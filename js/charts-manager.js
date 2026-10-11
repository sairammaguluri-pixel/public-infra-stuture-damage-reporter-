/* ==========================================================================
   CivicPulse Chart.js Accountability & Analytics Visualizer
   ========================================================================== */

class ChartsManager {
  constructor() {
    this.slaChart = null;
    this.categoryChart = null;
    this.trendChart = null;
  }

  renderAccountabilityCharts() {
    const metrics = window.appState.getMetricsSummary();
    const reports = window.appState.getAllReports();

    this.renderSlaChart(metrics.departmentStats);
    this.renderCategoryChart(reports);
    this.renderTrendChart(reports);
  }

  renderSlaChart(deptStats) {
    const ctx = document.getElementById('chart-sla-dept');
    if (!ctx) return;

    if (this.slaChart) this.slaChart.destroy();

    const labels = deptStats.map(d => d.code);
    const dataSla = deptStats.map(d => d.slaRate);
    const backgroundColors = dataSla.map(val => val >= 90 ? '#10b981' : (val >= 75 ? '#f59e0b' : '#ef4444'));

    this.slaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '% Reports Resolved Within SLA Target',
          data: dataSla,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `SLA Compliance: ${ctx.raw}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  }

  renderCategoryChart(reports) {
    const ctx = document.getElementById('chart-category-breakdown');
    if (!ctx) return;

    if (this.categoryChart) this.categoryChart.destroy();

    const categoryCounts = {};
    Object.keys(SEED_CATEGORIES).forEach(c => categoryCounts[c] = 0);

    reports.forEach(r => {
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      }
    });

    const labels = Object.keys(categoryCounts).map(c => SEED_CATEGORIES[c].label.split('/')[0]);
    const data = Object.values(categoryCounts);
    const colors = Object.keys(categoryCounts).map(c => SEED_CATEGORIES[c].color);

    const totalReportsCount = data.reduce((a, b) => a + b, 0);

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11, family: 'Inter' } }
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const count = tooltipItem.raw;
                const pct = totalReportsCount > 0 ? ((count / totalReportsCount) * 100).toFixed(1) : 0;
                return ` ${tooltipItem.label}: ${count} reports (${pct}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  renderTrendChart(reports) {
    const ctx = document.getElementById('chart-resolution-trend');
    if (!ctx) return;

    if (this.trendChart) this.trendChart.destroy();

    // Past 7 days trend mock
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const submittedData = [12, 19, 15, 22, 18, 14, 25];
    const resolvedData = [10, 16, 18, 20, 22, 12, 21];

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'New Reports Submitted',
            data: submittedData,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Reports Resolved',
            data: resolvedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

window.chartsManager = new ChartsManager();
