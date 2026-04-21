// ============================================================
// aiEngine.js — Rule-Based AI Detection Engine
//
// This is the core intelligence of Sentinel+.
// Implements simple but realistic medical rules to detect
// abnormal conditions without needing any ML framework.
//
// Rules are based on standard clinical threshold guidelines.
// ============================================================
 
/**
 * Analyze a set of vital readings and return risk assessment.
 *
 * @param {object} current     - Current reading { heartRate, activityLevel, secondsSinceLastMovement }
 * @param {array}  history     - Last N heart rate readings (numbers)
 * @param {object} thresholds  - User's custom thresholds from their profile
 * @returns {{ status, issues, score }}
 */
function analyzeVitals(current, history = [], thresholds = {}) {
  const {
    heartRate,
    activityLevel,
    secondsSinceLastMovement = 0,
  } = current;
 
  const {
    heartRateUpperThreshold = 100,
    heartRateLowerThreshold = 55,
    inactivityThresholdMinutes = 30,
  } = thresholds;
 
  const issues = [];    // Array of detected problems
  let status = 'normal';
  let riskScore = 0;    // 0–100 risk score
 
  // ── RULE 1: Heart Rate Upper Threshold ──
  // Critical: > 120 bpm (tachycardia territory)
  // Warning:  > upper threshold (default 100 bpm)
  if (heartRate > 120) {
    issues.push({
      rule: 'HR_HIGH_CRITICAL',
      msg: `Critical tachycardia: ${heartRate} bpm (threshold: 120)`,
      level: 'critical',
    });
    status = 'critical';
    riskScore += 40;
  } else if (heartRate > heartRateUpperThreshold) {
    issues.push({
      rule: 'HR_HIGH_WARNING',
      msg: `Elevated heart rate: ${heartRate} bpm (threshold: ${heartRateUpperThreshold})`,
      level: 'warning',
    });
    if (status !== 'critical') status = 'warning';
    riskScore += 20;
  }
 
  // ── RULE 2: Heart Rate Lower Threshold ──
  // Critical: < 40 bpm (severe bradycardia)
  // Warning:  < lower threshold (default 55 bpm)
  if (heartRate < 40) {
    issues.push({
      rule: 'HR_LOW_CRITICAL',
      msg: `Severe bradycardia: ${heartRate} bpm (threshold: 40)`,
      level: 'critical',
    });
    status = 'critical';
    riskScore += 40;
  } else if (heartRate < heartRateLowerThreshold) {
    issues.push({
      rule: 'HR_LOW_WARNING',
      msg: `Low heart rate: ${heartRate} bpm (threshold: ${heartRateLowerThreshold})`,
      level: 'warning',
    });
    if (status !== 'critical') status = 'warning';
    riskScore += 20;
  }
 
  // ── RULE 3: Sudden Change Detection ──
  // Compares current HR to average of last 5 readings
  // Sudden spike or drop is a red flag even if within threshold
  if (history.length >= 3) {
    const recent = history.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const change = Math.abs(heartRate - avg);
 
    if (change > 30) {
      issues.push({
        rule: 'SUDDEN_CHANGE_CRITICAL',
        msg: `Sudden heart rate change: ${change > 0 ? '+' : ''}${Math.round(heartRate - avg)} bpm from recent average`,
        level: 'critical',
      });
      status = 'critical';
      riskScore += 35;
    } else if (change > 18) {
      issues.push({
        rule: 'SUDDEN_CHANGE_WARNING',
        msg: `Rapid heart rate change: ${Math.round(Math.abs(heartRate - avg))} bpm from recent average`,
        level: 'warning',
      });
      if (status !== 'critical') status = 'warning';
      riskScore += 15;
    }
  }
 
  // ── RULE 4: Prolonged Inactivity ──
  // No movement for extended period can indicate a fall or loss of consciousness
  const inactivityMinutes = secondsSinceLastMovement / 60;
  const criticalInactivity = inactivityThresholdMinutes * 2; // 2x the warning threshold
 
  if (inactivityMinutes > criticalInactivity) {
    issues.push({
      rule: 'INACTIVITY_CRITICAL',
      msg: `No movement for ${Math.round(inactivityMinutes)} minutes — possible fall or emergency`,
      level: 'critical',
    });
    status = 'critical';
    riskScore += 30;
  } else if (inactivityMinutes > inactivityThresholdMinutes) {
    issues.push({
      rule: 'INACTIVITY_WARNING',
      msg: `Extended inactivity: ${Math.round(inactivityMinutes)} minutes with no movement`,
      level: 'warning',
    });
    if (status !== 'critical') status = 'warning';
    riskScore += 15;
  }
 
  // ── RULE 5: High HR + Low Activity Combination ──
  // High heart rate while stationary is a suspicious pattern
  // (could indicate stress, cardiac event, or anxiety)
  if (heartRate > 95 && activityLevel < 20 && secondsSinceLastMovement > 60) {
    issues.push({
      rule: 'HIGH_HR_LOW_ACTIVITY',
      msg: `High heart rate (${heartRate} bpm) with no physical activity — unusual pattern`,
      level: 'warning',
    });
    if (status !== 'critical') status = 'warning';
    riskScore += 20;
  }
 
  // Cap risk score at 100
  riskScore = Math.min(100, riskScore);
 
  return {
    status,          // 'normal' | 'warning' | 'critical'
    issues,          // Array of detected issues with rule + message + level
    riskScore,       // 0–100 numeric risk score
    primaryIssue: issues.length > 0 ? issues[0] : null,
  };
}
 
/**
 * Generate a sensor reading with natural fluctuation.
 * Simulates real wearable device behavior.
 *
 * @param {number} lastHR       - Previous heart rate value
 * @param {number} lastActivity - Previous activity level
 * @param {string} mode         - 'normal' | 'warning' | 'critical'
 */
function simulateSensorReading(lastHR = 72, lastActivity = 65, mode = 'normal') {
  let heartRate, activityLevel;
 
  if (mode === 'critical') {
    // Simulate a critical event (spike or severe drop)
    const isSpiking = Math.random() > 0.5;
    heartRate    = isSpiking
      ? Math.floor(Math.random() * 30 + 120)   // 120–150 spike
      : Math.floor(Math.random() * 20 + 28);   // 28–48 drop
    activityLevel = Math.floor(Math.random() * 15);
  } else if (mode === 'warning') {
    heartRate    = Math.random() > 0.5
      ? Math.floor(Math.random() * 15 + 101)   // 101–116 elevated
      : Math.floor(Math.random() * 10 + 44);   // 44–54 low
    activityLevel = Math.floor(Math.random() * 30 + 5);
  } else {
    // Normal: gentle random walk around last value
    const hrDelta  = (Math.random() - 0.5) * 10;
    const actDelta = (Math.random() - 0.5) * 14;
    heartRate     = Math.round(Math.max(58, Math.min(100, lastHR + hrDelta)));
    activityLevel = Math.round(Math.max(15, Math.min(95, lastActivity + actDelta)));
  }
 
  return { heartRate, activityLevel };
}
 
module.exports = { analyzeVitals, simulateSensorReading };
