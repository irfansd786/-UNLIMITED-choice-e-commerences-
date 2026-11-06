import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  ExternalLink, 
  Plus, 
  Clock, 
  Bot, 
  User, 
  ShoppingBag, 
  Layers, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';
import { adminAIService } from '../../services/api';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { getTimeBasedGreeting, speakJarvis, stopJarvisAudio } from '../../services/jarvisVoiceService';

export default function AIBusinessAssistant() {
  const { 
    isOpen, 
    closeAssistant, 
    queuedPrompt, 
    clearQueuedPrompt, 
    activeConversationId, 
    setActiveConversationId 
  } = useAIAssistantStore();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [executingActionId, setExecutingActionId] = useState(null);
  const [actionSuccesses, setActionSuccesses] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const currentAudioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      if (activeConversationId) {
        loadConversationMessages(activeConversationId);
      } else {
        const greeting = getTimeBasedGreeting('Chief');
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `${greeting} I am your UNLIMITED choice Jarvis AI Operations Manager. I have complete visibility into live customer store traffic, inventory, pending orders, and customer feedback. How may I assist you today?`,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, [isOpen, activeConversationId]);

  useEffect(() => {
    if (isOpen && queuedPrompt) {
      handleSendMessage(queuedPrompt);
      clearQueuedPrompt();
    }
  }, [isOpen, queuedPrompt]);

  const loadConversations = async () => {
    try {
      const data = await adminAIService.getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversationMessages = async (id) => {
    try {
      setLoading(true);
      const data = await adminAIService.getConversation(id);
      if (data?.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    stopCurrentAudio();
    setActiveConversationId(null);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: "New session initialized, Chief. What business queries or operations shall we look into?",
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowHistory(false);
  };

  const stopCurrentAudio = () => {
    stopJarvisAudio();
    setIsPlayingAudio(false);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    stopCurrentAudio();
    setInputText('');

    const tempUserMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const offsetMinutes = -new Date().getTimezoneOffset();
      const res = await adminAIService.sendChatMessage(text, activeConversationId, offsetMinutes);

      if (res.conversation_id && res.conversation_id !== activeConversationId) {
        setActiveConversationId(res.conversation_id);
        loadConversations();
      }

      const asstMsg = {
        id: res.message_id || 'asst-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        action_type: res.action_type,
        action_data: res.action_payload,
        requires_confirmation: res.requires_confirmation,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, asstMsg]);

      if (autoSpeak && res.reply) {
        setIsPlayingAudio(true);
        speakJarvis(
          res.reply,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
      }

    } catch (err) {
      console.error('AI chat failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `Apologies Chief, I encountered an operational disruption: ${err.message || 'Server connection error'}.`,
          isError: true,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    stopCurrentAudio();
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });

        if (audioBlob.size < 1000) {
          return;
        }

        await handleVoiceSubmit(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or unsupported:', err);
      alert('Microphone access was denied or is not supported in this browser. Please grant microphone permissions in your address bar.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceSubmit = async (audioBlob) => {
    setLoading(true);

    const placeholderId = 'recording-' + Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: placeholderId,
        role: 'user',
        content: '🎙️ Processing voice instruction...',
        isTranscribing: true,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const offsetMinutes = -new Date().getTimezoneOffset();
      const res = await adminAIService.sendVoiceChat(audioBlob, activeConversationId, offsetMinutes);

      setMessages(prev => prev.map(m => {
        if (m.id === placeholderId) {
          return {
            ...m,
            content: res.user_transcript || 'Voice instruction',
            isTranscribing: false
          };
        }
        return m;
      }));

      if (res.conversation_id && res.conversation_id !== activeConversationId) {
        setActiveConversationId(res.conversation_id);
        loadConversations();
      }

      const asstMsg = {
        id: res.message_id || 'asst-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        action_type: res.action_type,
        action_data: res.action_payload,
        requires_confirmation: res.requires_confirmation,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, asstMsg]);

      if (autoSpeak && res.reply) {
        setIsPlayingAudio(true);
        speakJarvis(
          res.reply,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
      }

    } catch (err) {
      console.error('Voice chat submission failed:', err);
      setMessages(prev => prev.map(m => {
        if (m.id === placeholderId) {
          return {
            ...m,
            content: 'Voice processing failed.',
            isError: true,
            isTranscribing: false
          };
        }
        return m;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (actionType, payload, messageId) => {
    try {
      setExecutingActionId(messageId);
      const res = await adminAIService.executeAction(actionType, payload, activeConversationId);

      setActionSuccesses(prev => ({
        ...prev,
        [messageId]: res
      }));

      setMessages(prev => [
        ...prev,
        {
          id: 'conf-' + Date.now(),
          role: 'assistant',
          content: `✅ Action executed successfully: ${res.message || 'Operation recorded.'}`,
          isSystemNotice: true,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      alert(`Action authorization failed: ${err.message}`);
    } finally {
      setExecutingActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Drawer Container */}
      <div className="w-full max-w-2xl bg-white border-l border-[#E7EBE7] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7EBE7] bg-[#FAF6F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center shadow-xs flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-[#173D30] text-base">JARVIS AI Commander</h3>
                <span className="text-[10px] bg-[#EBF5F0] text-[#173D30] px-2.5 py-0.5 rounded-full border border-[#D5E6DF] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  24/7 Sentinel
                </span>
              </div>
              <p className="text-[11px] text-[#727A74]">UNLIMITED choice Operations & Store Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (isPlayingAudio) stopCurrentAudio();
                setAutoSpeak(!autoSpeak);
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors border ${
                autoSpeak 
                  ? 'bg-white border-[#C5A16E]/40 text-[#173D30]' 
                  : 'bg-[#F7F8F6] border-[#E7EBE7] text-[#727A74]'
              }`}
              title={autoSpeak ? 'Voice output enabled' : 'Voice output muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-[#C5A16E]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Conversation History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-xl bg-white border border-[#E7EBE7] hover:border-[#173D30] text-[#727A74] hover:text-[#173D30] transition-colors"
              title="Conversation history"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* New Chat */}
            <button
              onClick={handleStartNewConversation}
              className="p-2 rounded-xl bg-white border border-[#E7EBE7] hover:border-[#173D30] text-[#727A74] hover:text-[#173D30] transition-colors"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Close Drawer */}
            <button
              onClick={closeAssistant}
              className="p-2 rounded-xl bg-white border border-[#E7EBE7] hover:bg-[#F7F8F6] text-[#727A74] hover:text-[#252A27] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Drawer Overlay (if toggled) */}
        {showHistory && (
          <div className="bg-[#FAF6F0] border-b border-[#E7EBE7] p-4 space-y-2 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-bold text-[#727A74] uppercase tracking-wider mb-2">
              <span>Past Executive Sessions</span>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-[#727A74] hover:text-[#252A27]"
              >
                Close
              </button>
            </div>
            {conversations.length === 0 ? (
              <p className="text-xs text-[#727A74] py-2">No previous conversations found.</p>
            ) : (
              conversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    setActiveConversationId(c.id);
                    loadConversationMessages(c.id);
                    setShowHistory(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    activeConversationId === c.id 
                      ? 'bg-white text-[#173D30] font-semibold border border-[#173D30] shadow-xs' 
                      : 'bg-white/60 text-[#252A27] border border-[#E7EBE7] hover:bg-white'
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <span className="text-[10px] text-[#727A74] flex-shrink-0">{c.updated_at}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audio Speaking Notification Banner */}
        {isPlayingAudio && (
          <div className="bg-[#EBF5F0] border-b border-[#D5E6DF] px-4 py-2 flex items-center justify-between text-xs text-[#173D30]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="font-semibold">JARVIS Speaking...</span>
            </div>
            <button
              onClick={stopCurrentAudio}
              className="px-2.5 py-0.5 rounded-md bg-[#173D30] hover:bg-[#112F25] text-white text-[11px] font-semibold transition-colors"
            >
              Stop Audio
            </button>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F7F8F6]">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const actionSuccess = actionSuccesses[msg.id];

            return (
              <div
                key={msg.id || idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#173D30] text-[#C5A16E] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#173D30] text-white rounded-br-sm font-medium'
                        : msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-sm'
                        : msg.isSystemNotice
                        ? 'bg-[#EBF5F0] border border-[#D5E6DF] text-[#173D30] rounded-bl-sm font-semibold'
                        : 'bg-white border border-[#E7EBE7] text-[#252A27] rounded-bl-sm'
                    }`}
                  >
                    {msg.isTranscribing ? (
                      <div className="flex items-center gap-2 text-stone-600">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#173D30]" />
                        <span>Transcribing spoken audio...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {/* INTERACTIVE ACTION CARD: DRAFT PRODUCT */}
                  {msg.action_type === 'PUBLISH_PRODUCT' && msg.action_data && (
                    <div className="bg-white border border-[#C5A16E]/40 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7EBE7]">
                        <div className="flex items-center gap-2 text-[#173D30] font-bold text-xs">
                          <ShoppingBag className="w-4 h-4 text-[#C5A16E]" />
                          <span>Product Draft Ready for Publishing</span>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                          Requires Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#727A74] text-[10px] block">Title</span>
                          <span className="font-semibold text-[#252A27]">{msg.action_data.name}</span>
                        </div>
                        <div>
                          <span className="text-[#727A74] text-[10px] block">Price</span>
                          <span className="font-bold text-[#173D30]">
                            ₹{Number(msg.action_data.price || 0).toLocaleString('en-IN')}
                            {msg.action_data.original_price && (
                              <span className="line-through text-[#9DA5A0] text-[10px] ml-1.5">
                                ₹{Number(msg.action_data.original_price).toLocaleString('en-IN')}
                              </span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#727A74] text-[10px] block">Category</span>
                          <span className="text-[#252A27]">{msg.action_data.category_name || 'Streetwear'}</span>
                        </div>
                        <div>
                          <span className="text-[#727A74] text-[10px] block">Stock Units</span>
                          <span className="text-[#252A27]">{msg.action_data.stock || 20} units total</span>
                        </div>
                      </div>

                      {msg.action_data.sizes && msg.action_data.sizes.length > 0 && (
                        <div>
                          <span className="text-[#727A74] text-[10px] block mb-1">Available Sizes:</span>
                          <div className="flex flex-wrap gap-1">
                            {msg.action_data.sizes.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-[#F7F8F6] text-[#252A27] rounded text-[10px] font-semibold border border-[#E7EBE7]">
                                {s.size} ({s.stock} in stock)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {actionSuccess ? (
                        <div className="p-2.5 rounded-xl bg-[#EBF5F0] border border-[#D5E6DF] text-[#173D30] text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Live on Storefront!
                          </span>
                          {actionSuccess.product_id && (
                            <a
                              href={`http://localhost:5173/products/${actionSuccess.product_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] underline flex items-center gap-1 text-[#173D30] font-semibold"
                            >
                              View Live <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction('PUBLISH_PRODUCT', msg.action_data, msg.id)}
                          disabled={executingActionId === msg.id}
                          className="w-full py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          {executingActionId === msg.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Publishing to Storefront...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A16E]" />
                              <span>Authorize & Publish to Storefront</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE ACTION CARD: PACKING LIST */}
                  {msg.action_type === 'PACKING_LIST' && msg.action_data && (
                    <div className="bg-white border border-[#E7EBE7] rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7EBE7]">
                        <div className="flex items-center gap-2 text-[#173D30] font-bold text-xs">
                          <Printer className="w-4 h-4 text-[#C5A16E]" />
                          <span>Dispatch Packing Slips ({msg.action_data.total_orders} Orders)</span>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="px-2.5 py-1 rounded-lg bg-[#173D30] hover:bg-[#112F25] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-[#727A74]">
                        Total items to pack: <strong className="text-[#173D30]">{msg.action_data.total_items_to_pack} units</strong>
                      </div>

                      {msg.action_data.orders && (
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {msg.action_data.orders.map((ord, oIdx) => (
                            <div key={oIdx} className="p-2 rounded-xl bg-[#F7F8F6] border border-[#E7EBE7] text-[11px] space-y-1">
                              <div className="flex items-center justify-between font-semibold text-[#252A27]">
                                <span>{ord.order_number} — {ord.customer_name}</span>
                                <span className="text-[10px] text-emerald-700 font-bold">{ord.payment_method}</span>
                              </div>
                              <ul className="text-[#727A74] space-y-0.5">
                                {ord.items.map((it, itIdx) => (
                                  <li key={itIdx} className="flex justify-between text-[10px]">
                                    <span>• {it.product_name} ({it.size || 'One Size'})</span>
                                    <span className="font-bold text-[#252A27]">Qty: {it.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE ACTION CARD: ORDER STATUS UPDATE */}
                  {msg.action_type === 'UPDATE_ORDER_STATUS' && msg.action_data && (
                    <div className="bg-white border border-[#E7EBE7] rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7EBE7]">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Order Status Change Request</span>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 font-semibold">
                          Confirmation Required
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-[#727A74] text-[10px] block">Order Target:</span>
                          <span className="font-semibold text-[#252A27]">Order #{msg.action_data.order_id}</span>
                        </div>
                        <div>
                          <span className="text-[#727A74] text-[10px] block">New Status:</span>
                          <span className="font-bold text-[#173D30] uppercase">{msg.action_data.status}</span>
                        </div>
                        {msg.action_data.note && (
                          <div>
                            <span className="text-[#727A74] text-[10px] block">Admin Memo:</span>
                            <span className="text-[#727A74] italic">"{msg.action_data.note}"</span>
                          </div>
                        )}
                      </div>

                      {actionSuccess ? (
                        <div className="p-2.5 rounded-xl bg-[#EBF5F0] border border-[#D5E6DF] text-[#173D30] text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Status successfully modified in database!
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction('UPDATE_ORDER_STATUS', msg.action_data, msg.id)}
                          disabled={executingActionId === msg.id}
                          className="w-full py-2 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          {executingActionId === msg.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A16E]" />
                          )}
                          <span>Confirm Status Change</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-[#9DA5A0] px-1">
                    {msg.created_at}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#C5A16E]/40 text-[#173D30] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-[#727A74] text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#173D30] border border-[#C5A16E]/40 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C5A16E]" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-[#173D30]">Executive AI analyzing database...</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173D30] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173D30] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173D30] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Recording Overlay when active */}
        {isRecording && (
          <div className="p-3.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div>
                <span className="font-bold text-xs text-[#252A27] block">Listening to your instruction...</span>
                <span className="text-[10px] text-[#727A74]">Speak naturally, then click Done</span>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Done Speaking</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E7EBE7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all shadow-xs ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#FAF6F0] border border-[#C5A16E]/40 hover:border-[#173D30] text-[#173D30]'
              }`}
              title="Push-to-talk voice input"
            >
              <Mic className="w-4 h-4 text-[#C5A16E]" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask business manager or speak via microphone..."
              disabled={loading || isRecording}
              className="flex-1 bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#252A27] placeholder:text-[#9DA5A0] focus:outline-none focus:border-[#173D30] transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading || isRecording}
              className="p-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-xs"
            >
              <Send className="w-4 h-4 text-[#C5A16E]" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-[#9DA5A0]">
            <span>Powered by Groq OSS & ElevenLabs Speech Engine</span>
            <span>All operations require confirmation</span>
          </div>
        </div>

      </div>
    </div>
  );
}
