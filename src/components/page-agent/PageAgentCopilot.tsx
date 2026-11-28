import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  buildPageAgentSystemInstructions,
  clearGeminiAuthConfig,
  GEMINI_MODEL_OPTIONS,
  GEMINI_OPENAI_ENDPOINT,
  GOOGLE_WORKSPACE_AFFILIATE,
  loadGeminiAuthConfig,
  normalizeOpenAiEndpoint,
  saveGeminiAuthConfig,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
} from '../../lib/page-agent/geminiConfig.js';

type GeminiModelId = 'gemini-2.0-flash' | 'gemini-1.5-flash';

interface GeminiAuthConfig {
  apiKey: string;
  model: GeminiModelId;
  endpoint: string;
  verifiedAt?: string;
}

interface CopilotLogItem {
  id: string;
  kind: 'user' | 'step' | 'success' | 'error' | 'info';
  text: string;
}

interface PendingQuestion {
  question: string;
  resolve: (answer: string) => void;
  reject: (reason?: unknown) => void;
}

interface PageAgentCopilotProps {
  appName?: string;
  appContext?: string;
  quickPrompts?: string[];
}

const DEFAULT_QUICK_PROMPTS = [
  'Mở Bảng Vẽ để thị phạm từng bước',
  'Chuyển sang tab Soạn Bài & Trình Chiếu',
  'Mở Tổng Quan Kho Học Liệu',
  'Mở mục Đánh Giá Học Sinh SMAS',
];

function translateActionLabel(toolName: string): string {
  const map: Record<string, string> = {
    click_element_by_index: 'Đang bấm vào nút/liên kết trên trang',
    input_text: 'Đang nhập nội dung vào ô dữ liệu',
    select_dropdown_option: 'Đang chọn tùy chọn danh sách',
    scroll: 'Đang cuộn trang để quan sát thêm',
    scroll_horizontally: 'Đang cuộn ngang màn hình',
    wait: 'Đang chờ giao diện cập nhật',
    done: 'Hoàn tất thao tác',
    ask_user: 'Đang hỏi thêm thông tin từ bạn',
  };
  return map[toolName] || `Đang thực thi bước (${toolName})`;
}

export default function PageAgentCopilot({
  appName = 'Cọ Nhí Studio',
  appContext = 'Phần mềm dạy học Mĩ thuật & STEAM tiểu học gồm Tổng quan học liệu, Soạn bài giảng trình chiếu, Bảng vẽ 4 bước, Trò chơi nghệ thuật, Chấm bài bằng Camera và Đánh giá SMAS.',
  quickPrompts = DEFAULT_QUICK_PROMPTS,
}: PageAgentCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authConfig, setAuthConfig] = useState<GeminiAuthConfig | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-2.0-flash');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const [commandInput, setCommandInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Sẵn sàng hỗ trợ');
  const [logs, setLogs] = useState<CopilotLogItem[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState('');

  const widgetRootRef = useRef<HTMLDivElement | null>(null);
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const agentRef = useRef<{ stop: () => Promise<void>; dispose: () => void } | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = loadGeminiAuthConfig() as GeminiAuthConfig | null;
    if (saved) {
      setAuthConfig(saved);
      setApiKeyInput(saved.apiKey);
      setSelectedModel(saved.model);
    }
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, pendingQuestion]);

  useEffect(() => {
    return () => {
      if (agentRef.current) {
        try {
          agentRef.current.dispose();
        } catch {
          // Bỏ qua lỗi dọn dẹp khi unmount
        }
        agentRef.current = null;
      }
    };
  }, []);

  const pushLog = useCallback((item: Omit<CopilotLogItem, 'id'>) => {
    setLogs((prev) => [
      ...prev.slice(-30),
      { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }, []);

  const handleCopyCode = async (planId: string, code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopiedPlanId(planId);
      setTimeout(() => {
        setCopiedPlanId((current) => (current === planId ? null : current));
      }, 2200);
    } catch {
      setAuthFeedback({
        ok: false,
        text: `Không thể tự động sao chép. Mã ưu đãi của bạn là: ${code}`,
      });
    }
  };

  const handleVerifyAndSave = async () => {
    setIsVerifyingKey(true);
    setAuthFeedback(null);
    const result = await verifyGeminiApiKey(apiKeyInput);
    setIsVerifyingKey(false);

    if (result.ok) {
      const saved = saveGeminiAuthConfig({
        apiKey: apiKeyInput,
        model: selectedModel,
        verifiedAt: new Date().toISOString(),
      }) as GeminiAuthConfig;
      setAuthConfig(saved);
      setAuthFeedback({ ok: true, text: result.message });
    } else {
      setAuthFeedback({ ok: false, text: result.message });
    }
  };

  const handleQuickSave = () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      setAuthFeedback({
        ok: false,
        text: 'Vui lòng nhập khóa API Google Gemini trước khi lưu.',
      });
      return;
    }
    const saved = saveGeminiAuthConfig({
      apiKey: cleanKey,
      model: selectedModel,
    }) as GeminiAuthConfig;
    setAuthConfig(saved);
    setAuthFeedback({
      ok: true,
      text: 'Đã lưu cấu hình Google Gemini cục bộ trên trình duyệt.',
    });
  };

  const handleRevokeKey = () => {
    clearGeminiAuthConfig();
    setAuthConfig(null);
    setApiKeyInput('');
    setAuthFeedback({
      ok: true,
      text: 'Đã xóa khóa API khỏi trình duyệt. Bạn có thể cấp quyền lại bất kỳ lúc nào.',
    });
  };

  const handleStopAgent = async () => {
    if (pendingQuestion) {
      pendingQuestion.reject(new Error('Người dùng đã dừng thao tác.'));
      setPendingQuestion(null);
      setQuestionAnswer('');
    }
    if (agentRef.current) {
      setLiveStatus('Đang dừng trợ lý...');
      try {
        await agentRef.current.stop();
        agentRef.current.dispose();
      } catch {
        // Bỏ qua lỗi khi dừng
      }
      agentRef.current = null;
    }
    setIsRunning(false);
    setLiveStatus('Đã dừng theo yêu cầu');
    pushLog({ kind: 'info', text: 'Đã dừng phiên thao tác trang theo yêu cầu của bạn.' });
  };

  const handleRunCommand = async (rawCommand?: string) => {
    const taskText = (rawCommand ?? commandInput).trim();
    if (!taskText || isRunning) return;

    const currentAuth = (loadGeminiAuthConfig() as GeminiAuthConfig | null) ?? authConfig;
    if (!currentAuth?.apiKey) {
      setIsAuthModalOpen(true);
      setAuthFeedback({
        ok: false,
        text: 'Vui lòng cấp quyền khóa API Google Gemini để trợ lý bắt đầu thao tác trang.',
      });
      return;
    }

    if (!rawCommand) {
      setCommandInput('');
    }

    setIsRunning(true);
    setLiveStatus('Đang khởi tạo Trợ lý AI...');
    pushLog({ kind: 'user', text: taskText });

    try {
      const [{ PageAgentCore }, { PageController }] = await Promise.all([
        import('@page-agent/core'),
        import('@page-agent/page-controller'),
      ]);

      if (agentRef.current) {
        try {
          agentRef.current.dispose();
        } catch {
          // Bỏ qua
        }
      }

      const blacklist: Array<() => Element> = [];
      if (widgetRootRef.current) {
        const rootEl = widgetRootRef.current;
        blacklist.push(() => rootEl);
      }
      if (modalRootRef.current) {
        const modalEl = modalRootRef.current;
        blacklist.push(() => modalEl);
      }

      const pageController = new PageController({
        enableMask: false,
        interactiveBlacklist: blacklist,
      });

      const agent = new PageAgentCore({
        pageController,
        baseURL: normalizeOpenAiEndpoint(currentAuth.endpoint || GEMINI_OPENAI_ENDPOINT),
        apiKey: currentAuth.apiKey,
        model: currentAuth.model,
        language: 'en-US',
        maxSteps: 18,
        stepDelay: 0.35,
        transformRequestBody: (body) => transformGeminiRequestBody(body),
        instructions: {
          system: buildPageAgentSystemInstructions(appName, appContext),
        },
      });

      agent.onAskUser = (question, options) => {
        return new Promise<string>((resolve, reject) => {
          const onAbort = () => {
            setPendingQuestion(null);
            reject(new Error('Đã hủy câu hỏi do dừng tác vụ.'));
          };
          options?.signal.addEventListener('abort', onAbort, { once: true });
          setLiveStatus('Đang chờ bạn trả lời...');
          setPendingQuestion({
            question,
            resolve: (ans) => {
              options?.signal.removeEventListener('abort', onAbort);
              setPendingQuestion(null);
              setQuestionAnswer('');
              resolve(ans);
            },
            reject: (err) => {
              options?.signal.removeEventListener('abort', onAbort);
              setPendingQuestion(null);
              setQuestionAnswer('');
              reject(err);
            },
          });
        });
      };

      agent.addEventListener('activity', (event) => {
        const detail = (event as CustomEvent).detail as
          | { type: string; tool?: string; attempt?: number; maxAttempts?: number; message?: string }
          | undefined;
        if (!detail) return;
        if (detail.type === 'thinking') {
          setLiveStatus('Đang quan sát giao diện và lập kế hoạch...');
        } else if (detail.type === 'executing' && detail.tool) {
          const label = translateActionLabel(detail.tool);
          setLiveStatus(label);
          pushLog({ kind: 'step', text: label });
        } else if (detail.type === 'retrying') {
          setLiveStatus(`Đang thử kết nối lại (${detail.attempt ?? 1}/${detail.maxAttempts ?? 3})...`);
        } else if (detail.type === 'error' && detail.message) {
          setLiveStatus('Gặp sự cố khi thao tác');
        }
      });

      agentRef.current = agent;
      const result = await agent.execute(taskText);

      if (result.success) {
        setLiveStatus('Đã hoàn tất');
        pushLog({
          kind: 'success',
          text: result.data || 'Đã hoàn tất yêu cầu trên giao diện.',
        });
      } else {
        setLiveStatus('Chưa thể hoàn tất');
        pushLog({
          kind: 'error',
          text: result.data || 'Trợ lý chưa hoàn thành được thao tác. Vui lòng thử diễn đạt cụ thể hơn.',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi không xác định khi chạy trợ lý.';
      setLiveStatus('Có lỗi kết nối');
      pushLog({
        kind: 'error',
        text: `Không thể thực thi: ${message}`,
      });
    } finally {
      if (agentRef.current) {
        try {
          agentRef.current.dispose();
        } catch {
          // Bỏ qua
        }
        agentRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleSubmitPendingAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingQuestion) return;
    const answer = questionAnswer.trim() || 'Đồng ý tiếp tục';
    pushLog({ kind: 'user', text: `Trả lời: ${answer}` });
    pendingQuestion.resolve(answer);
  };

  return (
    <>
      <div
        ref={widgetRootRef}
        data-browser-use-ignore="true"
        data-page-agent-not-interactive="true"
        className="fixed bottom-20 left-4 md:left-auto md:bottom-5 md:right-5 z-[70] flex flex-col items-start md:items-end gap-3"
      >
        {isOpen && (
          <section
            aria-label="Panel Trợ lý AI thao tác trang web"
            className="w-[372px] max-w-[calc(100vw-2rem)] max-h-[75vh] flex flex-col rounded-3xl border border-white/70 bg-white/85 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.32)] ring-1 ring-slate-900/10 overflow-hidden"
          >
            {/* Header kính mờ */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-amber-500/92 via-orange-500/92 to-rose-500/90 text-white backdrop-blur-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold truncate">Trợ lý Thao tác Trang</h2>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-white/20 border border-white/25">
                      Gemini
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 truncate">{liveStatus}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Cấp quyền Google Gemini & Ưu đãi Workspace"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer border ${
                    authConfig?.apiKey
                      ? 'bg-emerald-500/35 border-emerald-200/70 text-white hover:bg-emerald-500/45'
                      : 'bg-slate-900/25 border-white/40 text-white hover:bg-slate-900/35'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{authConfig?.apiKey ? 'Đã kết nối' : 'Cấp quyền'}</span>
                </button>

                {logs.length > 0 && !isRunning && (
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    title="Xóa lịch sử hội thoại"
                    className="p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Thu gọn trợ lý"
                  className="p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 text-sm text-slate-800">
              {!authConfig?.apiKey && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/85 backdrop-blur-sm p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">
                        Chưa cấp quyền Google Gemini
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Kết nối API Key Google Gemini (chuẩn OpenAI) để trợ lý tự động bấm nút, điền nội dung và điều hướng bằng tiếng Việt.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-2 px-3 shadow-sm transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Cấp quyền Gemini & Nhận ưu đãi 10%</span>
                  </button>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-600">
                    Gợi ý thao tác nhanh trên trang:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleRunCommand(prompt)}
                        className="text-left px-3 py-2 rounded-xl border border-slate-200/80 bg-white/75 hover:bg-amber-50/80 hover:border-amber-300 text-xs font-medium text-slate-700 transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{prompt}</span>
                        <Play className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl px-3 py-2 text-xs leading-relaxed border ${
                        item.kind === 'user'
                          ? 'bg-amber-600 text-white border-amber-600 ml-6'
                          : item.kind === 'success'
                            ? 'bg-emerald-50/90 text-emerald-950 border-emerald-200 mr-2'
                            : item.kind === 'error'
                              ? 'bg-rose-50/90 text-rose-900 border-rose-200 mr-2'
                              : item.kind === 'step'
                                ? 'bg-white/80 text-slate-600 border-slate-200/80 mr-4 flex items-center gap-2'
                                : 'bg-slate-100/90 text-slate-700 border-slate-200 mr-2'
                      }`}
                    >
                      {item.kind === 'step' && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="whitespace-pre-wrap">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {pendingQuestion && (
                <form
                  onSubmit={handleSubmitPendingAnswer}
                  className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3 space-y-2"
                >
                  <p className="text-xs font-bold text-amber-950">
                    Trợ lý cần xác nhận: {pendingQuestion.question}
                  </p>
                  <input
                    type="text"
                    value={questionAnswer}
                    onChange={(e) => setQuestionAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => pendingQuestion.reject(new Error('Người dùng hủy trả lời.'))}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      Gửi trả lời
                    </button>
                  </div>
                </form>
              )}

              <div ref={logEndRef} />
            </div>

            {/* Thanh nhập lệnh thuần Việt */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRunCommand();
              }}
              className="p-3 border-t border-slate-200/70 bg-white/70 backdrop-blur-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  disabled={isRunning}
                  placeholder="Ra lệnh tiếng Việt (vd: Mở Bảng Vẽ...)"
                  className="flex-1 min-w-0 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                />
                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleStopAgent}
                    className="inline-flex items-center gap-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!commandInput.trim()}
                    className="inline-flex items-center gap-1 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-2 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Chạy</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Ưu đãi Google Workspace -10%</span>
                </button>
                <span>{authConfig?.model ?? 'gemini-2.0-flash'}</span>
              </div>
            </form>
          </section>
        )}

        {/* Nút nổi góc màn hình */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Mở Trợ lý AI thao tác trang"
          className="group inline-flex items-center gap-2 rounded-full border border-white/70 bg-slate-900/90 hover:bg-slate-900 text-white px-4 py-2.5 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                isRunning
                  ? 'bg-sky-400'
                  : authConfig?.apiKey
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning
                  ? 'bg-sky-400'
                  : authConfig?.apiKey
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
              }`}
            />
          </span>
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span className="text-xs font-bold tracking-tight">Trợ lý thao tác AI</span>
        </button>
      </div>

      {/* Modal Cấp quyền Gemini & Tiếp thị liên kết Google Workspace */}
      {isAuthModalOpen && (
        <div
          ref={modalRootRef}
          data-browser-use-ignore="true"
          data-page-agent-not-interactive="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="page-agent-auth-title"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/70 bg-white/94 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 space-y-5 text-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="page-agent-auth-title" className="text-base font-extrabold text-slate-900">
                    Cấp quyền Google Gemini & Ưu đãi Workspace
                  </h3>
                  <p className="text-xs text-slate-600">
                    Kết nối động cơ AI thao tác trang qua chuẩn OpenAI-compatible của Google Gemini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Đóng hộp thoại"
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khu vực 1: Kết nối Google Gemini */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  1. Cấu hình động cơ Google Gemini
                </span>
                <span className="text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600">
                  {GEMINI_OPENAI_ENDPOINT}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GEMINI_MODEL_OPTIONS.map((option) => {
                  const active = selectedModel === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedModel(option.id as GeminiModelId)}
                      className={`text-left rounded-xl border p-2.5 transition cursor-pointer ${
                        active
                          ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{option.label}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{option.description}</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Khóa API Google Gemini (lưu cục bộ trên trình duyệt)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Dán Gemini API Key (AIza...)"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-3 pr-9 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((prev) => !prev)}
                      aria-label={showApiKey ? 'Ẩn khóa API' : 'Hiện khóa API'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {authFeedback && (
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-medium border ${
                    authFeedback.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {authFeedback.text}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isVerifyingKey}
                  onClick={handleVerifyAndSave}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 shadow-sm transition cursor-pointer"
                >
                  {isVerifyingKey ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Kiểm tra & Cấp quyền</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickSave}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-2 transition cursor-pointer"
                >
                  <span>Lưu nhanh</span>
                </button>

                {authConfig?.apiKey && (
                  <button
                    type="button"
                    onClick={handleRevokeKey}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-2 transition cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Thu hồi khóa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Khu vực 2: Tiếp thị liên kết Google Workspace chính thức */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-sky-50/80 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span>2. {GOOGLE_WORKSPACE_AFFILIATE.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {GOOGLE_WORKSPACE_AFFILIATE.subtitle}
                  </p>
                </div>

                <a
                  href={GOOGLE_WORKSPACE_AFFILIATE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 shadow-sm transition"
                >
                  <span>Đăng ký nhận ưu đãi 10%</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-2">
                {GOOGLE_WORKSPACE_AFFILIATE.plans.map((plan) => {
                  const isCopied = copiedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900">
                          {plan.name}{' '}
                          <span className="font-medium text-slate-500">({plan.englishName})</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          {plan.highlight}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <code className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 tracking-wide">
                          {plan.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => void handleCopyCode(plan.id, plan.code)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-600">
                Liên kết đối tác chính thức:{' '}
                <a
                  href={GOOGLE_WORKSPACE_AFFILIATE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 underline break-all"
                >
                  {GOOGLE_WORKSPACE_AFFILIATE.url}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
