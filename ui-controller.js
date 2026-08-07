/* ==========================================================================
   GHMC CivicPulse — UI Controller & View Renderer
   Greater Hyderabad Municipal Corporation | Hyderabad, Telangana
   ========================================================================== */

class UIController {
  constructor() {
    this.currentView = 'home';
    this.wizardState = {
      step: 1,
      photoUrl: null,
      lat: 17.3850,
      lng: 78.4867,
      aiResult: null,
      confirmedCategory: null,
      confirmedSeverity: null,
      description: "",
      wardId: "ward-1"
    };
    this.activeDetailReportId = null;
    this.mapFilters = {
      category: 'all',
      severity: 'all',
      status: 'all',
      search: ''
    };
  }

  init() {
    this.bindGlobalEvents();
    this.switchView('home');
    this.renderMetricsSummary();
    
    // Subscribe to state updates
    window.appState.subscribe(() => {
      this.renderCurrentView();
    });
  }

  bindGlobalEvents() {
    // Role switcher dropdown
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.value = window.appState.currentRole;
      roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        window.appState.setRole(role);
        this.showToast(`Switched active workspace role to: ${role.toUpperCase()}`);
        
        if (role === 'staff') {
          this.switchView('staff-queue');
        } else if (role === 'admin') {
          this.switchView('admin-rules');
        } else {
          this.switchView('home');
        }
      });
    }
  }

  switchView(viewId) {
    this.currentView = viewId;
    
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) targetSec.classList.add('active');

    const targetNav = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (targetNav) targetNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'home':
        this.renderHomeView();
        break;
      case 'report-wizard':
        this.renderWizardStep();
        break;
      case 'public-map':
        this.renderPublicMapView();
        break;
      case 'report-detail':
        this.renderReportDetailView();
        break;
      case 'accountability':
        this.renderAccountabilityView();
        break;
      case 'staff-queue':
        this.renderStaffQueueView();
        break;
      case 'admin-rules':
        this.renderAdminRulesView();
        break;
    }
    this.renderMetricsSummary();
  }

  renderMetricsSummary() {
    const metrics = window.appState.getMetricsSummary();

    const elTotal = document.getElementById('stat-total-reports');
    if (elTotal) elTotal.innerText = metrics.totalReports;

    const elResolve = document.getElementById('stat-avg-resolution');
    if (elResolve) elResolve.innerText = `${metrics.avgResolveHours}h`;

    const elSla = document.getElementById('stat-sla-pct');
    if (elSla) elSla.innerText = `${metrics.slaMetPct}%`;

    const elCrews = document.getElementById('stat-active-crews');
    if (elCrews) elCrews.innerText = "42 Crews";
  }

  /* --------------------------------------------------------------------------
     1. HOME VIEW RENDERER
     -------------------------------------------------------------------------- */
  renderHomeView() {
    const container = document.getElementById('recent-reports-grid');
    if (!container) return;

    const reports = window.appState.getAllReports().slice(0, 6);
    container.innerHTML = reports.map(r => this.createReportCardHTML(r)).join('');
  }

  createReportCardHTML(report) {
    const cat = SEED_CATEGORIES[report.category] || SEED_CATEGORIES.other;
    const ward = SEED_WARDS.find(w => w.id === report.ward_id);

    return `
      <div class="report-card card-hover" onclick="window.uiController.showReportDetail('${report.id}')">
        <div style="position: relative;">
          <img src="${report.photo_url}" class="report-card-thumb" alt="${cat.label}" />
          <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 6px;">
            <span class="severity-chip severity-${report.severity}">${report.severity}</span>
          </div>
          <div style="position: absolute; bottom: 10px; left: 10px;">
            <span class="badge badge-${report.status}">${report.status.replace('_', ' ')}</span>
          </div>
        </div>
        <div class="report-card-content">
          <div class="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
            <span><i class="fa-solid ${cat.icon}" style="color:${cat.color}"></i> ${cat.label.split('/')[0]}</span>
            <span class="font-mono text-navy-900 font-bold">${report.id}</span>
          </div>
          <div class="text-xs text-slate-400 font-semibold mb-1">
            <i class="fa-solid fa-location-dot text-brand"></i> ${ward ? ward.name : 'Ward 1'}
          </div>
          <p class="font-bold text-navy-900 text-sm mb-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            ${report.description || cat.label}
          </p>
          <div class="flex justify-between items-center text-xs text-slate-400 mt-auto" style="border-top:1px solid #f1f5f9; padding-top:8px;">
            <span><i class="fa-solid fa-clock"></i> ${new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span class="text-brand font-semibold">View Transparency Timeline &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     2. CITIZEN REPORT WIZARD FLOW RENDERER
     -------------------------------------------------------------------------- */
  startReportWizard() {
    this.wizardState = {
      step: 1,
      photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=75",
      lat: 17.3850,
      lng: 78.4867,
      aiResult: null,
      confirmedCategory: null,
      confirmedSeverity: null,
      description: "",
      wardId: "ward-1"
    };
    this.switchView('report-wizard');
  }

  renderWizardStep() {
    const step = this.wizardState.step;
    
    // Update step indicators
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`wizard-step-indicator-${i}`);
      if (el) {
        el.classList.remove('active', 'completed');
        if (i < step) el.classList.add('completed');
        if (i === step) el.classList.add('active');
      }
    }

    document.querySelectorAll('.wizard-step-content').forEach(c => c.classList.add('hidden'));

    if (step === 1) {
      document.getElementById('wizard-step-1').classList.remove('hidden');
    } else if (step === 2) {
      document.getElementById('wizard-step-2').classList.remove('hidden');
      this.renderWizardStep2AI();
    } else if (step === 3) {
      document.getElementById('wizard-step-3').classList.remove('hidden');
      this.renderWizardStep3Map();
    } else if (step === 4) {
      document.getElementById('wizard-step-4').classList.remove('hidden'); // Confirmation
    }
  }

  async handlePhotoUpload(fileOrPresetUrl) {
    this.wizardState.photoUrl = typeof fileOrPresetUrl === 'string' ? fileOrPresetUrl : URL.createObjectURL(fileOrPresetUrl);
    
    // Extract Geotag
    const geotag = await window.aiEngine.extractGeotag(fileOrPresetUrl);
    this.wizardState.lat = geotag.lat;
    this.wizardState.lng = geotag.lng;

    // Run AI Classification
    this.wizardState.step = 2;
    this.renderWizardStep();
  }

  async renderWizardStep2AI() {
    const previewImg = document.getElementById('wizard-ai-preview');
    if (previewImg) previewImg.src = this.wizardState.photoUrl;

    const loadingBox = document.getElementById('wizard-ai-loading');
    const resultsBox = document.getElementById('wizard-ai-results');
    
    if (loadingBox) loadingBox.classList.remove('hidden');
    if (resultsBox) resultsBox.classList.add('hidden');

    // Call AI Engine
    const result = await window.aiEngine.classifyPhoto(this.wizardState.photoUrl);
    this.wizardState.aiResult = result;
    this.wizardState.confirmedCategory = result.category;
    this.wizardState.confirmedSeverity = result.severity;

    // Check for Duplicates
    const duplicates = window.aiEngine.detectDuplicates(this.wizardState.lat, this.wizardState.lng, result.category);
    
    if (loadingBox) loadingBox.classList.add('hidden');
    if (resultsBox) resultsBox.classList.remove('hidden');

    // Populate AI fields
    const scoreFormatted = Number(result.confidence_score).toFixed(1);
    document.getElementById('ai-confidence-score').innerText = `${scoreFormatted}%`;
    document.getElementById('ai-confidence-fill').style.width = `${scoreFormatted}%`;
    document.getElementById('ai-category-suggestion').innerText = SEED_CATEGORIES[result.category].label;
    document.getElementById('ai-severity-suggestion').innerText = result.severity.toUpperCase();
    document.getElementById('ai-rationale-text').innerText = result.severity_rationale;

    // Low confidence warning
    const lowConfBox = document.getElementById('ai-low-confidence-warning');
    if (lowConfBox) {
      if (result.low_confidence_flag) {
        lowConfBox.classList.remove('hidden');
      } else {
        lowConfBox.classList.add('hidden');
      }
    }

    // Duplicate detection alert box
    const dupAlert = document.getElementById('ai-duplicate-alert');
    if (dupAlert) {
      if (duplicates.length > 0) {
        dupAlert.classList.remove('hidden');
        document.getElementById('duplicate-count-text').innerText = 
          `Found ${duplicates.length} report(s) within ${duplicates[0].distanceMeters}m radius! Report #${duplicates[0].report.id} was submitted ${new Date(duplicates[0].report.created_at).toLocaleDateString()}.`;
      } else {
        dupAlert.classList.add('hidden');
      }
    }

    // Category override select
    const categorySelect = document.getElementById('wizard-category-override');
    if (categorySelect) {
      categorySelect.value = result.category;
    }

    const severitySelect = document.getElementById('wizard-severity-override');
    if (severitySelect) {
      severitySelect.value = result.severity;
    }
  }

  renderWizardStep3Map() {
    const latInput = document.getElementById('wizard-lat');
    const lngInput = document.getElementById('wizard-lng');
    if (latInput) latInput.value = this.wizardState.lat;
    if (lngInput) lngInput.value = this.wizardState.lng;

    // Initialize Leaflet Wizard Map
    setTimeout(() => {
      window.mapManager.initWizardMap('wizard-map', this.wizardState.lat, this.wizardState.lng, (newLat, newLng) => {
        this.wizardState.lat = parseFloat(newLat);
        this.wizardState.lng = parseFloat(newLng);
        if (latInput) latInput.value = newLat;
        if (lngInput) lngInput.value = newLng;
      });
    }, 100);
  }

  submitReportWizard() {
    const category = document.getElementById('wizard-category-override').value;
    const severity = document.getElementById('wizard-severity-override').value;
    const description = document.getElementById('wizard-description').value;
    const wardId = document.getElementById('wizard-ward').value;

    // Route report via AI engine
    const routing = window.aiEngine.routeReport(category, wardId);

    const reportId = `GHMC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport = {
      id: reportId,
      category,
      severity,
      confidence_score: this.wizardState.aiResult ? this.wizardState.aiResult.confidence_score : 95.0,
      description: description || SEED_CATEGORIES[category].label,
      photo_url: this.wizardState.photoUrl,
      lat: this.wizardState.lat,
      lng: this.wizardState.lng,
      ward_id: wardId,
      status: "submitted",
      department_id: routing.department_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sla_deadline: routing.sla_deadline,
      duplicate_of_id: null,
      ai_log: {
        model_version: this.wizardState.aiResult ? this.wizardState.aiResult.model_version : "GHMC-CivicVision-v4",
        confidence: this.wizardState.aiResult ? this.wizardState.aiResult.confidence_score : 95.0,
        detected_features: this.wizardState.aiResult ? this.wizardState.aiResult.detected_features : ["user_uploaded"],
        severity_rationale: this.wizardState.aiResult ? this.wizardState.aiResult.severity_rationale : "User confirmed severity",
        auto_routed_to: routing.department_name
      },
      timeline: [
        {
          status: "submitted",
          timestamp: new Date().toISOString(),
          note: `Report submitted via Citizen Portal. Auto-routed to ${routing.department_name} (SLA: ${routing.sla_hours} hours).`,
          actor: "Citizen (Anonymous)"
        }
      ]
    };

    window.appState.addReport(newReport);
    this.wizardState.createdReportId = reportId;

    // Render Confirmation Step 4
    document.getElementById('wizard-step-3').classList.add('hidden');
    document.getElementById('wizard-step-4').classList.remove('hidden');

    document.getElementById('confirm-tracking-id').innerText = reportId;
    document.getElementById('confirm-assigned-dept').innerText = routing.department_name;
    document.getElementById('confirm-sla-hours').innerText = `${routing.sla_hours} Hours Target`;

    this.showToast(`Report #${reportId} successfully submitted!`);
  }

  /* --------------------------------------------------------------------------
     3. PUBLIC MAP VIEW RENDERER
     -------------------------------------------------------------------------- */
  renderPublicMapView() {
    const allReports = window.appState.getAllReports();
    
    // Filter reports based on mapFilters
    const filtered = allReports.filter(r => {
      if (this.mapFilters.category !== 'all' && r.category !== this.mapFilters.category) return false;
      if (this.mapFilters.severity !== 'all' && r.severity !== this.mapFilters.severity) return false;
      if (this.mapFilters.status !== 'all' && r.status !== this.mapFilters.status) return false;
      if (this.mapFilters.search) {
        const q = this.mapFilters.search.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        if (!matchId && !matchDesc) return false;
      }
      return true;
    });

    // Render Sidebar Cards
    const sidebarList = document.getElementById('map-sidebar-reports');
    if (sidebarList) {
      if (filtered.length === 0) {
        sidebarList.innerHTML = `
          <div class="text-center text-slate-500 py-8">
            <i class="fa-solid fa-filter-circle-xmark text-3xl mb-2"></i>
            <p class="font-bold">No reports match your filters</p>
            <p class="text-xs text-slate-400">Try adjusting category, status, or search terms.</p>
          </div>
        `;
      } else {
        sidebarList.innerHTML = filtered.map(r => this.createReportCardHTML(r)).join('');
      }
    }

    // Render Leaflet Map Markers
    // Guard: only fully init the map on first load of this view.
    // On subsequent filter changes, just update markers to avoid flicker/lag.
    setTimeout(() => {
      if (!window.mapManager.publicMap) {
        window.mapManager.initPublicMap('public-map', filtered, (selectedId) => {
          this.highlightMapSidebarCard(selectedId);
        });
      } else {
        window.mapManager.renderPublicMarkers(filtered);
      }
    }, 80);
  }

  highlightMapSidebarCard(reportId) {
    const cards = document.querySelectorAll('#map-sidebar-reports .report-card');
    cards.forEach(c => c.style.border = '');
    
    const targetCard = Array.from(cards).find(c => c.innerText.includes(reportId));
    if (targetCard) {
      targetCard.style.border = '2px solid var(--color-brand-primary)';
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  updateMapFilters() {
    this.mapFilters.category = document.getElementById('filter-map-category').value;
    this.mapFilters.severity = document.getElementById('filter-map-severity').value;
    this.mapFilters.status = document.getElementById('filter-map-status').value;
    this.mapFilters.search = document.getElementById('filter-map-search').value;

    this.renderPublicMapView();
  }

  /* --------------------------------------------------------------------------
     4. PUBLIC REPORT DETAIL & TIMELINE VIEW RENDERER
     -------------------------------------------------------------------------- */
  showReportDetail(reportId) {
    this.activeDetailReportId = reportId;
    this.switchView('report-detail');
  }

  renderReportDetailView() {
    const reportId = this.activeDetailReportId || "GHMC-2026-101";
    const report = window.appState.getReportById(reportId);
    if (!report) return;

    const cat = SEED_CATEGORIES[report.category] || SEED_CATEGORIES.other;
    const dept = SEED_DEPARTMENTS.find(d => d.id === report.department_id);
    const ward = SEED_WARDS.find(w => w.id === report.ward_id);

    // Header info
    document.getElementById('detail-id-header').innerText = report.id;
    document.getElementById('detail-category-badge').innerHTML = `
      <span class="badge" style="background-color: ${cat.color}18; color: ${cat.color}; border: 1px solid ${cat.color}40; font-weight: 700;">
        <i class="fa-solid ${cat.icon}"></i> ${cat.label}
      </span>
    `;
    document.getElementById('detail-severity-badge').innerHTML = `<span class="severity-chip severity-${report.severity}">${report.severity}</span>`;
    document.getElementById('detail-status-badge').innerHTML = `<span class="badge badge-${report.status}">${report.status.replace('_', ' ')}</span>`;
    
    // Metadata Cards
    if (document.getElementById('detail-ward-name')) {
      document.getElementById('detail-ward-name').innerText = ward ? ward.name : (report.ward_id || "Ward 1 - Downtown");
    }
    if (document.getElementById('detail-coords')) {
      document.getElementById('detail-coords').innerText = `${report.lat ? report.lat.toFixed(5) : '17.38500'}, ${report.lng ? report.lng.toFixed(5) : '78.48670'}`;
    }
    if (document.getElementById('detail-dept-assigned')) {
      document.getElementById('detail-dept-assigned').innerText = dept ? dept.name : "Municipal Department";
    }
    if (document.getElementById('detail-dept-contact')) {
      document.getElementById('detail-dept-contact').innerText = dept ? dept.contact_info : "grievance@ghmc.gov.in | 1800-425-9999";
    }
    if (document.getElementById('detail-sla-target')) {
      document.getElementById('detail-sla-target').innerText = `${dept ? dept.sla_hours : 48} Hours SLA`;
    }
    if (document.getElementById('detail-sla-status')) {
      const isBreached = report.sla_deadline && new Date() > new Date(report.sla_deadline) && report.status !== 'resolved';
      document.getElementById('detail-sla-status').innerHTML = isBreached 
        ? `<span class="text-red-600 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> OVERDUE</span>`
        : `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> On Track</span>`;
    }
    if (document.getElementById('detail-created-at')) {
      document.getElementById('detail-created-at').innerText = new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (document.getElementById('detail-time-ago')) {
      document.getElementById('detail-time-ago').innerText = `${new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (document.getElementById('detail-description')) {
      document.getElementById('detail-description').innerText = report.description || cat.label;
    }

    // Photo
    const photoEl = document.getElementById('detail-photo');
    if (photoEl) photoEl.src = report.photo_url;

    // Render Mini Location Map
    setTimeout(() => {
      window.mapManager.initDetailMap('detail-map', report.lat || 17.3850, report.lng || 78.4867, report.category);
    }, 100);

    // Resolution photo section
    const resSec = document.getElementById('detail-resolution-photo-section');
    if (resSec) {
      if (report.resolution_photo_url) {
        resSec.classList.remove('hidden');
        document.getElementById('detail-resolution-photo').src = report.resolution_photo_url;
      } else {
        resSec.classList.add('hidden');
      }
    }

    // AI Audit Log Panel
    const aiLog = report.ai_log || {};
    const confVal = aiLog.confidence || report.confidence_score || 95;
    document.getElementById('detail-ai-confidence').innerText = `${Number(confVal).toFixed(1)}%`;
    document.getElementById('detail-ai-rationale').innerText = aiLog.severity_rationale || "AI safety heuristic verified.";
    document.getElementById('detail-ai-json').innerText = JSON.stringify(aiLog, null, 2);

    // Render Vertical Timeline
    const timelineContainer = document.getElementById('detail-timeline-container');
    if (timelineContainer) {
      timelineContainer.innerHTML = (report.timeline || []).map((t, idx) => {
        const isLast = idx === (report.timeline.length - 1);
        return `
          <div class="timeline-item ${isLast ? 'active' : 'completed'}">
            <div class="timeline-marker">
              <i class="fa-solid ${isLast ? 'fa-spinner fa-spin' : 'fa-check'}"></i>
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-navy-900 text-sm" style="text-transform: capitalize;">
                  ${t.status.replace('_', ' ')}
                </span>
                <span class="text-xs text-slate-400"><i class="fa-solid fa-clock"></i> ${new Date(t.timestamp).toLocaleString()}</span>
              </div>
              <p class="text-xs text-slate-600 mb-1">${t.note}</p>
              <span class="text-xs font-semibold text-slate-400">By: ${t.actor}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /* --------------------------------------------------------------------------
     5. ACCOUNTABILITY & LEADERBOARD VIEW RENDERER
     -------------------------------------------------------------------------- */
  renderAccountabilityView() {
    const metrics = window.appState.getMetricsSummary();

    // Render Wall of Shame Leaderboard Table
    const tableBody = document.getElementById('accountability-leaderboard-body');
    if (tableBody) {
      tableBody.innerHTML = metrics.departmentStats.map(d => `
        <tr>
          <td class="font-bold text-navy-900">${d.name} (${d.code})</td>
          <td class="font-semibold text-slate-600">${d.total}</td>
          <td><span class="badge ${d.open > 0 ? 'badge-under_review' : 'badge-resolved'}">${d.open} Open</span></td>
          <td class="font-bold ${d.slaRate >= 90 ? 'text-green-600' : 'text-amber-600'}">${d.slaRate}% SLA Met</td>
          <td class="text-slate-500 font-mono text-sm">${d.oldestOpenDays} Days</td>
          <td class="font-semibold text-slate-600">${d.activeCrews} Active Units</td>
        </tr>
      `).join('');
    }

    // Render Charts
    setTimeout(() => {
      window.chartsManager.renderAccountabilityCharts();
    }, 100);
  }

  /* --------------------------------------------------------------------------
     6. MUNICIPAL STAFF QUEUE VIEW RENDERER
     -------------------------------------------------------------------------- */
  renderStaffQueueView() {
    const deptSelect = document.getElementById('staff-department-select');
    if (deptSelect) {
      deptSelect.value = window.appState.currentDepartment;
    }

    const currentDeptId = window.appState.currentDepartment;
    const reports = window.appState.getAllReports().filter(r => r.department_id === currentDeptId);

    const tbody = document.getElementById('staff-queue-body');
    if (!tbody) return;

    if (reports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-slate-500 py-8">
            No active reports in this department queue.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = reports.map(r => {
      const cat = SEED_CATEGORIES[r.category] || SEED_CATEGORIES.other;
      const isSlaBreached = r.sla_deadline && new Date() > new Date(r.sla_deadline) && r.status !== 'resolved';

      return `
        <tr>
          <td class="font-bold text-navy-900">${r.id}</td>
          <td><span class="badge badge-${r.status}">${r.status.replace('_', ' ')}</span></td>
          <td><span class="severity-chip severity-${r.severity}">${r.severity}</span></td>
          <td><i class="fa-solid ${cat.icon}" style="color:${cat.color}"></i> ${cat.label.split('/')[0]}</td>
          <td class="text-xs text-slate-500">${new Date(r.created_at).toLocaleDateString()}</td>
          <td>
            ${isSlaBreached 
              ? `<span class="badge badge-rejected" style="animation:pulse-critical 1.5s infinite;"><i class="fa-solid fa-triangle-exclamation"></i> OVERDUE</span>` 
              : `<span class="text-xs text-slate-500">${r.sla_deadline ? new Date(r.sla_deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Normal'}</span>`}
          </td>
          <td>
            <button onclick="window.uiController.openStaffActionModal('${r.id}')" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-pen-to-square"></i> Manage Ticket
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  openStaffActionModal(reportId) {
    const report = window.appState.getReportById(reportId);
    if (!report) return;

    this.activeStaffModalReportId = reportId;
    const cat = SEED_CATEGORIES[report.category] || SEED_CATEGORIES.other;
    const ward = SEED_WARDS.find(w => w.id === report.ward_id);
    
    document.getElementById('modal-staff-ticket-id').innerText = report.id;

    if (document.getElementById('modal-staff-thumb')) {
      document.getElementById('modal-staff-thumb').src = report.photo_url;
    }
    if (document.getElementById('modal-staff-category-badge')) {
      document.getElementById('modal-staff-category-badge').innerHTML = `<span class="badge" style="background-color:${cat.color}18; color:${cat.color};">${cat.label.split('/')[0]}</span>`;
    }
    if (document.getElementById('modal-staff-severity-chip')) {
      document.getElementById('modal-staff-severity-chip').innerHTML = `<span class="severity-chip severity-${report.severity}">${report.severity}</span>`;
    }
    if (document.getElementById('modal-staff-ward')) {
      document.getElementById('modal-staff-ward').innerText = ward ? ward.name : (report.ward_id || "Ward 1");
    }
    if (document.getElementById('modal-staff-desc-snippet')) {
      document.getElementById('modal-staff-desc-snippet').innerText = report.description || cat.label;
    }

    document.getElementById('modal-staff-status-select').value = report.status;
    document.getElementById('modal-staff-note').value = '';
    document.getElementById('modal-staff-resolution-photo').value = '';

    const modal = document.getElementById('modal-staff-action');
    if (modal) modal.classList.add('active');
  }

  closeStaffActionModal() {
    const modal = document.getElementById('modal-staff-action');
    if (modal) modal.classList.remove('active');
  }

  saveStaffAction() {
    const reportId = this.activeStaffModalReportId;
    const newStatus = document.getElementById('modal-staff-status-select').value;
    const note = document.getElementById('modal-staff-note').value;
    const resPhotoUrl = document.getElementById('modal-staff-resolution-photo').value || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

    const actor = `Municipal Staff (${window.appState.currentRole.toUpperCase()})`;
    window.appState.updateReportStatus(reportId, newStatus, note, actor, newStatus === 'resolved' ? resPhotoUrl : null);

    this.closeStaffActionModal();
    this.showToast(`Ticket #${reportId} status updated to ${newStatus.toUpperCase()}`);
  }

  /* --------------------------------------------------------------------------
     7. ADMIN ROUTING RULES VIEW RENDERER
     -------------------------------------------------------------------------- */
  renderAdminRulesView() {
    const rules = window.appState.getRoutingRules();
    const tbody = document.getElementById('admin-rules-body');
    if (!tbody) return;

    tbody.innerHTML = rules.map(rule => {
      const cat = SEED_CATEGORIES[rule.category] || SEED_CATEGORIES.other;
      const dept = SEED_DEPARTMENTS.find(d => d.id === rule.department_id);
      const ward = SEED_WARDS.find(w => w.id === rule.ward_id);

      return `
        <tr>
          <td class="font-bold text-navy-900">${rule.id}</td>
          <td><i class="fa-solid ${cat.icon}" style="color:${cat.color}"></i> ${cat.label.split('/')[0]}</td>
          <td><span class="badge badge-submitted">${ward ? ward.name : 'All Wards'}</span></td>
          <td class="font-bold text-brand">${dept ? dept.name : rule.department_id}</td>
          <td class="font-mono text-sm">${rule.sla_hours} Hours Target</td>
          <td>
            <button onclick="window.appState.deleteRoutingRule('${rule.id}')" class="btn btn-outline btn-sm text-red-600">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-green-400"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.uiController = new UIController();
