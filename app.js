// ============================================================
// RAA COMMUNITY DASHBOARD — APP LOGIC
// ============================================================

// ---- HELPERS ----
function logoHtml(item, size) {
  size = size || 40;
  const fbSize = size;
  const fallback = `<img src="raa-brand/raa-logo.png" alt="RAA" style="width:${fbSize}px;height:${fbSize}px;object-fit:contain;border-radius:6px;">`;
  if (item.logo && (item.logo.startsWith('http') || item.logo.startsWith('logos/'))) {
    return `<img src="${item.logo}" alt="" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:6px;" onerror="this.outerHTML=this.getAttribute('data-fallback')" data-fallback='${fallback.replace(/'/g, "&#39;")}'>`;
  }
  return fallback;
}

function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

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
  if (sectionId === 'land-ecosystem') updateEcoStats();
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

// Overview CTA buttons
document.querySelectorAll('.ov-cta').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const block = btn.closest('.ov-block');
    if (block) goToSection(block.dataset.goto);
  });
});

// Eco overview cards
document.querySelectorAll('.eco-overview-card[data-eco]').forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSection('land-ecosystem');
    setTimeout(() => switchEcoCategory(card.dataset.eco), 50);
  });
});

// Sidebar ecosystem navigation
document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ecoId = btn.dataset.ecoNav;
    goToSection('land-ecosystem');
    setTimeout(() => switchEcoCategory(ecoId), 50);
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
    ? `<div class="popup-tag">${init.breakthroughTarget}</div><br>` : '';
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
    if (!init.lat && !init.lng) return;
    const marker = L.marker([init.lat, init.lng], { icon: pinIcon(init.scope) })
      .addTo(map);
    if (usePanel) {
      marker.on('click', () => showSidePanel(init));
    } else {
      marker.bindPopup(popupHtml(init), { className: 'map-popup', maxWidth: 280 });
    }
  });
}

function initOverviewMap() {
  mapOverview = L.map('map-overview', { center: [20, 0], zoom: 1.5, minZoom: 1, maxZoom: 6, scrollWheelZoom: true, zoomControl: false, dragging: true, maxBounds: [[-85, -180],[85, 180]], maxBoundsViscosity: 1.0 });
  L.control.zoom({ position: 'bottomleft' }).addTo(mapOverview);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(mapOverview);
  addMarkers(mapOverview, false);
}

function initDetailMap() {
  mapDetail = L.map('map-detail', { center: [20, 15], zoom: 2.5, minZoom: 2, maxZoom: 8, scrollWheelZoom: true, zoomControl: false, maxBounds: [[-85, -180],[85, 180]], maxBoundsViscosity: 1.0 });
  L.control.zoom({ position: 'bottomleft' }).addTo(mapDetail);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(mapDetail);
  addMarkers(mapDetail, true);
}

// ---- GLOBAL PRESENCE STATS ----
function updateGPStats() {
  const total = initiatives.length;
  const countries = new Set(initiatives.map(i => i.country)).size;
  const regions = new Set(initiatives.flatMap(i => i.geographicScope)).size;
  animateDgStat('gp-initiatives', total);
  animateDgStat('gp-countries', countries);
  animateDgStat('gp-regions', regions);
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
      <div class="list-logo">${logoHtml(init, 28)}</div>
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
    ${init.thematicPriorities.length ? `<div class="panel-section-label">Thematic Priorities</div><div class="panel-tags">${init.thematicPriorities.map(t => `<span class="panel-tag">${t}</span>`).join('')}</div>` : ''}
    ${init.actorType ? `<div class="panel-section-label">Actor Type</div><div class="panel-tags"><span class="panel-tag">${init.actorType}</span></div>` : ''}
    ${init.breakthroughTarget ? `<div class="panel-section-label">Breakthrough Target</div><div class="panel-tags"><span class="panel-tag">${init.breakthroughTarget}</span></div>` : ''}
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

document.addEventListener('click', e => {
  if (e.target.id === 'gp-panel-back') showPanelList();
});

document.querySelectorAll('.gp-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gpScopeFilter = btn.dataset.scope;
    document.querySelectorAll('.gp-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showPanelList();
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

document.getElementById('map-overview').addEventListener('click', e => e.stopPropagation());

// ---- ANIMATE NUMBERS ON SCROLL ----
function animateNums(selector) {
  document.querySelectorAll(selector).forEach(el => {
    if (el.dataset.animated) return;
    const text = el.textContent;
    // Strip commas before parsing, detect M/K/+ suffix
    const cleaned = text.replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return;
    const isDecimal = num % 1 !== 0;
    const suffix = cleaned.replace(/[\d.]/g, '');
    const steps = 30;
    const inc = num / steps;
    let cur = 0, step = 0;
    el.dataset.animated = '1';
    el.textContent = '0' + suffix;
    const timer = setInterval(() => {
      step++; cur += inc;
      if (step >= steps) { cur = num; clearInterval(timer); }
      const display = isDecimal ? cur.toFixed(1) : Math.round(cur).toLocaleString();
      el.textContent = display + suffix;
    }, 30);
  });
}

const snapshotGrid = document.querySelector('.snapshot-ov-grid');
if (snapshotGrid) {
  const snapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateNums('.snap-num');
    });
  }, { threshold: 0.3 });
  snapObserver.observe(snapshotGrid);
}

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
    if (idSearchQuery && !init.name.toLowerCase().includes(idSearchQuery.toLowerCase())) return false;
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
    if (init.activePartner) stamps.push('<span class="stamp partner"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>RAA Active Partner</span>');
    if (init.breakthroughTarget) stamps.push(`<span class="stamp breakthrough"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>${init.breakthroughTarget}</span>`);
    const priorities = init.thematicPriorities.map(t => `<span class="card-priority-tag">${t}</span>`).join('');

    const card = document.createElement('div');
    card.className = 'initiative-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-logo">${logoHtml(init, 56)}</div>
        <div class="card-header-text">
          <span class="card-name">${init.name}</span>
        </div>
      </div>
      <div class="card-country"><span class="flag">${init.flag}</span> ${init.country} <span class="card-scope-text ${sc}"><svg width="11" height="14" viewBox="0 0 28 36" fill="currentColor" style="vertical-align:-2px;margin-right:4px;"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"/><circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/></svg>${init.scope}</span></div>
      <div class="card-stamps">${stamps.join('')}</div>
      ${priorities ? `<div class="card-priorities">${priorities}</div>` : ''}
      <div class="card-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
    `;
    card.addEventListener('click', () => showProfile(init.name));
    grid.appendChild(card);
  });
}

// Clear all filters
document.getElementById('clear-all-filters').addEventListener('click', () => {
  activeFilters = {};
  idSearchQuery = '';
  const searchInput = document.getElementById('id-search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-dropdown').classList.remove('open');
  renderInitiatives();
});

// Search input
const idSearchInput = document.getElementById('id-search-input');
if (idSearchInput) {
  idSearchInput.addEventListener('input', () => {
    idSearchQuery = idSearchInput.value;
    renderInitiatives();
  });
}

// Filters
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
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

    if (filterKey === 'breakthrough') {
      if (activeFilters.breakthrough && activeFilters.breakthrough.length) {
        activeFilters.breakthrough = [];
        btn.classList.remove('active');
      } else {
        activeFilters.breakthrough = initiatives.map(i => i.breakthroughTarget).filter(Boolean);
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

    const btnRect = btn.offsetLeft;
    dropdown.style.left = btnRect + 'px';

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

// ---- PROFILE MODAL (MODERN REDESIGN) ----
function showProfile(name, showDirectoryBtn) {
  const init = initiatives.find(i => i.name === name);
  if (!init) return;

  const directoryBtn = showDirectoryBtn
    ? `<div style="text-align:right;margin-top:-8px;padding:8px 0;"><button class="btn-go-directory" onclick="closeModal('profile-modal');goToSection('initiatives-directory');">Go to Directory &rarr;</button></div>`
    : '';

  // Stamps
  let stamps = '';
  if (init.activePartner) stamps += `<div class="pro-stamp partner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>RAA Active Partner</span></div>`;
  if (init.breakthroughTarget) stamps += `<div class="pro-stamp breakthrough"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${init.breakthroughTarget}</span></div>`;

  // Header with logo
  const headerBlock = `<div class="pro-header"><div class="pro-header-logo">${logoHtml(init, 96)}</div></div>`;

  // CTAs
  let ctas = '';
  if (init.website) ctas += `<a href="${init.website}" target="_blank" class="profile-cta-btn org"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Visit Organization</a>`;
  if (init.initiativeLink) ctas += `<a href="${init.initiativeLink}" target="_blank" class="profile-cta-btn initiative"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Explore Initiative</a>`;
  if (init.annualReport && init.canDisclose34) ctas += `<a href="${init.annualReport}" target="_blank" class="profile-cta-btn report"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Annual Report</a>`;
  if (init.video) ctas += `<a href="${init.video}" target="_blank" class="profile-cta-btn video"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Watch Video</a>`;

  // Impact numbers (respect disclosure flags)
  let impacts = '';
  function addImpact(value, label, color) {
    if (!value || value === 0) return;
    impacts += `<div class="pro-impact" style="--impact-color:${color}"><div class="pro-impact-num">${formatNumber(value)}</div><div class="pro-impact-label">${label}</div></div>`;
  }
  if (init.canDisclose31) {
    const totalHa = (init.haToBeRestored || 0) + (init.haToBeConserved || 0) + (init.haUnderRestoration || 0) + (init.haConserved || 0) + (init.inlandWatersRestoration || 0);
    addImpact(totalHa, 'Hectares', '#48966a');
    addImpact(init.peopleToBeBenefited || init.peopleBenefited, init.peopleToBeBenefited ? 'People to Benefit' : 'People Benefited', '#587da0');
  }
  if (init.canDisclose33) {
    const totalFinance = (init.financialToMobilize || 0) + (init.financialMobilized || 0);
    addImpact(totalFinance, 'USD Committed', '#c49a3c');
  }

  // Description (collapsible if long)
  let descHtml = '';
  if (init.shortDescription) {
    const isLong = init.shortDescription.length > 300;
    if (isLong) {
      descHtml = `<div class="pro-desc collapsed" onclick="this.classList.toggle('collapsed')"><p>${init.shortDescription}</p><span class="pro-desc-toggle">Read more</span></div>`;
    } else {
      descHtml = `<div class="pro-desc"><p>${init.shortDescription}</p></div>`;
    }
  }

  // Primary tags
  let primary = '';
  function addPrimaryTags(label, arr) {
    if (!arr || !arr.length) return;
    primary += `<div class="pro-tag-group"><span class="pro-tag-label">${label}</span><div class="pro-tags-wrap">${arr.map(t => `<span class="pro-tag">${t}</span>`).join('')}</div></div>`;
  }
  function addPrimaryField(label, value) {
    if (!value) return;
    primary += `<div class="pro-tag-group"><span class="pro-tag-label">${label}</span><div class="pro-tags-wrap"><span class="pro-tag">${value}</span></div></div>`;
  }

  addPrimaryField('Type of Actor', init.actorType);
  addPrimaryTags('Thematic Priorities', init.thematicPriorities);
  addPrimaryTags('Enablers', init.enablers);
  if (init.canDisclose31) addPrimaryTags('Priority Ecosystem', init.priorityEcosystem);

  // Detail numbers (breakdown)
  let details = '';
  function addDetail(label, value, prefix, suffix) {
    if (!value || value === 0) return;
    details += `<div class="pro-detail-num"><span class="pro-detail-label">${label}</span><span class="pro-detail-value">${prefix || ''}${formatNumber(value)}${suffix || ''}</span></div>`;
  }
  // 3.1 & 3.2: Land, water, people
  if (init.canDisclose31) {
    addDetail('Ha Under Restoration', init.haUnderRestoration, '', ' ha');
    addDetail('Ha Conserved', init.haConserved, '', ' ha');
    addDetail('Inland Waters', init.inlandWatersRestoration, '', ' ha');
    addDetail('Ha to Restore', init.haToBeRestored, '', ' ha');
    addDetail('Ha to Conserve', init.haToBeConserved, '', ' ha');
    addDetail('People Benefited', init.peopleBenefited, '', '');
    addDetail('People to Benefit', init.peopleToBeBenefited, '', '');
    if (init.howPeopleBenefited) details += `<div class="pro-detail-num full"><span class="pro-detail-label">How</span><span class="pro-detail-value">${init.howPeopleBenefited}</span></div>`;
  }
  // 3.3: Finance
  if (init.canDisclose33) {
    addDetail('Finance Mobilized', init.financialMobilized, 'USD ', '');
    addDetail('Finance to Mobilize', init.financialToMobilize, 'USD ', '');
  }
  // 3.4: Other indicators
  if (init.canDisclose34) {
    if (init.additionalIndicators) details += `<div class="pro-detail-num full"><span class="pro-detail-label">Additional Indicators</span><span class="pro-detail-value">${init.additionalIndicators}</span></div>`;
  }

  // Secondary compact info
  let secondary = '';
  function addSecondary(label, arr) {
    if (!arr || !arr.length) return;
    secondary += `<div class="pro-sec-item"><span class="pro-sec-label">${label}</span><span class="pro-sec-value">${arr.join(' · ')}</span></div>`;
  }
  addSecondary('Geographic Scope', init.geographicScope);
  addSecondary('Rio Synergies', init.rioSynergies);
  if (init.canDisclose31) addSecondary('Beneficiaries', init.beneficiaries);
  if (init.otherPartners) secondary += `<div class="pro-sec-item"><span class="pro-sec-label">Other Partners</span><span class="pro-sec-value">${init.otherPartners}</span></div>`;
  if (init.canDisclose33) {
    if (init.otherResourcesMobilized) secondary += `<div class="pro-sec-item"><span class="pro-sec-label">Resources Mobilized</span><span class="pro-sec-value">${init.otherResourcesMobilized}</span></div>`;
    if (init.otherResourcesToMobilize) secondary += `<div class="pro-sec-item"><span class="pro-sec-label">Resources to Mobilize</span><span class="pro-sec-value">${init.otherResourcesToMobilize}</span></div>`;
  }

  document.getElementById('modal-body').innerHTML = `
    ${headerBlock}
    <div class="pro-body">
      <div class="pro-title-row">
        <h2 class="pro-name">${init.name}</h2>
        <div class="pro-subtitle">${init.partnerName}${init.country ? ' &middot; ' + init.flag + ' ' + init.country : ''}</div>
      </div>
      ${stamps ? `<div class="pro-stamps">${stamps}</div>` : ''}
      ${ctas ? `<div class="pro-ctas">${ctas}</div>` : ''}
      ${descHtml}
      ${impacts ? `<div class="pro-impacts">${impacts}</div>` : ''}
      ${primary ? `<div class="pro-primary">${primary}</div>` : ''}
      ${details ? `<div class="pro-details-grid">${details}</div>` : ''}
      ${secondary ? `<div class="pro-secondary">${secondary}</div>` : ''}
      ${directoryBtn}
    </div>
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
const ecoDescriptions = {
  'data-metrics': { title: 'Data & Metrics on Land', desc: 'Access to data portals, monitoring systems and metric platforms tackling land degradation and supporting restoration and drought resilience.' },
  'funding-grants': { title: 'Funding & Grants', desc: 'Visibility of existing financial instruments and funding opportunities related to land and drought.' },
  'knowledge': { title: 'Knowledge Ecosystem', desc: 'Orientation across knowledge, technical and policy infrastructures shaping the global land and soil agenda.' }
};

function switchEcoCategory(ecoId) {
  document.querySelectorAll('.eco-category-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.eco-panel').forEach(p => p.classList.remove('active'));
  const activeCard = document.querySelector(`.eco-category-card[data-eco="${ecoId}"]`);
  if (activeCard) activeCard.classList.add('active');
  const panel = document.getElementById('eco-' + ecoId);
  if (panel) panel.classList.add('active');
  const info = ecoDescriptions[ecoId];
  if (info) {
    document.getElementById('eco-expanded-title').textContent = info.title;
    document.getElementById('eco-expanded-desc').textContent = info.desc;
  }
}

document.querySelectorAll('.eco-category-card').forEach(card => {
  card.addEventListener('click', () => switchEcoCategory(card.dataset.eco));
});

switchEcoCategory('data-metrics');

document.querySelectorAll('.eco-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.eco-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.eco-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('eco-' + tab.dataset.eco).classList.add('active');
  });
});

const ecoColors = { data: '#48966a', funding: '#F8AA41', knowledge: '#587da0' };

function showPlatformProfile(p, color) {
  const objectives = p.objectives ? p.objectives.map(o => `<li>${o}</li>`).join('') : '';
  document.getElementById('platform-modal-body').innerHTML = `
    <div class="plat-profile-banner" style="background:${color}">
      <div class="plat-profile-logo">${p.logo}</div>
    </div>
    <div class="plat-profile-body">
      <h2 class="plat-profile-name">${p.name}</h2>
      <p class="plat-profile-desc">${p.description}</p>
      ${p.relevance ? `<div class="plat-profile-section"><h4>Relevance</h4><p>${p.relevance}</p></div>` : ''}
      ${objectives ? `<div class="plat-profile-section"><h4>Main Objectives</h4><ul>${objectives}</ul></div>` : ''}
      ${p.link ? `<a href="${p.link}" target="_blank" class="plat-profile-btn">Visit Platform \u2192</a>` : '<span class="plat-profile-btn disabled">Link coming soon</span>'}
    </div>
  `;
  document.getElementById('platform-modal').classList.add('open');
}

function renderPlatforms(containerId, data, color) {
  const grid = document.getElementById(containerId);
  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'platform-card';
    card.style.setProperty('--platform-color', color);
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showPlatformProfile(p, color));
    card.innerHTML = `
      <div class="platform-banner"></div>
      <div class="platform-body">
        <div class="platform-header">
          <div class="platform-logo">${p.logo}</div>
          <div class="platform-name">${p.name}</div>
        </div>
        <div class="platform-desc">${p.description}</div>
        <div class="platform-footer">
          <span class="platform-link">Learn more \u2192</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateEcoStats() {
  const total = platforms.data.length + platforms.funding.length + platforms.knowledge.length;
  animateDgStat('eco-total', total);
  animateDgStat('eco-categories', 3);
  const ecData = document.getElementById('eco-count-data');
  const ecFunding = document.getElementById('eco-count-funding');
  const ecKnowledge = document.getElementById('eco-count-knowledge');
  if (ecData) ecData.textContent = platforms.data.length;
  if (ecFunding) ecFunding.textContent = platforms.funding.length;
  if (ecKnowledge) ecKnowledge.textContent = platforms.knowledge.length;
}

// ---- SECTION 4: COMMUNITY SNAPSHOT ----
document.getElementById('snapshot-date').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function renderBarChart(id, data) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  const max = Math.max(...data.map(d => d.pct || d.value));
  data.forEach(d => {
    const w = Math.round(((d.pct || d.value) / max) * 100);
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `<span class="bar-label">${d.label}</span><div class="bar-track"><div class="bar-fill" style="width:0%" data-width="${w}%"></div></div><span class="bar-value">${d.value}</span>`;
    el.appendChild(item);
  });
}

function renderDonut(chartId, legendId, data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;
  let cum = 0;
  const parts = [];
  const legend = document.getElementById(legendId);
  if (!legend) return;
  legend.innerHTML = '';
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
  const chartEl = document.getElementById(chartId);
  if (chartEl) chartEl.style.background = `conic-gradient(${parts.join(', ')})`;
}

function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    if (isNaN(target)) return;
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

// ============================================================
// INIT APP — waits for data to load, then renders everything
// ============================================================
async function initApp() {
  await loadData();

  // Update hero stats from real data
  const totalInit = initiatives.length;
  const totalCountries = new Set(initiatives.map(i => i.country)).size;
  const totalHa = initiatives.reduce((sum, i) => sum + (i.haToBeRestored || 0) + (i.haToBeConserved || 0) + (i.haUnderRestoration || 0) + (i.haConserved || 0) + (i.inlandWatersRestoration || 0), 0);

  document.querySelectorAll('.hero-stat-num').forEach(el => {
    const label = el.nextElementSibling?.textContent?.trim();
    if (label === 'Initiatives') { el.dataset.count = totalInit; el.dataset.suffix = ''; }
    if (label === 'Countries') { el.dataset.count = totalCountries; el.dataset.suffix = ''; }
    if (label === 'Hectares') {
      if (totalHa >= 1e6) { el.dataset.count = (totalHa / 1e6).toFixed(1); el.dataset.suffix = 'M'; el.dataset.decimal = '1'; }
      else { el.dataset.count = totalHa; el.dataset.suffix = ''; }
    }
  });

  // Update snapshot counters
  const counterCards = document.querySelectorAll('.counter-card');
  counterCards.forEach(card => {
    const num = card.querySelector('.counter-num');
    const suffix = card.querySelector('.counter-suffix');
    const label = card.querySelector('.counter-label')?.textContent?.trim();
    if (label?.includes('Initiatives')) { num.dataset.target = totalInit; suffix.textContent = ''; }
    if (label?.includes('Countries')) { num.dataset.target = totalCountries; suffix.textContent = ''; }
    if (label?.includes('Hectares')) {
      if (totalHa >= 1e6) { num.dataset.target = (totalHa / 1e6).toFixed(1); suffix.textContent = 'M+'; }
      else { num.dataset.target = totalHa; suffix.textContent = ''; }
    }
  });

  // Update snapshot overview cards
  const snapNums = document.querySelectorAll('.snap-num');
  snapNums.forEach(el => {
    const label = el.nextElementSibling?.textContent?.trim() || el.parentElement?.querySelector('.snap-label')?.textContent?.trim();
    if (label?.includes('Initiatives')) el.textContent = totalInit;
    if (label?.includes('Countries')) el.textContent = totalCountries;
    if (label?.includes('Hectares')) el.textContent = totalHa >= 1e6 ? (totalHa / 1e6).toFixed(1) + 'M+' : totalHa.toLocaleString();
    if (label?.includes('Actor')) el.textContent = new Set(initiatives.map(i => i.actorType)).size;
  });

  // Initialize maps
  initOverviewMap();

  // Render overview initiatives — rotating carousel, minimal cards (logo + name + country + scope)
  const overviewGrid = document.getElementById('overview-initiatives');
  overviewGrid.innerHTML = '';
  const initTrack = document.createElement('div');
  initTrack.className = 'ov-init-track';
  const initList = [...initiatives, ...initiatives];
  initList.forEach(init => {
    const sc = init.scope.toLowerCase();
    const card = document.createElement('div');
    card.className = 'initiative-card ov-mini';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-logo">${logoHtml(init, 56)}</div>
        <div class="card-header-text">
          <span class="card-name">${init.name}</span>
        </div>
      </div>
      <div class="card-country"><span class="flag">${init.flag}</span> ${init.country} <span class="card-scope-text ${sc}"><svg width="11" height="14" viewBox="0 0 28 36" fill="currentColor" style="vertical-align:-2px;margin-right:4px;"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"/><circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/></svg>${init.scope}</span></div>
    `;
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      showProfile(init.name, true);
    });
    initTrack.appendChild(card);
  });
  overviewGrid.appendChild(initTrack);

  // Render overview partners — logos only, marquee style (only partners with real logos)
  const overviewPartners = document.getElementById('overview-partners');
  overviewPartners.innerHTML = '';
  const partnersWithLogo = partners.filter(p => p.logo && p.logo.startsWith('logos/'));
  const partnerList = [...partnersWithLogo, ...partnersWithLogo];
  const track = document.createElement('div');
  track.className = 'ov-partners-track';
  partnerList.forEach(p => {
    const el = document.createElement('div');
    el.className = 'ov-partner-item';
    el.title = p.name;
    el.innerHTML = logoHtml(p, 70);
    track.appendChild(el);
  });
  overviewPartners.appendChild(track);

  // Render initiatives directory
  renderInitiatives();

  // Render platforms
  renderPlatforms('platforms-data', platforms.data, ecoColors.data);
  renderPlatforms('platforms-funding', platforms.funding, ecoColors.funding);
  renderPlatforms('platforms-knowledge', platforms.knowledge, ecoColors.knowledge);

  // Render snapshot charts
  renderBarChart('chart-sector', snapshotData.bySector);
  renderBarChart('chart-priority', snapshotData.byPriority);
  renderBarChart('chart-enabler', snapshotData.byEnabler);
  renderBarChart('chart-breakthrough', snapshotData.byBreakthrough);
  renderDonut('chart-scope', 'legend-scope', snapshotData.byScope);
  renderDonut('chart-region', 'legend-region', snapshotData.byRegion);

  // Render partners list (alphabetical with letter index)
  const pGrid = document.getElementById('partners-grid');
  const alphaNav = document.getElementById('partners-alpha');
  pGrid.innerHTML = '';
  alphaNav.innerHTML = '';

  // Sort partners alphabetically
  const sortedPartners = [...partners].sort((a, b) => a.name.localeCompare(b.name));

  // Find which letters have partners
  const usedLetters = new Set(sortedPartners.map(p => p.name[0].toUpperCase()));

  // Build alphabet nav
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    const btn = document.createElement('a');
    btn.className = 'alpha-letter' + (usedLetters.has(letter) ? ' active' : '');
    btn.textContent = letter;
    btn.href = '#';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('partner-letter-' + letter);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    alphaNav.appendChild(btn);
  });

  // Build partner list grouped by letter in 2-col grid
  let currentLetter = '';
  let currentGroup = null;
  sortedPartners.forEach(p => {
    const letter = p.name[0].toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      const heading = document.createElement('div');
      heading.className = 'partner-letter-heading';
      heading.id = 'partner-letter-' + letter;
      heading.textContent = letter;
      pGrid.appendChild(heading);
      currentGroup = document.createElement('div');
      currentGroup.className = 'partner-letter-group';
      pGrid.appendChild(currentGroup);
    }
    const card = document.createElement('div');
    card.className = 'partner-row';
    card.innerHTML = `
      <div class="partner-row-logo">${logoHtml(p, 56)}</div>
      <div class="partner-row-info">
        <div class="partner-row-name">${p.name}</div>
        ${p.location ? `<div class="partner-row-location">${p.location}</div>` : ''}
      </div>
      ${p.website ? `<a href="${p.website}" target="_blank" class="partner-row-link"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Visit Website</a>` : ''}
    `;
    currentGroup.appendChild(card);
  });

  // Hide loading overlay
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';

  // Animate hero count-up
  animateCountUp();
}

// Start the app
initApp();
