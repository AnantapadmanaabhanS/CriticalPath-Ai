// Voice Service wrapping Web Speech API & Natural Keyword Tagging

export interface ParsedVoiceResult {
  transcript: string;
  tags: string[];
  patientStatus: 'STABLE' | 'CRITICAL' | 'UNCONSCIOUS' | 'MONITORING';
}

const KEYWORD_MAP: Record<string, { tag: string; status?: 'CRITICAL' | 'UNCONSCIOUS' | 'STABLE' }> = {
  'bleeding': { tag: 'HEAVY BLEEDING', status: 'CRITICAL' },
  'blood': { tag: 'HEAVY BLEEDING', status: 'CRITICAL' },
  'unconscious': { tag: 'UNCONSCIOUS', status: 'UNCONSCIOUS' },
  'fainted': { tag: 'UNCONSCIOUS', status: 'UNCONSCIOUS' },
  'no pulse': { tag: 'NO PULSE', status: 'CRITICAL' },
  'weak pulse': { tag: 'WEAK PULSE', status: 'CRITICAL' },
  'cpr': { tag: 'CPR IN PROGRESS', status: 'CRITICAL' },
  'fracture': { tag: 'FRACTURE SUSPECTED', status: 'CRITICAL' },
  'broken': { tag: 'FRACTURE SUSPECTED', status: 'CRITICAL' },
  'head injury': { tag: 'HEAD TRAUMA', status: 'CRITICAL' },
  'concussion': { tag: 'HEAD TRAUMA', status: 'CRITICAL' },
  'breath': { tag: 'RESPIRATORY DISTRESS', status: 'CRITICAL' },
  'oxygen': { tag: 'LOW SPO2', status: 'CRITICAL' },
  'stable': { tag: 'STABLE CONDITION', status: 'STABLE' },
  'conscious': { tag: 'CONSCIOUS & ALERT', status: 'STABLE' },
  'pain': { tag: 'SEVERE PAIN' },
  'burn': { tag: 'BURNS DETECTED', status: 'CRITICAL' },
  'chest': { tag: 'CHEST PAIN', status: 'CRITICAL' }
};

export function parseSpeechTranscript(text: string): ParsedVoiceResult {
  const lower = text.toLowerCase();
  const tagsSet = new Set<string>();
  let patientStatus: 'STABLE' | 'CRITICAL' | 'UNCONSCIOUS' | 'MONITORING' = 'MONITORING';

  Object.entries(KEYWORD_MAP).forEach(([keyword, val]) => {
    if (lower.includes(keyword)) {
      tagsSet.add(val.tag);
      if (val.status) {
        if (patientStatus !== 'UNCONSCIOUS' && patientStatus !== 'CRITICAL') {
          patientStatus = val.status;
        } else if (val.status === 'UNCONSCIOUS' || val.status === 'CRITICAL') {
          patientStatus = val.status;
        }
      }
    }
  });

  if (tagsSet.size === 0) {
    tagsSet.add('PARAMEDIC UPDATE');
  }

  return {
    transcript: text,
    tags: Array.from(tagsSet),
    patientStatus
  };
}

export function speakText(message: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech Synthesis not supported in this environment');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
}
