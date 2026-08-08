import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, Hospital, VoiceConditionUpdate, ResponderUnit } from '../../types';
import { parseSpeechTranscript, speakText, isSpeechRecognitionSupported } from '../../services/voiceService';
import { Ambulance, Navigation, Mic, MicOff, Volume2, Hospital as HospitalIcon, ShieldAlert, CheckCircle2, User, Phone, Radio, Zap, HeartPulse, ChevronRight, Activity, Clock } from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';

interface ResponderAppProps {
  activeIncident: Incident | null;
  assignedUnit: ResponderUnit | null;
  hospitals: Hospital[];
  onAcceptIncident: () => void;
  onAddVoiceUpdate: (update: VoiceConditionUpdate) => void;
  onSelectHospital: (hospital: Hospital) => void;
}

export const ResponderApp = ({
  activeIncident,
  assignedUnit,
  hospitals,
  onAcceptIncident,
  onAddVoiceUpdate,
  onSelectHospital
}: ResponderAppProps) => {
  const [isListening, setIsListening] = useState(false);
  const [manualSpeechText, setManualSpeechText] = useState('');
  const [activeSpeechRecognition, setActiveSpeechRecognition] = useState<unknown | null>(null);
  const [voiceLog, setVoiceLog] = useState<VoiceConditionUpdate[]>(activeIncident?.voiceUpdates || []);

  useEffect(() => {
    if (activeIncident?.voiceUpdates) {
      setVoiceLog(activeIncident.voiceUpdates);
    }
  }, [activeIncident?.voiceUpdates]);

  // Handle Web Speech API Recording
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Browser does not support Web Speech API natively. You can use the text-input voice simulator below.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass() as {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
      };

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleProcessSpeech(transcript);
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setActiveSpeechRecognition(recognition);
      setIsListening(true);
      speakText("Voice condition input activated. Speak patient status.");
    } catch (e) {
      console.error("Failed to start speech recognition", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (activeSpeechRecognition) {
      (activeSpeechRecognition as { stop: () => void }).stop();
    }
    setIsListening(false);
  };

  const handleProcessSpeech = (text: string) => {
    if (!text.trim()) return;

    const parsed = parseSpeechTranscript(text);
    const newUpdate: VoiceConditionUpdate = {
      id: `vlog-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTranscript: parsed.transcript,
      tags: parsed.tags,
      patientStatus: parsed.patientStatus,
      speaker: assignedUnit?.paramedicName || 'Paramedic Unit'
    };

    onAddVoiceUpdate(newUpdate);
    setManualSpeechText('');

    // Voice Feedback Confirmation read out hands-free to paramedic
    const speakMsg = `Condition updated: ${parsed.tags.join(', ')}. Dispatched to ${activeIncident?.targetHospital?.name || 'Trauma Center'}.`;
    speakText(speakMsg);
  };

  const isAccepted = activeIncident?.status === 'EN_ROUTE' || activeIncident?.status === 'ARRIVED';

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner: Assigned Unit Status */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Ambulance className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{assignedUnit?.name || 'AMB-101 ALS Rapid Responder'}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                UNIT ONLINE · GPS STREAMING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle: {assignedUnit?.vehicleNo || 'KA-05-EQ-1001'} · Crew: {assignedUnit?.paramedicName || 'Dr. Vikram & Paramedic Anita'}
            </p>
          </div>
        </div>

        {/* Hands-Free Voice Status Audio Feedback Toggle */}
        <button
          onClick={() => speakText(`Navigation en route to ${activeIncident?.location.address || 'Crash Site'}. Green wave signal clearance active.`)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-medium flex items-center gap-1.5"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Test Hands-Free Voice Guidance</span>
        </button>
      </div>

      {/* Main Grid Section */}
      {activeIncident ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Incoming Incident Card & Navigation Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Alert Card */}
            <div className={`p-6 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
              activeIncident.severity === 'HIGH'
                ? 'bg-rose-950/90 border-rose-500'
                : activeIncident.severity === 'MEDIUM'
                ? 'bg-amber-950/90 border-amber-500'
                : 'bg-emerald-950/90 border-emerald-500'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider ${
                    activeIncident.severity === 'HIGH'
                      ? 'bg-rose-600 text-white'
                      : activeIncident.severity === 'MEDIUM'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {activeIncident.severity} SEVERITY DISPATCH
                  </span>

                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/90 px-2.5 py-1 rounded-full border border-cyan-700">
                    {activeIncident.confirmationCount > 1 ? `CONFIRMED (${activeIncident.confirmationCount} SOURCES)` : `SOURCE: ${activeIncident.detectionSources.join('+')}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-300 block">INCIDENT ID</span>
                  <span className="text-sm font-extrabold text-white font-mono">{activeIncident.id}</span>
                </div>
              </div>

              {/* Location & Victim Details */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-mono text-[10px] uppercase">CRASH LOCATION</p>
                  <p className="text-base font-bold text-white mt-0.5">{activeIncident.location.address}</p>
                  <p className="text-cyan-300 font-mono text-[11px] mt-1">{activeIncident.location.highwayKm}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-mono text-[10px] uppercase">VICTIM & MEDICAL PROFILE SNAPSHOT</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {activeIncident.driverProfile.name} ({activeIncident.driverProfile.age} yrs)
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[11px]">
                      BLOOD: {activeIncident.driverProfile.bloodGroup}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 text-[10px]">
                      Allergies: {activeIncident.driverProfile.allergies.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* One-Tap Accept & Route Button */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                {!isAccepted ? (
                  <button
                    onClick={onAcceptIncident}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-lg shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <Navigation className="w-6 h-6 fill-slate-950" />
                    <span>ACCEPT INCIDENT & START NAVIGATION</span>
                  </button>
                ) : (
                  <div className="w-full bg-emerald-950/80 border border-emerald-500 p-3.5 rounded-2xl flex items-center justify-between text-emerald-300 text-xs font-mono">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>NAVIGATION ACTIVE · GREEN WAVE TRAFFIC SIGNALS CLEARED</span>
                    </div>
                    <span className="text-white font-mono font-bold bg-emerald-900 px-2.5 py-1 rounded">
                      ETA {assignedUnit?.etaMinutes || 4} MINS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Navigation Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>AI Route Guidance & Dynamic Congestion Forecast</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Pre-Cleared Traffic Wave
                </span>
              </div>

              <InteractiveMap
                activeIncident={activeIncident}
                assignedUnit={assignedUnit}
                targetHospital={activeIncident.targetHospital}
              />
            </div>

            {/* Hands-Free Voice Input for Paramedic Patient Condition */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-rose-400 animate-pulse" />
                  <div>
                    <h3 className="text-base font-bold text-white">Hands-Free Paramedic Voice Update</h3>
                    <p className="text-xs text-slate-400">Speak updates en-route (Web Speech API auto-transcribes & tags for hospital prep)</p>
                  </div>
                </div>

                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Listening...' : 'Push to Speak'}</span>
                </button>
              </div>

              {/* Fallback Text Simulator for Speech Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Or type spoken update (e.g. 'patient conscious heavy bleeding from leg')..."
                  value={manualSpeechText}
                  onChange={e => setManualSpeechText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleProcessSpeech(manualSpeechText);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleProcessSpeech(manualSpeechText)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Parse
                </button>
              </div>

              {/* Parsed Transcripts & Tags Log */}
              {voiceLog.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Paramedic Logs Shared with Hospital:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {voiceLog.map((log) => (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-cyan-400 font-bold">{log.speaker} · {log.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            log.patientStatus === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {log.patientStatus}
                          </span>
                        </div>
                        <p className="text-slate-200 italic">"{log.rawTranscript}"</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 text-[10px] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Hospital Selection & Match Facility Panel */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <HospitalIcon className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">AI Hospital Match & Pre-Arrival Alert</h3>
                  <p className="text-xs text-slate-400">Ranked by ICU beds, Level 1 Trauma, blood stock & traffic ETA</p>
                </div>
              </div>

              {/* Hospital Cards List */}
              <div className="space-y-3">
                {hospitals.map((hosp) => {
                  const isSelected = activeIncident.targetHospital?.id === hosp.id;

                  return (
                    <div
                      key={hosp.id}
                      onClick={() => onSelectHospital(hosp)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500 shadow-lg ring-2 ring-purple-500/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{hosp.traumaCenterLevel}</span>
                          <h4 className="text-sm font-bold text-white">{hosp.name}</h4>
                          <p className="text-[11px] text-slate-400">{hosp.address} ({hosp.distanceKm} km away)</p>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-1 rounded-full bg-purple-900/80 text-purple-200 text-xs font-mono font-bold">
                            {hosp.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Reasons Why Picked */}
                      <p className="text-xs text-purple-200/90 bg-purple-950/50 p-2 rounded-xl border border-purple-800/50">
                        "{hosp.reason}"
                      </p>

                      {/* Capabilities Snapshot */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          {hosp.icuBedsAvailable} ICU Beds
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                          {hosp.ventilatorAvailable} Ventilators
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                          Blood: {hosp.bloodBankStock.join(', ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standby State for Responder App */
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Ambulance className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Responder Unit Standing By</h3>
          <p className="text-xs text-slate-400">
            Monitoring automated vehicle telemetry & highway CCTV feeds. When a crash occurs, incoming dispatch alerts will pop up automatically.
          </p>
        </div>
      )}
    </div>
  );
};
