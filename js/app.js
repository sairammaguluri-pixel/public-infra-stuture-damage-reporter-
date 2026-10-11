/* ==========================================================================
   GHMC CivicPulse — Application Entry Point & Event Listener Wiring
   Greater Hyderabad Municipal Corporation | Hyderabad, Telangana
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Initializing GHMC CivicPulse — Greater Hyderabad Municipal Corporation...");

  // Initialize UI Controller
  window.uiController.init();

  // Navigation Links Binding
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.closest('[data-view]').getAttribute('data-view');
      window.uiController.switchView(view);
    });
  });

  // Report Wizard Triggers
  const btnReportHero = document.getElementById('btn-report-hero');
  if (btnReportHero) {
    btnReportHero.addEventListener('click', () => window.uiController.startReportWizard());
  }

  const btnReportNav = document.getElementById('btn-report-nav');
  if (btnReportNav) {
    btnReportNav.addEventListener('click', () => window.uiController.startReportWizard());
  }

  // Wizard Photo Upload Dropzone
  const dropzone = document.getElementById('wizard-dropzone');
  const fileInput = document.getElementById('wizard-file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        window.uiController.handlePhotoUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        window.uiController.handlePhotoUpload(e.target.files[0]);
      }
    });
  }

  // Sample Image Preset Buttons in Wizard
  document.querySelectorAll('.preset-photo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.getAttribute('data-url');
      window.uiController.handlePhotoUpload(url);
    });
  });

  // Wizard Step Controls
  const btnStep2Next = document.getElementById('btn-step2-next');
  if (btnStep2Next) {
    btnStep2Next.addEventListener('click', () => {
      window.uiController.wizardState.step = 3;
      window.uiController.renderWizardStep();
    });
  }

  const btnStep3Submit = document.getElementById('btn-step3-submit');
  if (btnStep3Submit) {
    btnStep3Submit.addEventListener('click', () => {
      window.uiController.submitReportWizard();
    });
  }

  // Public Map Filters
  ['filter-map-category', 'filter-map-severity', 'filter-map-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => window.uiController.updateMapFilters());
  });

  const searchMapInput = document.getElementById('filter-map-search');
  if (searchMapInput) {
    searchMapInput.addEventListener('input', () => window.uiController.updateMapFilters());
  }

  // Staff Queue Department Switcher
  const staffDeptSelect = document.getElementById('staff-department-select');
  if (staffDeptSelect) {
    staffDeptSelect.addEventListener('change', (e) => {
      window.appState.setDepartment(e.target.value);
      window.uiController.renderStaffQueueView();
    });
  }

  // Staff Modal Actions
  const btnSaveStaffModal = document.getElementById('btn-save-staff-modal');
  if (btnSaveStaffModal) {
    btnSaveStaffModal.addEventListener('click', () => window.uiController.saveStaffAction());
  }

  const btnCloseStaffModal = document.getElementById('btn-close-staff-modal');
  if (btnCloseStaffModal) {
    btnCloseStaffModal.addEventListener('click', () => window.uiController.closeStaffActionModal());
  }

  // CSV Export Buttons
  document.querySelectorAll('.btn-export-csv').forEach(btn => {
    btn.addEventListener('click', () => {
      window.appState.exportCSV();
      window.uiController.showToast("Report dataset exported to CSV file.");
    });
  });

  // Reset System Button
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm("Reset all municipal reports to clean seed state?")) {
        window.appState.resetToDefaults();
        window.uiController.showToast("System reset to default seed state.");
      }
    });
  }
});
