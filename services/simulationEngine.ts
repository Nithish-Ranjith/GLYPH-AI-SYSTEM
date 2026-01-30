
import { LULCClass, PixelPoint, TransitionData, AnalysisReport } from '../types';
import { CLASS_COLORS, TIRUPATI_COORDS } from '../constants';

// --- SEEDED RANDOM FOR DETERMINISTIC PRODUCTION BEHAVIOR ---
class PseudoRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  
  // Returns 0 to 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Returns range [min, max]
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Global instance for consistency
const rng = new PseudoRandom(12345); 

// --- GEOGRAPHIC CONSTANTS FOR TIRUPATI ---
const GEO_CONSTANTS = {
    LAT_START: 13.58,
    LAT_END: 13.68,
    LNG_START: 79.35,
    LNG_END: 79.50,
    RESOLUTION: 0.0015, // Approx 150m resolution
    CENTER: { lat: 13.6288, lng: 79.4192 },
    RENIGUNTA: { lat: 13.6450, lng: 79.4900 },
    LAKE: { lat: 13.5900, lng: 79.3700 },
    HILL_BOUNDARY: 13.6550
};

// 2D Noise function (Simplex-like)
const noise = (x: number, y: number) => {
    return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 - Math.floor(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
};

export class SimulationEngine {
    private static instance: SimulationEngine;
    public gridData: PixelPoint[] = [];
    public stats: {
        counts2018: Record<string, number>;
        counts2024: Record<string, number>;
        transitions: TransitionData[];
        totalPixels: number;
    } | null = null;

    private constructor() {
        this.generateDataset();
    }

    public static getInstance(): SimulationEngine {
        if (!SimulationEngine.instance) {
            SimulationEngine.instance = new SimulationEngine();
        }
        return SimulationEngine.instance;
    }

    private generateDataset() {
        const points: PixelPoint[] = [];
        let idCounter = 0;
        
        // Reset Stats
        const counts18: Record<string, number> = { 'Forest': 0, 'Water': 0, 'Agriculture': 0, 'Barren': 0, 'Built-up': 0 };
        const counts24: Record<string, number> = { 'Forest': 0, 'Water': 0, 'Agriculture': 0, 'Barren': 0, 'Built-up': 0 };
        const transitionMap: Record<string, number> = {};

        for (let lat = GEO_CONSTANTS.LAT_START; lat <= GEO_CONSTANTS.LAT_END; lat += GEO_CONSTANTS.RESOLUTION) {
            for (let lng = GEO_CONSTANTS.LNG_START; lng <= GEO_CONSTANTS.LNG_END; lng += GEO_CONSTANTS.RESOLUTION) {
                
                // Deterministic Jitter
                if (rng.next() > 0.45) continue; // 55% sparsity

                idCounter++;
                
                // Distances
                const dCity = Math.sqrt(Math.pow(lat - GEO_CONSTANTS.CENTER.lat, 2) + Math.pow(lng - GEO_CONSTANTS.CENTER.lng, 2));
                const dRenigunta = Math.sqrt(Math.pow(lat - GEO_CONSTANTS.RENIGUNTA.lat, 2) + Math.pow(lng - GEO_CONSTANTS.RENIGUNTA.lng, 2));
                const dLake = Math.sqrt(Math.pow(lat - GEO_CONSTANTS.LAKE.lat, 2) + Math.pow(lng - GEO_CONSTANTS.LAKE.lng, 2));

                const n1 = noise(lat * 200, lng * 200); // Terrain noise
                
                // --- 2018 CLASSIFICATION (BASELINE) ---
                let cls18: LULCClass = 'Barren';

                if (lat > GEO_CONSTANTS.HILL_BOUNDARY + (n1 * 0.003)) {
                    cls18 = 'Forest'; // Seshachalam Hills
                } else if (dLake < 0.012 + (n1 * 0.002)) {
                    cls18 = 'Water'; // Rayalacheruvu
                } else if (dCity < 0.030 + (n1 * 0.005)) {
                    cls18 = 'Built-up'; // Core City
                } else if (dRenigunta < 0.015) {
                    cls18 = 'Built-up'; // Renigunta Hub
                } else if (lat > 13.62 && lat < 13.65 && lng > 79.42 && lng < 79.49) {
                     // Corridor Logic
                     if (Math.abs(lat - 13.635) < 0.005) cls18 = 'Built-up';
                     else cls18 = 'Agriculture';
                } else {
                    // Plains
                    cls18 = n1 > -0.2 ? 'Agriculture' : 'Barren';
                }

                // --- 2024 CLASSIFICATION (GROWTH LOGIC) ---
                let cls24: LULCClass = cls18;

                // 1. Urban Sprawl (Distance decay function)
                if (cls18 === 'Agriculture' || cls18 === 'Barren') {
                    const sprawlProb = Math.max(0, 0.8 - (dCity * 20)); // Closer = Higher prob
                    if (rng.next() < sprawlProb) cls24 = 'Built-up';
                    
                    // Corridor thickening
                    if (dRenigunta < 0.025 && rng.next() > 0.5) cls24 = 'Built-up';
                }

                // 2. Encroachment (Forest Edge)
                if (cls18 === 'Forest' && lat < GEO_CONSTANTS.HILL_BOUNDARY + 0.003) {
                     // Alipiri / Foothills encroachment
                     if (lng < 79.40 && rng.next() > 0.85) cls24 = 'Built-up';
                }

                // 3. Water Stress
                if (cls18 === 'Water') {
                    // Lake shrinkage at edges
                    if (dLake > 0.009 && rng.next() > 0.6) cls24 = 'Barren';
                }

                // --- TIME TRAVEL & RISK LOGIC ---
                
                // Calculate Transition Year (2019-2024)
                let transitionYear = 2024;
                if (cls18 !== cls24) {
                    // Logic: Closer to city center = Earlier transition
                    // Logic: Closer to Lake = Later transition (recent encroachment)
                    
                    const distFactor = dCity * 100; // 0 to 5 approx
                    
                    // Base year starts early (2019) and adds years based on distance
                    const baseYear = 2019 + Math.min(4, Math.floor(distFactor));
                    
                    // Add noise
                    transitionYear = Math.min(2024, Math.max(2019, baseYear + Math.floor(rng.range(-1, 2))));
                }

                // Calculate Risk Score
                let riskScore = 10; // Base risk
                
                if (cls24 === 'Built-up') {
                    riskScore += 20; // Base urban strain
                    // High Heat Island Risk in dense center
                    if (dCity < 0.015) riskScore += 30; 
                    // Flood Risk near lake
                    if (dLake < 0.02) riskScore += 45; 
                    // Encroachment Risk
                    if (cls18 === 'Forest') riskScore = 95; 
                } else if (cls24 === 'Barren' && cls18 === 'Water') {
                    riskScore = 90; // Water loss critical
                } else if (cls24 === 'Forest') {
                    riskScore = 5; // Healthy
                }

                // Jitter risk slightly
                riskScore = Math.min(100, Math.max(0, riskScore + rng.range(-5, 5)));

                // Update Stats
                counts18[cls18]++;
                counts24[cls24]++;
                
                const transKey = `${cls18}|${cls24}`; // Pipe separator for parsing later
                transitionMap[transKey] = (transitionMap[transKey] || 0) + 1;

                points.push({
                    id: `px-${idCounter}`,
                    lat, lng,
                    class2018: cls18,
                    class2024: cls24,
                    confidence: rng.range(0.70, 0.99),
                    variation: Math.abs(n1),
                    jitterLat: rng.range(-0.0002, 0.0002),
                    jitterLng: rng.range(-0.0002, 0.0002),
                    radius: rng.range(40, 70),
                    riskScore: Math.round(riskScore),
                    transitionYear: transitionYear
                });
            }
        }

        this.gridData = points;
        
        // Process Transitions for UI
        const transitions: TransitionData[] = [];
        // Approximate Hectares per pixel (150m x 150m = 2.25ha, adjusted for sparsity)
        const HA_FACTOR = 3.5; 

        Object.entries(transitionMap).forEach(([key, count]) => {
            const [from, to] = key.split('|') as [LULCClass, LULCClass];
            transitions.push({
                from, to, hectares: Math.round(count * HA_FACTOR)
            });
        });

        // Scale Counts to Hectares for realism
        const scaledCounts18: Record<string, number> = {};
        const scaledCounts24: Record<string, number> = {};
        
        Object.keys(counts18).forEach(k => scaledCounts18[k] = Math.round(counts18[k] * HA_FACTOR));
        Object.keys(counts24).forEach(k => scaledCounts24[k] = Math.round(counts24[k] * HA_FACTOR));

        this.stats = {
            counts2018: scaledCounts18,
            counts2024: scaledCounts24,
            transitions,
            totalPixels: points.length
        };
    }

    public getAlerts(): AnalysisReport[] {
        // Generate consistent alerts based on the data
        return [
             {
                id: 'alert-001',
                title: 'Critical Forest Encroachment',
                summary: `Detected ${this.getTransitionValue('Forest', 'Built-up')}ha loss in Alipiri Sector.`,
                severity: 'high',
                date: '2024-03-15',
                department: 'Forestry',
                lat: 13.66, lng: 79.39
            },
            {
                id: 'alert-002',
                title: 'Lake Shrinkage Warning',
                summary: `Rayalacheruvu surface area reduced by ${this.getTransitionValue('Water', 'Barren')}ha.`,
                severity: 'medium',
                date: '2024-02-28',
                department: 'Water Works',
                lat: 13.59, lng: 79.37
            },
            {
                id: 'alert-003',
                title: 'Rapid Urban Expansion',
                summary: `Renigunta corridor built-up area increased by ${this.getTransitionValue('Agriculture', 'Built-up')}ha.`,
                severity: 'high',
                date: '2024-01-10',
                department: 'Urban Planning',
                lat: 13.64, lng: 79.48
            }
        ];
    }

    private getTransitionValue(from: string, to: string): number {
        const t = this.stats?.transitions.find(t => t.from === from && t.to === to);
        return t ? t.hectares : 0;
    }
}
