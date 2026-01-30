
// DEPRECATED in favor of services/simulationEngine.ts
// Keeping stub for interface compatibility if needed, but App.tsx should use SimulationEngine directly.

import { AnalysisReport, PixelPoint } from '../types';

export const pushAlertToCloud = async (alert: AnalysisReport) => {
    console.log("Simulating Cloud Push:", alert);
    return `local-id-${Date.now()}`;
};

export const subscribeToAlerts = (callback: (alerts: AnalysisReport[]) => void) => {
    return () => {};
};

export const subscribeToGrid = (callback: (points: PixelPoint[]) => void) => {
    return () => {};
};

export const logSystemEvent = async (message: string, type: string) => {
    console.log(`[SYSTEM LOG] ${type}: ${message}`);
};
