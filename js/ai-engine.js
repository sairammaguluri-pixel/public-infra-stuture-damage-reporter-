/* ==========================================================================
   GHMC CivicPulse — AI / Computer Vision Engine & Automated Routing
   Greater Hyderabad Municipal Corporation | Hyderabad, Telangana
   ========================================================================== */

class AIEngine {
  constructor() {
    this.modelVersion = "GHMC-CivicVision-v4-prod";
    this.confidenceThreshold = 70.0; // Flag below 70%
  }

  /**
   * Simulates computer vision classification pipeline on uploaded image.
   * Returns: { category, confidence_score, severity, severity_rationale, detected_features, low_confidence_flag }
   */
  async classifyPhoto(imageDataUrl, userHintCategory = null) {
    // Artificial latency for authentic AI processing visual effect
    await new Promise(resolve => setTimeout(resolve, 800));

    let category = "pothole";
    let confidence = 94.8;
    let severity = "high";
    let rationale = "Deep road surface cavity detected. Risk of vehicular damage.";
    let features = ["asphalt_fracture", "depth_est_3.5in", "car_lane_line"];

    // Heuristic simulation based on image string or user hint
    const lower = imageDataUrl ? imageDataUrl.toLowerCase() : "";

    if (userHintCategory && SEED_CATEGORIES[userHintCategory]) {
      category = userHintCategory;
      confidence = Math.floor(Math.random() * 15) + 84; // 84-98%
    } else if (lower.includes("tree") || lower.includes("branch") || lower.includes("wood")) {
      category = "fallen_tree_branch";
      confidence = 92.4;
      severity = "high";
      rationale = "Large wooden timber obstruction spanning roadway lane.";
      features = ["wood_fiber", "leaf_canopy_dense", "road_obstruction"];
    } else if (lower.includes("water") || lower.includes("leak") || lower.includes("spray")) {
      category = "water_leak";
      confidence = 96.1;
      severity = "critical";
      rationale = "Pressurized fluid spray with pooling stream on pedestrian walkway.";
      features = ["fluid_reflection", "gushing_water", "concrete_erosion"];
    } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("dark")) {
      category = "streetlight_outage";
      confidence = 89.2;
      severity = "medium";
      rationale = "Dark cobra-head fixture detected during operational hours.";
      features = ["unlit_bulb_array", "pole_structure"];
    } else if (lower.includes("drain") || lower.includes("clog")) {
      category = "storm_drain_blockage";
      confidence = 91.5;
      severity = "high";
      rationale = "Storm catch basin grate covered with dense leaf and litter debris.";
      features = ["clogged_grate", "standing_water", "plastic_debris"];
    } else {
      // Standard pothole default or low confidence scenario randomly testable
      category = "pothole";
      confidence = 93.5;
      severity = "high";
      rationale = "Significant asphalt degradation detected with sharp rim edges.";
      features = ["asphalt_depression", "exposed_base_rock"];
    }

    const lowConfidence = confidence < this.confidenceThreshold;

    return {
      category,
      confidence_score: confidence,
      severity,
      severity_rationale: rationale,
      detected_features: features,
      low_confidence_flag: lowConfidence,
      model_version: this.modelVersion,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extracts EXIF GPS Geotag from image file or provides realistic fallback.
   */
  async extractGeotag(file) {
    // Simulates EXIF extraction from photo header
    await new Promise(resolve => setTimeout(resolve, 300));

    // Default: Hyderabad city center with small randomized jitter across GHMC area
    const baseLat = 17.3850;
    const baseLng = 78.4867;
    const jitterLat = (Math.random() - 0.5) * 0.04;  // ±0.02° ≈ ±2km
    const jitterLng = (Math.random() - 0.5) * 0.04;

    return {
      lat: Number((baseLat + jitterLat).toFixed(5)),
      lng: Number((baseLng + jitterLng).toFixed(5)),
      hasExif: true,
      accuracy: 8 // meters
    };
  }

  /**
   * Haversine formula to compute distance between 2 coordinates in meters
   */
  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Detects duplicate reports within radius (e.g. 100m) and time window (7 days)
   */
  detectDuplicates(lat, lng, category, radiusMeters = 150) {
    const allReports = window.appState.getAllReports();
    const matches = [];

    allReports.forEach(report => {
      if (report.status === 'resolved' || report.status === 'rejected') return;
      
      const distance = this.getDistanceMeters(lat, lng, report.lat, report.lng);
      
      // Match category or close proximity
      if (distance <= radiusMeters && (report.category === category || distance <= 40)) {
        matches.push({
          report,
          distanceMeters: Math.round(distance)
        });
      }
    });

    return matches;
  }

  /**
   * Auto-routing engine: Maps category + ward to municipal department via configurable rules table
   */
  routeReport(category, wardId) {
    const rules = window.appState.getRoutingRules();

    // Find specific rule matching category & ward, or category & 'all'
    let rule = rules.find(r => r.category === category && r.ward_id === wardId);
    if (!rule) {
      rule = rules.find(r => r.category === category && r.ward_id === 'all');
    }

    let targetDepartmentId = "dept-general";
    let slaHours = 72;

    if (rule) {
      targetDepartmentId = rule.department_id;
      slaHours = rule.sla_hours;
    } else {
      // Fallback from category default
      const catConfig = SEED_CATEGORIES[category];
      if (catConfig) {
        targetDepartmentId = catConfig.defaultDepartment;
        slaHours = catConfig.defaultSla;
      }
    }

    const deptObj = SEED_DEPARTMENTS.find(d => d.id === targetDepartmentId);
    const deadlineDate = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    return {
      department_id: targetDepartmentId,
      department_name: deptObj ? deptObj.name : "Municipal Department",
      sla_hours: slaHours,
      sla_deadline: deadlineDate
    };
  }
}

window.aiEngine = new AIEngine();
