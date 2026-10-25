import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  LifeBuoy,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../store/useStore';

/**
 * Intelligent Rule-Based Disaster AI Copilot
 * Context-aware AI assistant leveraging live simulation state with optional external LLM endpoint fallback.
 */
export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Zustand Store selectors
  const simulation = useStore((state) => state.simulation);
  const resources = useStore((state) => state.resources);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello, Commander. I am CascadeAI, your Disaster Response Copilot. I analyze real-time cascade risks, infrastructure dependencies, and resource dispatch.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'welcome-2',
      sender: 'assistant',
      text: 'You can ask me about critical zones, boat deployments, rainfall scenario impacts, or damage projections.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickChips: [
        'Which area is most at risk?',
        'Where should I send boats?',
        'What if rainfall doubles?',
        'What is the damage estimate?',
        'Show evacuation routes',
        'Status report',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  /**
   * Rule-based engine analyzing current simulation and resource state
   */
  const generateRuleBasedResponse = (query) => {
    const q = query.toLowerCase().trim();
    const rainfall = simulation?.rainfallIntensity || 50;
    const hour = simulation?.currentHour || 0;
    const reportsCount = simulation?.citizenReports?.length || 0;

    // 1. Most at risk areas
    if (q.includes('risk') || q.includes('vulnerable') || q.includes('dangerous') || q.includes('worst hit')) {
      return `Based on current hydrodynamic cascade analysis (${rainfall} mm/hr rainfall):
1. 🔴 Kurla West (LBS Marg): Inundation depth ~1.85m. Mithi River overflow + SUB2 substation trip creates high structural isolation.
2. 🔴 Dharavi Sector 1: Depth ~1.60m. Tidal backflow locks storm outfalls; drainage capacity dropped by 86%.
3. 🟠 Sion Gandhi Market: Depth ~1.45m. Road transit severed; Sion Hospital ground ward ingress risk.

Recommendation: Prioritize immediate boat evacuations along CST Road and LBS Marg.`;
    }

    // 2. Where should I send boats
    if (q.includes('boat') || q.includes('watercraft') || q.includes('dinghy') || q.includes('swift water')) {
      const availableBoats = resources?.equipment?.find((e) => e.type === 'boat')?.available ?? 28;
      return `Deploy rescue boats to zones exceeding 1.2m flood depth where vehicular access is submerged:
• Kurla West (LBS & Kranti Nagar): Dispatch 12 Gemini inflatable rescue boats. Water velocity is elevated near the river channel.
• Dharavi Kumbharwada / Transit Camp: Dispatch 10 boats for dense low-rise residential evacuations.
• Sion Underpass & Transit corridors: Dispatch 6 boats for stranded public transit commuters.

Status: ${availableBoats} rescue boats cataloged in municipal reserve. NDRF 8th Battalion is on high standby at Bandra-Kurla Jetty.`;
    }

    // 3. What if rainfall doubles
    if (q.includes('doubles') || q.includes('double') || q.includes('rainfall doubles') || q.includes('heavy rain')) {
      const doubled = rainfall * 2;
      return `Simulation Projection: Escalating precipitation to ${doubled} mm/hr triggers critical non-linear cascade failure:
• Drainage Saturation: Urban soil absorption drops to 0% within 35 minutes.
• Substation Inundation: SUB1 (Dharavi) and SUB4 (Sakinaka) will trip, expanding total blackout to 18 municipal wards.
• Hospital Grid: Bhabha and Sion hospitals will transition entirely to emergency diesel generators with 18-24 hrs fuel reserve.
• Casualties & Displacement: Displaced population increases by ~240% (est. 185,000 citizens needing shelter).

Action: Trigger Section 4 Disaster Protocol, pre-deploy dewatering pumps to Kurla Pumping Station.`;
    }

    // 4. Damage estimate
    if (q.includes('damage') || q.includes('cost') || q.includes('loss') || q.includes('economic') || q.includes('estimate')) {
      const baseCrores = Math.round(rainfall * 3.8 + 120);
      return `Estimated Cumulative Economic Impact:
• Direct Damage: ₹${baseCrores} - ₹${baseCrores + 140} Crores
  - Commercial halted in BKC Financial District: ~₹180 Crores
  - Power substation & transformer replacement: ~₹45 Crores
  - Road pavement & bridge erosion: ~₹65 Crores
  - Residential & small enterprise inventory loss: ~₹190 Crores
• Infrastructure Offline: 12 arterial roads, 2 grid substations, 1 pump station.
• Note: Projections generated using synthetic vulnerability curves.`;
    }

    // 5. Evacuation routes & shelters
    if (q.includes('evacuat') || q.includes('shelter') || q.includes('route') || q.includes('escape')) {
      return `Active Evacuation Corridors & Relocation Centers:
• Corridor A (Kurla): Evacuate EAST via elevated Kurla flyover towards Kurla Railway Colony Municipal Hall (Cap: 1,800). Avoid LBS Marg.
• Corridor B (Dharavi): Move towards Sion Municipal Indoor Stadium (Cap: 2,500) and Dharavi Community Complex (Cap: 1,200).
• Corridor C (Kalina/BKC): Transit via Hans Bhugra Marg towards University Campus Shelter (Cap: 3,000).

Transport warning: Western Express Highway underpasses are currently blocked. Utilize designated high-clearance military trucks.`;
    }

    // 6. Status report
    if (q.includes('status') || q.includes('sitrep') || q.includes('overview') || q.includes('summary')) {
      return `CURRENT DISASTER SITUATION REPORT:
• Simulation Hour: T+${hour}:00 hrs
• Monitored Rainfall: ${rainfall} mm/hr (Scenario: ${simulation?.climateScenario || 'Normal Monsoon'})
• High-Risk Zones: 3 Critical, 5 High, 12 Moderate
• Citizen Crowd-Reports Received: ${reportsCount} verified alerts
• Active Allocations: ${resources?.allocations?.length || 6} operational response teams
• Critical Warning: High tide sea lock in effect at Mahim Bay. Drainage outfall restricted until tidal crest recedes.`;
    }

    // Default Fallback
    return `I can help analyze cascading disaster scenarios. You can ask me:
• "Which area is most at risk?"
• "Where should I send boats?"
• "What if rainfall doubles?"
• "What is the damage estimate?"
• "Show evacuation routes"
• "Status report"`;
  };

  /**
   * Handle sending a query
   */
  const handleSend = async (textToSend = inputMessage) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    let assistantResponse = '';

    // Optional External LLM check
    const endpoint = import.meta.env?.VITE_LLM_ENDPOINT;
    if (endpoint) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            context: {
              rainfall: simulation?.rainfallIntensity,
              hour: simulation?.currentHour,
              citizenReportsCount: simulation?.citizenReports?.length,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          assistantResponse = data.reply || data.response || data.text;
        }
      } catch (e) {
        // Fallback safely to rule-based logic
        assistantResponse = '';
      }
    }

    // If external LLM did not return response, use robust rule-based engine
    if (!assistantResponse) {
      // Simulate realistic thinking delay
      await new Promise((r) => setTimeout(r, 650));
      assistantResponse = generateRuleBasedResponse(text);
    }

    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: assistantResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-2xl hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] border border-cyan-300/40 flex items-center justify-center transition-all duration-300 group"
        aria-label="Toggle Disaster AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          </div>
        )}
      </motion.button>

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[82vh] glass-panel-dark border border-cyan-500/30 shadow-2xl rounded-2xl flex flex-col overflow-hidden backdrop-blur-2xl bg-navy-900/95"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-navy-800/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-cascade-cyan/20 border border-cascade-cyan/40 flex items-center justify-center text-cascade-cyan shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-display font-semibold text-white flex items-center space-x-1.5">
                    <span>CascadeAI Copilot</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Disaster Cascade & Resource Optimizer
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() =>
                    setMessages([
                      {
                        id: `reset-${Date.now()}`,
                        sender: 'assistant',
                        text: 'Session reset. Ready for your incident inquiry.',
                        timestamp: new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      },
                    ])
                  }
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition"
                  title="Clear Conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Context Banner */}
            <div className="px-3 py-1.5 bg-navy-950/60 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Sim Rain: <strong className="text-white">{simulation?.rainfallIntensity || 50} mm/h</strong></span>
              </span>
              <span>Hour: <strong className="text-white">T+{simulation?.currentHour || 0}:00</strong></span>
              <span>Reports: <strong className="text-white">{simulation?.citizenReports?.length || 0}</strong></span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[88%] ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-cascade-cyan/20 text-cascade-cyan border border-cascade-cyan/30'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-navy-800/90 border border-white/10 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-8">
                    {msg.timestamp}
                  </span>

                  {/* Quick Chips if attached */}
                  {msg.quickChips && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
                      {msg.quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-cascade-cyan/20 hover:border-cascade-cyan/40 border border-white/10 text-cyan-200 rounded-full transition-all duration-200 text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-cascade-cyan/20 text-cascade-cyan border border-cascade-cyan/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3 py-2 bg-navy-800/80 border border-white/10 rounded-2xl rounded-tl-none flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-navy-950/80 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CascadeAI (e.g., 'Which area is most at risk?')..."
                  className="flex-1 bg-navy-900 border border-white/15 focus:border-cyan-400/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow transition"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1">
                <span>Rule-based engine with live state integration</span>
                <span>Enter ↵ to send</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
