// ============================================================
// RAA COMMUNITY DASHBOARD — DATA LOADER
// Fetches live data from published Google Sheets CSVs
// ============================================================

const _isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const _SHEET_ID = '1K2oV35MOnzpybC4TUIczIM1dhIe1ZmbbUqCZkalDfGY';
const _BASE = `https://docs.google.com/spreadsheets/d/${_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

const CSV_URLS = {
  initiatives: _isLocal
    ? _BASE + '5.%20DEV_INITIATIVES'
    : _BASE + '6.%20PUB_INITIATIVES'
};

// ---- CSV PARSER ----
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const lines = [];

  // Split into logical lines, preserving quotes for the second pass
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      current += ch; // preserve the quote
      if (inQuotes && text[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current); current = '';
    } else if (ch === '\r' && !inQuotes) {
      // skip \r
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length === 0) return [];

  // Parse a single CSV line into fields
  function parseLine(line) {
    const vals = [];
    let field = '';
    let q = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (!q) { q = true; }
        else if (line[j + 1] === '"') { field += '"'; j++; }
        else { q = false; }
      } else if (c === ',' && !q) {
        vals.push(field.trim()); field = '';
      } else {
        field += c;
      }
    }
    vals.push(field.trim());
    return vals;
  }

  const headers = parseLine(lines[0]).map(h => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
    rows.push(obj);
  }
  return rows;
}

// ---- COUNTRY LOOKUP (lat/lng/flag) ----
const COUNTRY_GEO = {
  "Afghanistan": { lat: 33.93, lng: 67.71, code: "AF" },
  "Albania": { lat: 41.15, lng: 20.17, code: "AL" },
  "Algeria": { lat: 28.03, lng: 1.66, code: "DZ" },
  "Angola": { lat: -11.20, lng: 17.87, code: "AO" },
  "Argentina": { lat: -38.42, lng: -63.62, code: "AR" },
  "Armenia": { lat: 40.07, lng: 45.04, code: "AM" },
  "Australia": { lat: -25.27, lng: 133.78, code: "AU" },
  "Austria": { lat: 47.52, lng: 14.55, code: "AT" },
  "Azerbaijan": { lat: 40.14, lng: 47.58, code: "AZ" },
  "Bangladesh": { lat: 23.68, lng: 90.36, code: "BD" },
  "Belgium": { lat: 50.50, lng: 4.47, code: "BE" },
  "Benin": { lat: 9.31, lng: 2.32, code: "BJ" },
  "Bhutan": { lat: 27.51, lng: 90.43, code: "BT" },
  "Bolivia": { lat: -16.29, lng: -63.59, code: "BO" },
  "Botswana": { lat: -22.33, lng: 24.68, code: "BW" },
  "Brazil": { lat: -14.24, lng: -51.93, code: "BR" },
  "Burkina Faso": { lat: 12.24, lng: -1.56, code: "BF" },
  "Burundi": { lat: -3.37, lng: 29.92, code: "BI" },
  "Cambodia": { lat: 12.57, lng: 104.99, code: "KH" },
  "Cameroon": { lat: 7.37, lng: 12.35, code: "CM" },
  "Canada": { lat: 56.13, lng: -106.35, code: "CA" },
  "Central African Republic": { lat: 6.61, lng: 20.94, code: "CF" },
  "Chad": { lat: 15.45, lng: 18.73, code: "TD" },
  "Chile": { lat: -35.68, lng: -71.54, code: "CL" },
  "China": { lat: 35.86, lng: 104.20, code: "CN" },
  "Colombia": { lat: 4.57, lng: -74.30, code: "CO" },
  "Comoros": { lat: -11.88, lng: 43.87, code: "KM" },
  "Congo": { lat: -0.23, lng: 15.83, code: "CG" },
  "Costa Rica": { lat: 9.75, lng: -83.75, code: "CR" },
  "Croatia": { lat: 45.10, lng: 15.20, code: "HR" },
  "Cuba": { lat: 21.52, lng: -77.78, code: "CU" },
  "Cyprus": { lat: 35.13, lng: 33.43, code: "CY" },
  "Czech Republic": { lat: 49.82, lng: 15.47, code: "CZ" },
  "Democratic Republic of the Congo": { lat: -4.04, lng: 21.76, code: "CD" },
  "Denmark": { lat: 56.26, lng: 9.50, code: "DK" },
  "Djibouti": { lat: 11.83, lng: 42.59, code: "DJ" },
  "Dominican Republic": { lat: 18.74, lng: -70.16, code: "DO" },
  "DRC": { lat: -4.04, lng: 21.76, code: "CD" },
  "Ecuador": { lat: -1.83, lng: -78.18, code: "EC" },
  "Egypt": { lat: 26.82, lng: 30.80, code: "EG" },
  "El Salvador": { lat: 13.79, lng: -88.90, code: "SV" },
  "Eritrea": { lat: 15.18, lng: 39.78, code: "ER" },
  "Estonia": { lat: 58.60, lng: 25.01, code: "EE" },
  "Eswatini": { lat: -26.52, lng: 31.47, code: "SZ" },
  "Ethiopia": { lat: 9.15, lng: 40.49, code: "ET" },
  "Fiji": { lat: -17.71, lng: 178.07, code: "FJ" },
  "Finland": { lat: 61.92, lng: 25.75, code: "FI" },
  "France": { lat: 46.23, lng: 2.21, code: "FR" },
  "Gabon": { lat: -0.80, lng: 11.61, code: "GA" },
  "Gambia": { lat: 13.44, lng: -15.31, code: "GM" },
  "Georgia": { lat: 42.32, lng: 43.36, code: "GE" },
  "Germany": { lat: 51.17, lng: 10.45, code: "DE" },
  "Ghana": { lat: 7.95, lng: -1.02, code: "GH" },
  "Greece": { lat: 39.07, lng: 21.82, code: "GR" },
  "Guatemala": { lat: 15.78, lng: -90.23, code: "GT" },
  "Guinea": { lat: 9.95, lng: -9.70, code: "GN" },
  "Guinea-Bissau": { lat: 11.80, lng: -15.18, code: "GW" },
  "Haiti": { lat: 18.97, lng: -72.29, code: "HT" },
  "Honduras": { lat: 15.20, lng: -86.24, code: "HN" },
  "Hungary": { lat: 47.16, lng: 19.50, code: "HU" },
  "India": { lat: 20.59, lng: 78.96, code: "IN" },
  "Indonesia": { lat: -0.79, lng: 113.92, code: "ID" },
  "Iran": { lat: 32.43, lng: 53.69, code: "IR" },
  "Iraq": { lat: 33.22, lng: 43.68, code: "IQ" },
  "Ireland": { lat: 53.14, lng: -7.69, code: "IE" },
  "Israel": { lat: 31.05, lng: 34.85, code: "IL" },
  "Italy": { lat: 41.87, lng: 12.57, code: "IT" },
  "Ivory Coast": { lat: 7.54, lng: -5.55, code: "CI" },
  "Jamaica": { lat: 18.11, lng: -77.30, code: "JM" },
  "Japan": { lat: 36.20, lng: 138.25, code: "JP" },
  "Jordan": { lat: 30.59, lng: 36.24, code: "JO" },
  "Kazakhstan": { lat: 48.02, lng: 66.92, code: "KZ" },
  "Kenya": { lat: -0.02, lng: 37.91, code: "KE" },
  "Kuwait": { lat: 29.31, lng: 47.48, code: "KW" },
  "Kyrgyzstan": { lat: 41.20, lng: 74.77, code: "KG" },
  "Laos": { lat: 19.86, lng: 102.50, code: "LA" },
  "Latvia": { lat: 56.88, lng: 24.60, code: "LV" },
  "Lebanon": { lat: 33.85, lng: 35.86, code: "LB" },
  "Lesotho": { lat: -29.61, lng: 28.23, code: "LS" },
  "Liberia": { lat: 6.43, lng: -9.43, code: "LR" },
  "Libya": { lat: 26.34, lng: 17.23, code: "LY" },
  "Lithuania": { lat: 55.17, lng: 23.88, code: "LT" },
  "Luxembourg": { lat: 49.82, lng: 6.13, code: "LU" },
  "Madagascar": { lat: -18.77, lng: 46.87, code: "MG" },
  "Malawi": { lat: -13.25, lng: 34.30, code: "MW" },
  "Malaysia": { lat: 4.21, lng: 101.98, code: "MY" },
  "Mali": { lat: 17.57, lng: -4.00, code: "ML" },
  "Mauritania": { lat: 21.01, lng: -10.94, code: "MR" },
  "Mauritius": { lat: -20.35, lng: 57.55, code: "MU" },
  "Mexico": { lat: 23.63, lng: -102.55, code: "MX" },
  "Mongolia": { lat: 46.86, lng: 103.85, code: "MN" },
  "Morocco": { lat: 31.79, lng: -7.09, code: "MA" },
  "Mozambique": { lat: -18.67, lng: 35.53, code: "MZ" },
  "Myanmar": { lat: 21.91, lng: 95.96, code: "MM" },
  "Namibia": { lat: -22.96, lng: 18.49, code: "NA" },
  "Nepal": { lat: 28.39, lng: 84.12, code: "NP" },
  "Netherlands": { lat: 52.13, lng: 5.29, code: "NL" },
  "New Zealand": { lat: -40.90, lng: 174.89, code: "NZ" },
  "Nicaragua": { lat: 12.87, lng: -85.21, code: "NI" },
  "Niger": { lat: 17.61, lng: 8.08, code: "NE" },
  "Nigeria": { lat: 9.08, lng: 8.68, code: "NG" },
  "North Macedonia": { lat: 41.51, lng: 21.75, code: "MK" },
  "Norway": { lat: 60.47, lng: 8.47, code: "NO" },
  "Oman": { lat: 21.47, lng: 55.98, code: "OM" },
  "Pakistan": { lat: 30.38, lng: 69.35, code: "PK" },
  "Palestine": { lat: 31.95, lng: 35.23, code: "PS" },
  "Panama": { lat: 8.54, lng: -80.78, code: "PA" },
  "Papua New Guinea": { lat: -6.31, lng: 143.96, code: "PG" },
  "Paraguay": { lat: -23.44, lng: -58.44, code: "PY" },
  "Peru": { lat: -9.19, lng: -75.02, code: "PE" },
  "Philippines": { lat: 12.88, lng: 121.77, code: "PH" },
  "Poland": { lat: 51.92, lng: 19.15, code: "PL" },
  "Portugal": { lat: 39.40, lng: -8.22, code: "PT" },
  "Qatar": { lat: 25.35, lng: 51.18, code: "QA" },
  "Romania": { lat: 45.94, lng: 24.97, code: "RO" },
  "Russia": { lat: 61.52, lng: 105.32, code: "RU" },
  "Rwanda": { lat: -1.94, lng: 29.87, code: "RW" },
  "Saudi Arabia": { lat: 23.89, lng: 45.08, code: "SA" },
  "Senegal": { lat: 14.50, lng: -14.45, code: "SN" },
  "Serbia": { lat: 44.02, lng: 21.01, code: "RS" },
  "Sierra Leone": { lat: 8.46, lng: -11.78, code: "SL" },
  "Singapore": { lat: 1.35, lng: 103.82, code: "SG" },
  "Slovakia": { lat: 48.67, lng: 19.70, code: "SK" },
  "Slovenia": { lat: 46.15, lng: 14.99, code: "SI" },
  "Somalia": { lat: 5.15, lng: 46.20, code: "SO" },
  "South Africa": { lat: -30.56, lng: 22.94, code: "ZA" },
  "South Korea": { lat: 35.91, lng: 127.77, code: "KR" },
  "South Sudan": { lat: 6.88, lng: 31.31, code: "SS" },
  "Spain": { lat: 40.46, lng: -3.75, code: "ES" },
  "Sri Lanka": { lat: 7.87, lng: 80.77, code: "LK" },
  "Sudan": { lat: 12.86, lng: 30.22, code: "SD" },
  "Sweden": { lat: 60.13, lng: 18.64, code: "SE" },
  "Switzerland": { lat: 46.82, lng: 8.23, code: "CH" },
  "Syria": { lat: 34.80, lng: 38.99, code: "SY" },
  "Tajikistan": { lat: 38.86, lng: 71.28, code: "TJ" },
  "Tanzania": { lat: -6.37, lng: 34.89, code: "TZ" },
  "Thailand": { lat: 15.87, lng: 100.99, code: "TH" },
  "Togo": { lat: 8.62, lng: 1.21, code: "TG" },
  "Trinidad and Tobago": { lat: 10.69, lng: -61.22, code: "TT" },
  "Tunisia": { lat: 33.89, lng: 9.54, code: "TN" },
  "Turkey": { lat: 38.96, lng: 35.24, code: "TR" },
  "Turkmenistan": { lat: 38.97, lng: 59.56, code: "TM" },
  "Uganda": { lat: 1.37, lng: 32.29, code: "UG" },
  "Ukraine": { lat: 48.38, lng: 31.17, code: "UA" },
  "United Arab Emirates": { lat: 23.42, lng: 53.85, code: "AE" },
  "UAE": { lat: 23.42, lng: 53.85, code: "AE" },
  "United Kingdom": { lat: 55.38, lng: -3.44, code: "GB" },
  "UK": { lat: 55.38, lng: -3.44, code: "GB" },
  "United States": { lat: 37.09, lng: -95.71, code: "US" },
  "USA": { lat: 37.09, lng: -95.71, code: "US" },
  "Uruguay": { lat: -32.52, lng: -55.77, code: "UY" },
  "Uzbekistan": { lat: 41.38, lng: 64.59, code: "UZ" },
  "Venezuela": { lat: 6.42, lng: -66.59, code: "VE" },
  "Vietnam": { lat: 14.06, lng: 108.28, code: "VN" },
  "Yemen": { lat: 15.55, lng: 48.52, code: "YE" },
  "Zambia": { lat: -13.13, lng: 27.85, code: "ZM" },
  "Zimbabwe": { lat: -19.02, lng: 29.15, code: "ZW" },
  "Côte d'Ivoire": { lat: 7.54, lng: -5.55, code: "CI" }
};

// Region centers for Regional scope pins
const REGION_GEO = {
  "Africa": { lat: 2.0, lng: 21.0 },
  "Americas": { lat: 10.0, lng: -75.0 },
  "Asia": { lat: 30.0, lng: 80.0 },
  "Asia-Pacific": { lat: 10.0, lng: 120.0 },
  "Europe": { lat: 50.0, lng: 10.0 },
  "Oceania": { lat: -25.0, lng: 140.0 },
  "Latin America and the Caribbean": { lat: -5.0, lng: -60.0 },
  "Sub-Saharan Africa": { lat: -5.0, lng: 25.0 },
  "Middle East and North Africa": { lat: 28.0, lng: 35.0 },
  "IGAD": { lat: 5.0, lng: 40.0 }
};

const REGIONS = ["Africa", "Americas", "Asia", "Asia-Pacific", "Europe", "Oceania",
  "Latin America and the Caribbean", "Sub-Saharan Africa", "Middle East and North Africa", "IGAD"];

// ---- FLAG EMOJI FROM COUNTRY CODE ----
function flagEmoji(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

// ---- PARSE HELPERS ----
function parseMultiValue(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function extractCountry(location) {
  if (!location) return '';
  const parts = location.split(',');
  return parts[parts.length - 1].trim();
}

const COUNTRY_ALIASES = {
  'UK': 'United Kingdom',
  'U.K.': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'USA': 'United States',
  'U.S.A.': 'United States',
  'U.S.': 'United States',
  'Mexico City / Mexico': 'Mexico',
  'UAE': 'United Arab Emirates',
  'U.A.E.': 'United Arab Emirates',
};

function lookupCountry(countryName) {
  const clean = (COUNTRY_ALIASES[countryName.trim()] || countryName.trim());
  const geo = COUNTRY_GEO[clean];
  if (geo) return { lat: geo.lat, lng: geo.lng, flag: flagEmoji(geo.code), country: clean };
  // Try case-insensitive
  const key = Object.keys(COUNTRY_GEO).find(k => k.toLowerCase() === clean.toLowerCase());
  if (key) {
    const g = COUNTRY_GEO[key];
    return { lat: g.lat, lng: g.lng, flag: flagEmoji(g.code), country: key };
  }
  return { lat: 0, lng: 0, flag: '', country: clean };
}

function determineScope(geographicScope) {
  if (!geographicScope || !geographicScope.length) return 'National';
  const values = geographicScope.map(s => s.trim());
  if (values.some(v => v.toLowerCase() === 'global')) return 'Global';
  const hasRegion = values.some(v => REGIONS.some(r => v.toLowerCase().includes(r.toLowerCase())));
  if (hasRegion) return 'Regional';
  return 'National';
}

function driveToImgUrl(driveLink) {
  if (!driveLink) return '';
  // If it's already a local path, use as-is
  if (driveLink.startsWith('logos/')) return driveLink;
  // Handle "open?id=XXX" format
  const idMatch1 = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch1) return 'https://drive.google.com/thumbnail?id=' + idMatch1[1] + '&sz=w200';
  // Handle "/d/XXX/" format
  const idMatch2 = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch2) return 'https://drive.google.com/thumbnail?id=' + idMatch2[1] + '&sz=w200';
  return driveLink;
}

function parseNumber(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function ensureHttps(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Extract embedded http(s) URL if field has text before/after it
  const embedded = trimmed.match(/https?:\/\/\S+/);
  if (embedded) return embedded[0].replace(/[.,;)'"]+$/, '');
  // Skip placeholders and non-URLs
  if (/^(TBC|TBD|N\/A|NA|TBA)$/i.test(trimmed)) return '';
  if (!trimmed.includes('.') || trimmed.includes(' ')) return '';
  // Bare domain — prepend https://
  return 'https://' + trimmed;
}

// ---- LOCAL LOGO LOOKUP ----
// Register local logo files here. Key = Partner ID, Value = file path.
// Update this map when adding new logos to the logos/ folder.
const LOCAL_LOGOS = {
  'P001': 'logos/logo-P001.png',
  'P002': 'logos/logo-P002.png',
  'P003': 'logos/logo-P003.png',
  'P004': 'logos/logo-P004.jpg',
  'P005': 'logos/logo-P005.png',
  'P008': 'logos/logo-P008.png',
  'P009': 'logos/logo-P009.png',
  'P012': 'logos/logo-P012.png',
  'P014': 'logos/logo-P014.png',
  'P018': 'logos/logo-P018.png',
  'P020': 'logos/logo-P020.png',
  'P033': 'logos/logo-P033.png',
  'P021': 'logos/logo-P021.png',
  'P024': 'logos/logo-P024 : logo-P025.png',
  'P025': 'logos/logo-P024 : logo-P025.png',
  'P026': 'logos/logo-P026.png',
  'P027': 'logos/logo-P027.png',
  'P028': 'logos/logo-P028.png',
  'P035': 'logos/logo-P035.png',
  'P037': 'logos/logo-P037.png',
  'P039': 'logos/logo-P039.png',
  'P042-045': 'logos/P042-045.png',
  'P042-049': 'logos/P042-049.png',
  'P043': 'logos/logo-P043.png',
  'P045': 'logos/logo-P045.png',
  'P047': 'logos/logo-P047.png',
  'P016': 'logos/logo-P016.png',
  'P049': 'logos/logo-P049.png',
  'P054': 'logos/logo-P054.png',
  'P061': 'logos/logo-P061.png',
  'P065': 'logos/logo-P065.jpg',
  'P068': 'logos/logo-P068.jpg',
  'P071': 'logos/logo-P071.png',
  'P072': 'logos/logo-P072.jpg',
  'P073': 'logos/logo-P073.jpg',
  'P082': 'logos/logo-P082.jpg',
  'P048': 'logos/logo-P048.png',
  'P050': 'logos/logo-P050.png',
  'P056': 'logos/logo-P056.png',
  'P086': 'logos/logo-P086.png',
  'P088': 'logos/logo-P088.png',
  'P058': 'logos/logo-P058.png',
  'P079': 'logos/logo-P079.png',
  'P080': 'logos/logo-P080.png',
  'P013': 'logos/logo-P013.png',
  'P081': 'logos/logo-P081.jpg'
};

// ---- SECONDARY LOGOS ----
// Add entries here when an initiative has a second logo to display on their profile card.
const SECONDARY_LOGOS = {
  'P005': 'logos/logo-P005b.jpg'
};

// ---- VIDEO LINKS ----
// Register video URLs here. Key = Partner ID (e.g. 'P006'), Value = YouTube/Vimeo URL.
const VIDEO_LINKS = {
  'P006': 'https://www.youtube.com/watch?v=amn4Sy346-o'
};

// ---- TRANSFORM CSV ROWS ----
function transformInitiativeRow(row) {
  const geoScope = parseMultiValue(row['Geographic scope']);
  const country = extractCountry(row["Org's Location"]);
  const geo = lookupCountry(country);
  const scope = determineScope(geoScope);

  // For Global scope, use country location; for Regional with no country match, use region center
  let lat = geo.lat, lng = geo.lng;
  if (lat === 0 && lng === 0 && geoScope.length) {
    const regionMatch = geoScope.find(g => REGION_GEO[g]);
    if (regionMatch) { lat = REGION_GEO[regionMatch].lat; lng = REGION_GEO[regionMatch].lng; }
  }

  return {
    id: row['Initiative ID'] || '',
    name: (row['Initiative name'] || '').trim(),
    partnerName: (row['Organization Name'] || '').trim(),
    logo: LOCAL_LOGOS[row['Initiative ID']] || LOCAL_LOGOS[row['Initiative ID']?.split('-')[0]] || driveToImgUrl((row['Logo (link)'] || '').split(',')[0].trim()),
    logo2: SECONDARY_LOGOS[row['Initiative ID']] || SECONDARY_LOGOS[row['Initiative ID']?.split('-')[0]] || '',
    website: ensureHttps(row['Link to website']),
    initiativeLink: ensureHttps(row['Link to initiative']),
    video: VIDEO_LINKS[row['Initiative ID']?.split('-')[0]] || '',
    country: geo.country,
    flag: geo.flag,
    lat: lat,
    lng: lng,
    scope: scope,
    activePartner: (row['Active Partner'] || '').trim().toLowerCase() === 'yes',
    shortDescription: row['Initiative description'] || '',
    geographicScope: geoScope,
    specificGeography: row['Specific geography'] || '',
    thematicPriorities: parseMultiValue(row['Priority area']).map(p => p.replace('Drought and Water Resilience', 'Drought & Water Resilience').replace('Land  Conservation and Restoration', 'Land Conservation & Restoration').replace('Land Conservation and Restoration', 'Land Conservation & Restoration')),
    enablers: parseMultiValue(row['Enabler']).map(e => e.replace(/^Science & Technology$/i, 'Science, Technology & Innovation')),
    actorType: (row['Type of organization'] || '').trim().replace(/^Multilateral Org$/i, 'Multilateral Organization'),
    priorityEcosystem: parseMultiValue(row['Priority Ecosystem']),
    breakthroughTarget: (row['Current BTT partner?'] || '').trim().toLowerCase() === 'yes' ? 'Land & Soil Breakthroughs' : '',
    rioSynergies: parseMultiValue(row['Rio Synergies']).filter(v =>
      ['SDG', 'UNFCCC', 'CBD', 'UNCCD'].some(k => v.toUpperCase().includes(k))
    ),
    otherMultilateralAgreements: row['*Other Multilateral Agreement or relevant process, stated below'] || '',
    beneficiaries: parseMultiValue(row['Beneficiaries']),
    otherPartners: row['Other partners'] || '',
    // Numeric data
    haToBeRestored: parseNumber(row['Ha to be under restoration']),
    haToBeConserved: parseNumber(row['Ha to be conserved']),
    haUnderRestoration: parseNumber(row['Ha under restoration']),
    haConserved: parseNumber(row['Ha conserved']),
    inlandWatersToBeRestored: parseNumber(row['Inland waters to be  under restoration']),
    inlandWatersToBeConserved: parseNumber(row['Inland waters to be conserved']),
    inlandWatersRestoration: parseNumber(row['Inland waters under restoration']),
    inlandWatersConserved: parseNumber(row['Inland waters conserved']),
    peopleToBeBenefited: parseNumber(row['People to be benefited']),
    peopleBenefited: parseNumber(row['People already benefited']),
    howPeopleBenefited: row['*how people are being benefited'] || '',
    howPeopleWillBeBenefited: row['*how people will be benefited'] || '',
    financialToMobilize: parseNumber(row['Financial resources to be mobilized']),
    financialMobilized: parseNumber(row['Financial resources mobilized']),
    otherResourcesToMobilize: row['Other resources to be mobilized'] || '',
    otherResourcesMobilized: row['Other resources mobilized'] || '',
    reportedElsewhere: row['Reported somewhere else?'] || '',
    otherReportingPlatform: row['*Other reporting platform'] || '',
    additionalIndicators: row['Additional indicators'] || '',
    toolsForLandData: row['Tools for land-related data'] || '',
    annualReport: row['Link to annual report'] || '',
    visualRepresentation: driveToImgUrl((row['Visual Representation (link)'] || '').split(',')[0].trim()),
    status: row['Status'] || '',
    // Disclosure flags
    canDisclose31: (row['Public diclosure of 3.1 and 3.2?'] || '').trim().toLowerCase() === 'yes',
    canDisclose33: (row['Public disclosure of 3.3? (finance)'] || '').trim().toLowerCase() === 'yes',
    canDisclose34: (row['Public disclosure of 3.4? (other indicators)'] || '').trim().toLowerCase() === 'yes'
  };
}

// ---- COMPUTE FILTER OPTIONS FROM DATA ----
function computeFilterOptions(inits) {
  return {
    scope: [...new Set(inits.map(i => i.scope))].filter(Boolean).sort(),
    priority: [...new Set(inits.flatMap(i => i.thematicPriorities))].filter(Boolean).sort(),
    enabler: [...new Set(inits.flatMap(i => i.enablers))].filter(Boolean).sort(),
    actor: [...new Set(inits.map(i => i.actorType))].filter(Boolean).sort(),
    country: [...new Set(inits.map(i => i.country))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
    breakthrough: [...new Set(inits.map(i => i.breakthroughTarget))].filter(Boolean).sort()
  };
}

// ---- COMPUTE SNAPSHOT DATA FROM DATA ----
function computeSnapshotData(inits) {
  const total = inits.length;

  function countBy(arr) {
    const counts = {};
    arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value);
  }

  const sectorColors = ['#263524', '#48966a', '#6d7042', '#587da0', '#c49a3c', '#b09a78', '#4a6a60'];
  const scopeColors = { 'Regional': '#74a869', 'National': '#b7d1a4', 'Global': '#2d6a4f' };
  const regionColors = ['#3d5a35', '#6b8f5e', '#8b6f47', '#d4dfc8', '#d6cdb8', '#587da0', '#c49a3c'];

  const bySector = countBy(inits.map(i => i.actorType).filter(Boolean));
  const byScope = Object.entries(
    inits.reduce((acc, i) => { acc[i.scope] = (acc[i.scope] || 0) + 1; return acc; }, {})
  ).map(([label, value]) => ({ label, value, color: scopeColors[label] || '#999' }));

  const byPriority = countBy(inits.flatMap(i => i.thematicPriorities));
  const byEnabler = countBy(inits.flatMap(i => i.enablers));

  const regionCounts = {};
  inits.forEach(i => {
    i.geographicScope.forEach(g => {
      const r = REGIONS.find(reg => g.toLowerCase().includes(reg.toLowerCase())) || g;
      regionCounts[r] = (regionCounts[r] || 0) + 1;
    });
  });
  const byRegion = Object.entries(regionCounts)
    .map(([label, value], idx) => ({ label, value, color: regionColors[idx % regionColors.length] }))
    .sort((a, b) => b.value - a.value);

  const btCounts = {};
  inits.forEach(i => {
    const bt = i.breakthroughTarget || 'Not declared';
    btCounts[bt] = (btCounts[bt] || 0) + 1;
  });
  const byBreakthrough = Object.entries(btCounts)
    .map(([label, value]) => ({ label, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);

  const byEcosystem = countBy(inits.flatMap(i => i.priorityEcosystem));

  return { bySector, byScope, byPriority, byEnabler, byRegion, byBreakthrough, byEcosystem };
}

// ---- PLATFORMS (hardcoded — no CSV yet) ----
const platforms = {
  data: [
    { name: "Lorem Ipsum", logo: "\ud83d\udcca", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.", relevance: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", objectives: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor"], link: "" },
    { name: "Dolor Sit Amet", logo: "\ud83c\udf0d", description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.", relevance: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", objectives: ["Ut enim ad minim veniam", "Quis nostrud exercitation", "Ullamco laboris nisi"], link: "" },
    { name: "Consectetur Adipiscing", logo: "\ud83d\uddfa\ufe0f", description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", relevance: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur.", objectives: ["Duis aute irure dolor", "Reprehenderit in voluptate", "Cillum dolore eu fugiat"], link: "" },
    { name: "Sed Do Eiusmod", logo: "\ud83d\udcc0", description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.", relevance: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", objectives: ["Excepteur sint occaecat", "Cupidatat non proident", "Officia deserunt mollit"], link: "" }
  ],
  funding: [
    { name: "Tempor Incididunt", logo: "\ud83c\udf10", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam quis nostrud exercitation.", relevance: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.", objectives: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor"], link: "" },
    { name: "Ut Labore Et Dolore", logo: "\ud83c\udf31", description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", relevance: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur.", objectives: ["Duis aute irure dolor", "Reprehenderit in voluptate", "Cillum dolore eu fugiat"], link: "" },
    { name: "Magna Aliqua Enim", logo: "\ud83c\udfe6", description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.", relevance: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", objectives: ["Excepteur sint occaecat", "Cupidatat non proident", "Officia deserunt mollit"], link: "" }
  ],
  knowledge: [
    { name: "Ad Minim Veniam", logo: "\ud83d\udcda", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.", relevance: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.", objectives: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor"], link: "" },
    { name: "Quis Nostrud Exercitation", logo: "\ud83c\udf3f", description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.", relevance: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", objectives: ["Ut enim ad minim veniam", "Quis nostrud exercitation", "Ullamco laboris nisi"], link: "" },
    { name: "Ullamco Laboris", logo: "\ud83c\udf3e", description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", relevance: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur.", objectives: ["Duis aute irure dolor", "Reprehenderit in voluptate", "Cillum dolore eu fugiat"], link: "" },
    { name: "Nisi Ut Aliquip", logo: "\ud83c\udf33", description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.", relevance: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", objectives: ["Excepteur sint occaecat", "Cupidatat non proident", "Officia deserunt mollit"], link: "" }
  ]
};

// ---- MAIN LOADER ----
async function loadData() {
  const overlay = document.getElementById('loading-overlay');

  try {
    const initRes = await fetch(CSV_URLS.initiatives);
    if (!initRes.ok) throw new Error('Failed to load initiatives');

    const initLastMod = initRes.headers.get('Last-Modified');
    window.dataLastModified = initLastMod ? new Date(initLastMod) : new Date();

    const initCSV = await initRes.text();

    function stripEmptyLeadingRows(csv) {
      return csv.split('\n').filter((line, i) => {
        if (i === 0 && line.replace(/,/g, '').trim() === '') return false;
        return true;
      }).join('\n');
    }

    window.initiatives = parseCSV(stripEmptyLeadingRows(initCSV)).map(transformInitiativeRow).filter(i => i.name);

    // Derive partners from initiatives — no separate PARTNERS sheet needed
    const partnerMap = new Map();
    window.initiatives.forEach(i => {
      const baseId = i.id.split('-')[0];
      if (!partnerMap.has(baseId)) {
        partnerMap.set(baseId, {
          id: baseId,
          name: i.partnerName,
          logo: LOCAL_LOGOS[baseId] || i.logo || '',
          website: i.website || ''
        });
      } else if (!partnerMap.get(baseId).website && i.website) {
        partnerMap.get(baseId).website = i.website;
      }
    });
    window.partners = [...partnerMap.values()].filter(p => p.name);

    window.platforms = platforms;
    window.filterOptions = computeFilterOptions(window.initiatives);
    window.snapshotData = computeSnapshotData(window.initiatives);

    console.log(`Loaded ${window.initiatives.length} initiatives, ${window.partners.length} partners`);

  } catch (err) {
    console.error('Data load error:', err);
    if (overlay) overlay.innerHTML = '<p style="color:#c44;font-family:Inter,sans-serif;">Unable to load data. Please refresh the page.</p>';
    throw err;
  }
}
