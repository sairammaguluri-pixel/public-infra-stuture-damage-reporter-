/* ==========================================================================
   GHMC CivicPulse — Leaflet Map Manager
   City: Hyderabad, Telangana, India
   Center: 17.3850, 78.4867 (Hussain Sagar / City Center)
   ========================================================================== */

class MapManager {
  constructor() {
    this.publicMap = null;
    this.wizardMap = null;
    this.detailMap = null;
    this.markersGroup = null;
    this.wizardMarker = null;
    this.onReportSelectCallback = null;
    // Hyderabad city center coordinates
    this.defaultLat = 17.3850;
    this.defaultLng = 78.4867;
  }

  // -------------------------------------------------------------------------
  // Tile Layer Factory — uses CartoDB Voyager (fast CDN, no API key needed)
  // -------------------------------------------------------------------------
  _buildTileLayer() {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 4,
      keepBuffer: 4,        // cache more tiles to reduce re-fetch lag
      updateWhenZooming: false,
      updateWhenIdle: true
    });
  }

  // -------------------------------------------------------------------------
  // 1. Public Live Map — Full Hyderabad Overview
  // -------------------------------------------------------------------------
  initPublicMap(elementId, initialReports = [], onReportClick = null) {
    if (this.publicMap) {
      this.publicMap.remove();
      this.publicMap = null;
    }

    const container = document.getElementById(elementId);
    if (!container) return;

    this.onReportSelectCallback = onReportClick;

    this.publicMap = L.map(elementId, {
      center: [this.defaultLat, this.defaultLng],
      zoom: 12,
      zoomControl: false,
      preferCanvas: true,   // Use Canvas renderer → much faster for many markers
      maxBoundsViscosity: 0.85
    });

    this._buildTileLayer().addTo(this.publicMap);

    L.control.zoom({ position: 'bottomright' }).addTo(this.publicMap);

    // GHMC boundary visual overlay (approximate bounding box)
    const ghmcBounds = [
      [17.2000, 78.2500],
      [17.6000, 78.7500]
    ];
    L.rectangle(ghmcBounds, {
      color: '#d4af37',
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.03,
      dashArray: '6 4',
      interactive: false
    }).addTo(this.publicMap);

    // City label
    L.marker([17.3850, 78.4867], {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(17,17,17,0.85);
          color: #d4af37;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(212,175,55,0.5);
          white-space: nowrap;
          backdrop-filter: blur(8px);
          letter-spacing: 0.08em;
        ">⬟ GHMC — Greater Hyderabad</div>`,
        iconSize: [200, 30],
        iconAnchor: [100, 15]
      }),
      interactive: false
    }).addTo(this.publicMap);

    this.renderPublicMarkers(initialReports);
  }

  // -------------------------------------------------------------------------
  // 2. Render Markers — Efficient batch with Canvas renderer
  // -------------------------------------------------------------------------
  renderPublicMarkers(reports) {
    if (!this.publicMap) return;

    if (this.markersGroup) {
      this.publicMap.removeLayer(this.markersGroup);
    }

    this.markersGroup = L.layerGroup().addTo(this.publicMap);
    const bounds = [];

    reports.forEach(report => {
      if (!report.lat || !report.lng) return;

      const catInfo = SEED_CATEGORIES[report.category] || SEED_CATEGORIES.other;
      const color = catInfo.color;
      const iconClass = catInfo.icon;

      // Severity ring color
      const severityRing = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444'
      }[report.severity] || '#6b7280';

      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 0 0 3px ${severityRing};
            border: 2px solid #fff;
          ">
            <i class="fa-solid ${iconClass}" style="transform: rotate(45deg); color: #fff; font-size: 14px;"></i>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([report.lat, report.lng], { icon: customIcon });

      // Fast popup — images loaded lazily via loading="lazy"
      const popupContent = `
        <div style="min-width: 230px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; padding: 2px;">
          <img
            src="${report.photo_url}"
            loading="lazy"
            decoding="async"
            style="width:100%; height:115px; object-fit:cover; border-radius:8px; margin-bottom:8px; background:#f1f5f9;"
            alt="${catInfo.label}"
          />
          <div style="display:flex; gap:5px; margin-bottom:6px; flex-wrap:wrap;">
            <span class="badge badge-${report.status}" style="font-size:0.7rem;">${report.status.replace('_',' ')}</span>
            <span class="severity-chip severity-${report.severity}" style="font-size:0.68rem;">${report.severity}</span>
          </div>
          <p style="font-size:0.8rem; font-weight:700; color:#111; margin:0 0 3px;">${report.id}</p>
          <p style="font-size:0.75rem; color:#64748b; margin:0 0 10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${report.description || catInfo.label}
          </p>
          <button
            onclick="window.uiController.showReportDetail('${report.id}')"
            class="btn btn-primary btn-sm btn-full"
            style="padding:5px 10px; font-size:0.78rem;">
            View Transparency Timeline <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>`;

      marker.bindPopup(popupContent, { maxWidth: 270 });

      marker.on('click', () => {
        if (this.onReportSelectCallback) {
          this.onReportSelectCallback(report.id);
        }
      });

      this.markersGroup.addLayer(marker);
      bounds.push([report.lat, report.lng]);
    });

    if (bounds.length > 0) {
      this.publicMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else {
      // fallback — center on Hyderabad
      this.publicMap.setView([this.defaultLat, this.defaultLng], 12);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Wizard Location Picker (Report Submission Step 2)
  //    Default location: Hyderabad city center
  // -------------------------------------------------------------------------
  initWizardMap(elementId, initialLat, initialLng, onLocationChange) {
    if (this.wizardMap) {
      this.wizardMap.remove();
      this.wizardMap = null;
    }

    const container = document.getElementById(elementId);
    if (!container) return;

    // Use Hyderabad center if no initial coords given
    const lat = initialLat || this.defaultLat;
    const lng = initialLng || this.defaultLng;

    this.wizardMap = L.map(elementId, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      preferCanvas: true
    });

    this._buildTileLayer().addTo(this.wizardMap);

    const pinIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          width: 42px; height: 42px;
          background: #d4af37;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(212,175,55,0.5);
          border: 2px solid #fff;
        ">
          <i class="fa-solid fa-location-dot" style="transform: rotate(45deg); color: #fff; font-size: 18px;"></i>
        </div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 42]
    });

    this.wizardMarker = L.marker([lat, lng], {
      draggable: true,
      icon: pinIcon
    }).addTo(this.wizardMap);

    this.wizardMarker.on('dragend', (e) => {
      const coord = e.target.getLatLng();
      if (onLocationChange) {
        onLocationChange(coord.lat.toFixed(5), coord.lng.toFixed(5));
      }
    });

    this.wizardMap.on('click', (e) => {
      this.wizardMarker.setLatLng(e.latlng);
      if (onLocationChange) {
        onLocationChange(e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5));
      }
    });
  }

  setWizardLocation(lat, lng) {
    if (this.wizardMap && this.wizardMarker) {
      this.wizardMap.setView([lat, lng], 15);
      this.wizardMarker.setLatLng([lat, lng]);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Detail Mini-Map — Report location view
  // -------------------------------------------------------------------------
  initDetailMap(elementId, lat, lng, categoryKey) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
    }

    this.detailMap = L.map(elementId, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
      preferCanvas: true
    });

    this._buildTileLayer().addTo(this.detailMap);

    const catInfo = SEED_CATEGORIES[categoryKey] || SEED_CATEGORIES.other;

    const customIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          width: 40px; height: 40px;
          background: ${catInfo.color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          border: 2px solid #fff;
        ">
          <i class="fa-solid ${catInfo.icon}" style="transform: rotate(45deg); color: #fff; font-size: 16px;"></i>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(this.detailMap)
      .bindPopup(`<b style="font-size:0.85rem;">${catInfo.label}</b><br><small style="color:#64748b;">${lat.toFixed(4)}, ${lng.toFixed(4)}</small>`)
      .openPopup();

    // Accuracy circle
    L.circle([lat, lng], {
      radius: 60,
      color: catInfo.color,
      fillColor: catInfo.color,
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4 4'
    }).addTo(this.detailMap);
  }
}

window.mapManager = new MapManager();
