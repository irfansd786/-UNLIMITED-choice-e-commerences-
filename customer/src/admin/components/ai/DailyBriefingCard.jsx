import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Square, 
  Clock, 
  Calendar, 
  TrendingUp, 
  PackageCheck, 
  AlertTriangle, 
  MessageSquare,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Boxes
} from 'lucide-react';
import { adminAIService } from '../../services/api';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { speakJarvis, stopJarvisAudio } from '../../services/jarvisVoiceService';

export default function DailyBriefingCard() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  const { openAssistant } = useAIAssistantStore();

  const loadBriefing = async () => {
    try {
      setLoading(true);
      const offsetMinutes = -new Date().getTimezoneOffset();
      const data = await adminAIService.getBriefing(offsetMinutes);
      setBriefing(data);
    } catch (err) {
      console.error('Failed to load AI business briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefing();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopJarvisAudio();
      setIsPlayingAudio(false);
      return;
    }

    if (!briefing?.spoken_summary) return;

    setIsPlayingAudio(true);
    speakJarvis(
      briefing.spoken_summary,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-[#E7EBE7] p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100"></div>
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-stone-100 rounded"></div>
              <div className="w-32 h-3 bg-stone-100 rounded"></div>
            </div>
          </div>
        </div>
        <div className="h-16 bg-stone-50 rounded-xl"></div>
      </div>
    );
  }

  if (!briefing) return null;

  const kpis = briefing.kpis || {};
  const sales = kpis.sales || {};
  const pipeline = kpis.orders_pipeline || {};
  const inventory = kpis.inventory || {};

  const todayRevenue = sales.today_revenue || 0;
  const todayOrders = sales.today_orders || 0;
  const readyToPack = pipeline.ready_to_pack_count || 0;
  const lowStockCount = inventory.low_stock_count || 0;
  const totalActive = inventory.total_active_products || 0;
  const totalUnits = inventory.total_units_in_stock || 0;

  return (
    <div className="rounded-2xl bg-white border border-[#E7EBE7] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top Briefing Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7EBE7]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/40 text-[#173D30] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#C5A16E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#173D30]">Executive Operations Briefing</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5F0] text-[#173D30] font-semibold border border-[#D5E6DF]">
                Live Intelligence
              </span>
            </div>
            <p className="text-xs text-[#727A74]">
              Unified summary of store sales, fulfillment pipeline, and inventory status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Spoken Briefing Button */}
          {briefing.spoken_summary && (
            <button
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                isPlayingAudio
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#173D30] hover:bg-[#112F25] text-white'
              }`}
              title={isPlayingAudio ? "Stop spoken briefing" : "Listen to audio executive briefing via Jarvis"}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Briefing</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#C5A16E]" />
                  <span>Play Spoken Briefing</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={loadBriefing}
            className="p-1.5 rounded-xl text-[#727A74] hover:text-[#173D30] hover:bg-[#F7F8F6] border border-[#E7EBE7] transition-colors"
            title="Refresh AI briefing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spoken / Written Briefing Summary Text */}
      {briefing.spoken_summary && (
        <div className="bg-[#FAF6F0] rounded-xl p-3.5 border border-[#C5A16E]/20 text-xs text-[#252A27] leading-relaxed flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-[#C5A16E] flex-shrink-0 mt-0.5" />
          <p className="italic">
            "{briefing.spoken_summary}"
          </p>
        </div>
      )}

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727A74] block">Today's Sales</span>
          <span className="text-base font-bold text-[#173D30] block mt-0.5">₹{Math.round(todayRevenue).toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-[#727A74]">{todayOrders} orders today</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727A74] block">Ready to Pack</span>
          <span className="text-base font-bold text-[#252A27] block mt-0.5">{readyToPack}</span>
          <span className="text-[10px] text-[#727A74]">Pending fulfillment</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727A74] block">Low Stock</span>
          <span className={`text-base font-bold block mt-0.5 ${lowStockCount > 0 ? 'text-amber-700' : 'text-[#252A27]'}`}>
            {lowStockCount}
          </span>
          <span className="text-[10px] text-[#727A74]">Needs reorder</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727A74] block">Active Listings</span>
          <span className="text-base font-bold text-[#252A27] block mt-0.5">{totalActive}</span>
          <span className="text-[10px] text-[#727A74]">Live on store</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727A74] block">Total Stock</span>
          <span className="text-base font-bold text-[#252A27] block mt-0.5">{totalUnits.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-[#727A74]">Physical units</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/30 flex flex-col justify-between">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#173D30] block">Jarvis AI</span>
          <button
            onClick={() => openAssistant()}
            className="text-xs font-semibold text-[#173D30] hover:text-[#237653] flex items-center justify-between mt-1 transition-colors"
          >
            <span>Ask Jarvis</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A16E]" />
          </button>
        </div>
      </div>
    </div>
  );
}
