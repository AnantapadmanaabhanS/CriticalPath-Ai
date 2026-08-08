import { motion } from 'motion/react';
import { Incident, ResponderUnit, Hospital, CctvCamera } from '../../types';
import { ShieldAlert, Navigation, Hospital as HospitalIcon, Camera, Radio, Zap } from 'lucide-react';

interface InteractiveMapProps {
  activeIncident?: Incident | null;
  assignedUnit?: ResponderUnit | null;
  targetHospital?: Hospital | null;
  cctvCameras?: CctvCamera[];
  compact?: boolean;
}

export const InteractiveMap = ({
  activeIncident,
  assignedUnit,
  targetHospital,
  cctvCameras = [],
  compact = false
}: InteractiveMapProps) => {
  const isHighSeverity = activeIncident?.severity === 'HIGH';
  const isMediumSeverity = activeIncident?.severity === 'MEDIUM';

  const incidentColorClass = isHighSeverity
    ? 'text-rose-500 fill-rose-500'
    : isMediumSeverity
    ? 'text-amber-500 fill-amber-500'
    : 'text-emerald-500 fill-emerald-500';

  const rippleColorClass = isHighSeverity
    ? 'bg-rose-500'
    : isMediumSeverity
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${compact ? 'h-64' : 'h-80 md:h-[420px]'}`}>
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Map Map Vector Overlay */}
      <svg className="absolute inset-0 w-full h-full text-slate-800 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Highway Lines (NH-44 Corridor) */}
        <path d="M 50 300 Q 300 200 500 320 T 950 280" fill="none" stroke="#334155" strokeWidth="48" strokeLinecap="round" />
        <path d="M 50 300 Q 300 200 500 320 T 950 280" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="12,12" opacity="0.6" />

        {/* Secondary Arterial Roads */}
        <path d="M 500 320 L 520 120" fill="none" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
        <path d="M 300 200 L 220 480" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
        <path d="M 750 295 L 820 500" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />

        {/* Active Emergency Dispatch Route Polyline */}
        {activeIncident && (
          <motion.path 
            d="M 180 380 Q 320 220 520 280 L 820 480" 
            fill="none" 
            stroke="url(#routeGradient)" 
            strokeWidth="6" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        )}
      </svg>

      {/* Map Control HUD Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-mono text-slate-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>HIGHWAY NH-44 · CORRIDOR LIVEMAP</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400 font-bold">10-15m TRAFFIC FORECAST ACTIVE</span>
      </div>

      {/* Traffic Signals Pre-Clearance Badge */}
      {activeIncident?.routeSignalsCleared && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md font-medium"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>GREEN WAVE: 4 Traffic Signals Pre-Cleared</span>
        </motion.div>
      )}

      {/* Interactive Map Nodes */}

      {/* 1. CCTV Nodes */}
      {cctvCameras.map((cam, idx) => {
        const coords = [
          { top: '32%', left: '22%' },
          { top: '48%', left: '48%' },
          { top: '38%', left: '72%' },
          { top: '24%', left: '88%' }
        ][idx % 4];

        return (
          <div key={cam.id} className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2" style={coords}>
            <div className={`p-1.5 rounded-full border shadow-md flex items-center justify-center transition-all ${cam.hasCrashDetected ? 'bg-rose-950 border-rose-500 text-rose-400 ring-4 ring-rose-500/30' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline-block absolute top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap shadow">
              {cam.id}
            </span>
          </div>
        );
      })}

      {/* 2. Active Crash Site Pin */}
      {activeIncident ? (
        <div className="absolute top-[48%] left-[52%] z-30 transform -translate-x-1/2 -translate-y-1/2">
          {/* Pulsing Ripple Effect */}
          <span className={`absolute -inset-4 rounded-full opacity-75 animate-ping ${rippleColorClass}`} />
          <span className={`absolute -inset-8 rounded-full opacity-30 animate-pulse ${rippleColorClass}`} />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`relative p-3 rounded-2xl shadow-2xl border-2 flex items-center justify-center backdrop-blur-md ${
              isHighSeverity 
                ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
                : isMediumSeverity 
                ? 'bg-amber-950/90 border-amber-500 text-amber-200' 
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}
          >
            <ShieldAlert className="w-7 h-7" />
          </motion.div>

          {/* Crash Info Card Tooltip */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-white rounded-xl p-2.5 shadow-2xl text-xs w-48 text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
              <span className={`w-2 h-2 rounded-full ${isHighSeverity ? 'bg-rose-500' : isMediumSeverity ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="uppercase tracking-wider">{activeIncident.severity} SEVERITY IMPACT</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] truncate">{activeIncident.location.highwayKm}</p>
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 py-0.5 rounded border border-cyan-800">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{activeIncident.confirmationCount > 1 ? `CONFIRMED (${activeIncident.confirmationCount} SOURCES)` : `SOURCE: ${activeIncident.detectionSources.join('+')}`}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute top-[48%] left-[52%] z-20 transform -translate-x-1/2 -translate-y-1/2 opacity-60">
          <div className="p-2 bg-slate-900 border border-slate-700 rounded-full text-slate-400 flex items-center gap-1 text-xs px-3">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetry & CCTV Active · Highway Clear</span>
          </div>
        </div>
      )}

      {/* 3. Moving Dispatched Unit Marker */}
      {assignedUnit && activeIncident && (
        <motion.div 
          className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ top: '65%', left: '20%' }}
          animate={{ top: ['65%', '58%', '50%'], left: ['20%', '35%', '46%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative group">
            <div className="p-2.5 rounded-full bg-cyan-500 text-slate-950 shadow-xl border-2 border-white flex items-center justify-center ring-4 ring-cyan-500/30">
              <Navigation className="w-5 h-5 fill-slate-950 transform rotate-45" />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-cyan-500 text-cyan-300 text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {assignedUnit.unitCode} (ETA {assignedUnit.etaMinutes}m)
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Target Hospital Marker */}
      {targetHospital && (
        <div className="absolute top-[75%] left-[82%] z-20 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-2 rounded-xl bg-purple-950/90 border border-purple-500 text-purple-200 shadow-xl flex items-center gap-2 backdrop-blur-md">
            <HospitalIcon className="w-5 h-5 text-purple-400" />
            <div className="text-left text-[11px]">
              <p className="font-bold text-white line-clamp-1">{targetHospital.name}</p>
              <p className="text-purple-300 font-mono text-[10px]">{targetHospital.icuBedsAvailable} ICU Beds · {targetHospital.traumaCenterLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="absolute bottom-2 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low/Tow</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span>GPS: 12.9716° N, 77.5946° E</span>
          <span className="text-cyan-400 font-semibold">Live Telemetry Synchronized</span>
        </div>
      </div>
    </div>
  );
};
