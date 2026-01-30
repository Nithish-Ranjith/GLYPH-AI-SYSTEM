
import { LULCClass, StatMetric, TransitionData, ChartDataPoint, AnalysisReport, GeoPolygon, Department, DepartmentConfig, TrendAlert, SimulationScenario, Language, RiskZone } from './types';

// Sci-Fi / Dark Mode Color Palette
export const CLASS_COLORS: Record<LULCClass, string> = {
  'Forest': '#059669',      // Emerald-600
  'Water': '#3b82f6',       // Blue-500
  'Agriculture': '#fbbf24', // Amber-400
  'Barren': '#475569',      // Slate-600
  'Built-up': '#dc2626',    // Red-600
};

export const TRANSITION_COLOR = '#E056FD';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  'en': {
    // App Titles
    'app.title': 'GLYPH MONITOR',
    'app.subtitle': 'DIGITAL TWIN v2.1',
    'app.analytics': 'TRIAD INTELLIGENCE',
    'app.reports': 'GOVERNANCE REPORTS',
    
    // Navigation
    'nav.monitor': 'Live Monitor',
    'nav.analytics': 'Triad Analysis',
    'nav.reports': 'Alerts & Reports',
    'nav.config': 'Configuration',
    'nav.kernel': 'System Kernel',

    // Status
    'status.online': 'SYSTEM ONLINE',
    'status.operational': 'OPERATIONAL',
    'status.latency': 'LATENCY',
    
    // Live Monitor
    'monitor.layerControl': 'LAYER CONTROL',
    'monitor.confidence': 'CONFIDENCE FILTER',
    'monitor.liveFeed': 'Live Feed',
    'monitor.metrics': 'LIVE METRICS',
    'monitor.viewAs': 'Viewing As',
    'monitor.areaDist': 'Area Distribution (Visible Pixels)',
    'monitor.transitions': 'Key Transitions (2018-24)',
    'monitor.btnReport': 'DOWNLOAD REPORT',
    'layer.lulc': 'LULC Grid',
    'layer.sar': 'Sentinel-1 (SAR)',
    'layer.optical': 'Sentinel-2 (Optical)',

    // Classes
    'class.Forest': 'Forest',
    'class.Water': 'Water',
    'class.Agriculture': 'Agriculture',
    'class.Barren': 'Barren',
    'class.Built-up': 'Urban',

    // Reports
    'reports.total': 'Total Reports',
    'reports.critical': 'Critical Severity',
    'reports.pending': 'Pending Action',
    'reports.filters': 'Filters',
    'reports.search': 'Search alerts...',
    'reports.status': 'Status',
    'reports.severity': 'Severity',
    'reports.dept': 'Department',
    'reports.details': 'Incident Details',
    'reports.location': 'Location',
    'reports.actions': 'Actions',
    'reports.sent': 'SENT',
    'reports.open': 'OPEN',
    'reports.dispatch': 'DISPATCH',

    // Settings
    'settings.account': 'ACCOUNT SECURITY',
    'settings.appearance': 'INTERFACE & REGION',
    'settings.kernel': 'SYSTEM KERNEL',
    'settings.notifications': 'ALERT CHANNELS',
    'settings.lang': 'System Language',
    'settings.sensitivity': 'Anomaly Detection Sensitivity',
    'settings.refresh': 'Sentinel-2 Data Refresh',
    'settings.retention': 'Data Retention Policy',
    'settings.save': 'SAVE CONFIGURATION',
    'settings.signOut': 'SIGN OUT',
    'settings.session': 'ACTIVE SESSION',

    // Auth
    'auth.title': 'SECURE ACCESS GATEWAY',
    'auth.id': 'GOVERNANCE ID',
    'auth.pass': 'PASSCODE',
    'auth.btn': 'AUTHENTICATE',
    'auth.accessDenied': 'ACCESS DENIED: Invalid Credentials'
  },
  'te': {
    'app.title': 'గ్లిఫ్ మానిటర్',
    'app.subtitle': 'డిజిటల్ ట్విన్ v2.1',
    'app.analytics': 'ట్రయాడ్ విశ్లేషణ',
    'app.reports': 'పాలన నివేదికలు',
    
    'nav.monitor': 'లైవ్ మానిటర్',
    'nav.analytics': 'ట్రయాడ్ విశ్లేషణ',
    'nav.reports': 'హెచ్చరికలు & నివేదికలు',
    'nav.config': 'కాన్ఫిగరేషన్',
    'nav.kernel': 'సిస్టమ్ కెర్నల్',

    'status.online': 'సిస్టమ్ ఆన్‌లైన్',
    'status.operational': 'పనిచేస్తోంది',
    'status.latency': 'లేటెన్సీ',

    'monitor.layerControl': 'లేయర్ నియంత్రణ',
    'monitor.confidence': 'కాన్ఫిడెన్స్ ఫిల్టర్',
    'monitor.liveFeed': 'లైవ్ ఫీడ్',
    'monitor.metrics': 'లైవ్ కొలమానాలు',
    'monitor.viewAs': 'వీక్షణ',
    'monitor.areaDist': 'ప్రాంత పంపిణీ (పిక్సెల్స్)',
    'monitor.transitions': 'ప్రధాన మార్పులు (2018-24)',
    'monitor.btnReport': 'నివేదిక డౌన్‌లోడ్ చేయండి',
    'layer.lulc': 'భూ వినియోగ గ్రిడ్',
    'layer.sar': 'సెంటినెల్-1 (SAR)',
    'layer.optical': 'సెంటినెల్-2 (ఆప్టికల్)',

    'class.Forest': 'అడవి',
    'class.Water': 'నీరు',
    'class.Agriculture': 'వ్యవసాయం',
    'class.Barren': 'బీడు భూమి',
    'class.Built-up': 'నగర నిర్మాణాలు',

    'reports.total': 'మొత్తం నివేదికలు',
    'reports.critical': 'అత్యవసర హెచ్చరికలు',
    'reports.pending': 'పెండింగ్ చర్యలు',
    'reports.filters': 'ఫిల్టర్లు',
    'reports.search': 'శోధించండి...',
    'reports.status': 'స్థితి',
    'reports.severity': 'తీవ్రత',
    'reports.dept': 'శాఖ',
    'reports.details': 'సంఘటన వివరాలు',
    'reports.location': 'ప్రాంతం',
    'reports.actions': 'చర్యలు',
    'reports.sent': 'పంపబడింది',
    'reports.open': 'ఓపెన్',
    'reports.dispatch': 'పంపండి',

    'settings.account': 'ఖాతా భద్రత',
    'settings.appearance': 'ఇంటర్ఫేస్ & ప్రాంతం',
    'settings.kernel': 'సిస్టమ్ కెర్నల్',
    'settings.notifications': 'హెచ్చరిక ఛానెల్‌లు',
    'settings.lang': 'సిస్టమ్ భాష',
    'settings.sensitivity': 'గుర్తింపు సున్నితత్వం',
    'settings.refresh': 'డేటా రిఫ్రెష్ రేట్',
    'settings.retention': 'డేటా నిల్వ విధానం',
    'settings.save': 'కాన్ఫిగరేషన్ సేవ్ చేయండి',
    'settings.signOut': 'లాగ్ అవుట్',
    'settings.session': 'యాక్టివ్ సెషన్',

    'auth.title': 'సురక్షిత యాక్సెస్ గేట్‌వే',
    'auth.id': 'గవర్నెన్స్ ఐడి',
    'auth.pass': 'పాస్‌కోడ్',
    'auth.btn': 'ధృవీకరించండి',
    'auth.accessDenied': 'యాక్సెస్ నిరాకరించబడింది'
  },
  'hi': {
    'app.title': 'ग्लिफ मॉनिटर',
    'app.subtitle': 'डिजिटल ट्विन v2.1',
    'app.analytics': 'त्रिकोण विश्लेषण',
    'app.reports': 'शासन रिपोर्ट',
    
    'nav.monitor': 'लाइव मॉनिटर',
    'nav.analytics': 'विश्लेषण',
    'nav.reports': 'चेतावनी और रिपोर्ट',
    'nav.config': 'कॉन्फ़िगरेशन',
    'nav.kernel': 'सिस्टम कर्नेल',

    'status.online': 'सिस्टम ऑनलाइन',
    'status.operational': 'सक्रिय',
    'status.latency': 'विलंबता',

    'monitor.layerControl': 'लेयर नियंत्रण',
    'monitor.confidence': 'विश्वास फिल्टर',
    'monitor.liveFeed': 'लाइव फीड',
    'monitor.metrics': 'लाइव मेट्रिक्स',
    'monitor.viewAs': 'देखने का नजरिया',
    'monitor.areaDist': 'क्षेत्र वितरण (पिक्सेल)',
    'monitor.transitions': 'प्रमुख परिवर्तन (2018-24)',
    'monitor.btnReport': 'रिपोर्ट डाउनलोड करें',
    'layer.lulc': 'भूमि उपयोग ग्रिड',
    'layer.sar': 'सेंटिनल-1 (SAR)',
    'layer.optical': 'सेंटिनल-2 (ऑप्टिकल)',

    'class.Forest': 'वन',
    'class.Water': 'जल',
    'class.Agriculture': 'कृषि',
    'class.Barren': 'बंजर भूमि',
    'class.Built-up': 'शहरी क्षेत्र',

    'reports.total': 'कुल रिपोर्ट',
    'reports.critical': 'गंभीर चेतावनी',
    'reports.pending': 'लंबित कार्रवाई',
    'reports.filters': 'फिल्टर',
    'reports.search': 'खोजें...',
    'reports.status': 'स्थिति',
    'reports.severity': 'गंभीरता',
    'reports.dept': 'विभाग',
    'reports.details': 'घटना का विवरण',
    'reports.location': 'स्थान',
    'reports.actions': 'कार्रवाई',
    'reports.sent': 'प्रेषित',
    'reports.open': 'सक्रिय',
    'reports.dispatch': 'भेजें',

    'settings.account': 'खाता सुरक्षा',
    'settings.appearance': 'इंटरफ़ेस और क्षेत्र',
    'settings.kernel': 'सिस्टम कर्नेल',
    'settings.notifications': 'चेतावनी चैनल',
    'settings.lang': 'सिस्टम भाषा',
    'settings.sensitivity': 'पहचान संवेदनशीलता',
    'settings.refresh': 'डेटा रिफ्रेश',
    'settings.retention': 'डेटा प्रतिधारण नीति',
    'settings.save': 'कॉन्फ़िगरेशन सहेजें',
    'settings.signOut': 'साइन आउट',
    'settings.session': 'सक्रिय सत्र',

    'auth.title': 'सुरक्षित एक्सेस गेटवे',
    'auth.id': 'गवर्नेंस आईडी',
    'auth.pass': 'पासकोड',
    'auth.btn': 'प्रमाणित करें',
    'auth.accessDenied': 'एक्सेस अस्वीकृत'
  }
};

// Initial Empty States for Loading
export const INITIAL_STATS: StatMetric[] = [];
export const INITIAL_TRANSITION_DATA: TransitionData[] = [];
export const INITIAL_PIE_DATA: ChartDataPoint[] = [];

export const RECENT_ALERTS: AnalysisReport[] = [
  {
    id: 'alert-001',
    title: 'Critical: Forest Encroachment',
    summary: 'Detected 420ha Forest → Built-up conversion near Alipiri reserve boundary.',
    severity: 'high',
    date: '2024-03-15',
    department: 'Forestry'
  },
  {
    id: 'alert-002',
    title: 'Water Stress Warning',
    summary: 'Rayalacheruvu surface area shrunk by 5.9% (12ha loss) due to siltation.',
    severity: 'medium',
    date: '2024-02-28',
    department: 'Water Works'
  },
  {
    id: 'alert-003',
    title: 'Rapid Urban Expansion',
    summary: 'Renigunta corridor shows 26.4% increase in built-up area vs 2018.',
    severity: 'high',
    date: '2024-01-10',
    department: 'Urban Planning'
  }
];

// --- MAP DATA ---
export const TIRUPATI_COORDS: [number, number] = [13.6288, 79.4192];

// We define an Area of Interest (AOI) Polygon for grid generation
export const AOI_BOUNDS = [
    [13.6800, 79.3400], // NW
    [13.6800, 79.5200], // NE
    [13.5700, 79.5200], // SE
    [13.5700, 79.3400]  // SW
];

export const MAP_ALERTS: TrendAlert[] = [
  { id: 't1', lat: 13.6650, lng: 79.3600, message: "⚠️ Critical Forest Loss (-420ha)", type: 'critical' },
  { id: 't2', lat: 13.6400, lng: 79.4800, message: "📈 Urban Sprawl (+26%)", type: 'warning' },
  { id: 't3', lat: 13.5900, lng: 79.3800, message: "💧 Lake Shrinkage (-6%)", type: 'critical' }
];

export const RISK_ZONES: RiskZone[] = [
    { id: 'r1', lat: 13.675, lng: 79.39, radius: 800, label: 'Alipiri Corridor', riskLevel: 92, predictedLoss: 120 },
    { id: 'r2', lat: 13.645, lng: 79.49, radius: 1000, label: 'Renigunta Sprawl', riskLevel: 85, predictedLoss: 210 },
    { id: 'r3', lat: 13.585, lng: 79.375, radius: 600, label: 'Lake Periphery', riskLevel: 78, predictedLoss: 45 },
    { id: 'r4', lat: 13.630, lng: 79.450, radius: 700, label: 'Central Densification', riskLevel: 65, predictedLoss: 90 },
    { id: 'r5', lat: 13.660, lng: 79.430, radius: 500, label: 'Northern Expansion', riskLevel: 70, predictedLoss: 75 }
];

// NEW: Temporal Analysis Zones
export const SEASONAL_RISK_ZONES: RiskZone[] = [
    // BRAHMOTSAVAM IMPACT (Pilgrim Influx)
    { id: 'tz-1', lat: 13.6780, lng: 79.3600, radius: 1200, label: 'Alipiri Footpath Entry', riskLevel: 95, predictedLoss: 45, type: 'pilgrim' },
    { id: 'tz-2', lat: 13.6288, lng: 79.4192, radius: 900, label: 'Central Station Hub', riskLevel: 88, predictedLoss: 12, type: 'pilgrim' },
    
    // SUMMER (Fire Risk)
    { id: 'tz-3', lat: 13.6900, lng: 79.3500, radius: 1500, label: 'Seshachalam Dry Zone A', riskLevel: 92, predictedLoss: 120, type: 'fire' },
    { id: 'tz-4', lat: 13.6700, lng: 79.4500, radius: 1100, label: 'Seshachalam Dry Zone B', riskLevel: 78, predictedLoss: 45, type: 'fire' },

    // MONSOON (Flood Risk)
    { id: 'tz-5', lat: 13.5900, lng: 79.3700, radius: 1300, label: 'Rayalacheruvu Floodplain', riskLevel: 85, predictedLoss: 0, type: 'flood' },
    { id: 'tz-6', lat: 13.6200, lng: 79.4300, radius: 800, label: 'Urban Low-Lying Area', riskLevel: 90, predictedLoss: 0, type: 'flood' }
];

// Re-export polygons as a fallback for the old code, though we will move to Grid
export const TIRUPATI_POLYGONS: GeoPolygon[] = [];
// Updated Geo Zones to match new data
export const GEO_ZONES: GeoPolygon[] = [
    { id: "A1", path: [[13.66, 79.36]], class2018: "Forest", class2024: "Built-up", label: "Alipiri Edge", confidence: 0.92 },
    { id: "B2", path: [[13.64, 79.48]], class2018: "Agriculture", class2024: "Built-up", label: "Renigunta Exp", confidence: 0.88 },
    { id: "C3", path: [[13.59, 79.38]], class2018: "Water", class2024: "Barren", label: "Lake Bed", confidence: 0.85 }
];


// DEPARTMENT CONFIGURATIONS
export const DEPT_CONFIGS: Record<Department, DepartmentConfig> = {
  'Forestry': {
    metrics: ['Forest Cover', 'Encroachment Rate', 'Biodiversity Index'],
    focusArea: 'Seshachalam Biosphere & Periphery',
    themeColor: 'emerald',
    rules: [
      'Strict enforcement of 500m buffer zone around Seshachalam Hills.',
      'Immediate eviction notice for unauthorized structures in Grid F-12.',
      'Reforestation drive mandatory for any cleared barren land > 2ha.'
    ],
    futureTrends: [
      'Projected loss of 210ha forest by 2027 if trends continue.',
      'High fragmentation risk in Northern corridor.',
      'Increased human-wildlife conflict zones near Alipiri.'
    ]
  },
  'Water Works': {
    metrics: ['Surface Water Area', 'Groundwater Levels', 'Pollution Index'],
    focusArea: 'Rayalacheruvu & Swarnamukhi River',
    themeColor: 'cyan',
    rules: [
      'No new borewells permitted in Red Zone (City Center).',
      'Mandatory rainwater harvesting for plots > 200 sq. yards.',
      'Industrial effluent monitoring frequency increased to weekly.'
    ],
    futureTrends: [
      'Critical groundwater depletion expected in Southern wards by 2025.',
      'Rayalacheruvu capacity may drop by 20% due to siltation.',
      'High flood risk due to 451ha impervious surface gain.'
    ]
  },
  'Urban Planning': {
    metrics: ['Built-up Density', 'Road Connectivity', 'Green Space Ratio'],
    focusArea: 'Tirupati Municipal Corporation Limits',
    themeColor: 'indigo',
    rules: [
      'FSI cap of 1.5 strictly enforced in Heritage Zones.',
      'Commercial conversion prohibited in designated residential colonies.',
      '30% Green Cover mandatory for new layouts > 5 acres.'
    ],
    futureTrends: [
      'Urban area projected to reach 3,180ha by 2027.',
      'Traffic density on AIR Bypass Road to exceed capacity by 40%.',
      'Heat island effect intensity to rise by 2°C in CBD.'
    ]
  },
  'General Administration': {
    metrics: ['Overall Compliance', 'Public Grievances', 'Revenue Collection'],
    focusArea: 'All Zones',
    themeColor: 'amber',
    rules: [
      'Inter-departmental coordination committee meeting every Monday.',
      'Digitization of all land records to be completed by Q4.',
      'Zero tolerance policy on encroachment of government lands.'
    ],
    futureTrends: [
      'Population influx of 15% expected due to new pilgrim corridors.',
      'Demand for smart utility grid to double in 3 years.',
      'Rising need for automated waste management systems.'
    ]
  }
};

// --- SIMULATION & ECONOMIC CONSTANTS ---

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim_green_belt',
    label: 'Enforce Green Belt (500m)',
    description: 'Strictly prohibit construction within 500m of forest boundary.',
    impact: {
      targetClass: 'Built-up',
      percentChange: -0.15, // Slows growth by 15% (saving ~200ha)
      revenueImpact: -15.5 // Loss of 15.5 Cr in potential tax
    },
    isActive: false
  },
  {
    id: 'sim_agri_permit',
    label: 'Restrict Agri-Conversion Permits',
    description: 'Halt all land-use conversion permits for agricultural lands > 2 acres.',
    impact: {
      targetClass: 'Agriculture',
      percentChange: 0.40, // Retains 40% of agri land destined for conversion
      revenueImpact: -8.2 // Loss in conversion fees
    },
    isActive: false
  },
  {
    id: 'sim_lake_restoration',
    label: 'Rayalacheruvu Restoration',
    description: 'Invest in desilting and removing encroachments from lake bed.',
    impact: {
      targetClass: 'Water',
      percentChange: 0.10, // 10% recovery
      revenueImpact: 12.0 // Long term gain
    },
    isActive: false
  }
];

// Tuned Factors to match the story:
// Carbon: ~1200 INR/ton to get ~6.8 Cr from 379ha
// Tax: ~120,000 INR/ha to get ~7.2 Cr from 601ha
// Flood Risk: Adjusted to factor in Impervious Surface
export const ECONOMIC_FACTORS = {
  CARBON_PRICE_PER_TON: 1200, 
  CARBON_TONS_PER_HA_FOREST: 150,
  TAX_REVENUE_PER_HA_URBAN: 120000, 
  FLOOD_RISK_COST_PER_HA_WATER_LOST: 2500000,
  FLOOD_RISK_COST_PER_HA_URBAN_GAIN: 100000 // Cost of increased runoff per ha of new concrete
};

export const EVENT_SAMPLING_OPTIONS = [
  "2018 Baseline (Sentinel-2)",
  "Post-Brahmotsavam 2022",
  "Peak Summer 2023",
  "Pre-Monsoon 2024",
  "Current (Live Feed)"
];
