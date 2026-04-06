// ============================================================
// RAA COMMUNITY DASHBOARD — APP LOGIC
// ============================================================

// ---- NAVIGATION: LANDING vs DETAIL ----
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');
const landing = document.getElementById('landing');
let mapOverview, mapDetail;

function goHome() {
  sections.forEach(s => s.classList.remove('active-section'));
  landing.classList.add('active-view');
  navLinks.forEach(l => l.classList.remove('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => { if (mapOverview) mapOverview.invalidateSize(); }, 150);
}

function goToSection(sectionId) {
  landing.classList.remove('active-view');
  sections.forEach(s => {
    s.classList.remove('active-section');
    if (s.id === sectionId) s.classList.add('active-section');
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.dataset.section === sectionId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (sectionId === 'global-presence') {
    setTimeout(() => {
      if (!mapDetail) initDetailMap();
      else mapDetail.invalidateSize();
    }, 150);
    updateGPStats();
    renderPanelList();
    showPanelList();
  }
  if (sectionId === 'initiatives-directory') updateIDStats();
  if (sectionId === 'community-snapshot') animateCounters();
}

// Header nav clicks
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goToSection(link.dataset.section);
  });
});

// Logo -> home
document.getElementById('logo-home').addEventListener('click', e => {
  e.preventDefault();
  goHome();
});

// Overview CTA buttons — only these navigate to detail pages
document.querySelectorAll('.ov-cta').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const block = btn.closest('.ov-block');
    if (block) goToSection(block.dataset.goto);
  });
});

// Eco overview cards — navigate to ecosystem with correct tab
document.querySelectorAll('.eco-overview-card[data-eco]').forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const ecoId = card.dataset.eco;
    goToSection('land-ecosystem');
    setTimeout(() => {
      document.querySelectorAll('.eco-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.eco-panel').forEach(p => p.classList.remove('active'));
      const targetTab = document.querySelector(`.eco-tab[data-eco="${ecoId}"]`);
      if (targetTab) targetTab.classList.add('active');
      const targetPanel = document.getElementById('eco-' + ecoId);
      if (targetPanel) targetPanel.classList.add('active');
    }, 50);
  });
});

// Sidebar ecosystem navigation
document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ecoId = btn.dataset.ecoNav;
    // Navigate to ecosystem section
    goToSection('land-ecosystem');
    // Activate the right tab/panel
    document.querySelectorAll('.eco-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.eco-panel').forEach(p => p.classList.remove('active'));
    const targetTab = document.querySelector(`.eco-tab[data-eco="${ecoId}"]`);
    if (targetTab) targetTab.classList.add('active');
    const targetPanel = document.getElementById('eco-' + ecoId);
    if (targetPanel) targetPanel.classList.add('active');
    // Highlight sidebar btn
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ---- MAPS ----
const scopeColors = { Global: '#002929', Regional: '#48966a', National: '#b4bab6' };

function pinIcon(scope) {
  const c = scopeColors[scope] || '#48966a';
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg viewBox="0 0 28 36" width="26" height="34"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${c}"/><circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/></svg>`,
    iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -34]
  });
}

function popupHtml(init) {
  const sc = init.scope.toLowerCase();
  const bt = init.breakthroughTarget
    ? `<div class="popup-tag">\u2705 ${init.breakthroughTarget}</div><br>` : '';
  return `<div class="popup-content">
    <h3>${init.name}</h3>
    <div class="country">${init.flag} ${init.country}</div>
    <div class="popup-scope ${sc}">${init.scope}</div><br>
    ${bt}
    <button class="btn-profile" onclick="showProfile('${init.name.replace(/'/g, "\\'")}', true)">View Full Profile</button>
  </div>`;
}

function addMarkers(map, usePanel) {
  initiatives.forEach(init => {
    const marker = L.marker([init.lat, init.lng], { icon: pinIcon(init.scope) })
      .addTo(map);
    if (usePanel) {
      marker.on('click', () => showSidePanel(init));
    } else {
      marker.bindPopup(popupHtml(init), { className: 'map-popup', maxWidth: 280 });
    }
  });
}

// Overview map (landing)
function initOverviewMap() {
  mapOverview = L.map('map-overview', { center: [20, 0], zoom: 1.5, minZoom: 1, maxZoom: 6, scrollWheelZoom: true, zoomControl: true, dragging: true, maxBounds: [[-85, -180],[85, 180]], maxBoundsViscosity: 1.0 });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(mapOverview);
  addMarkers(mapOverview, false);
}

// Detail map
function initDetailMap() {
  mapDetail = L.map('map-detail', { center: [20, 15], zoom: 2.5, minZoom: 2, maxZoom: 8, scrollWheelZoom: true, maxBounds: [[-85, -180],[85, 180]], maxBoundsViscosity: 1.0 });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(mapDetail);
  addMarkers(mapDetail, true);
}

initOverviewMap();

// ---- GLOBAL PRESENCE STATS ----
function updateGPStats() {
  const total = initiatives.length;
  const countries = new Set(initiatives.map(i => i.country)).size;
  const regions = new Set(initiatives.flatMap(i => i.geographicScope)).size;
  const global = initiatives.filter(i => i.scope === 'Global').length;
  const regional = initiatives.filter(i => i.scope === 'Regional').length;
  const national = initiatives.filter(i => i.scope === 'National').length;
  animateDgStat('gp-initiatives', total);
  animateDgStat('gp-countries', countries);
  animateDgStat('gp-regions', regions);
  animateDgStat('gp-global', global);
  animateDgStat('gp-regional', regional);
  animateDgStat('gp-national', national);
}

// ---- SIDE PANEL (Global Presence) ----
let gpScopeFilter = 'all';

function renderPanelList() {
  const list = document.getElementById('gp-panel-list');
  if (!list) return;
  list.innerHTML = '';
  const filtered = gpScopeFilter === 'all' ? initiatives : initiatives.filter(i => i.scope === gpScopeFilter);
  filtered.forEach(init => {
    const sc = init.scope.toLowerCase();
    const item = document.createElement('div');
    item.className = 'gp-panel-list-item';
    item.innerHTML = `
      <div class="list-logo">${init.logo}</div>
      <div class="list-info">
        <div class="list-name">${init.name}</div>
        <div class="list-meta">${init.flag} ${init.country}</div>
      </div>
      <span class="list-scope ${sc}">${init.scope}</span>
    `;
    item.addEventListener('click', () => {
      showSidePanel(init);
      if (mapDetail) mapDetail.flyTo([init.lat, init.lng], 5, { duration: 0.8 });
      list.querySelectorAll('.gp-panel-list-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
    list.appendChild(item);
  });
}

function showSidePanel(init) {
  const panel = document.getElementById('gp-panel-content');
  const listView = document.getElementById('gp-panel-list');
  const detailView = document.getElementById('gp-panel-detail');
  if (!panel || !listView || !detailView) return;

  const sc = init.scope.toLowerCase();
  panel.innerHTML = `
    <div class="panel-name">${init.name}</div>
    <div class="panel-country">${init.flag} ${init.country}</div>
    <span class="panel-scope ${sc}">${init.scope}</span>
    <p class="panel-desc">${init.shortDescription}</p>
    <div class="panel-section-label">Thematic Priorities</div>
    <div class="panel-tags">${init.thematicPriorities.map(t => `<span class="panel-tag">${t}</span>`).join('')}</div>
    <div class="panel-section-label">Actor Type</div>
    <div class="panel-tags"><span class="panel-tag">${init.actorType}</span></div>
    ${init.breakthroughTarget ? `<div class="panel-section-label">Breakthrough Target</div><div class="panel-tags"><span class="panel-tag">\u2705 ${init.breakthroughTarget}</span></div>` : ''}
    <button class="btn-panel-profile" onclick="showProfile('${init.name.replace(/'/g, "\\'")}', true)">View Full Profile</button>
  `;
  listView.style.display = 'none';
  detailView.style.display = 'block';
}

function showPanelList() {
  document.getElementById('gp-panel-list').style.display = 'block';
  document.getElementById('gp-panel-detail').style.display = 'none';
  document.querySelectorAll('.gp-panel-list-item').forEach(i => i.classList.remove('active'));
}

// Back button in panel
document.addEventListener('click', e => {
  if (e.target.id === 'gp-panel-back') showPanelList();
});

// Scope filter buttons
document.querySelectorAll('.gp-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gpScopeFilter = btn.dataset.scope;
    document.querySelectorAll('.gp-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPanelList();
  });
});

function animateDgStat(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 900;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Prevent map clicks from navigating to detail section
document.getElementById('map-overview').addEventListener('click', e => e.stopPropagation());

// ---- ANIMATE NUMBERS ON SCROLL ----
function animateNums(selector) {
  document.querySelectorAll(selector).forEach(el => {
    if (el.dataset.animated) return;
    const text = el.textContent;
    const num = parseFloat(text);
    if (isNaN(num)) return;
    const isDecimal = num % 1 !== 0;
    const suffix = text.replace(/[\d.]/g, '');
    const steps = 30;
    const inc = num / steps;
    let cur = 0, step = 0;
    el.dataset.animated = '1';
    el.textContent = '0' + suffix;
    const timer = setInterval(() => {
      step++; cur += inc;
      if (step >= steps) { cur = num; clearInterval(timer); }
      el.textContent = (isDecimal ? cur.toFixed(1) : Math.round(cur)) + suffix;
    }, 30);
  });
}

// Hero stats — animate on load
const heroStats = document.querySelector('.landing-hero-stats');
if (heroStats) {
  setTimeout(() => animateNums('.hero-stat-num'), 300);
}

// Snapshot cards — animate when visible
const snapshotGrid = document.querySelector('.snapshot-ov-grid');
if (snapshotGrid) {
  const snapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateNums('.snap-num');
    });
  }, { threshold: 0.3 });
  snapObserver.observe(snapshotGrid);
}

// ---- LANDING: OVERVIEW INITIATIVES ----
const overviewGrid = document.getElementById('overview-initiatives');
initiatives.slice(0, 4).forEach(init => {
  const sc = init.scope.toLowerCase();
  const card = document.createElement('div');
  card.className = 'ov-init-card';
  card.innerHTML = `
    <div class="ov-init-name">${init.name}</div>
    <div class="ov-init-meta">${init.flag} ${init.country} &middot; ${init.actorType}</div>
    <span class="ov-init-scope ${sc}">${init.scope}</span>
  `;
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    showProfile(init.name, true);
  });
  overviewGrid.appendChild(card);
});

// ---- LANDING: OVERVIEW PARTNERS ----
const overviewPartners = document.getElementById('overview-partners');
partners.slice(0, 8).forEach(p => {
  const el = document.createElement('div');
  el.className = 'ov-partner';
  el.innerHTML = `<span class="ov-partner-logo">${p.logo}</span> ${p.name}`;
  overviewPartners.appendChild(el);
});

// ---- SECTION 2: INITIATIVES DIRECTORY ----
let activeFilters = {};
let idSearchQuery = '';

function updateIDStats() {
  animateDgStat('id-total', initiatives.length);
  animateDgStat('id-partners', initiatives.filter(i => i.activePartner).length);
}

function renderInitiatives() {
  const grid = document.getElementById('initiatives-grid');
  const countEl = document.getElementById('id-results-count');
  grid.innerHTML = '';

  const filtered = initiatives.filter(init => {
    // Search filter
    if (idSearchQuery && !init.name.toLowerCase().includes(idSearchQuery.toLowerCase())) return false;
    // Dropdown filters
    for (const [key, values] of Object.entries(activeFilters)) {
      if (values.length === 0) continue;
      if (key === 'scope' && !values.includes(init.scope)) return false;
      if (key === 'priority' && !init.thematicPriorities.some(p => values.includes(p))) return false;
      if (key === 'enabler' && !init.enablers.some(e => values.includes(e))) return false;
      if (key === 'actor' && !values.includes(init.actorType)) return false;
      if (key === 'breakthrough' && !values.includes(init.breakthroughTarget)) return false;
      if (key === 'activePartner' && !init.activePartner) return false;
    }
    return true;
  });

  // Results count
  if (countEl) {
    const hasFilters = idSearchQuery || Object.values(activeFilters).some(v => v.length > 0);
    countEl.textContent = hasFilters
      ? `Showing ${filtered.length} of ${initiatives.length} initiatives`
      : `${initiatives.length} initiatives`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:#6b6b6b;padding:20px;">No initiatives match the selected filters.</p>';
    return;
  }

  filtered.forEach(init => {
    const sc = init.scope.toLowerCase();
    const stamps = [];
    if (init.activePartner) stamps.push('<span class="stamp partner">RAA Active Partner</span>');
    if (init.breakthroughTarget) stamps.push(`<span class="stamp breakthrough">\u2705 ${init.breakthroughTarget}</span>`);

    const priorities = init.thematicPriorities.map(t => `<span class="card-priority-tag">${t}</span>`).join('');

    const card = document.createElement('div');
    card.className = 'initiative-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-name">${init.name}</span>
        <span class="card-type">${init.actorType}</span>
      </div>
      <div class="card-country"><span class="flag">${init.flag}</span> ${init.country}</div>
      <span class="card-scope ${sc}">${init.scope}</span>
      <div class="card-stamps">${stamps.join('')}</div>
      <div class="card-priorities">${priorities}</div>
      <div class="card-actions">
        <button class="btn-view-profile" onclick="showProfile('${init.name.replace(/'/g, "\\'")}')">View Full Profile</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Search input
const idSearchInput = document.getElementById('id-search-input');
if (idSearchInput) {
  idSearchInput.addEventListener('input', () => {
    idSearchQuery = idSearchInput.value;
    renderInitiatives();
  });
}

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filterKey = btn.dataset.filter;
    const dropdown = document.getElementById('filter-dropdown');

    if (filterKey === 'activePartner') {
      if (activeFilters.activePartner) {
        delete activeFilters.activePartner;
        btn.classList.remove('active');
      } else {
        activeFilters.activePartner = [true];
        btn.classList.add('active');
      }
      dropdown.classList.remove('open');
      renderInitiatives();
      return;
    }

    if (dropdown.classList.contains('open') && dropdown.dataset.filter === filterKey) {
      dropdown.classList.remove('open');
      return;
    }

    const options = filterOptions[filterKey] || [];
    if (!activeFilters[filterKey]) activeFilters[filterKey] = [];

    dropdown.dataset.filter = filterKey;
    dropdown.innerHTML = options.map(opt => {
      const sel = activeFilters[filterKey].includes(opt) ? 'selected' : '';
      return `<span class="filter-option ${sel}" data-value="${opt}">${opt}</span>`;
    }).join('') + '<span class="filter-option" data-value="__clear" style="color:#c44;">Clear</span>';
    dropdown.classList.add('open');

    dropdown.querySelectorAll('.filter-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        if (val === '__clear') {
          activeFilters[filterKey] = [];
          btn.classList.remove('active');
        } else {
          const idx = activeFilters[filterKey].indexOf(val);
          if (idx >= 0) activeFilters[filterKey].splice(idx, 1);
          else activeFilters[filterKey].push(val);
          btn.classList.toggle('active', activeFilters[filterKey].length > 0);
        }
        dropdown.classList.remove('open');
        renderInitiatives();
      });
    });
  });
});

renderInitiatives();

// ---- PROFILE MODAL ----
function showProfile(name, showDirectoryBtn) {
  const init = initiatives.find(i => i.name === name);
  if (!init) return;

  const stamps = [];
  if (init.activePartner) stamps.push('<span class="stamp partner">RAA Active Partner</span>');
  if (init.breakthroughTarget) stamps.push(`<span class="stamp breakthrough">\u2705 ${init.breakthroughTarget}</span>`);

  const directoryBtn = showDirectoryBtn
    ? `<div style="text-align:right;"><button class="btn-go-directory" onclick="closeModal('profile-modal');goToSection('initiatives-directory');">Go to Directory &rarr;</button></div>`
    : '';

  document.getElementById('modal-body').innerHTML = `
    <div class="profile-header">
      <div class="profile-logo">${init.logo}</div>
      <div class="profile-title-block">
        <h2>${init.name}</h2>
        <div class="profile-subtitle">${init.partnerName} &middot; ${init.flag} ${init.country}</div>
        <div style="margin-top:6px;">${stamps.join(' ')}</div>
      </div>
    </div>
    <p class="profile-desc">${init.shortDescription}</p>
    <div class="profile-grid">
      <div><div class="profile-field-label">Geographic Scope</div><div class="profile-tags">${init.geographicScope.map(g => `<span class="profile-tag">${g}</span>`).join('')}</div></div>
      <div><div class="profile-field-label">Scope</div><div class="profile-field-value">${init.scope}</div></div>
      <div><div class="profile-field-label">RAA Thematic Priorities</div><div class="profile-tags">${init.thematicPriorities.map(t => `<span class="profile-tag">${t}</span>`).join('')}</div></div>
      <div><div class="profile-field-label">Critical RAA Enablers</div><div class="profile-tags">${init.enablers.map(e => `<span class="profile-tag alt">${e}</span>`).join('')}</div></div>
      <div><div class="profile-field-label">Type of Actor</div><div class="profile-field-value">${init.actorType}</div></div>
      <div><div class="profile-field-label">Priority Ecosystem</div><div class="profile-tags">${init.priorityEcosystem.map(e => `<span class="profile-tag">${e}</span>`).join('')}</div></div>
      <div><div class="profile-field-label">Rio Synergies</div><div class="profile-tags">${init.rioSynergies.map(r => `<span class="profile-tag alt">${r}</span>`).join('')}</div></div>
      <div><div class="profile-field-label">Main Beneficiaries</div><div class="profile-tags">${init.beneficiaries.map(b => `<span class="profile-tag">${b}</span>`).join('')}</div></div>
      ${init.breakthroughTarget ? `<div><div class="profile-field-label">Breakthrough Target</div><div class="profile-field-value">\u2705 ${init.breakthroughTarget}</div></div>` : ''}
    </div>
    ${directoryBtn}
  `;
  document.getElementById('profile-modal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});

// ---- SECTION 3: ECOSYSTEM ----
document.querySelectorAll('.eco-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.eco-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.eco-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('eco-' + tab.dataset.eco).classList.add('active');
  });
});

function renderPlatforms(containerId, data) {
  const grid = document.getElementById(containerId);
  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'platform-card';
    card.innerHTML = `
      <div class="platform-header">
        <div class="platform-logo">${p.logo}</div>
        <div class="platform-name">${p.name}</div>
      </div>
      <div class="platform-desc">${p.description}</div>
      ${p.link ? `<a href="${p.link}" target="_blank" class="platform-link">Visit platform \u2192</a>` : '<span class="platform-link" style="opacity:0.4;">Link coming soon</span>'}
    `;
    grid.appendChild(card);
  });
}

renderPlatforms('platforms-data', platforms.data);
renderPlatforms('platforms-funding', platforms.funding);
renderPlatforms('platforms-knowledge', platforms.knowledge);

// ---- SECTION 4: COMMUNITY SNAPSHOT ----
document.getElementById('snapshot-date').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function renderBarChart(id, data) {
  const el = document.getElementById(id);
  const max = Math.max(...data.map(d => d.pct));
  data.forEach(d => {
    const w = Math.round((d.pct / max) * 100);
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `<span class="bar-label">${d.label}</span><div class="bar-track"><div class="bar-fill" style="width:0%" data-width="${w}%"></div></div><span class="bar-value">${d.value}</span>`;
    el.appendChild(item);
  });
}

renderBarChart('chart-sector', snapshotData.bySector);
renderBarChart('chart-priority', snapshotData.byPriority);
renderBarChart('chart-enabler', snapshotData.byEnabler);
renderBarChart('chart-breakthrough', snapshotData.byBreakthrough);

function renderDonut(chartId, legendId, data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const parts = [];
  const legend = document.getElementById(legendId);
  data.forEach(d => {
    const start = (cum / total) * 100;
    cum += d.value;
    const end = (cum / total) * 100;
    parts.push(`${d.color} ${start}% ${end}%`);
    const pct = Math.round((d.value / total) * 100);
    const item = document.createElement('div');
    item.className = 'donut-legend-item';
    item.innerHTML = `<span class="donut-legend-dot" style="background:${d.color}"></span>${d.label}: ${pct}%`;
    legend.appendChild(item);
  });
  document.getElementById(chartId).style.background = `conic-gradient(${parts.join(', ')})`;
}

renderDonut('chart-scope', 'legend-scope', snapshotData.byScope);
renderDonut('chart-region', 'legend-region', snapshotData.byRegion);

function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    const isDecimal = target % 1 !== 0;
    const steps = 30;
    const inc = target / steps;
    let cur = 0, step = 0;
    const timer = setInterval(() => {
      step++; cur += inc;
      if (step >= steps) { cur = target; clearInterval(timer); }
      counter.textContent = isDecimal ? cur.toFixed(1) : Math.round(cur);
    }, 30);
  });
  document.querySelectorAll('.bar-fill').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.width; }, 100);
  });
}

// ---- SECTION 5: PARTNERS ----
const pGrid = document.getElementById('partners-grid');
partners.forEach(p => {
  const card = document.createElement('div');
  card.className = 'partner-card';
  card.innerHTML = `
    <div class="partner-logo">${p.logo}</div>
    <div>
      <div class="partner-name">${p.name}</div>
      ${p.website ? `<a href="${p.website}" target="_blank" class="partner-link">Visit website</a>` : ''}
    </div>
  `;
  pGrid.appendChild(card);
});
