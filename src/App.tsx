import React, { useState, useEffect } from 'react';
import { ViewTab, Incident, VehicleDriverProfile, TelemetrySensors, CctvCamera, Hospital, ResponderUnit, VoiceConditionUpdate } from './types';
import { INITIAL_DRIVER_PROFILE, MOCK_HOSPITALS, MOCK_RESPONDER_UNITS, MOCK_CCTV_CAMERAS } from './data/mockData';
import { evaluateCrashSeverity, rankHospitalsForIncident, findBestResponderUnit } from './utils/severityEngine';
import { NavigationHeader } from './components/NavigationHeader';
import { VehicleApp } from './components/vehicle/VehicleApp';
import { ResponderApp } from './components/responder/ResponderApp';
import { DispatcherCenter } from './components/dispatcher/DispatcherCenter';
import { speakText } from './services/voiceService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('VEHICLE');
  const [driverProfile, setDriverProfile] = useState<VehicleDriverProfile>(INITIAL_DRIVER_PROFILE);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [responderUnits, setResponderUnits] = useState<ResponderUnit[]>(MOCK_RESPONDER_UNITS);
  const [cctvCameras, setCctvCameras] = useState<CctvCamera[]>(MOCK_CCTV_CAMERAS);

  // Normal baseline vehicle telemetry
  const [telemetry, setTelemetry] = useState<TelemetrySensors>({
    gForce: 1.1,
    speedKmH: 72,
    rollAngleDeg: 0,
    airbagDeployed: false,
    occupantMotionDetected: true,
    impactZone: 'FRONT'
  });

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || null;

  // Trigger Crash Sensor Simulation
  const handleSimulateCrash = (requestedSeverity: 'HIGH' | 'LOW' | 'MEDIUM' = 'HIGH') => {
    let mockSensors: TelemetrySensors;

    if (requestedSeverity === 'HIGH') {
      mockSensors = {
        gForce: 14.8,
        speedKmH: 92,
        rollAngleDeg: 65,
        airbagDeployed: true,
        occupantMotionDetected: false,
        impactZone: 'FRONT'
      };
    } else if (requestedSeverity === 'MEDIUM') {
      mockSensors = {
        gForce: 6.4,
        speedKmH: 60,
        rollAngleDeg: 15,
        airbagDeployed: false,
        occupantMotionDetected: true,
        impactZone: 'SIDE'
      };
    } else {
      mockSensors = {
        gForce: 2.8,
        speedKmH: 35,
        rollAngleDeg: 0,
        airbagDeployed: false,
        occupantMotionDetected: true,
        impactZone: 'REAR'
      };
    }

    setTelemetry(mockSensors);

    const hasCctv = activeIncident?.detectionSources.includes('CCTV') || false;
    const evalResult = evaluateCrashSeverity(mockSensors, hasCctv);
    const rankedHospitals = rankHospitalsForIncident(hospitals, driverProfile.bloodGroup);
    const assignedUnit = findBestResponderUnit(responderUnits, evalResult.recommendedUnitType);

    if (activeIncident) {
      // Multi-Source Confirmation: Merge with existing active incident
      const updatedSources = Array.from(new Set([...activeIncident.detectionSources, 'SENSOR' as const]));
      const newCount = updatedSources.length;

      const updatedIncident: Incident = {
        ...activeIncident,
        detectionSources: updatedSources,
        confirmationCount: newCount,
        isMultiSourceConfirmed: newCount > 1,
        severity: evalResult.severity,
        severityScore: evalResult.score,
        telemetrySnapshot: mockSensors,
        assignedUnit: assignedUnit || activeIncident.assignedUnit,
        targetHospital: rankedHospitals[0]
      };

      setIncidents(prev => prev.map(i => i.id === activeIncident.id ? updatedIncident : i));
    } else {
      // Create New Incident
      const newInc: Incident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestampMs: Date.now(),
        detectionSources: ['SENSOR'],
        confirmationCount: 1,
        isMultiSourceConfirmed: false,
        severity: evalResult.severity,
        severityScore: evalResult.score,
        status: 'DETECTED',
        location: {
          address: 'Highway NH-44, Corridor Northbound, near KM Marker 212',
          highwayKm: 'NH-44 · KM 212 Marker',
          lat: 12.9716,
          lng: 77.5946,
          isApproximate: false
        },
        telemetrySnapshot: mockSensors,
        driverProfile: driverProfile,
        assignedUnit: assignedUnit,
        targetHospital: rankedHospitals[0],
        voiceUpdates: [],
        routeSignalsCleared: true
      };

      setIncidents(prev => [newInc, ...prev]);
      setActiveIncidentId(newInc.id);

      // Voice prompt announcement
      speakText(`Crash auto-detected. Severity ${evalResult.severity}. Dispatched unit ${assignedUnit?.unitCode || 'responder'}.`);
    }
  };

  // Trigger CCTV Camera Highway Detection
  const handleSimulateCctvCrash = (targetCamId: string = 'CAM-104') => {
    setCctvCameras(prev => prev.map(c => c.id === targetCamId ? { ...c, hasCrashDetected: true } : c));

    if (activeIncident) {
      // Merge CCTV into active incident
      const updatedSources = Array.from(new Set([...activeIncident.detectionSources, 'CCTV' as const]));
      const newCount = updatedSources.length;

      const updatedIncident: Incident = {
        ...activeIncident,
        cctvCameraId: targetCamId,
        detectionSources: updatedSources,
        confirmationCount: newCount,
        isMultiSourceConfirmed: newCount > 1
      };

      setIncidents(prev => prev.map(i => i.id === activeIncident.id ? updatedIncident : i));
    } else {
      // Create incident triggered by CCTV
      const mockSensors: TelemetrySensors = {
        gForce: 8.2,
        speedKmH: 75,
        rollAngleDeg: 20,
        airbagDeployed: true,
        occupantMotionDetected: false,
        impactZone: 'FRONT'
      };

      const evalResult = evaluateCrashSeverity(mockSensors, true);
      const rankedHospitals = rankHospitalsForIncident(hospitals, driverProfile.bloodGroup);
      const assignedUnit = findBestResponderUnit(responderUnits, 'AMBULANCE');

      const newInc: Incident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestampMs: Date.now(),
        detectionSources: ['CCTV'],
        confirmationCount: 1,
        isMultiSourceConfirmed: false,
        severity: evalResult.severity,
        severityScore: evalResult.score,
        status: 'DETECTED',
        location: {
          address: 'NH-44 Highway Marker 212, Near Flyover Exit',
          highwayKm: 'NH-44 · CCTV Camera 104',
          lat: 12.9700,
          lng: 77.5920,
          isApproximate: true
        },
        telemetrySnapshot: mockSensors,
        driverProfile: driverProfile,
        cctvCameraId: targetCamId,
        assignedUnit: assignedUnit,
        targetHospital: rankedHospitals[0],
        voiceUpdates: [],
        routeSignalsCleared: true
      };

      setIncidents(prev => [newInc, ...prev]);
      setActiveIncidentId(newInc.id);

      speakText(`CCTV Highway alert confirmed on Camera ${targetCamId}. Unit dispatched.`);
    }
  };

  // Trigger Manual Victim SOS
  const handleTriggerSos = () => {
    if (activeIncident) {
      const updatedSources = Array.from(new Set([...activeIncident.detectionSources, 'SOS' as const]));
      const newCount = updatedSources.length;

      const updatedIncident: Incident = {
        ...activeIncident,
        detectionSources: updatedSources,
        confirmationCount: newCount,
        isMultiSourceConfirmed: newCount > 1
      };

      setIncidents(prev => prev.map(i => i.id === activeIncident.id ? updatedIncident : i));
    } else {
      handleSimulateCrash('HIGH');
    }
  };

  // False alarm cancellation
  const handleCancelFalseAlarm = () => {
    if (!activeIncident) return;
    setIncidents(prev => prev.map(i => i.id === activeIncident.id ? { ...i, status: 'CANCELLED_FALSE_ALARM' } : i));
    setActiveIncidentId(null);
    setCctvCameras(MOCK_CCTV_CAMERAS);
    speakText("Dispatch cancelled. False alarm registered.");
  };

  // Clear Incidents
  const handleClearIncidents = () => {
    setIncidents([]);
    setActiveIncidentId(null);
    setCctvCameras(MOCK_CCTV_CAMERAS);
    setTelemetry({
      gForce: 1.1,
      speedKmH: 72,
      rollAngleDeg: 0,
      airbagDeployed: false,
      occupantMotionDetected: true,
      impactZone: 'FRONT'
    });
  };

  // Responder actions
  const handleAcceptIncident = () => {
    if (!activeIncident) return;
    setIncidents(prev => prev.map(i => i.id === activeIncident.id ? { ...i, status: 'EN_ROUTE' } : i));
    speakText(`Incident accepted. Driving route started to ${activeIncident.location.address}. All traffic signals pre-cleared green.`);
  };

  const handleAddVoiceUpdate = (update: VoiceConditionUpdate) => {
    if (!activeIncident) return;
    setIncidents(prev => prev.map(i => i.id === activeIncident.id ? {
      ...i,
      voiceUpdates: [update, ...i.voiceUpdates]
    } : i));
  };

  const handleSelectHospital = (hosp: Hospital) => {
    if (!activeIncident) return;
    setIncidents(prev => prev.map(i => i.id === activeIncident.id ? { ...i, targetHospital: hosp } : i));
    speakText(`Hospital destination updated to ${hosp.name}. Pre-arrival alert sent.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Universal Navigation Header & Simulation Bar */}
      <NavigationHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeIncident={activeIncident}
        onSimulateCrash={handleSimulateCrash}
        onSimulateCctvCrash={() => handleSimulateCctvCrash('CAM-104')}
        onTriggerSos={handleTriggerSos}
        onClearIncidents={handleClearIncidents}
      />

      {/* Primary Tab View Viewport */}
      <main className="flex-1 py-6">
        {currentTab === 'VEHICLE' && (
          <VehicleApp
            profile={driverProfile}
            onUpdateProfile={setDriverProfile}
            activeIncident={activeIncident}
            onTriggerSos={handleTriggerSos}
            onCancelFalseAlarm={handleCancelFalseAlarm}
            telemetry={telemetry}
          />
        )}

        {currentTab === 'RESPONDER' && (
          <ResponderApp
            activeIncident={activeIncident}
            assignedUnit={activeIncident?.assignedUnit || responderUnits[0]}
            hospitals={hospitals}
            onAcceptIncident={handleAcceptIncident}
            onAddVoiceUpdate={handleAddVoiceUpdate}
            onSelectHospital={handleSelectHospital}
          />
        )}

        {currentTab === 'DISPATCHER' && (
          <DispatcherCenter
            incidents={incidents}
            cctvCameras={cctvCameras}
            responderUnits={responderUnits}
            activeIncident={activeIncident}
            onSelectIncident={(inc) => setActiveIncidentId(inc.id)}
            onTriggerCctvCrash={(camId) => handleSimulateCctvCrash(camId)}
            onManualReassignUnit={(incId, unitId) => {
              const unit = responderUnits.find(u => u.id === unitId);
              if (unit) {
                setIncidents(prev => prev.map(i => i.id === incId ? { ...i, assignedUnit: unit } : i));
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
