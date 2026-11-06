import React, { useState } from 'react';
import { 
  Volume2, 
  Square, 
  Sparkles, 
  Minus, 
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { stopJarvisAudio, playJarvisChime } from '../../services/jarvisVoiceService';

export default function JarvisLiveSpeechColumn() {
  const {
    isSpeaking,
    currentSpeakingText,
    lastResponse,
    setSpeaking
  } = useJarvisStore();

  const [isMinimized, setIsMinimized] = useState(false);

  const handleStopSpeaking = () => {
    stopJarvisAudio();
    setSpeaking(false);
    playJarvisChime('action');
  };

  const displayText = currentSpeakingText || lastResponse || 'Good day, Chief. Jarvis AI Voice Assistant is active and listening for your commands.';

  // Minimized View (Clean 1-line bar)
  if (isMinimized) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 shadow-2xs flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#173D30] text-[#D7F58C] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">
            Jarvis: "{displayText}"
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs animate-pulse cursor-pointer"
              title="Stop speaking"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Expand Jarvis column"
          >
            <span>Expand</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded View — Clean Card Showing ONLY the Text of AI + Stop Button + Minimize Button
  return (
    <div className={`w-full bg-white rounded-3xl border transition-all duration-300 p-4 sm:p-5 shadow-2xs ${
      isSpeaking 
        ? 'border-emerald-300 ring-2 ring-emerald-100 bg-gradient-to-r from-white via-emerald-50/15 to-white' 
        : 'border-slate-100'
    }`}>
      {/* Top Header: Title, Status, Stop Button & Minimize Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        
        {/* Left: Jarvis Identity & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform ${
            isSpeaking 
              ? 'bg-[#173D30] text-[#D7F58C] scale-105 shadow-xs ring-2 ring-emerald-400/40' 
              : 'bg-[#173D30] text-[#D7F58C]'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-slate-900 uppercase">
                Jarvis AI Voice
              </span>

              {/* Status Pill */}
              {isSpeaking ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  Talking Now
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Stop Button & Minimize Toggle */}
        <div className="flex items-center gap-2">
          {/* STOP BUTTON */}
          <button
            onClick={handleStopSpeaking}
            className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 scale-102 animate-pulse'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
            title="Immediately stop Jarvis from talking (Shortcut: Esc or say 'Stop')"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Speaking</span>
          </button>

          {/* MINIMIZE BUTTON */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Minimize Jarvis card"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: ONLY Shows the Text of AI */}
      <div className={`mt-3 p-4 rounded-2xl border transition-all ${
        isSpeaking 
          ? 'bg-emerald-50/60 border-emerald-200 shadow-xs' 
          : 'bg-slate-50/70 border-slate-200/80'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isSpeaking ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isSpeaking ? '🗣️ Jarvis is Speaking:' : '💬 AI Voice Output:'}
              </span>

              {/* Live soundwave equalizer when speaking */}
              {isSpeaking && (
                <div className="flex items-center gap-0.5 h-3 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-2"></span>
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-3" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-2.5" style={{ animationDelay: '0.45s' }}></span>
                </div>
              )}
            </div>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isSpeaking ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
            }`}>
              "{displayText}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
