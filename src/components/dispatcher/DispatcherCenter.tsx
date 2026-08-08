import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, CctvCamera, ResponderUnit, Hospital } from '../../types';
import { Building2, Camera, Radio, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Car, Ambulance, BarChart3, Users, Navigation, Eye, User, Phone, MapPin, RefreshCw, Zap } from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';

interface DispatcherCenterProps {
  incidents: Incident[];
  cctvCameras: CctvCamera[];
  responderUnits: ResponderUnit[];
  activeIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onTriggerCctvCrash: (camId: string) => void;
  onManualReassignUnit: (incidentId: string, unitId: string) => void;
}

export const DispatcherCenter = ({
  incidents,
  cctvCameras,
  responderUnits,
  activeIncident,
  onSelectIncident,
  onTriggerCctvCrash,
  onManualReassignUnit
}: DispatcherCenterProps) => {
  const [activeCctvTab, setActiveCctvTab] = useState<string>('CAM-104');
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<Incident | null>(activeIncident);

  const selectedInc = selectedIncidentDetail || activeIncident || incidents[0] || null;

  // Key Analytics calculations
  const totalToday = incidents.length;
  const highSeverityCount = incidents.filter(i => i.severity === 'HIGH').length;
  const mediumSeverityCount = incidents.filter(i => i.severity === 'MEDIUM').length;
  const lowSeverityCount = incidents.filter(i => i.severity === 'LOW').length;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>DETECTION TO DISPATCH</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-400">1.2 SECONDS</p>
          <p className="text-[10px] text-slate-500">Zero human intervention delay</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>AVG RESPONSE TIME</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">4.8 MINS</p>
          <p className="text-[10px] text-slate-500">Green Wave Signal Clearance</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>MULTI-SOURCE CONFIRMED</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-400">
            {incidents.filter(i => i.confirmationCount > 1).length} INCIDENTS
          </p>
          <p className="text-[10px] text-slate-500">Sensor + CCTV Dual Verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>SEVERITY TODAY</span>
            <BarChart3 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center gap-2 pt-1 font-bold">
            <span className="text-rose-400">{highSeverityCount} High</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400">{mediumSeverityCount} Med</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">{lowSeverityCount} Low</span>
          </div>
          <p className="text-[10px] text-slate-500">Total {totalToday} Incidents Monitored</p>
        </div>
      </div>

      {/* Main Command Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: CCTV Monitoring Hub & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* CCTV Highway Camera Grid Feed */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Highway CCTV Live Monitoring Grid (NH-44)</h3>
                  <p className="text-xs text-slate-400">Independent optical crash detection source & multi-source verifier</p>
                </div>
              </div>

              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded border border-indigo-800 font-bold">
                4 CAMERAS STREAMING
              </span>
            </div>

            {/* Camera Video Tiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cctvCameras.map((cam) => (
                <div
                  key={cam.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                    cam.hasCrashDetected
                      ? 'bg-rose-950/80 border-rose-500 shadow-xl ring-2 ring-rose-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Camera Header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cam.hasCrashDetected ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                      {cam.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate">{cam.location}</span>
                  </div>

                  {/* Mock Video Canvas Frame */}
                  <div className="h-28 rounded-xl bg-slate-900 border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: cam.snapshotBg }} />
                    <span className="absolute top-2 left-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
                      LIVE · 30 FPS
                    </span>

                    {cam.hasCrashDetected ? (
                      <div className="text-center space-y-1 p-2 bg-rose-950/90 border border-rose-500/80 rounded-xl animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto" />
                        <p className="text-[11px] font-bold text-rose-200">CRASH VISUAL DETECTED</p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 font-mono text-[11px]">
                        <p>[CCTV OPTICAL FEED]</p>
                        <p className="text-[9px] text-slate-600 mt-0.5">Automated Vision Analytics Active</p>
                      </div>
                    )}
                  </div>

                  {/* Trigger / Flag Button */}
                  <button
                    onClick={() => onTriggerCctvCrash(cam.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      cam.hasCrashDetected
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cam.hasCrashDetected ? 'Flagged (Crash Detected)' : 'Flag Accident on Camera'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Dispatcher Interactive Map */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Dispatcher Strategic Highway Corridor Map</span>
            </h3>

            <InteractiveMap
              activeIncident={selectedInc}
              assignedUnit={selectedInc?.assignedUnit}
              targetHospital={selectedInc?.targetHospital}
              cctvCameras={cctvCameras}
            />
          </div>
        </div>

        {/* Right Column: Live Incident Table Feed & Selected Incident Inspector */}
        <div className="space-y-6">
          {/* Incident Table / List */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Live Incident Log</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{incidents.length} Records</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {incidents.map((inc) => {
                const isSelected = selectedInc?.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentDetail(inc);
                      onSelectIncident(inc);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        inc.severity === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : inc.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {inc.severity} SEVERITY
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">{inc.createdAt}</span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-white truncate">{inc.location.address}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Patient: {inc.driverProfile.name} ({inc.driverProfile.bloodGroup})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono pt-1 border-t border-slate-800/60">
                      <span className="text-cyan-400">
                        {inc.confirmationCount > 1 ? `Confirmed (${inc.confirmationCount} Sources)` : `Source: ${inc.detectionSources.join('+')}`}
                      </span>

                      <span className="text-purple-300 font-bold">
                        {inc.assignedUnit?.unitCode || 'Auto-Allocating'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Incident Inspector Drawer */}
          {selectedInc && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Victim Medical & Incident Snapshot</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400">{selectedInc.id}</span>
              </div>

              {/* Medical Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[10px]">PATIENT DETAILS</p>
                  <p className="font-bold text-white text-sm">{selectedInc.driverProfile.name}, {selectedInc.driverProfile.age} yrs</p>
                  <p className="text-rose-400 font-mono font-bold">Blood Group: {selectedInc.driverProfile.bloodGroup}</p>
                  <p className="text-slate-300 text-[11px]">Allergies: {selectedInc.driverProfile.allergies.join(', ')}</p>
                  <p className="text-slate-300 text-[11px]">Conditions: {selectedInc.driverProfile.medicalConditions.join(', ')}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 text-[10px]">VEHICLE & INSURANCE</p>
                  <p className="font-mono font-bold text-white">{selectedInc.driverProfile.vehicle.registrationNo}</p>
                  <p className="text-slate-300 text-[11px]">{selectedInc.driverProfile.vehicle.makeModelColor}</p>
                </div>

                {/* Paramedic Live Condition Updates */}
                {selectedInc.voiceUpdates.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-rose-400 font-mono text-[10px] font-bold uppercase">LIVE EN-ROUTE PARAMEDIC SPEECH TAGS</p>
                    {selectedInc.voiceUpdates.map((v, i) => (
                      <div key={i} className="text-[11px] text-slate-200">
                        <span className="text-slate-400 font-mono">[{v.timestamp}]</span> "{v.rawTranscript}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
