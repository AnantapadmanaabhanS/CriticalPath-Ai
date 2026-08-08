import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VehicleDriverProfile, Incident, TelemetrySensors } from '../../types';
import { ShieldCheck, AlertTriangle, User, Car, Phone, Heart, Activity, Radio, XCircle, CheckCircle2, Navigation, Edit3, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';

interface VehicleAppProps {
  profile: VehicleDriverProfile;
  onUpdateProfile: (updated: VehicleDriverProfile) => void;
  activeIncident: Incident | null;
  onTriggerSos: () => void;
  onCancelFalseAlarm: () => void;
  telemetry: TelemetrySensors;
}

export const VehicleApp = ({
  profile,
  onUpdateProfile,
  activeIncident,
  onTriggerSos,
  onCancelFalseAlarm,
  telemetry
}: VehicleAppProps) => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [editedProfile, setEditedProfile] = useState<VehicleDriverProfile>(profile);
  const [falseAlarmCountdown, setFalseAlarmCountdown] = useState<number | null>(null);

  // Sync edited profile state when profile prop changes
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  // False alarm auto-dispatch countdown safety timer
  useEffect(() => {
    if (activeIncident && activeIncident.status === 'DETECTED') {
      setFalseAlarmCountdown(10);
      const interval = setInterval(() => {
        setFalseAlarmCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setFalseAlarmCountdown(null);
    }
  }, [activeIncident]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editedProfile);
    setShowProfileSetup(false);
  };

  const isCrashActive = activeIncident && activeIncident.status !== 'CANCELLED_FALSE_ALARM' && activeIncident.status !== 'RESOLVED';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Calm Status Header or Active Crash Alert Card */}
      <AnimatePresence mode="wait">
        {isCrashActive ? (
          <motion.div
            key="crash-alert"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-3xl shadow-2xl border-2 ${
              activeIncident.severity === 'HIGH'
                ? 'bg-rose-950/90 border-rose-500 text-rose-100 ring-4 ring-rose-500/20'
                : activeIncident.severity === 'MEDIUM'
                ? 'bg-amber-950/90 border-amber-500 text-amber-100 ring-4 ring-amber-500/20'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${activeIncident.severity === 'HIGH' ? 'bg-rose-600' : 'bg-amber-500'} text-white shadow-lg animate-bounce`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                      AUTOMATIC DISPATCH CONFIRMED
                    </span>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {activeIncident.confirmationCount > 1 ? `Confirmed (${activeIncident.confirmationCount} Sources)` : `Source: ${activeIncident.detectionSources.join('+')}`}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold mt-1 text-white">
                    Crash Detected! Emergency Help Notified.
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    Telemetry captured impact force ({activeIncident.telemetrySnapshot.gForce}G). Dispatch pipeline triggered automatically — no action required.
                  </p>
                </div>
              </div>

              {/* ETA Display */}
              {activeIncident.assignedUnit && (
                <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-center min-w-[160px]">
                  <p className="text-xs font-mono text-cyan-400 uppercase">DISPATCHED UNIT ETA</p>
                  <p className="text-3xl font-extrabold text-white font-mono mt-0.5">
                    {activeIncident.assignedUnit.etaMinutes} MINS
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 truncate">
                    {activeIncident.assignedUnit.name}
                  </p>
                </div>
              )}
            </div>

            {/* False Alarm Option */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>
                  {falseAlarmCountdown !== null 
                    ? `Proceeding automatically. Responder en route (${falseAlarmCountdown}s window to cancel)...` 
                    : `Active dispatch live tracking. Stay calm.`}
                </span>
              </div>

              <button
                onClick={onCancelFalseAlarm}
                className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-rose-300 border border-rose-800 font-medium transition-all flex items-center gap-2 active:scale-95"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Cancel Dispatch (False Alarm)</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="calm-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h2 className="text-lg font-bold text-white">CriticalPath Ai Vehicle Protection Active</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated G-sensor, rollover & CCTV crash monitor running silently in background.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileSetup(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Edit Profile & Vehicle</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout: Interactive Map + SOS Button + Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Interactive Dispatch Map */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Live Vehicle Position & Emergency Corridor</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">NH-44 · KM Marker 212</span>
          </div>

          <InteractiveMap
            activeIncident={activeIncident}
            assignedUnit={activeIncident?.assignedUnit}
            targetHospital={activeIncident?.targetHospital}
          />
        </div>

        {/* Right Column: SOS Assurance Button & Telemetry Stream */}
        <div className="space-y-6">
          {/* Prominent Assurance SOS Button */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ASSURANCE TRIGGER</span>
              <h3 className="text-base font-bold text-white mt-0.5">Manual Emergency SOS</h3>
              <p className="text-xs text-slate-400 mt-1">
                Auto-detection is primary. Pressing SOS immediately confirms or initiates direct priority dispatch.
              </p>
            </div>

            <button
              onClick={onTriggerSos}
              className="w-full py-6 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xl shadow-2xl shadow-rose-600/40 border-2 border-rose-400/50 flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
              </div>
              <span className="tracking-wider">PRESS FOR IMMEDIATE HELP</span>
              <span className="text-[10px] font-mono font-normal opacity-90 text-rose-100">
                Auto-captures location & pre-registered profile
              </span>
            </button>
          </div>

          {/* Vehicle Sensor Telemetry Feed */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Vehicle Telemetry Sensors</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-500 text-[10px]">IMPACT FORCE</p>
                <p className={`text-base font-bold ${telemetry.gForce > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {telemetry.gForce} G
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-500 text-[10px]">SPEED</p>
                <p className="text-base font-bold text-cyan-400">
                  {telemetry.speedKmH} KM/H
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-500 text-[10px]">ROLL ANGLE</p>
                <p className={`text-base font-bold ${telemetry.rollAngleDeg > 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {telemetry.rollAngleDeg}°
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-500 text-[10px]">AIRBAG</p>
                <p className={`text-base font-bold ${telemetry.airbagDeployed ? 'text-rose-400' : 'text-slate-400'}`}>
                  {telemetry.airbagDeployed ? 'DEPLOYED' : 'NORMAL'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Registered Driver & Vehicle Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Pre-Registered Emergency Profile</h3>
          </div>
          <button
            onClick={() => setShowProfileSetup(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Driver Name & Blood Group */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <p className="text-slate-400 text-[11px]">Driver / Patient</p>
            <p className="text-sm font-bold text-white">{profile.name}, {profile.age} yrs ({profile.gender})</p>
            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold text-[11px] border border-rose-800">
              BLOOD GROUP: {profile.bloodGroup}
            </div>
          </div>

          {/* Medical Conditions & Allergies */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <p className="text-slate-400 text-[11px]">Medical Records</p>
            <p className="text-slate-200 font-medium">
              Conditions: <span className="text-amber-300">{profile.medicalConditions.join(', ')}</span>
            </p>
            <p className="text-slate-200 font-medium">
              Allergies: <span className="text-rose-300">{profile.allergies.join(', ')}</span>
            </p>
          </div>

          {/* Vehicle Details */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <p className="text-slate-400 text-[11px]">Registered Vehicle</p>
            <p className="text-sm font-bold text-white font-mono">{profile.vehicle.registrationNo}</p>
            <p className="text-slate-300 text-[11px]">{profile.vehicle.makeModelColor}</p>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <p className="text-slate-400 text-[11px]">Emergency Contact</p>
            <p className="text-sm font-bold text-white">{profile.emergencyContact.name} ({profile.emergencyContact.relation})</p>
            <p className="text-cyan-400 font-mono font-bold flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{profile.emergencyContact.phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pre-registered Profile Setup Modal */}
      <AnimatePresence>
        {showProfileSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Edit Vehicle & Driver Emergency Profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileSetup(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-slate-400 mb-1">Blood Group</label>
                    <select
                      value={editedProfile.bloodGroup}
                      onChange={e => setEditedProfile({ ...editedProfile, bloodGroup: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="O+ Positive">O+ Positive</option>
                      <option value="O- Negative">O- Negative</option>
                      <option value="A+ Positive">A+ Positive</option>
                      <option value="A- Negative">A- Negative</option>
                      <option value="B+ Positive">B+ Positive</option>
                      <option value="B- Negative">B- Negative</option>
                      <option value="AB+ Positive">AB+ Positive</option>
                      <option value="AB- Negative">AB- Negative</option>
                    </select>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-slate-400 mb-1">Known Allergies (comma separated)</label>
                    <input
                      type="text"
                      value={editedProfile.allergies.join(', ')}
                      onChange={e => setEditedProfile({ ...editedProfile, allergies: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <label className="block text-slate-400 mb-1">Medical Conditions (comma separated)</label>
                    <input
                      type="text"
                      value={editedProfile.medicalConditions.join(', ')}
                      onChange={e => setEditedProfile({ ...editedProfile, medicalConditions: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-slate-400 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={editedProfile.emergencyContact.name}
                      onChange={e => setEditedProfile({ ...editedProfile, emergencyContact: { ...editedProfile.emergencyContact, name: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-slate-400 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={editedProfile.emergencyContact.phone}
                      onChange={e => setEditedProfile({ ...editedProfile, emergencyContact: { ...editedProfile.emergencyContact, phone: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                      required
                    />
                  </div>

                  {/* Vehicle Registration */}
                  <div>
                    <label className="block text-slate-400 mb-1">Vehicle Registration No.</label>
                    <input
                      type="text"
                      value={editedProfile.vehicle.registrationNo}
                      onChange={e => setEditedProfile({ ...editedProfile, vehicle: { ...editedProfile.vehicle, registrationNo: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                      required
                    />
                  </div>

                  {/* Vehicle Model & Color */}
                  <div>
                    <label className="block text-slate-400 mb-1">Vehicle Make / Model / Color</label>
                    <input
                      type="text"
                      value={editedProfile.vehicle.makeModelColor}
                      onChange={e => setEditedProfile({ ...editedProfile, vehicle: { ...editedProfile.vehicle, makeModelColor: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowProfileSetup(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
