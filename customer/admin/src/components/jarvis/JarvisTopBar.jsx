import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertCircle,
  Square
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { 
  getTimeBasedGreeting, 
  checkCustomerWebHealth, 
  playJarvisChime, 
  speakJarvis, 
  stopJarvisAudio,
  parseJarvisCommand 
} from '../../services/jarvisVoiceService';

export default function JarvisTopBar({ adminName = 'Chief' }) {
  const { 
    isListening, 
    isRecognizing, 
    isSpeaking, 
    isInConversation, 
    isMuted,
    hasActivatedVoice,
    micPermission,
    liveTranscript, 
    lastHeard, 
    lastResponse, 
    customerWebStatus,
    toggleMute,
    setSpeaking,
    setLastResponse,
    setCustomerWebStatus
  } = useJarvisStore();

  const { openAssistant } = useAIAssistantStore();
  const [checkingWeb, setCheckingWeb] = useState(false);

  const greeting = getTimeBasedGreeting(adminName);

  const handleActivateMic = () => {
    if (window.__activateJarvisVoice) {
      window.__activateJarvisVoice();
    }
  };

  const handleCheckCustomerWeb = async () => {
    setCheckingWeb(true);
    playJarvisChime('action');
    const res = await checkCustomerWebHealth();
    setCustomerWebStatus(res);
    setLastResponse(res.summary);
    speakJarvis(res.summary, () => setSpeaking(true), () => setSpeaking(false));
    setCheckingWeb(false);
  };

  return (
    <header className="rounded-2xl bg-white border border-[#E7EBE7] p-4 sm:p-5 shadow-sm space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Greeting & System Pulse */}
        <div className="flex items-center gap-3.5">
          <div 
            onClick={openAssistant}
            className="cursor-pointer relative w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/40 flex items-center justify-center shadow-xs flex-shrink-0 group hover:border-[#173D30] transition-all"
            title="Open Jarvis AI Command Center"
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-all ${
              isSpeaking 
                ? 'bg-purple-600 animate-ping' 
                : isRecognizing 
                  ? 'bg-emerald-600 animate-ping' 
                  : isListening && !isMuted 
                    ? 'bg-[#173D30] animate-pulse' 
                    : 'bg-stone-300'
            }`}></div>
            <Sparkles className="w-5 h-5 text-[#C5A16E] absolute opacity-90 group-hover:rotate-12 transition-transform" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#252A27] tracking-tight">
                {greeting}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                JARVIS 24/7
              </span>
            </div>
            <p className="text-xs text-[#727A74]">
              Executive Operations & Voice Sentinel
            </p>
          </div>
        </div>

        {/* Center/Right: Voice Controller & Customer Web Monitor */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Mic State / One-Click Activator */}
          {!hasActivatedVoice ? (
            <button
              onClick={handleActivateMic}
              className="px-3.5 py-2 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
              title="Click to grant mic permission and start 24/7 Jarvis voice recognition"
            >
              <Mic className="w-3.5 h-3.5 text-[#C5A16E]" />
              <span>Activate Jarvis Voice</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-xs">
              <button
                onClick={toggleMute}
                className={`p-1 rounded-lg transition-colors ${
                  isMuted ? 'text-red-600 bg-red-50' : 'text-[#173D30] hover:bg-[#EBF5F0]'
                }`}
                title={isMuted ? 'Unmute Jarvis' : 'Mute Jarvis'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
              </button>

              <div className="font-mono text-[11px] flex items-center gap-1.5">
                {isMuted ? (
                  <span className="text-red-600 font-semibold">Voice Muted</span>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-700 font-semibold animate-pulse">Jarvis Speaking...</span>
                    <button
                      onClick={() => {
                        stopJarvisAudio();
                        useJarvisStore.getState().setSpeaking(false);
                      }}
                      className="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] flex items-center gap-1 shadow-xs transition-colors"
                      title="Stop Jarvis talking (Esc)"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>Stop (Esc)</span>
                    </button>
                  </div>
                ) : isRecognizing ? (
                  <span className="text-emerald-700 font-semibold truncate max-w-[150px]">
                    Hearing: "{liveTranscript || '...'}"
                  </span>
                ) : isInConversation ? (
                  <span className="text-amber-700 font-semibold">In Conversation...</span>
                ) : (
                  <span className="text-[#727A74]">
                    Listening for <b className="text-[#173D30]">"Jarvis"</b>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Customer Web Monitor Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-xs">
            <Globe className="w-3.5 h-3.5 text-[#237653] flex-shrink-0" />
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#727A74]">Store:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                customerWebStatus?.customerOnline ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {customerWebStatus?.customerOnline ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                    Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-600 inline" />
                    Offline
                  </>
                )}
              </span>
              <span className="text-[#9DA5A0] text-[10px]">
                ({customerWebStatus?.latencyMs || 0}ms)
              </span>
            </div>

            <div className="flex items-center gap-1 border-l border-[#E7EBE7] pl-1.5 ml-0.5">
              <button
                onClick={handleCheckCustomerWeb}
                disabled={checkingWeb}
                className="p-1 text-[#727A74] hover:text-[#173D30] rounded hover:bg-white transition-colors"
                title="Run immediate health check on customer website"
              >
                <RefreshCw className={`w-3 h-3 ${checkingWeb ? 'animate-spin text-[#173D30]' : ''}`} />
              </button>
              <a
                href={typeof window !== 'undefined' ? window.location.origin : '/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#727A74] hover:text-[#173D30] rounded hover:bg-white transition-colors"
                title="Open live customer store"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Assistant Trigger Button */}
          <button
            onClick={() => openAssistant()}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#C5A16E]/40 hover:border-[#173D30] text-[#173D30] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            title="Open Jarvis AI Operations Command Center"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A16E]" />
            <span>AI Commander</span>
          </button>
        </div>

      </div>

      {/* Floating Subtitle / Spoken Feedback Banner */}
      {(liveTranscript || lastHeard || lastResponse) && (
        <div className="pt-3 border-t border-[#E7EBE7] space-y-2 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#252A27] min-w-0">
              {liveTranscript ? (
                <span className="text-emerald-700 italic flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Hearing: "{liveTranscript}"
                </span>
              ) : lastHeard ? (
                <span className="text-[#252A27] truncate">
                  <b className="text-emerald-700">Chief:</b> "{lastHeard}"
                </span>
              ) : null}

              {lastResponse && (
                <>
                  <span className="text-[#E7EBE7]">•</span>
                  <span className="text-[#173D30] text-[11px] leading-snug">
                    <b className="text-[#C5A16E]">Jarvis:</b> "{lastResponse}"
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Spoken Inquiry Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-[#727A74] font-semibold mr-1">Voice Prompts:</span>
            {[
              "Cancel all the orders",
              "Pack all orders",
              "What is today's revenue?",
              "Suggest a new product",
              "Add Vintage Acid Wash Hoodie",
              "Check customer web pages",
              "Open orders",
              "Open products"
            ].map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (window.__activateJarvisVoice) {
                    window.__activateJarvisVoice();
                  }
                  useJarvisStore.getState().setLastHeard(cmd);
                  parseJarvisCommand(cmd);
                  window.dispatchEvent(new CustomEvent('jarvis-command', { detail: cmd }));
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F7F8F6] hover:bg-[#FAF6F0] border border-[#E7EBE7] hover:border-[#C5A16E] text-[10px] text-[#727A74] hover:text-[#173D30] font-sans transition-colors"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
