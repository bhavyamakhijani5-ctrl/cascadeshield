/**
 * CascadeShield - Emergency Report & Alert Generator
 * Generates multilingual disaster reports, SMS alerts, and PDF documents.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fallback zones data for immediate generation if simulation hasn't run yet
const DEFAULT_ZONES = [
  { id: 'Z06', name: 'Kurla West - LBS Marg', risk: 'CRITICAL', floodDepth: '1.85m', populationAtRisk: 68500, cascade: 'Substation SUB2 tripped, road blocked, water pumping halted', shelter: 'Kurla Railway Colony Municipal Hall' },
  { id: 'Z01', name: 'Dharavi Sector 1 - Kumbharwada', risk: 'CRITICAL', floodDepth: '1.60m', populationAtRisk: 76000, cascade: 'Tidal backflow, storm drains blocked, hospital power risk', shelter: 'Dharavi Community Welfare Complex' },
  { id: 'Z08', name: 'Sion West - Gandhi Market', risk: 'CRITICAL', floodDepth: '1.45m', populationAtRisk: 42000, cascade: 'Arterial road submerged, transit disrupted, power line severed', shelter: 'Sion Municipal Indoor Stadium' },
  { id: 'Z07', name: 'Kurla East - Kamgar Nagar', risk: 'HIGH', floodDepth: '1.20m', populationAtRisk: 54000, cascade: 'Mithi River breach, drainage capacity 90% reduced', shelter: 'Kurla Railway Colony Municipal Hall' },
  { id: 'Z10', name: 'Kalina Military Camp Area', risk: 'HIGH', floodDepth: '1.10m', populationAtRisk: 39000, cascade: 'Airport perimeter wall overflow, surface runoff surge', shelter: 'Bandra-Kurla Sports Complex Shelter' },
  { id: 'Z18', name: 'Bandra East - Government Colony', risk: 'HIGH', floodDepth: '0.95m', populationAtRisk: 48000, cascade: 'Kalanagar junction waterlogged, access to BKC compromised', shelter: 'Bandra Municipal High School' },
  { id: 'Z02', name: 'Dharavi Sector 2 - Transit Camp', risk: 'HIGH', floodDepth: '0.90m', populationAtRisk: 52000, cascade: 'Sanitation grid breach, drinking water contamination hazard', shelter: 'Dharavi Community Welfare Complex' },
  { id: 'Z19', name: 'Chembur - Postal Colony', risk: 'MODERATE', floodDepth: '0.75m', populationAtRisk: 31000, cascade: 'Storm drains running near capacity, localized pooling', shelter: 'Chembur General Education Academy' },
  { id: 'Z14', name: 'Santacruz East - Vakola Pipeline', risk: 'MODERATE', floodDepth: '0.70m', populationAtRisk: 37500, cascade: 'Vakola nullah overflow threatening residential low-rises', shelter: 'Vakola Municipal Primary School' },
  { id: 'Z25', name: 'Powai - IIT Lakeside Slopes', risk: 'MODERATE', floodDepth: '0.65m', populationAtRisk: 22000, cascade: 'Steep hill slope runoff, debris accumulation risk', shelter: 'Powai Civic & Cultural Center' },
];

const DEFAULT_RESOURCES = [
  { item: 'NDRF Swift Water Rescue Boats', allocated: '18 boats', target: 'Kurla West & Dharavi', status: 'Deployed' },
  { item: 'High-Capacity Dewatering Pumps (500 HP)', allocated: '14 units', target: 'Sion West & Gandhi Market', status: 'En route' },
  { item: 'Mobile Emergency Generator Trailers (250 kVA)', allocated: '8 units', target: 'Sion Hospital & Bhabha Hospital', status: 'Operational' },
  { item: 'SDRF Rapid Trauma Medical Vans', allocated: '6 teams', target: 'Kurla & Dharavi Sector 1', status: 'Deployed' },
  { item: 'Packaged Safe Drinking Water', allocated: '35,000 Liters', target: 'All Zone Relief Shelters', status: 'Staged at Hub' },
  { item: 'Ready-to-Eat Emergency Food Rations', allocated: '25,000 Meals', target: 'Sion & Dharavi Shelters', status: 'Distribution active' },
];

// Multilingual template strings
const TEMPLATES = {
  en: {
    reportTitle: 'CascadeShield Emergency Disaster Intelligence Brief',
    incidentName: 'Urban Flood Cascade & Critical Infrastructure Impact Assessment',
    executiveSummary: 'Heavy precipitation exceeding {rainfall} mm has initiated multi-tier systemic failure across the Mithi River catchment basin. Low-lying wards in Dharavi, Kurla, and Sion face severe waterlogging with water depths ranging from 1.1m to 1.85m. Primary grid substations SUB1 and SUB2 are vulnerable, threatening power to dewatering stations and trauma centers. Rapid deployment of rescue boats and dewatering assets is ongoing.',
    evacuationAdvice: [
      'Immediately commence orderly evacuation of ground-floor residents in {criticalZones} to designated municipal shelters.',
      'Instruct motorists and commercial traffic to avoid LBS Marg, Sion Circle, and Western Express Highway underpasses.',
      'Switch off residential main breakers before floodwaters touch electrical sockets.',
      'Boil municipal tap water for at least 3 minutes before consumption due to cross-contamination risk.',
      'Dial 1078 (Disaster Helpline) or 1916 (BMC Control Room) for medical and swift-water rescue emergencies.',
    ],
    keyWarnings: [
      'FLASH FLOOD WARNING: Secondary surge expected within 90 minutes due to 4.4m high-tide sea lock at Mahim Creek.',
      'INFRASTRUCTURE ALERT: Kurla Receiving Substation at risk of automatic safety trip if water level increases by 15cm.',
      'HOSPITAL RED ALERT: Ground level power backups at Sion Hospital operating on temporary elevated diesel platforms.',
      'PUBLIC HEALTH NOTICE: Prevent wading through stagnant water to avoid leptospirosis and vector-borne contamination.',
    ],
    labels: {
      zone: 'Zone / Locality',
      risk: 'Risk Level',
      depth: 'Water Depth',
      popAtRisk: 'Pop. at Risk',
      cascadeImpact: 'Cascading Infrastructure Impact',
      assignedShelter: 'Nearest Shelter',
      resource: 'Resource / Asset',
      qty: 'Allocated Quantity',
      destination: 'Target Sector',
      operationalStatus: 'Status',
    },
    alertTemplate: '⚠️ ALERT: Severe flood warning for {zone}. Risk Level: {risk}. Evacuate immediately to {shelter}. Emergency Helpline: 1078 / 1916. Avoid moving water.',
  },
  hi: {
    reportTitle: 'कैस्केडशील्ड आपातकालीन आपदा खुफिया रिपोर्ट',
    incidentName: 'शहरी बाढ़ प्रभाव एवं महत्वपूर्ण अवसंरचना आकलन',
    executiveSummary: '{rainfall} मिमी से अधिक की भारी वर्षा ने मीठी नदी जलसंभर क्षेत्र में बहु-स्तरीय प्रणालीगत विफलता शुरू कर दी है। धारावी, कुर्ला और सायन के निचले इलाकों में 1.1 मीटर से 1.85 मीटर तक भीषण जलभराव हो गया है। सबस्टेशन SUB1 और SUB2 जोखिम में हैं, जिससे पम्पिंग स्टेशनों और अस्पतालों की बिजली बाधित होने की आशंका है। बचाव नौकाओं और डी-वाटरिंग पंपों की त्वरित तैनाती जारी है।',
    evacuationAdvice: [
      '{criticalZones} के निचले तलों के निवासियों को तुरंत निकटतम नगरपालिका राहत आश्रयों में स्थानांतरित करें।',
      'एलबीएस मार्ग, सायन सर्कल और वेस्टर्न एक्सप्रेसवे के अंडरपास से वाहन चालकों को दूर रहने का निर्देश दें।',
      'बाढ़ का पानी बिजली के सॉकेट तक पहुँचने से पहले घरों का मुख्य पावर स्विच बंद करें।',
      'जल संदूषण की आशंका के चलते पीने के पानी को कम से कम 3 मिनट तक उबालकर ही पिएं।',
      'आपातकालीन बचाव एवं चिकित्सा सहायता के लिए तुरंत 1078 (आपदा हेल्पलाइन) या 1916 पर कॉल करें।',
    ],
    keyWarnings: [
      'आकस्मिक बाढ़ चेतावनी: माहिम खाड़ी में 4.4 मीटर उच्च ज्वार के कारण अगले 90 मिनट में जलस्तर में वृद्धि संभावित है।',
      'अवसंरचना चेतावनी: कुर्ला सबस्टेशन में पानी 15 सेमी और बढ़ने पर सुरक्षा स्वतः-ट्रिप होने का खतरा है।',
      'अस्पताल अलर्ट: सायन अस्पताल के आपातकालीन वार्ड में बैकअप जनरेटर ऊंचे प्लेटफॉर्म पर सक्रिय हैं।',
      'स्वास्थ्य परामर्श: लेप्टोस्पायरोसिस और संक्रामक रोगों से बचाव के लिए दूषित बाढ़ के पानी में न चलें।',
    ],
    labels: {
      zone: 'क्षेत्र / इलाका',
      risk: 'जोखिम स्तर',
      depth: 'पानी की गहराई',
      popAtRisk: 'प्रभावित जनसंख्या',
      cascadeImpact: 'अवसंरचना प्रभाव',
      assignedShelter: 'निकटतम आश्रय',
      resource: 'संसाधन / उपकरण',
      qty: 'आवंटित मात्रा',
      destination: 'लक्षित क्षेत्र',
      operationalStatus: 'स्थिति',
    },
    alertTemplate: '⚠️ चेतावनी: {zone} में भीषण बाढ़ की चेतावनी। जोखिम स्तर: {risk}। कृपया तुरंत {shelter} में स्थानांतरित हों। हेल्पलाइन: 1078 / 1916। जलभराव से बचें।',
  },
  mr: {
    reportTitle: 'कॅस्केडशील्ड आणीबाणी आपत्ती माहिती अहवाल',
    incidentName: 'शहरी पूर परिस्थिती आणि पायाभूत सुविधा परिणाम मूल्यांकन',
    executiveSummary: '{rainfall} मिमीपेक्षा जास्त अतिवृष्टीमुळे मिठी नदी पात्रात बहुस्तरीय पूर परिस्थिती उद्भवली आहे. धारावी, कुर्ला आणि सायनमधील सखल भागात 1.1 ते 1.85 मीटरपर्यंत पाणी साचले आहे. मुख्य विद्युत उपकेंद्र SUB1 आणि SUB2 धोक्यात असल्याने पंपिंग स्टेशन्स आणि रुग्णालयांचा वीजपुरवठा बाधित होण्याची शक्यता आहे. बचाव नौका आणि उपसा पंपांची तत्काळ तैनाती सुरू आहे.',
    evacuationAdvice: [
      '{criticalZones} मधील तळमजल्यावरील नागरिकांनी त्वरित जवळच्या महानगरपालिका निवारा केंद्रात सुरक्षित स्थलांतर करावे.',
      'एलबीएस मार्ग, सायन सर्कल आणि पश्चिम द्रुतगती महामार्गावरील भुयारी मार्ग टाळण्याचे आवाहन करण्यात आले आहे.',
      'घरातील वीज उपकरणांचा मुख्य पुरवठा (Main Switch) त्वरित बंद करा.',
      'पाणी दूषित होण्याचा धोका असल्याने पिण्याचे पाणी किमान 3 मिनिटे उकळूनच प्यावे.',
      'वैद्यकीय आणि बचाव मदतीसाठी तत्काळ 1078 (आपत्ती निवारण कक्ष) किंवा 1916 वर संपर्क साधावा.',
    ],
    keyWarnings: [
      'तातडीचा पूर इशारा: माहीम खाडीत 4.4 मीटर भरतीमुळे पुढील 90 मिनिटांत पाण्याचा फुगवटा वाढण्याची शक्यता.',
      'पायाभूत सुविधा इशारा: कुर्ला उपकेंद्रात पाणी आणखी 15 सेमी वाढल्यास वीजपुरवठा खंडित होण्याची भीती.',
      'रुग्णालय हाय अलर्ट: सायन रुग्णालयातील आपत्कालीन कक्ष सुरक्षित उंचावर हलवण्यात आले आहेत.',
      'आरोग्य सूचना: लेप्टोस्पायरोसिस आणि जलजन्य आजार टाळण्यासाठी साचलेल्या पाण्यात चालणे टाळा.',
    ],
    labels: {
      zone: 'परिसर / प्रभाग',
      risk: 'धोका पातळी',
      depth: 'पाण्याची पातळी',
      popAtRisk: 'धोक्यात लोकसंख्या',
      cascadeImpact: 'पायाभूत सुविधा परिणाम',
      assignedShelter: 'जवळचे निवारा केंद्र',
      resource: 'संसाधन / पथक',
      qty: 'वाटप प्रमाण',
      destination: 'लक्ष्य क्षेत्र',
      operationalStatus: 'स्थिती',
    },
    alertTemplate: '⚠️ सावधान: {zone} परिसरासाठी अतिवृष्टी व पूर चेतावणी. धोका पातळी: {risk}. त्वरित {shelter} येथे सुरक्षित स्थलांतर करा. मदत कक्ष: 1078 / 1916.',
  },
};

/**
 * Generate a comprehensive emergency disaster report in the chosen language.
 * @param {Object} [simulationResults] - Results from the cascade simulation.
 * @param {string} [language='en'] - 'en' | 'hi' | 'mr'
 * @returns {Object} Structured report object
 */
export function generateEmergencyReport(simulationResults = null, language = 'en') {
  const lang = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
  const t = TEMPLATES[lang];

  // Extract or synthesize vulnerable zones
  let zones = [];
  if (simulationResults && Array.isArray(simulationResults.zones) && simulationResults.zones.length > 0) {
    zones = simulationResults.zones
      .slice(0, 10)
      .map((z, idx) => ({
        id: z.id || `Z${String(idx + 1).padStart(2, '0')}`,
        name: z.name || `Zone ${idx + 1}`,
        risk: z.riskLevel || (z.floodDepth > 1.2 ? 'CRITICAL' : z.floodDepth > 0.6 ? 'HIGH' : 'MODERATE'),
        floodDepth: typeof z.floodDepth === 'number' ? `${z.floodDepth.toFixed(2)}m` : (z.floodDepth || '1.20m'),
        populationAtRisk: z.populationAtRisk || z.population || 45000,
        cascade: z.cascadeImpact || z.cascadeSummary || 'Substation surge risk & arterial road block',
        shelter: z.nearestShelter || 'Municipal Relief Camp',
      }));
  } else {
    zones = [...DEFAULT_ZONES];
  }

  // Extract or synthesize resource allocation plan
  let resourcePlan = [];
  if (simulationResults && Array.isArray(simulationResults.allocations) && simulationResults.allocations.length > 0) {
    resourcePlan = simulationResults.allocations.map((a) => ({
      item: a.resourceName || a.type || 'Emergency Asset',
      allocated: `${a.quantity || 1} units`,
      target: a.zoneName || a.zoneId || 'Critical Sector',
      status: a.status || 'Dispatched',
    }));
  } else {
    resourcePlan = [...DEFAULT_RESOURCES];
  }

  const rainfallVal = simulationResults?.rainfallIntensity || 165;
  const criticalZonesStr = zones
    .filter((z) => z.risk === 'CRITICAL')
    .map((z) => z.name)
    .join(', ') || 'Kurla West, Dharavi, Sion';

  const summary = t.executiveSummary.replace('{rainfall}', rainfallVal);
  const evacuationAdvice = t.evacuationAdvice.map((item) =>
    item.replace('{criticalZones}', criticalZonesStr)
  );

  const now = new Date();
  const dateFormatted = now.toLocaleString(lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return {
    id: `REP-${Date.now().toString(36).toUpperCase()}`,
    title: t.reportTitle,
    incidentName: t.incidentName,
    date: dateFormatted,
    isoTimestamp: now.toISOString(),
    language: lang,
    summary,
    vulnerableZones: zones,
    resourcePlan,
    evacuationAdvice,
    keyWarnings: t.keyWarnings,
    labels: t.labels,
    metadata: {
      generatedBy: 'CascadeShield Incident Command Engine v2.4',
      systemClassification: 'OFFICIAL EMERGENCY USE ONLY',
      city: 'Greater Mumbai Municipal Corporation (MCGM)',
      rainfallRecorded: `${rainfallVal} mm/hr`,
    },
  };
}

/**
 * Generate formatted SMS / WhatsApp alert text for a specific zone.
 * @param {string} zone - Zone name
 * @param {string} risk - Risk level string ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')
 * @param {string} nearestShelter - Shelter location name
 * @param {string} [language='en'] - 'en' | 'hi' | 'mr'
 * @returns {string} Alert message text
 */
export function generateAlertMessage(zone, risk, nearestShelter, language = 'en') {
  const lang = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
  const t = TEMPLATES[lang];

  const riskTranslations = {
    en: { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MODERATE: 'MODERATE', LOW: 'LOW' },
    hi: { CRITICAL: 'अति गंभीर (CRITICAL)', HIGH: 'उच्च (HIGH)', MODERATE: 'मध्यम (MODERATE)', LOW: 'सामान्य (LOW)' },
    mr: { CRITICAL: 'अत्यंत गंभीर (CRITICAL)', HIGH: 'उच्च धोका (HIGH)', MODERATE: 'मध्यम (MODERATE)', LOW: 'कमी (LOW)' },
  };

  const translatedRisk = riskTranslations[lang]?.[risk] || risk;
  const zoneName = zone || 'Selected Municipal Sector';
  const shelterName = nearestShelter || 'Designated Municipal Shelter';

  return t.alertTemplate
    .replace('{zone}', zoneName)
    .replace('{risk}', translatedRisk)
    .replace('{shelter}', shelterName);
}

/**
 * Generate a PDF document using jsPDF + jspdf-autotable.
 * Uses ASCII-safe titles and labels to ensure crisp, universal PDF rendering.
 * @param {Object} report - Report object generated by generateEmergencyReport
 * @returns {{ doc: jsPDF, blob: Blob, download: (filename?: string) => void }}
 */
export function generatePDF(report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner Background (Navy Dark)
  doc.setFillColor(15, 23, 42); // slate-900 / navy-800
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line (Cyan Cascade)
  doc.setFillColor(0, 212, 255);
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 212, 255);
  doc.text('CASCADESHIELD EMERGENCY BRIEF', margin, 16);

  // Subtitle / Classification
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `Incident: ${report.incidentName || 'Urban Flood Cascade Assessment'}`,
    margin,
    24
  );

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Report ID: ${report.id || 'N/A'} | Generated: ${new Date().toUTCString()} | Status: ACTIVE`,
    margin,
    32
  );
  doc.text(
    `Jurisdiction: Municipal Corporation of Greater Mumbai (MCGM) | Helpline: 1078`,
    margin,
    37
  );

  let currentY = 52;

  // Executive Summary Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SITUATION OVERVIEW & EXECUTIVE SUMMARY', margin, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const summaryText = report.summary || 'Severe precipitation triggering critical infrastructure cascades across vulnerable sectors.';
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
  doc.text(splitSummary, margin, currentY);
  currentY += splitSummary.length * 4.6 + 6;

  // Vulnerable Zones Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. TOP PRIORITY VULNERABLE ZONES (CASCADING RISKS)', margin, currentY);
  currentY += 4;

  const zoneTableHeaders = [
    ['Zone ID', 'Locality Name', 'Risk', 'Water Depth', 'Pop. at Risk', 'Nearest Shelter'],
  ];

  const zoneTableRows = (report.vulnerableZones || []).map((z) => [
    z.id,
    z.name,
    z.risk,
    z.floodDepth,
    Number(z.populationAtRisk).toLocaleString('en-IN'),
    z.shelter,
  ]);

  const autoTableFn = typeof autoTable === 'function' ? autoTable : doc.autoTable;

  autoTableFn(doc, {
    startY: currentY,
    head: zoneTableHeaders,
    body: zoneTableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [20, 29, 56],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 46 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'HIGH') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need a page break for the resources and evacuation section
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 20;
  }

  // Resource Allocation Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. EMERGENCY RESOURCE ALLOCATION PLAN', margin, currentY);
  currentY += 4;

  const resourceTableHeaders = [
    ['Resource / Equipment', 'Quantity Allocated', 'Target Zone / Facility', 'Status'],
  ];

  const resourceTableRows = (report.resourcePlan || []).map((r) => [
    r.item,
    r.allocated,
    r.target,
    r.status,
  ]);

  autoTableFn(doc, {
    startY: currentY,
    head: resourceTableHeaders,
    body: resourceTableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 55 },
      3: { cellWidth: 30, halign: 'center' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // Evacuation & Warnings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('4. KEY EVACUATION DIRECTIVES & OPERATIONAL WARNINGS', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  (report.keyWarnings || []).forEach((w) => {
    const lines = doc.splitTextToSize(`* ${w}`, pageWidth - margin * 2);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 4;
  });

  currentY += 2;
  (report.evacuationAdvice || []).slice(0, 3).forEach((a) => {
    const lines = doc.splitTextToSize(`- ${a}`, pageWidth - margin * 2);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 4;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CascadeShield Disaster Intelligence Platform | Confidential MCGM Brief | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const blob = doc.output('blob');
  const filename = `CascadeShield-Emergency-Report-${Date.now()}.pdf`;

  return {
    doc,
    blob,
    filename,
    download: (name = filename) => {
      doc.save(name);
    },
  };
}

export default {
  generateEmergencyReport,
  generateAlertMessage,
  generatePDF,
};
