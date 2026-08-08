export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type IncidentStatus = 
  | 'DETECTED'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED_FALSE_ALARM';

export type DetectionSource = 'SENSOR' | 'CCTV' | 'SOS';

export interface VehicleDriverProfile {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  vehicle: {
    registrationNo: string;
    makeModelColor: string;
    vehicleType: 'Car' | 'Bike' | 'Truck' | 'SUV';
    insuranceProvider?: string;
  };
}

export interface TelemetrySensors {
  gForce: number; // e.g. 1.1 normal, 14.8 crash
  speedKmH: number; // speed at impact
  rollAngleDeg: number; // rollover angle (0-180)
  airbagDeployed: boolean;
  occupantMotionDetected: boolean;
  impactZone: 'FRONT' | 'SIDE' | 'REAR' | 'ROLLOVER';
}

export interface CctvCamera {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  isOnline: boolean;
  hasCrashDetected: boolean;
  snapshotBg: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  traumaCenterLevel: string; // e.g., 'Level 1 Trauma'
  icuBedsAvailable: number;
  ventilatorAvailable: number;
  bloodBankStock: string[];
  matchScore: number;
  reason: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface ResponderUnit {
  id: string;
  name: string;
  type: 'AMBULANCE' | 'TOWING';
  unitCode: string;
  vehicleNo: string;
  paramedicName: string;
  phone: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'BUSY';
  currentLocationName: string;
  lat: number;
  lng: number;
  etaMinutes: number;
}

export interface VoiceConditionUpdate {
  id: string;
  timestamp: string;
  rawTranscript: string;
  tags: string[];
  patientStatus: 'STABLE' | 'CRITICAL' | 'UNCONSCIOUS' | 'MONITORING';
  speaker: string;
}

export interface Incident {
  id: string;
  createdAt: string;
  timestampMs: number;
  detectionSources: DetectionSource[];
  confirmationCount: number; // 1, 2, or 3
  isMultiSourceConfirmed: boolean;
  severity: SeverityLevel;
  severityScore: number; // 0 - 100
  status: IncidentStatus;
  location: {
    address: string;
    highwayKm: string;
    lat: number;
    lng: number;
    isApproximate: boolean;
  };
  telemetrySnapshot: TelemetrySensors;
  driverProfile: VehicleDriverProfile;
  cctvCameraId?: string;
  assignedUnit?: ResponderUnit;
  targetHospital?: Hospital;
  voiceUpdates: VoiceConditionUpdate[];
  notes?: string;
  routeSignalsCleared: boolean;
}

export type ViewTab = 'VEHICLE' | 'RESPONDER' | 'DISPATCHER';
