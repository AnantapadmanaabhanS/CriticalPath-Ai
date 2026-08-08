import { VehicleDriverProfile, Hospital, ResponderUnit, CctvCamera } from '../types';

export const INITIAL_DRIVER_PROFILE: VehicleDriverProfile = {
  name: "Rahul Sharma",
  age: 34,
  gender: "Male",
  bloodGroup: "O+ Positive",
  allergies: ["Penicillin", "Latex"],
  medicalConditions: ["Type 2 Diabetes", "Mild Asthma"],
  emergencyContact: {
    name: "Priya Sharma",
    relation: "Spouse",
    phone: "+91 98765 43210"
  },
  vehicle: {
    registrationNo: "KA-01-MJ-8821",
    makeModelColor: "Silver Honda City (2023)",
    vehicleType: "Car",
    insuranceProvider: "Star Health & Allied Insurance"
  }
};

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hosp-1",
    name: "Apex Trauma & Super Speciality Hospital",
    address: "NH-44 Bypass, Corridor West, Sector 12",
    distanceKm: 3.8,
    traumaCenterLevel: "Level 1 Trauma Center",
    icuBedsAvailable: 6,
    ventilatorAvailable: 4,
    bloodBankStock: ["O+", "O-", "A+", "B+", "AB+"],
    matchScore: 98,
    reason: "Dedicated 24/7 Level 1 Trauma ICU with direct O+ blood reserve & emergency ventilator beds.",
    phone: "+91 80 4112 9000",
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: "hosp-2",
    name: "St. Jude Emergency & Critical Care",
    address: "Highway Outer Ring Road, Exit 14",
    distanceKm: 6.2,
    traumaCenterLevel: "Level 2 Trauma Center",
    icuBedsAvailable: 3,
    ventilatorAvailable: 2,
    bloodBankStock: ["O+", "B+", "A+"],
    matchScore: 84,
    reason: "Full trauma capabilities; slightly further travel distance via highway.",
    phone: "+91 80 2234 5678",
    lat: 12.9820,
    lng: 77.6100
  },
  {
    id: "hosp-3",
    name: "CityCare General Hospital",
    address: "Main Junction Road, Civil Lines",
    distanceKm: 2.1,
    traumaCenterLevel: "General Emergency",
    icuBedsAvailable: 1,
    ventilatorAvailable: 0,
    bloodBankStock: ["B+", "AB+"],
    matchScore: 62,
    reason: "Closest distance, but limited ventilator capacity & ICU availability.",
    phone: "+91 80 2553 1111",
    lat: 12.9600,
    lng: 77.5800
  }
];

export const MOCK_RESPONDER_UNITS: ResponderUnit[] = [
  {
    id: "unit-amb-101",
    name: "Advanced Life Support (ALS) Ambulance 101",
    type: "AMBULANCE",
    unitCode: "AMB-101",
    vehicleNo: "KA-05-EQ-1001",
    paramedicName: "Dr. Vikram Seth & Paramedic Anita",
    phone: "+91 99000 11201",
    status: "AVAILABLE",
    currentLocationName: "Highway Control Station (KM 208)",
    lat: 12.9680,
    lng: 77.5850,
    etaMinutes: 4
  },
  {
    id: "unit-amb-108",
    name: "Emergency Rapid Response Ambulance 108",
    type: "AMBULANCE",
    unitCode: "AMB-108",
    vehicleNo: "KA-05-EQ-1088",
    paramedicName: "Paramedic Suresh Kumar",
    phone: "+91 99000 11208",
    status: "AVAILABLE",
    currentLocationName: "Sector 9 Toll Plaza Standby",
    lat: 12.9750,
    lng: 77.6050,
    etaMinutes: 7
  },
  {
    id: "unit-tow-201",
    name: "Highway Heavy Recovery Towing Truck 01",
    type: "TOWING",
    unitCode: "TOW-201",
    vehicleNo: "KA-05-TR-2001",
    paramedicName: "Operator Rajesh Singh",
    phone: "+91 99000 11301",
    status: "AVAILABLE",
    currentLocationName: "Expressway Maintenance Depot",
    lat: 12.9630,
    lng: 77.5900,
    etaMinutes: 6
  }
];

export const MOCK_CCTV_CAMERAS: CctvCamera[] = [
  {
    id: "CAM-104",
    name: "NH-44 Corridor — KM 212 Northbound",
    location: "NH-44 Highway Marker 212, Near Flyover",
    lat: 12.9700,
    lng: 77.5920,
    isOnline: true,
    hasCrashDetected: false,
    snapshotBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
  },
  {
    id: "CAM-108",
    name: "NH-44 Toll Plaza Exit — KM 215",
    location: "Expressway Toll Plaza South Bound",
    lat: 12.9780,
    lng: 77.6010,
    isOnline: true,
    hasCrashDetected: false,
    snapshotBg: "linear-gradient(135deg, #111827 0%, #1f2937 100%)"
  },
  {
    id: "CAM-112",
    name: "Bypass Junction Feed — Camera 3",
    location: "Industrial Corridor Outer Slip Road",
    lat: 12.9620,
    lng: 77.5810,
    isOnline: true,
    hasCrashDetected: false,
    snapshotBg: "linear-gradient(135deg, #020617 0%, #0f172a 100%)"
  },
  {
    id: "CAM-116",
    name: "High-Speed Curve Monitoring — CAM-116",
    location: "NH-44 Sharp Curve Marker 218",
    lat: 12.9850,
    lng: 77.6120,
    isOnline: true,
    hasCrashDetected: false,
    snapshotBg: "linear-gradient(135deg, #090d16 0%, #131c2e 100%)"
  }
];
