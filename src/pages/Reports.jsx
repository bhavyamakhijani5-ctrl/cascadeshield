import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Copy,
  Check,
  Send,
  Smartphone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Database,
  Table,
  Shield,
  Radio,
  ExternalLink,
  Code,
  Globe,
  Share2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PhoneMockup from '../components/PhoneMockup';
import {
  generateEmergencyReport,
  generateAlertMessage,
  generatePDF,
} from '../utils/reportGenerator';
import { exportAsJSON, exportAsCSV, copyToClipboard } from '../utils/exportUtils';

const MUMBAI_ZONES = [
  { id: 'Z06', name: 'Kurla West (LBS Marg)', risk: 'CRITICAL', shelter: 'Kurla Railway Colony Municipal Hall', depth: '1.85m' },
  { id: 'Z01', name: 'Dharavi Sector 1 - Kumbharwada', risk: 'CRITICAL', shelter: 'Dharavi Community Welfare Complex', depth: '1.60m' },
  { id: 'Z08', name: 'Sion West - Gandhi Market', risk: 'CRITICAL', shelter: 'Sion Municipal Indoor Stadium', depth: '1.45m' },
  { id: 'Z07', name: 'Kurla East - Kamgar Nagar', risk: 'HIGH', shelter: 'Kurla Railway Colony Municipal Hall', depth: '1.20m' },
  { id: 'Z10', name: 'Kalina Military Camp Area', risk: 'HIGH', shelter: 'Bandra-Kurla Sports Complex Shelter', depth: '1.10m' },
  { id: 'Z18', name: 'Bandra East - Government Colony', risk: 'HIGH', shelter: 'Bandra Municipal High School', depth: '0.95m' },
  { id: 'Z02', name: 'Dharavi Sector 2 - Transit Camp', risk: 'HIGH', shelter: 'Dharavi Community Welfare Complex', depth: '0.90m' },
  { id: 'Z19', name: 'Chembur - Postal Colony', risk: 'MODERATE', shelter: 'Chembur General Education Academy', depth: '0.75m' },
  { id: 'Z14', name: 'Santacruz East - Vakola Pipeline', risk: 'MODERATE', shelter: 'Vakola Municipal Primary School', depth: '0.70m' },
  { id: 'Z25', name: 'Powai - IIT Lakeside Slopes', risk: 'MODERATE', shelter: 'Powai Civic & Cultural Center', depth: '0.65m' },
];

export default function Reports() {
  const simulation = useStore((state) => state.simulation);
  const resources = useStore((state) => state.resources);
  const currentLang = useStore((state) => state.ui.language);
  const setStoreLanguage = useStore((state) => state.setLanguage);

  // Local state
  const [reportLang, setReportLang] = useState(currentLang || 'en');
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  // Phone Mockup Alert Simulator state
  const [selectedZone, setSelectedZone] = useState(MUMBAI_ZONES[0]);
  const [simLang, setSimLang] = useState('en');
  const [showTwilioGuide, setShowTwilioGuide] = useState(false);

  // Generate initial report on load
  useEffect(() => {
    const initialRep = generateEmergencyReport(
      {
        rainfallIntensity: simulation.rainfallIntensity,
        zones: simulation.results?.zones,
        allocations: resources.allocations,
      },
      reportLang
    );
    setReport(initialRep);
  }, []);

  // Update report when reportLang changes
  const handleLanguageChange = (lang) => {
    setReportLang(lang);
    setStoreLanguage(lang);
    if (report) {
      const updated = generateEmergencyReport(
        {
          rainfallIntensity: simulation.rainfallIntensity,
          zones: simulation.results?.zones,
          allocations: resources.allocations,
        },
        lang
      );
      setReport(updated);
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRep = generateEmergencyReport(
        {
          rainfallIntensity: simulation.rainfallIntensity,
          zones: simulation.results?.zones,
          allocations: resources.allocations,
        },
        reportLang
      );
      setReport(newRep);
      setIsGenerating(false);
    }, 400);
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    setIsDownloadingPDF(true);
    try {
      const pdfObj = generatePDF(report);
      pdfObj.download(`CascadeShield-${report.id}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleCopyAlertText = async (text, type = 'alert') => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      reportId: report?.id,
      simulationState: simulation,
      allocations: resources.allocations,
      reportData: report,
    };
    exportAsJSON(payload, `cascadeshield-simulation-results-${Date.now()}.json`);
  };

  const handleExportCSV = () => {
    // If allocations exist, export them; otherwise export top vulnerable zones
    if (resources.allocations && resources.allocations.length > 0) {
      exportAsCSV(resources.allocations, `cascadeshield-resource-allocations-${Date.now()}.csv`);
    } else if (report?.resourcePlan) {
      exportAsCSV(report.resourcePlan, `cascadeshield-resource-plan-${Date.now()}.csv`);
    } else {
      exportAsCSV(MUMBAI_ZONES, `cascadeshield-zones-${Date.now()}.csv`);
    }
  };

  const currentAlertMessage = generateAlertMessage(
    selectedZone.name,
    selectedZone.risk,
    selectedZone.shelter,
    simLang
  );

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
      {/* Page Title & Intro */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cascade-cyan text-xs font-mono uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-cascade-cyan" />
            <span>Disaster Communications & Emergency Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Emergency Reports & Multi-Channel Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Synthesize real-time cascade telemetry into official municipal action reports, trigger multi-lingual SMS broadcasts, and export data models for cross-agency coordination.
          </p>
        </div>

        {/* Global Quick Action Bar */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="btn-primary text-xs py-2.5 px-4 flex items-center space-x-2 shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Emergency Report'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || !report}
            className="px-4 py-2.5 bg-navy-800 hover:bg-navy-700 border border-white/15 text-white rounded-lg text-xs font-medium flex items-center space-x-2 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-cascade-cyan" />
            <span>{isDownloadingPDF ? 'Compiling PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EMERGENCY REPORT GENERATOR */}
      <section className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        {/* Accent background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cascade-cyan/20 text-cascade-cyan border border-cascade-cyan/30">
                OFFICIAL MCGM BRIEF
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {report?.id || 'GENERATING'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-1">
              {report?.title || 'CascadeShield Emergency Disaster Intelligence Brief'}
            </h2>
            <p className="text-xs text-slate-400">{report?.date}</p>
          </div>

          {/* Language Selector Tabs */}
          <div className="flex items-center bg-navy-800/90 p-1 rounded-xl border border-white/10 self-start sm:self-center">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                reportLang === 'en'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                reportLang === 'hi'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('mr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                reportLang === 'mr'
                  ? 'bg-cascade-cyan text-navy-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              मराठी (Marathi)
            </button>
          </div>
        </div>

        {report && (
          <div className="mt-6 space-y-6">
            {/* Situation Summary Box */}
            <div className="bg-navy-800/60 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-cascade-cyan" />
                  <span>1. Situation Summary & Cascade State</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopyAlertText(report.summary, 'summary')}
                  className="text-[11px] text-slate-400 hover:text-cascade-cyan flex items-center space-x-1"
                >
                  {copiedType === 'summary' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
                {report.summary}
              </p>
            </div>

            {/* Top 10 Vulnerable Zones Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Priority Vulnerable Zones (Top 10 Risk Ranked)</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Criteria: Hydrodynamic Inundation + Substation Dependency
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-navy-800/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-800 text-slate-300 border-b border-white/10 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Zone ID</th>
                      <th className="py-2.5 px-3">Locality / Sector</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3">Water Depth</th>
                      <th className="py-2.5 px-3">Pop. At Risk</th>
                      <th className="py-2.5 px-3">Cascading Failure Impact</th>
                      <th className="py-2.5 px-3">Designated Shelter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {report.vulnerableZones.map((z, idx) => (
                      <tr
                        key={z.id || idx}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-cascade-cyan font-bold">
                          {z.id}
                        </td>
                        <td className="py-2 px-3 font-medium text-white">{z.name}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              z.risk === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : z.risk === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {z.risk}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-cyan-300">{z.floodDepth}</td>
                        <td className="py-2 px-3 font-mono">
                          {Number(z.populationAtRisk).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-slate-400 max-w-xs truncate" title={z.cascade}>
                          {z.cascade}
                        </td>
                        <td className="py-2 px-3 text-slate-300">{z.shelter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resource Allocation Plan */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Table className="w-3.5 h-3.5 text-cascade-cyan" />
                <span>3. Recommended Resource & Equipment Allocation Plan</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.resourcePlan.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 bg-navy-800/60 rounded-xl border border-white/5 hover:border-white/15 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{res.item}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          {res.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Target: <span className="text-slate-200">{res.target}</span>
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Quantity</span>
                      <span className="font-mono font-bold text-cascade-cyan">
                        {res.allocated}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Warnings & Evacuation Directives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Immediate Tactical Warnings</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {report.keyWarnings.map((w, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-red-400 font-bold shrink-0">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Evacuation Corridors & Advisory</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {report.evacuationAdvice.map((a, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: SMS & WHATSAPP ALERT SIMULATOR */}
      <section className="glass-panel p-6 rounded-2xl relative">
        <div className="mb-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Multi-Channel Citizen Broadcast System</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              SMS & WhatsApp Broadcast Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Preview localized emergency broadcast dispatches in all regional languages before initiating gateway transmission.
            </p>
          </div>

          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono">
            ⚠️ Simulation only — no real SMS sent
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            {/* Zone Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Broadcast Municipal Zone
              </label>
              <div className="relative">
                <select
                  value={selectedZone.name}
                  onChange={(e) => {
                    const found = MUMBAI_ZONES.find((z) => z.name === e.target.value);
                    if (found) setSelectedZone(found);
                  }}
                  className="w-full bg-navy-800 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 appearance-none pr-10"
                >
                  {MUMBAI_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name} — Risk: {z.risk} (Depth: {z.depth})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Language Selection Buttons */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Broadcast Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी (Hindi)' },
                  { code: 'mr', label: 'मराठी (Marathi)' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setSimLang(l.code)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                      simLang === l.code
                        ? 'bg-cascade-cyan/20 border-cascade-cyan text-cascade-cyan font-bold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatted Text Box & Action */}
            <div className="bg-navy-800/80 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Formatted Payload Preview</span>
                <span className="font-mono text-[11px]">
                  {currentAlertMessage.length} characters (1 SMS segment)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-amber-200 bg-navy-950/80 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                {currentAlertMessage}
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyAlertText(currentAlertMessage, 'sms')}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-medium text-white flex items-center justify-center space-x-1.5 transition"
                >
                  {copiedType === 'sms' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cascade-cyan" />
                      <span>Copy Alert Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Twilio Integration Guide */}
            <div className="border border-white/10 rounded-xl bg-navy-800/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTwilioGuide(!showTwilioGuide)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Code className="w-4 h-4 text-cascade-cyan" />
                  <span className="text-xs font-bold text-white">
                    Production Architecture: How to integrate Twilio & Government SMS Gateways
                  </span>
                </div>
                {showTwilioGuide ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {showTwilioGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 border-t border-white/10 space-y-3 text-xs text-slate-300"
                  >
                    <p>
                      CascadeShield can be connected to Twilio Programmable Messaging or national CAP (Common Alerting Protocol) gateways to dispatch cell broadcasts to registered phone numbers:
                    </p>
                    <pre className="bg-navy-950 p-3 rounded-lg border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`// Example Twilio Node.js Dispatch Webhook
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function broadcastZoneAlert({ zoneName, risk, shelter, recipients }) {
  const alertBody = \`⚠️ ALERT: Flood warning for \${zoneName}. Risk: \${risk}. Evacuate to \${shelter}. Helpline: 1078\`;
  
  const promises = recipients.map(phone =>
    client.messages.create({
      body: alertBody,
      from: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: phone,
    })
  );
  return Promise.allSettled(promises);
}`}
                    </pre>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>
                        <strong>CAP-compliant feeds:</strong> Ready for NDMA Sachet National Disaster Alerting Portal.
                      </li>
                      <li>
                        <strong>WhatsApp Business API:</strong> Supports rich template interactive cards with maps and helpline tap-to-call buttons.
                      </li>
                      <li>
                        <strong>Rate Limiting:</strong> Staggered batches of 5,000 SMS/minute per telecom circle to prevent network congestion.
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Phone Mockup Column */}
          <div className="lg:col-span-6 flex justify-center">
            <PhoneMockup
              title="Disaster Management Cell"
              subtitle="MCGM Emergency Broadcast"
              senderNumber="NDMA-ALERTS"
            >
              {/* Earlier message timestamp */}
              <div className="text-center text-[10px] text-slate-500 my-1">
                Today 09:30 AM
              </div>

              {/* Informational bubble */}
              <div className="self-center bg-navy-900/80 border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-slate-400">
                Official Emergency Broadcast System Active
              </div>

              {/* Incoming Urgent Alert Bubble */}
              <motion.div
                key={`${selectedZone.id}-${simLang}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-navy-900 border-l-4 border-l-amber-500 border border-white/10 rounded-2xl p-3 shadow-lg max-w-[94%] space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold tracking-wider">
                  <span>DISASTER ALERT</span>
                  <span className="text-slate-400 font-normal">Now</span>
                </div>
                <p className="text-[12px] text-slate-100 font-medium leading-relaxed">
                  {currentAlertMessage}
                </p>
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Sector: {selectedZone.name}</span>
                  <span className="text-cyan-400">Verified Broadcast</span>
                </div>
              </motion.div>

              {/* Citizen advisory card inside phone */}
              <div className="bg-navy-900/60 border border-white/10 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-white flex items-center space-x-1">
                  <span>ℹ️ Emergency Actions:</span>
                </div>
                <div>1. Do not enter basement parking or subways.</div>
                <div>2. Keep drinking water and mobile torches ready.</div>
                <div>3. Helpline: 1078 (Disaster) / 100 (Police)</div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* SECTION 3: DATA EXPORT */}
      <section className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-cascade-cyan text-xs font-mono uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Interoperability & Data Federation</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-white">
              Export Simulation & Allocation Datasets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate machine-readable exports for geographic information systems (GIS), district collectors, and emergency command centers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* JSON Export Card */}
          <div className="p-5 rounded-xl bg-navy-800/60 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-cascade-cyan/20 border border-cascade-cyan/30 flex items-center justify-center text-cascade-cyan">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">
                Complete Simulation Telemetry (JSON)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exports rainfall curves, multi-stage hydrodynamic cascade propagation matrices, affected infrastructure nodes, and confidence indexes in RFC 8259 JSON format.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="py-2.5 px-4 bg-navy-700 hover:bg-navy-600 border border-white/15 text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-cascade-cyan" />
              <span>Export Simulation Results as JSON</span>
            </button>
          </div>

          {/* CSV Export Card */}
          <div className="p-5 rounded-xl bg-navy-800/60 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Table className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">
                Resource Allocation & Dispatch Manifest (CSV)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exports tabular deployment manifests: rescue boats, heavy dewatering pumps, trauma units, and shelter staging rosters ready for Microsoft Excel, QGIS, or ArcGIS.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="py-2.5 px-4 bg-navy-700 hover:bg-navy-600 border border-white/15 text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Allocation Plan as CSV</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
