// ============================================================
// RAA COMMUNITY DASHBOARD — DATA LAYER
// All data is placeholder. Replace with real data when ready.
// ============================================================

// ---- INITIATIVES (Section 1 & 2) ----
const initiatives = [
  {
    name: "Red Sudamérica Verde",
    partnerName: "Green South America Network",
    logo: "\ud83c\udf3f",
    website: "",
    country: "Brazil",
    flag: "\ud83c\udde7\ud83c\uddf7",
    lat: -14.24, lng: -51.93,
    scope: "Regional",
    activePartner: true,
    shortDescription: "Regional network promoting land restoration across South American ecosystems through community-driven approaches.",
    geographicScope: ["Americas"],
    thematicPriorities: ["Land Conservation and Restoration"],
    enablers: ["Finance", "Governance"],
    actorType: "Civil Society",
    priorityEcosystem: ["Forests (including dry forests and woodlands)", "Savannahs and grasslands"],
    breakthroughTarget: "Land Restoration",
    rioSynergies: ["UNFCCC", "CBD"],
    beneficiaries: ["Local Communities", "Indigenous Peoples", "Farmers"],
    indicators: ""
  },
  {
    name: "GreenStart Nigeria",
    partnerName: "GreenStart Foundation",
    logo: "\ud83c\udf31",
    website: "",
    country: "Nigeria",
    flag: "\ud83c\uddf3\ud83c\uddec",
    lat: 9.08, lng: 8.68,
    scope: "National",
    activePartner: true,
    shortDescription: "Data-driven initiative supporting land restoration and sustainable agriculture in Nigeria.",
    geographicScope: ["Africa"],
    thematicPriorities: ["Agriculture and Food Systems", "Land Conservation and Restoration"],
    enablers: ["Science, Technology and Innovation"],
    actorType: "Civil Society",
    priorityEcosystem: ["Croplands", "Savannahs and grasslands"],
    breakthroughTarget: "Land Restoration",
    rioSynergies: ["SDG"],
    beneficiaries: ["Farmers", "Smallholder farmers", "Youth"],
    indicators: ""
  },
  {
    name: "Paran Women",
    partnerName: "Paran Women's Collective",
    logo: "\ud83c\udf3e",
    website: "",
    country: "India",
    flag: "\ud83c\uddee\ud83c\uddf3",
    lat: 20.59, lng: 78.96,
    scope: "National",
    activePartner: false,
    shortDescription: "Women-led initiative engaging 100 communities in land restoration and drought resilience in India.",
    geographicScope: ["Asia"],
    thematicPriorities: ["Drought and Water Resilience"],
    enablers: ["Governance"],
    actorType: "Civil Society",
    priorityEcosystem: ["Croplands", "Rangelands (including pastoral areas)"],
    breakthroughTarget: "",
    rioSynergies: ["SDG"],
    beneficiaries: ["Women", "Local Communities", "Smallholder farmers"],
    indicators: ""
  },
  {
    name: "Oasis Restoration Initiative",
    partnerName: "Oasis International",
    logo: "\ud83c\udfdc\ufe0f",
    website: "",
    country: "Kenya",
    flag: "\ud83c\uddf0\ud83c\uddea",
    lat: -1.29, lng: 36.82,
    scope: "Regional",
    activePartner: false,
    shortDescription: "Cross-border initiative focused on restoring degraded oasis ecosystems across East Africa.",
    geographicScope: ["Africa"],
    thematicPriorities: ["Land Conservation and Restoration", "Drought and Water Resilience"],
    enablers: ["Science, Technology and Innovation"],
    actorType: "Multilateral Organizations",
    priorityEcosystem: ["Wetlands (including peatlands)", "Rangelands (including pastoral areas)"],
    breakthroughTarget: "Drought Resilience",
    rioSynergies: ["UNFCCC", "CBD"],
    beneficiaries: ["Pastoralists", "Drought-affected populations"],
    indicators: ""
  },
  {
    name: "Sahel Resilience Project",
    partnerName: "Sahel Green Alliance",
    logo: "\ud83c\udf0d",
    website: "",
    country: "Niger",
    flag: "\ud83c\uddf3\ud83c\uddea",
    lat: 17.61, lng: 8.08,
    scope: "Regional",
    activePartner: true,
    shortDescription: "Multi-country programme addressing drought resilience and land restoration across the Sahel region.",
    geographicScope: ["Africa"],
    thematicPriorities: ["Drought and Water Resilience", "Agriculture and Food Systems"],
    enablers: ["Finance", "Governance"],
    actorType: "National Government",
    priorityEcosystem: ["Savannahs and grasslands", "Croplands"],
    breakthroughTarget: "Drought Resilience",
    rioSynergies: ["UNFCCC", "SDG"],
    beneficiaries: ["Drought-affected populations", "Farmers", "Local Communities"],
    indicators: ""
  },
  {
    name: "Pacific Islands Land Trust",
    partnerName: "Pacific Environment Trust",
    logo: "\ud83c\udf0a",
    website: "",
    country: "Fiji",
    flag: "\ud83c\uddeb\ud83c\uddef",
    lat: -17.71, lng: 178.07,
    scope: "Regional",
    activePartner: false,
    shortDescription: "Regional trust supporting island nations in coastal land restoration and climate adaptation.",
    geographicScope: ["Oceania"],
    thematicPriorities: ["Land Conservation and Restoration"],
    enablers: ["Governance"],
    actorType: "Local and Subnational Governments",
    priorityEcosystem: ["Wetlands (including peatlands)"],
    breakthroughTarget: "",
    rioSynergies: ["UNFCCC"],
    beneficiaries: ["Local Communities"],
    indicators: ""
  },
  {
    name: "Central Asia Greenbelt",
    partnerName: "Greenbelt Foundation",
    logo: "\ud83c\udf32",
    website: "",
    country: "Kazakhstan",
    flag: "\ud83c\uddf0\ud83c\uddff",
    lat: 48.02, lng: 66.92,
    scope: "Global",
    activePartner: true,
    shortDescription: "Global reforestation initiative with flagship operations across Central Asian landscapes.",
    geographicScope: ["Asia", "Europe"],
    thematicPriorities: ["Land Conservation and Restoration"],
    enablers: ["Science, Technology and Innovation", "Finance"],
    actorType: "Private Sector",
    priorityEcosystem: ["Forests (including dry forests and woodlands)", "Mountain landscapes"],
    breakthroughTarget: "Land Restoration",
    rioSynergies: ["UNFCCC", "CBD", "SDG"],
    beneficiaries: ["Local Communities", "Public institutions"],
    indicators: ""
  },
  {
    name: "Mediterranean Soil Alliance",
    partnerName: "MedSoil Research Network",
    logo: "\ud83c\udf3b",
    website: "",
    country: "Spain",
    flag: "\ud83c\uddea\ud83c\uddf8",
    lat: 40.46, lng: -3.75,
    scope: "Regional",
    activePartner: false,
    shortDescription: "Research-driven alliance focused on soil health and sustainable land management across the Mediterranean.",
    geographicScope: ["Europe"],
    thematicPriorities: ["Agriculture and Food Systems"],
    enablers: ["Science, Technology and Innovation"],
    actorType: "Academia",
    priorityEcosystem: ["Croplands"],
    breakthroughTarget: "",
    rioSynergies: ["SDG"],
    beneficiaries: ["Farmers", "Public institutions"],
    indicators: ""
  }
];

// ---- FILTER OPTIONS ----
const filterOptions = {
  scope: ["Global", "Regional", "National"],
  priority: [
    "Agriculture and Food Systems",
    "Drought and Water Resilience",
    "Land Conservation and Restoration"
  ],
  enabler: [
    "Finance",
    "Governance",
    "Science, Technology and Innovation"
  ],
  actor: [
    "Academia",
    "Civil Society",
    "Financial Sector",
    "Local and Subnational Governments",
    "Multilateral Organizations",
    "National Government",
    "Private Sector"
  ],
  breakthrough: [
    "Land Restoration",
    "Drought Resilience"
  ]
};

// ---- PLATFORMS (Section 3) ----
const platforms = {
  data: [
    { name: "UNCCD PRAIS", logo: "\ud83d\udcca", description: "Performance Review and Assessment of Implementation System for reporting on the UNCCD Strategic Framework.", link: "" },
    { name: "Trends.Earth", logo: "\ud83c\udf0d", description: "Free and open-source tool for monitoring land change using earth observations and cloud computing.", link: "" },
    { name: "Global Land Outlook", logo: "\ud83d\uddfa\ufe0f", description: "UNCCD flagship publication providing data and analysis on the state of the world's land resources.", link: "" },
    { name: "World Overview of Conservation Approaches and Technologies", logo: "\ud83d\udcc0", description: "Global network and database on sustainable land management practices.", link: "" }
  ],
  funding: [
    { name: "Global Environment Facility", logo: "\ud83c\udf10", description: "International funding mechanism addressing biodiversity, climate change, land degradation and other environmental issues.", link: "" },
    { name: "Green Climate Fund", logo: "\ud83c\udf31", description: "Global fund supporting developing countries in their climate adaptation and mitigation efforts.", link: "" },
    { name: "Land Degradation Neutrality Fund", logo: "\ud83c\udfe6", description: "Impact investment fund supporting projects contributing to land degradation neutrality worldwide.", link: "" }
  ],
  knowledge: [
    { name: "UNCCD Knowledge Hub", logo: "\ud83d\udcda", description: "Central platform for knowledge sharing on desertification, land degradation and drought.", link: "" },
    { name: "World Resources Institute", logo: "\ud83c\udf3f", description: "Global research organization working on environment and development challenges.", link: "" },
    { name: "CGIAR Research Programme", logo: "\ud83c\udf3e", description: "Global research partnership for a food-secure future dedicated to reducing poverty and hunger.", link: "" },
    { name: "Global Landscapes Forum", logo: "\ud83c\udf33", description: "Multi-stakeholder platform for integrated landscape management knowledge and action.", link: "" }
  ]
};

// ---- SNAPSHOT DATA (Section 4) ----
const snapshotData = {
  bySector: [
    { label: "Civil Society", value: 38, pct: 30 },
    { label: "National Government", value: 25, pct: 20 },
    { label: "Private Sector", value: 22, pct: 18 },
    { label: "Academia", value: 15, pct: 12 },
    { label: "Multilateral Org.", value: 13, pct: 10 },
    { label: "Local Government", value: 12, pct: 10 }
  ],
  byScope: [
    { label: "Regional", value: 45, color: "#74a869" },
    { label: "National", value: 50, color: "#b7d1a4" },
    { label: "Global", value: 30, color: "#2d6a4f" }
  ],
  byPriority: [
    { label: "Land Conservation", value: 52, pct: 42 },
    { label: "Drought & Water", value: 40, pct: 32 },
    { label: "Agriculture & Food", value: 33, pct: 26 }
  ],
  byEnabler: [
    { label: "Governance", value: 48, pct: 38 },
    { label: "Finance", value: 42, pct: 34 },
    { label: "Science & Tech", value: 35, pct: 28 }
  ],
  byRegion: [
    { label: "Africa", value: 44, color: "#3d5a35" },
    { label: "Americas", value: 30, color: "#6b8f5e" },
    { label: "Asia", value: 25, color: "#8b6f47" },
    { label: "Europe", value: 16, color: "#d4dfc8" },
    { label: "Oceania", value: 10, color: "#d6cdb8" }
  ],
  byBreakthrough: [
    { label: "Land Restoration", value: 65, pct: 52 },
    { label: "Drought Resilience", value: 38, pct: 30 },
    { label: "Not declared", value: 22, pct: 18 }
  ]
};

// ---- PARTNERS (Section 5) ----
const partners = [
  { name: "UNCCD Secretariat", logo: "\ud83c\udf10", website: "" },
  { name: "United Nations Environment Programme", logo: "\ud83c\udf0d", website: "" },
  { name: "Food and Agriculture Organization", logo: "\ud83c\udf3e", website: "" },
  { name: "World Bank Group", logo: "\ud83c\udfe6", website: "" },
  { name: "Global Environment Facility", logo: "\u2b50", website: "" },
  { name: "International Union for Conservation of Nature", logo: "\ud83c\udf3f", website: "" },
  { name: "World Resources Institute", logo: "\ud83d\udcca", website: "" },
  { name: "African Union", logo: "\ud83c\uddf3\ud83c\uddec", website: "" },
  { name: "European Commission", logo: "\ud83c\uddea\ud83c\uddfa", website: "" },
  { name: "Kingdom of Saudi Arabia", logo: "\ud83c\uddf8\ud83c\udde6", website: "" },
  { name: "Green Climate Fund", logo: "\ud83c\udf31", website: "" },
  { name: "CGIAR", logo: "\ud83c\udf3e", website: "" }
];
