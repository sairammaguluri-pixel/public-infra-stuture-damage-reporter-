/* ==========================================================================
   GHMC CivicPulse - Greater Hyderabad Municipal Corporation
   Location: Hyderabad, Telangana, India (17.3850, 78.4867)
   ========================================================================== */

const SEED_DEPARTMENTS = [
  {
    id: "dept-roads",
    name: "GHMC Engineering & Roads Department",
    code: "GHMC-ENG",
    categories: ["pothole", "hazardous_debris"],
    contact_info: "roads@ghmc.gov.in | 040-2311-1111",
    sla_hours: 48,
    active_crews: 28
  },
  {
    id: "dept-water",
    name: "HMWSSB Water Supply & Sewerage Board",
    code: "HMWSSB",
    categories: ["water_leak", "storm_drain_blockage"],
    contact_info: "water@hmwssb.gov.in | 040-2311-1122",
    sla_hours: 24,
    active_crews: 22
  },
  {
    id: "dept-electrical",
    name: "GHMC Street Lighting & Electrical Works",
    code: "GHMC-ELEC",
    categories: ["streetlight_outage"],
    contact_info: "electrical@ghmc.gov.in | 040-2311-1133",
    sla_hours: 72,
    active_crews: 18
  },
  {
    id: "dept-parks",
    name: "GHMC Sanitation & Horticulture Division",
    code: "GHMC-SAN",
    categories: ["fallen_tree_branch"],
    contact_info: "sanitation@ghmc.gov.in | 040-2311-1144",
    sla_hours: 36,
    active_crews: 14
  },
  {
    id: "dept-general",
    name: "GHMC Citizen Grievance Redressal Cell",
    code: "GHMC-CELL",
    categories: ["other"],
    contact_info: "grievance@ghmc.gov.in | 1800-425-9999",
    sla_hours: 96,
    active_crews: 10
  }
];

const SEED_WARDS = [
  { id: "ward-1", name: "Secunderabad – Station Road & Cantonment", supervisor: "K. Venkatesh Rao", lat: 17.4399, lng: 78.4983 },
  { id: "ward-2", name: "Banjara Hills – Road No.12 & Jubilee Hills", supervisor: "P. Madhavi Reddy", lat: 17.4123, lng: 78.4482 },
  { id: "ward-3", name: "Old City – Charminar & Laad Bazaar", supervisor: "M. Osman Ali", lat: 17.3616, lng: 78.4747 },
  { id: "ward-4", name: "Kukatpally – KPHB Colony & HITECH City", supervisor: "S. Nagarjuna", lat: 17.4849, lng: 78.3959 },
  { id: "ward-5", name: "LB Nagar – Dilsukhnagar & Uppal", supervisor: "R. Laxmi Devi", lat: 17.3546, lng: 78.5548 },
  { id: "ward-6", name: "Ameerpet – SR Nagar & Punjagutta", supervisor: "T. Ravi Kumar", lat: 17.4374, lng: 78.4487 },
  { id: "ward-7", name: "Mehdipatnam – Tolichowki & Attapur", supervisor: "N. Sirisha", lat: 17.3920, lng: 78.4270 }
];

const SEED_CATEGORIES = {
  pothole: {
    label: "Pothole / Road Surface Damage",
    icon: "fa-road",
    color: "#ef4444",
    defaultDepartment: "dept-roads",
    defaultSla: 48
  },
  streetlight_outage: {
    label: "Streetlight Outage / Dark Stretch",
    icon: "fa-lightbulb",
    color: "#f59e0b",
    defaultDepartment: "dept-electrical",
    defaultSla: 72
  },
  storm_drain_blockage: {
    label: "Clogged Drain / Flooding Risk",
    icon: "fa-filter",
    color: "#3b82f6",
    defaultDepartment: "dept-water",
    defaultSla: 24
  },
  fallen_tree_branch: {
    label: "Fallen Tree / Branch on Road",
    icon: "fa-tree",
    color: "#10b981",
    defaultDepartment: "dept-parks",
    defaultSla: 36
  },
  water_leak: {
    label: "Water Main Pipe Burst / Leak",
    icon: "fa-faucet-drip",
    color: "#2563eb",
    defaultDepartment: "dept-water",
    defaultSla: 24
  },
  hazardous_debris: {
    label: "Hazardous Debris / Construction Waste",
    icon: "fa-triangle-exclamation",
    color: "#f97316",
    defaultDepartment: "dept-roads",
    defaultSla: 24
  },
  other: {
    label: "Other Municipal Grievance",
    icon: "fa-circle-info",
    color: "#6b7280",
    defaultDepartment: "dept-general",
    defaultSla: 96
  }
};

const INITIAL_ROUTING_RULES = [
  { id: "rule-1", category: "pothole", ward_id: "all", department_id: "dept-roads", priority: 1, sla_hours: 48 },
  { id: "rule-2", category: "water_leak", ward_id: "all", department_id: "dept-water", priority: 1, sla_hours: 24 },
  { id: "rule-3", category: "storm_drain_blockage", ward_id: "all", department_id: "dept-water", priority: 1, sla_hours: 24 },
  { id: "rule-4", category: "streetlight_outage", ward_id: "all", department_id: "dept-electrical", priority: 1, sla_hours: 72 },
  { id: "rule-5", category: "fallen_tree_branch", ward_id: "all", department_id: "dept-parks", priority: 1, sla_hours: 36 },
  { id: "rule-6", category: "hazardous_debris", ward_id: "ward-3", department_id: "dept-roads", priority: 2, sla_hours: 12 }
];

// Hyderabad / GHMC Seed Reports
const SEED_REPORTS = [
  {
    id: "GHMC-2026-101",
    category: "pothole",
    severity: "critical",
    confidence_score: 97.2,
    description: "Deep crater on Tank Bund Road near Hussain Sagar roundabout causing multiple vehicle wheel rim damage.",
    photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=75",
    lat: 17.4239,
    lng: 78.4738,
    ward_id: "ward-1",
    status: "in_progress",
    department_id: "dept-roads",
    created_at: "2026-08-05T09:14:00Z",
    updated_at: "2026-08-06T14:30:00Z",
    sla_deadline: "2026-08-07T09:14:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 97.2,
      detected_features: ["asphalt_deep_cavity", "high_traffic_arterial"],
      severity_rationale: "Major crater on Tank Bund — peak traffic corridor. Immediate repair required.",
      auto_routed_to: "GHMC Engineering & Roads Department"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-05T09:14:00Z", note: "Reported via GHMC Mobile App.", actor: "Citizen (Raghavendra)" },
      { status: "acknowledged", timestamp: "2026-08-05T10:02:00Z", note: "Auto-routed to Road Inspector, Circle-2.", actor: "GHMC AI Engine" },
      { status: "in_progress", timestamp: "2026-08-06T14:30:00Z", note: "Hot-mix patching crew dispatched from depot.", actor: "Road Inspector Venkatesh" }
    ]
  },
  {
    id: "GHMC-2026-102",
    category: "water_leak",
    severity: "critical",
    confidence_score: 95.8,
    description: "HMWSSB main pipe burst near Banjara Hills Road No.12, water gushing into road causing traffic disruption.",
    photo_url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=75",
    lat: 17.4123,
    lng: 78.4482,
    ward_id: "ward-2",
    status: "acknowledged",
    department_id: "dept-water",
    created_at: "2026-08-07T06:20:00Z",
    updated_at: "2026-08-07T06:45:00Z",
    sla_deadline: "2026-08-08T06:20:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 95.8,
      detected_features: ["water_jet_burst", "road_flooding"],
      severity_rationale: "Water main burst on premium residential arterial. Immediate valve isolation needed.",
      auto_routed_to: "HMWSSB Water Supply & Sewerage Board"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-07T06:20:00Z", note: "Submitted via GHMC Portal.", actor: "Citizen (Madhavi)" },
      { status: "acknowledged", timestamp: "2026-08-07T06:45:00Z", note: "HMWSSB valve operator crew alerted.", actor: "HMWSSB Control Room" }
    ]
  },
  {
    id: "GHMC-2026-103",
    category: "fallen_tree_branch",
    severity: "high",
    confidence_score: 93.1,
    description: "Giant Peepal tree branch fallen across road near Charminar, blocking traffic towards Laad Bazaar.",
    photo_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=75",
    lat: 17.3616,
    lng: 78.4747,
    ward_id: "ward-3",
    status: "resolved",
    department_id: "dept-parks",
    created_at: "2026-08-04T14:10:00Z",
    updated_at: "2026-08-05T11:00:00Z",
    resolved_at: "2026-08-05T11:00:00Z",
    resolution_photo_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=75",
    sla_deadline: "2026-08-06T02:10:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 93.1,
      detected_features: ["large_branch_obstruction", "heritage_zone"],
      severity_rationale: "Tourist corridor obstruction near Charminar. High footfall area.",
      auto_routed_to: "GHMC Sanitation & Horticulture Division"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-04T14:10:00Z", note: "Reported by local shopkeeper.", actor: "Citizen (Saleem)" },
      { status: "resolved", timestamp: "2026-08-05T11:00:00Z", note: "Debris cleared, road sanitized by GHMC Sanitation team.", actor: "Sanitation Supervisor" }
    ]
  },
  {
    id: "GHMC-2026-104",
    category: "streetlight_outage",
    severity: "medium",
    confidence_score: 90.4,
    description: "Six consecutive streetlights non-functional on KPHB Colony Main Road near Kukatpally metro.",
    photo_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=75",
    lat: 17.4849,
    lng: 78.3959,
    ward_id: "ward-4",
    status: "scheduled",
    department_id: "dept-electrical",
    created_at: "2026-08-06T21:00:00Z",
    updated_at: "2026-08-07T08:15:00Z",
    sla_deadline: "2026-08-09T21:00:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 90.4,
      detected_features: ["unlit_pole_sequence_6"],
      severity_rationale: "Residential area near metro station left in darkness. Safety concern.",
      auto_routed_to: "GHMC Street Lighting & Electrical Works"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-06T21:00:00Z", note: "Submitted from GHMC App.", actor: "Citizen (Pradeep)" },
      { status: "scheduled", timestamp: "2026-08-07T08:15:00Z", note: "Electrical bucket van scheduled for AM shift.", actor: "GHMC Electrical Circle-3" }
    ]
  },
  {
    id: "GHMC-2026-105",
    category: "storm_drain_blockage",
    severity: "high",
    confidence_score: 94.5,
    description: "Major stormwater drain completely blocked with plastic waste near Dilsukhnagar causing waterlogging.",
    photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=75",
    lat: 17.3546,
    lng: 78.5548,
    ward_id: "ward-5",
    status: "under_review",
    department_id: "dept-water",
    created_at: "2026-08-06T16:45:00Z",
    updated_at: "2026-08-07T09:00:00Z",
    sla_deadline: "2026-08-07T16:45:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 94.5,
      detected_features: ["drain_blockage", "monsoon_overflow_risk"],
      severity_rationale: "Monsoon season flood risk. Densely populated area.",
      auto_routed_to: "HMWSSB Water Supply & Sewerage Board"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-06T16:45:00Z", note: "Reported with photo evidence.", actor: "Citizen (Laxmi)" },
      { status: "under_review", timestamp: "2026-08-07T09:00:00Z", note: "Field inspection assigned to HMWSSB technician.", actor: "GHMC Control Room" }
    ]
  },
  {
    id: "GHMC-2026-106",
    category: "hazardous_debris",
    severity: "medium",
    confidence_score: 88.7,
    description: "Construction material and steel rods dumped on footpath in Ameerpet near Metro Pillar No.45.",
    photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=75",
    lat: 17.4374,
    lng: 78.4487,
    ward_id: "ward-6",
    status: "acknowledged",
    department_id: "dept-roads",
    created_at: "2026-08-07T07:30:00Z",
    updated_at: "2026-08-07T09:30:00Z",
    sla_deadline: "2026-08-08T07:30:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 88.7,
      detected_features: ["steel_rods", "footpath_blockage"],
      severity_rationale: "Pedestrian safety hazard near busy metro junction.",
      auto_routed_to: "GHMC Engineering & Roads Department"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-07T07:30:00Z", note: "Submitted.", actor: "Citizen (Ravi Kumar)" },
      { status: "acknowledged", timestamp: "2026-08-07T09:30:00Z", note: "Contractor notice issued.", actor: "GHMC Inspector" }
    ]
  },
  {
    id: "GHMC-2026-107",
    category: "pothole",
    severity: "low",
    confidence_score: 84.3,
    description: "Minor surface cracks and small pothole on Tolichowki side road near Mehdipatnam bus stop.",
    photo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=75",
    lat: 17.3920,
    lng: 78.4270,
    ward_id: "ward-7",
    status: "submitted",
    department_id: "dept-roads",
    created_at: "2026-08-07T10:00:00Z",
    updated_at: "2026-08-07T10:00:00Z",
    sla_deadline: "2026-08-09T10:00:00Z",
    duplicate_of_id: null,
    ai_log: {
      model_version: "GHMC-CivicVision-v4",
      confidence: 84.3,
      detected_features: ["minor_cracks", "surface_pothole"],
      severity_rationale: "Low severity road defect. Routine repair scheduling appropriate.",
      auto_routed_to: "GHMC Engineering & Roads Department"
    },
    timeline: [
      { status: "submitted", timestamp: "2026-08-07T10:00:00Z", note: "Logged via GHMC Citizen Portal.", actor: "Citizen (Sirisha)" }
    ]
  }
];
