import { ViewTab, Incident } from '../types';
import { Car, Ambulance, Building2, Radio, AlertTriangle, ShieldCheck, Camera, HelpCircle, RefreshCw, Volume2 } from 'lucide-react';

interface NavigationHeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  activeIncident: Incident | null;
  onSimulateCrash: (severity: 'HIGH' | 'LOW' | 'MEDIUM') => void;
  onSimulateCctvCrash: () => void;
  onTriggerSos: () => void;
  onClearIncidents: () => void;
}

export const NavigationHeader = ({
  currentTab,
  onTabChange,
  activeIncident,
  onSimulateCrash,
  onSimulateCctvCrash,
  onTriggerSos,
  onClearIncidents
}: NavigationHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-xl shadow-xl">
      {/* Top System Branding & Real-time Indicator */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-cyan-400 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider text-white">CriticalPath Ai</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-bold">
                AUTOMATIC AI DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-human delay automatic crash detection, AI severity scoring & emergency routing
            </p>
          </div>
        </div>

        {/* Global Active Emergency Indicator */}
        {activeIncident ? (
          <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/80 px-3 py-1.5 rounded-xl shadow-lg animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <div className="text-left">
              <span className="text-xs font-bold text-rose-200 uppercase tracking-wide block">
                ACTIVE INCIDENT: {activeIncident.severity} SEVERITY
              </span>
              <span className="text-[10px] text-rose-300 font-mono">
                {activeIncident.confirmationCount > 1 
                  ? `CONFIRMED (${activeIncident.confirmationCount} SOURCES)` 
                  : `SOURCE: ${activeIncident.detectionSources.join(' + ')}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ALL SYSTEMS ACTIVE · HIGHWAY SENSOR STREAM ONLINE</span>
          </div>
        )}
      </div>

      {/* Simulator Toolbar Controls */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Simulation Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono font-medium text-[11px] uppercase mr-1 hidden sm:inline">
              Simulate Event:
            </span>

            <button
              onClick={() => onSimulateCrash('HIGH')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              title="Simulate severe impact with airbag deployment & rollover"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate High Crash</span>
            </button>

            <button
              onClick={() => onSimulateCrash('LOW')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              title="Simulate minor collision (tow truck dispatch)"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Low Crash (Tow)</span>
            </button>

            <button
              onClick={onSimulateCctvCrash}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-medium shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              title="Simulate CCTV camera crash detection on Highway NH-44"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>CCTV Highway Flag</span>
            </button>

            <button
              onClick={onTriggerSos}
              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              title="Trigger victim manual SOS press"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Manual SOS</span>
            </button>

            {activeIncident && (
              <button
                onClick={onClearIncidents}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-all flex items-center gap-1"
                title="Reset simulation state"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* View Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('VEHICLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'VEHICLE'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>1. Vehicle App</span>
            </button>

            <button
              onClick={() => onTabChange('RESPONDER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'RESPONDER'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>2. Responder App</span>
            </button>

            <button
              onClick={() => onTabChange('DISPATCHER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'DISPATCHER'
                  ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. Dispatcher Center</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
