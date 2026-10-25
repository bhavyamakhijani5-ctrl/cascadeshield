export const RISK_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
  extreme: '#dc2626',
};

export const HAZARD_COLORS = {
  flood: '#00d4ff',
  landslide: '#a855f7',
  power: '#ffb020',
  water: '#06b6d4',
  road: '#f43f5e',
  hospital: '#22d3ee',
};

export const getRiskLevel = (score) => {
  if (score < 0.2) return { level: 'Low', color: RISK_COLORS.low, bg: 'bg-green-500/20', text: 'text-green-400' };
  if (score < 0.4) return { level: 'Moderate', color: RISK_COLORS.moderate, bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
  if (score < 0.6) return { level: 'High', color: RISK_COLORS.high, bg: 'bg-orange-500/20', text: 'text-orange-400' };
  if (score < 0.8) return { level: 'Critical', color: RISK_COLORS.critical, bg: 'bg-red-500/20', text: 'text-red-400' };
  return { level: 'Extreme', color: RISK_COLORS.extreme, bg: 'bg-red-700/20', text: 'text-red-500' };
};
