/* ==========================================================================
   GHMC CivicPulse — State Management & Persistence Layer
   ========================================================================== */

const STORAGE_KEYS = {
  REPORTS: 'ghmc_reports_v2',
  RULES: 'ghmc_routing_rules_v2',
  USER_ROLE: 'ghmc_current_role_v2',
  SELECTED_WARD: 'ghmc_selected_ward_v2'
};

class StateManager {
  constructor() {
    this.reports = [];
    this.routingRules = [];
    this.currentRole = 'citizen'; // 'citizen' | 'staff' | 'admin'
    this.currentDepartment = 'dept-roads'; // default staff department queue
    this.selectedWard = 'all';
    this.listeners = [];
    
    this.init();
  }

  init() {
    // Load Reports
    const savedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (savedReports) {
      try {
        this.reports = JSON.parse(savedReports);
      } catch (e) {
        console.error("Failed to parse saved reports", e);
        this.reports = [...SEED_REPORTS];
      }
    } else {
      this.reports = [...SEED_REPORTS];
      this.saveReports();
    }

    // Load Routing Rules
    const savedRules = localStorage.getItem(STORAGE_KEYS.RULES);
    if (savedRules) {
      try {
        this.routingRules = JSON.parse(savedRules);
      } catch (e) {
        this.routingRules = [...INITIAL_ROUTING_RULES];
      }
    } else {
      this.routingRules = [...INITIAL_ROUTING_RULES];
      this.saveRules();
    }

    // Load Role & Ward
    const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (savedRole) this.currentRole = savedRole;

    const savedWard = localStorage.getItem(STORAGE_KEYS.SELECTED_WARD);
    if (savedWard) this.selectedWard = savedWard;
  }

  saveReports() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
    this.notify();
  }

  saveRules() {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(this.routingRules));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  // --- Reports CRUD ---
  getAllReports() {
    return [...this.reports];
  }

  getReportById(id) {
    return this.reports.find(r => r.id === id);
  }

  addReport(newReport) {
    this.reports.unshift(newReport);
    this.saveReports();
    return newReport;
  }

  updateReportStatus(reportId, newStatus, note, actor = "Staff", resolutionPhotoUrl = null) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return null;

    report.status = newStatus;
    report.updated_at = new Date().toISOString();

    if (newStatus === 'resolved') {
      report.resolved_at = new Date().toISOString();
      if (resolutionPhotoUrl) {
        report.resolution_photo_url = resolutionPhotoUrl;
      }
    }

    report.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus.replace('_', ' ')}`,
      actor: actor
    });

    this.saveReports();
    return report;
  }

  reassignDepartment(reportId, newDepartmentId, note, actor = "Supervisor") {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return null;

    const deptObj = SEED_DEPARTMENTS.find(d => d.id === newDepartmentId);
    const oldDept = SEED_DEPARTMENTS.find(d => d.id === report.department_id);

    report.department_id = newDepartmentId;
    report.updated_at = new Date().toISOString();
    report.timeline.push({
      status: report.status,
      timestamp: new Date().toISOString(),
      note: `Reassigned from ${oldDept ? oldDept.name : 'Unassigned'} to ${deptObj ? deptObj.name : newDepartmentId}. ${note || ''}`,
      actor: actor
    });

    this.saveReports();
    return report;
  }

  // --- Routing Rules CRUD ---
  getRoutingRules() {
    return [...this.routingRules];
  }

  updateRoutingRule(updatedRule) {
    const idx = this.routingRules.findIndex(r => r.id === updatedRule.id);
    if (idx !== -1) {
      this.routingRules[idx] = updatedRule;
    } else {
      this.routingRules.push(updatedRule);
    }
    this.saveRules();
  }

  deleteRoutingRule(ruleId) {
    this.routingRules = this.routingRules.filter(r => r.id !== ruleId);
    this.saveRules();
  }

  // --- Role & Ward Control ---
  setRole(role) {
    this.currentRole = role;
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    this.notify();
  }

  setDepartment(deptId) {
    this.currentDepartment = deptId;
    this.notify();
  }

  setWard(wardId) {
    this.selectedWard = wardId;
    localStorage.setItem(STORAGE_KEYS.SELECTED_WARD, wardId);
    this.notify();
  }

  // --- Metrics & Analytics Engine ---
  getMetricsSummary() {
    const total = this.reports.length;
    const resolved = this.reports.filter(r => r.status === 'resolved');
    const open = this.reports.filter(r => r.status !== 'resolved' && r.status !== 'rejected');
    const critical = this.reports.filter(r => r.severity === 'critical' && r.status !== 'resolved');

    const now = new Date();

    // Helper: evaluates if a report is compliant with its SLA target
    const isSlaCompliant = (r) => {
      if (r.status === 'rejected') return true;
      if (r.status === 'resolved') {
        if (!r.resolved_at || !r.sla_deadline) return true;
        return new Date(r.resolved_at) <= new Date(r.sla_deadline);
      }
      // For open reports
      if (!r.sla_deadline) return true;
      return now <= new Date(r.sla_deadline);
    };

    // Calculate Average Time to Resolve (in hours)
    let totalResolveHours = 0;
    resolved.forEach(r => {
      if (r.created_at && r.resolved_at) {
        const diffMs = new Date(r.resolved_at) - new Date(r.created_at);
        totalResolveHours += Math.max(0, diffMs / (1000 * 60 * 60));
      }
    });
    const avgResolveHours = resolved.length > 0 ? (totalResolveHours / resolved.length).toFixed(1) : "2.4";

    // Overall SLA Met Percentage across all active reports
    const compliantCount = this.reports.filter(r => isSlaCompliant(r)).length;
    const slaMetPct = total > 0 ? ((compliantCount / total) * 100).toFixed(1) : "100.0";

    // Department Wall of Shame / Leaderboard
    const departmentStats = SEED_DEPARTMENTS.map(dept => {
      const deptReports = this.reports.filter(r => r.department_id === dept.id);
      const deptOpen = deptReports.filter(r => r.status !== 'resolved' && r.status !== 'rejected');
      const deptResolved = deptReports.filter(r => r.status === 'resolved');
      
      const deptCompliant = deptReports.filter(r => isSlaCompliant(r)).length;
      const deptSlaRate = deptReports.length > 0 ? Math.round((deptCompliant / deptReports.length) * 100) : 100;

      // Oldest open report in days
      let oldestDays = 0;
      deptOpen.forEach(r => {
        const ageMs = Date.now() - new Date(r.created_at).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays > oldestDays) oldestDays = ageDays;
      });

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        total: deptReports.length,
        open: deptOpen.length,
        resolved: deptResolved.length,
        slaRate: deptSlaRate,
        oldestOpenDays: oldestDays.toFixed(1),
        activeCrews: dept.active_crews
      };
    });

    return {
      totalReports: total,
      openReports: open.length,
      resolvedReports: resolved.length,
      criticalOpen: critical.length,
      avgResolveHours,
      slaMetPct,
      departmentStats
    };
  }

  // --- Export Center ---
  exportCSV() {
    const headers = ["ID", "Category", "Severity", "Status", "Ward", "Department", "Created At", "Resolved At", "Lat", "Lng", "Description"];
    const rows = this.reports.map(r => [
      r.id,
      r.category,
      r.severity,
      r.status,
      r.ward_id,
      r.department_id,
      r.created_at,
      r.resolved_at || "",
      r.lat,
      r.lng,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civicpulse_reports_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.RULES);
    this.reports = [...SEED_REPORTS];
    this.routingRules = [...INITIAL_ROUTING_RULES];
    this.notify();
  }
}

window.appState = new StateManager();
