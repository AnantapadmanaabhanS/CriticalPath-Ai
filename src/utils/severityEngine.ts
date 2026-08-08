import { TelemetrySensors, SeverityLevel, Hospital, ResponderUnit } from '../types';

export interface SeverityEvaluation {
  severity: SeverityLevel;
  score: number;
  description: string;
  recommendedUnitType: 'AMBULANCE' | 'TOWING';
  isUrgentMedical: boolean;
}

/**
 * AI Severity Classification Engine
 * Evaluates impact force, rollover, airbag deployment, speed, and occupant motion signals.
 */
export function evaluateCrashSeverity(sensors: TelemetrySensors, hasCctvConfirmation: boolean = false): SeverityEvaluation {
  let score = 0;

  // 1. Impact Force (G-Force)
  if (sensors.gForce >= 12) score += 40;
  else if (sensors.gForce >= 6) score += 25;
  else if (sensors.gForce >= 3) score += 15;
  else score += 5;

  // 2. Airbag Deployment
  if (sensors.airbagDeployed) score += 25;

  // 3. Rollover Angle
  if (sensors.rollAngleDeg >= 45) score += 20;

  // 4. Speed at Impact
  if (sensors.speedKmH >= 80) score += 15;
  else if (sensors.speedKmH >= 40) score += 10;

  // 5. Occupant Movement Signal
  if (!sensors.occupantMotionDetected) score += 15; // Unresponsive occupant is critical

  // 6. Multi-source confirmation boost
  if (hasCctvConfirmation) score += 10;

  // Cap score at 100
  score = Math.min(100, Math.max(1, score));

  // Determine Severity Level
  if (score >= 60 || sensors.airbagDeployed || sensors.rollAngleDeg >= 45 || !sensors.occupantMotionDetected) {
    return {
      severity: 'HIGH',
      score,
      description: 'HIGH SEVERITY — Severe impact detected. Airbag deployed / potential occupant unresponsiveness. Immediate ALS ICU Ambulance dispatched.',
      recommendedUnitType: 'AMBULANCE',
      isUrgentMedical: true
    };
  } else if (score >= 35 || sensors.gForce >= 5) {
    return {
      severity: 'MEDIUM',
      score,
      description: 'MEDIUM SEVERITY — Moderate collision impact. Vehicle damaged & occupant status unclear. Rapid Ambulance dispatched for safety check.',
      recommendedUnitType: 'AMBULANCE',
      isUrgentMedical: false
    };
  } else {
    return {
      severity: 'LOW',
      score,
      description: 'LOW SEVERITY — Vehicle damaged / undrivable but low impact force and occupant signals OK. Towing recovery vehicle dispatched.',
      recommendedUnitType: 'TOWING',
      isUrgentMedical: false
    };
  }
}

/**
 * Select best hospital based on trauma capabilities, ICU beds, blood bank stock, and proximity
 */
export function rankHospitalsForIncident(hospitals: Hospital[], patientBloodGroup: string): Hospital[] {
  return [...hospitals].sort((a, b) => {
    let scoreA = a.matchScore;
    let scoreB = b.matchScore;

    // Check if blood group matched
    const bloodMatchA = a.bloodBankStock.some(b => patientBloodGroup.includes(b));
    const bloodMatchB = b.bloodBankStock.some(b => patientBloodGroup.includes(b));

    if (bloodMatchA) scoreA += 10;
    if (bloodMatchB) scoreB += 10;

    // Proximity factor
    scoreA -= a.distanceKm * 2;
    scoreB -= b.distanceKm * 2;

    return scoreB - scoreA;
  });
}

/**
 * Find closest available responder unit matching severity requirement
 */
export function findBestResponderUnit(units: ResponderUnit[], unitType: 'AMBULANCE' | 'TOWING'): ResponderUnit | undefined {
  const available = units.filter(u => u.status === 'AVAILABLE' && u.type === unitType);
  if (available.length === 0) {
    // Fallback to any available unit
    return units.find(u => u.status === 'AVAILABLE');
  }
  return available.sort((a, b) => a.etaMinutes - b.etaMinutes)[0];
}
