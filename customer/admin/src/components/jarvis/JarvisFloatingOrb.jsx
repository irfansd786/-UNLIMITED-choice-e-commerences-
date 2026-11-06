import React from 'react';
import { Sparkles, Mic, MicOff } from 'lucide-react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';

export default function JarvisFloatingOrb() {
  const { isListening, isRecognizing, isSpeaking, isMuted, hasActivatedVoice } = useJarvisStore();
  const { toggleAssistant } = useAIAssistantStore();

  const handleOrbClick = () => {
    if (!hasActivatedVoice && window.__activateJarvisVoice) {
      window.__activateJarvisVoice();
    }
    toggleAssistant();
  };

  return (
    <button
      onClick={handleOrbClick}
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#173D30] hover:bg-[#112F25] text-white border border-[#C5A16E]/40 shadow-lg shadow-[#173D30]/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-sans"
      title="Jarvis 24/7 AI Commander (Voice & Operations)"
      aria-label="Open Jarvis AI Commander"
    >
      {/* Pulsing Core */}
      <div className="relative flex items-center justify-center">
        <span className={`w-3.5 h-3.5 rounded-full ${
          isSpeaking 
            ? 'bg-purple-400 animate-ping' 
            : isRecognizing 
              ? 'bg-emerald-400 animate-ping' 
              : isListening && !isMuted 
                ? 'bg-[#C5A16E] animate-pulse' 
                : 'bg-stone-400'
        }`}></span>
        <span className={`absolute w-2 h-2 rounded-full ${
          isSpeaking 
            ? 'bg-purple-300' 
            : isRecognizing 
              ? 'bg-emerald-300' 
              : isListening && !isMuted 
                ? 'bg-[#C5A16E]' 
                : 'bg-stone-300'
        }`}></span>
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-wider text-white group-hover:text-[#FAF6F0] transition-colors flex items-center gap-1.5">
          <span>JARVIS AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </span>
        <span className="text-[10px] text-stone-300 font-mono -mt-0.5">
          {isSpeaking ? 'Speaking...' : isRecognizing ? 'Hearing Chief...' : '24/7 Online'}
        </span>
      </div>

      <div className="p-1 rounded-full bg-[#112F25] border border-[#C5A16E]/30 text-[#C5A16E] ml-1">
        {isMuted ? <MicOff className="w-3.5 h-3.5 text-red-300" /> : <Mic className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
}
