import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Play,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import {
  activateProSubscription,
  buildPageAgentSystemInstructions,
  buildProQuickPayPayload,
  clearGeminiAuthConfig,
  evaluateCopilotExecutionAccess,
  FREE_TRIAL_MAX_RUNS,
  GEMINI_MODEL_OPTIONS,
  GEMINI_OPENAI_ENDPOINT,
  generateProOrderCode,
  getRemainingFreeRuns,
  GOOGLE_WORKSPACE_AFFILIATE,
  loadCopilotSubscription,
  loadGeminiAuthConfig,
  normalizeOpenAiEndpoint,
  PRO_SUBSCRIPTION_PLANS,
  PRO_SUPPORT_CONTACT,
  recordFreeRunUsage,
  resetCopilotToFree,
  saveGeminiAuthConfig,
  transformGeminiRequestBody,
  verifyGeminiApiKey,
  verifyProActivationCode,
} from '../../lib/page-agent/geminiConfig.js';

type GeminiModelId = 'gemini-2.0-flash' | 'gemini-1.5-flash';
type ProBillingCycle = 'monthly' | 'yearly';

interface GeminiAuthConfig {
  apiKey: string;
  model: GeminiModelId;
  endpoint: string;
  verifiedAt?: string;
}

interface CopilotSubscriptionState {
  tier: 'free' | 'pro';
  billingCycle: ProBillingCycle | null;
  freeRunsUsed: number;
  proActivatedAt?: string;
  proExpiresAt?: string;
  activationMethod?: 'qr_instant' | 'activation_code';
  orderCode?: string;
}

interface CopilotLogItem {
  id: string;
  kind: 'user' | 'step' | 'success' | 'error' | 'info' | 'upsell';
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
  proPrompts?: string[];
}

const DEFAULT_QUICK_PROMPTS = [
  'Mở Bảng Vẽ để thị phạm từng bước',
  'Chuyển sang tab Soạn Bài & Trình Chiếu',
  'Mở Tổng Quan Kho Học Liệu',
  'Mở mục Đánh Giá Học Sinh SMAS',
];

const DEFAULT_PRO_PROMPTS = [
  'Tự động điền biểu mẫu nhận xét đánh giá SMAS hàng loạt (Pro)',
  'Xử lý dữ liệu kế hoạch bài dạy & xuất báo cáo chuyên sâu (Pro)',
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

function buildQrSvgData(text: string): { size: number; path: string } {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const { size, data } = qr.modules;
  const parts: string[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (data[y * size + x]) {
        parts.push(`M${x} ${y}h1v1h-1z`);
      }
    }
  }
  return { size, path: parts.join('') };
}

function tryBasicSampleNavigation(commandText: string): { matched: boolean; label?: string } {
  if (typeof document === 'undefined') return { matched: false };
  const normalizedCmd = commandText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const keywords = [
    { match: ['bang ve', 'thi pham'], targets: ['bang ve'] },
    { match: ['soan bai', 'trinh chieu'], targets: ['soan bai', 'trinh chieu'] },
    { match: ['tong quan', 'hoc lieu'], targets: ['tong quan', 'kho hoc lieu'] },
    { match: ['smas', 'danh gia'], targets: ['smas', 'danh gia'] },
    { match: ['tro choi'], targets: ['tro choi'] },
  ];

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('a, button, [role="tab"], [role="button"]'),
  ).filter((el) => {
    if (el.closest('[data-page-agent-not-interactive="true"]')) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  for (const rule of keywords) {
    if (rule.match.some((kw) => normalizedCmd.includes(kw))) {
      for (const el of candidates) {
        const text = (el.textContent || el.getAttribute('aria-label') || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (rule.targets.some((t) => text.includes(t))) {
          el.click();
          return {
            matched: true,
            label: (el.textContent || el.getAttribute('aria-label') || 'Mục đã chọn').trim(),
          };
        }
      }
    }
  }

  return { matched: false };
}

export default function PageAgentCopilot({
  appName = 'Cọ Nhí Studio',
  appContext = 'Phần mềm dạy học Mĩ thuật & STEAM tiểu học gồm Tổng quan học liệu, Soạn bài giảng trình chiếu, Bảng vẽ 4 bước, Trò chơi nghệ thuật, Chấm bài bằng Camera và Đánh giá SMAS.',
  quickPrompts = DEFAULT_QUICK_PROMPTS,
  proPrompts = DEFAULT_PRO_PROMPTS,
}: PageAgentCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const [authConfig, setAuthConfig] = useState<GeminiAuthConfig | null>(
    () => loadGeminiAuthConfig() as GeminiAuthConfig | null,
  );
  const [subscription, setSubscription] = useState<CopilotSubscriptionState>(
    () => loadCopilotSubscription() as CopilotSubscriptionState,
  );

  const [apiKeyInput, setApiKeyInput] = useState(() => loadGeminiAuthConfig()?.apiKey ?? '');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(
    () => (loadGeminiAuthConfig()?.model as GeminiModelId | undefined) ?? 'gemini-2.0-flash',
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const [selectedProCycle, setSelectedProCycle] = useState<ProBillingCycle>('yearly');
  const [proOrderCode, setProOrderCode] = useState<string>(() => generateProOrderCode('PRO'));
  const [proActivationCodeInput, setProActivationCodeInput] = useState('');
  const [proModalFeedback, setProModalFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [isActivatingPro, setIsActivatingPro] = useState(false);
  const [copiedOrderInfo, setCopiedOrderInfo] = useState(false);

  const [commandInput, setCommandInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Sẵn sàng hỗ trợ');
  const [logs, setLogs] = useState<CopilotLogItem[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState('');

  const widgetRootRef = useRef<HTMLDivElement | null>(null);
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const proModalRootRef = useRef<HTMLDivElement | null>(null);
  const agentRef = useRef<{ stop: () => Promise<void>; dispose: () => void } | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

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

  const isPro = subscription.tier === 'pro';
  const remainingFreeRuns = getRemainingFreeRuns(subscription);

  const viteEnv =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

  const quickPayPayload = useMemo(
    () =>
      buildProQuickPayPayload({
        planId: selectedProCycle,
        orderCode: proOrderCode,
        vietQrEnv: {
          bankBin: viteEnv.VITE_VIETQR_BANK_BIN,
          bankName: viteEnv.VITE_VIETQR_BANK_NAME,
          accountNo: viteEnv.VITE_VIETQR_ACCOUNT_NO,
          accountName: viteEnv.VITE_VIETQR_ACCOUNT_NAME,
          template: viteEnv.VITE_VIETQR_TEMPLATE,
        },
      }),
    [
      selectedProCycle,
      proOrderCode,
      viteEnv.VITE_VIETQR_BANK_BIN,
      viteEnv.VITE_VIETQR_BANK_NAME,
      viteEnv.VITE_VIETQR_ACCOUNT_NO,
      viteEnv.VITE_VIETQR_ACCOUNT_NAME,
      viteEnv.VITE_VIETQR_TEMPLATE,
    ],
  );

  const qrSvg = useMemo(() => buildQrSvgData(quickPayPayload.qrText), [quickPayPayload.qrText]);

  const activeProPlan = useMemo(
    () =>
      PRO_SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedProCycle) ??
      PRO_SUBSCRIPTION_PLANS[1],
    [selectedProCycle],
  );

  const pushLog = useCallback((item: Omit<CopilotLogItem, 'id'>) => {
    setLogs((prev) => [
      ...prev.slice(-30),
      { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }, []);

  const handleOpenProModal = useCallback(() => {
    setProModalFeedback(null);
    setProOrderCode(generateProOrderCode('PRO'));
    setIsProModalOpen(true);
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

  const handleCopyOrderSummary = async () => {
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(activeProPlan.priceVnd) + 'đ';
    const text = `Nâng cấp Trợ lý AI Pro (${appName}) | ${activeProPlan.name} (${formattedPrice}) | Mã đơn: ${proOrderCode}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedOrderInfo(true);
      setTimeout(() => setCopiedOrderInfo(false), 2200);
    } catch {
      setProModalFeedback({
        ok: true,
        text: `Thông tin đơn của bạn: ${text}`,
      });
    }
  };

  const handleInstantQrActivation = () => {
    setIsActivatingPro(true);
    setProModalFeedback(null);
    setTimeout(() => {
      const upgraded = activateProSubscription({
        billingCycle: selectedProCycle,
        method: 'qr_instant',
        orderCode: proOrderCode,
        currentRunsUsed: subscription.freeRunsUsed,
      }) as CopilotSubscriptionState;
      setSubscription(upgraded);
      setIsActivatingPro(false);
      setLiveStatus('Pro · Không giới hạn');
      setProModalFeedback({
        ok: true,
        text: `Kích hoạt thành công ${activeProPlan.name} (mã đơn ${proOrderCode})! Toàn bộ tính năng Trợ lý AI Pro đã sẵn sàng.`,
      });
      pushLog({
        kind: 'success',
        text: `Đã nâng cấp ${activeProPlan.name} thành công! Mở khóa không giới hạn lượt, điền biểu mẫu & xử lý dữ liệu thông minh.`,
      });
    }, 650);
  };

  const handleActivateByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const check = verifyProActivationCode(proActivationCodeInput);
    if (!check.ok) {
      setProModalFeedback({ ok: false, text: check.message });
      return;
    }
    const upgraded = activateProSubscription({
      billingCycle: check.billingCycle,
      method: 'activation_code',
      orderCode: proActivationCodeInput.trim().toUpperCase(),
      currentRunsUsed: subscription.freeRunsUsed,
    }) as CopilotSubscriptionState;
    setSubscription(upgraded);
    setProActivationCodeInput('');
    setLiveStatus('Pro · Không giới hạn');
    setProModalFeedback({ ok: true, text: check.message });
    pushLog({
      kind: 'success',
      text: check.message,
    });
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

    const latestSub = loadCopilotSubscription() as CopilotSubscriptionState;
    setSubscription(latestSub);
    const accessCheck = evaluateCopilotExecutionAccess(latestSub, taskText);

    if (!accessCheck.allowed) {
      pushLog({ kind: 'user', text: taskText });
      pushLog({
        kind: 'upsell',
        text:
          accessCheck.message ||
          'Nâng cấp gói Pro để mở khóa không giới hạn Trợ lý AI.',
      });
      setLiveStatus(
        accessCheck.reason === 'quota_exhausted'
          ? 'Đã hết 5/5 lượt Cơ bản'
          : 'Tính năng dành cho gói Pro',
      );
      return;
    }

    const currentAuth = (loadGeminiAuthConfig() as GeminiAuthConfig | null) ?? authConfig;
    if (!currentAuth?.apiKey) {
      const sampleNav = tryBasicSampleNavigation(taskText);
      if (sampleNav.matched) {
        if (!rawCommand) setCommandInput('');
        const updatedSub = recordFreeRunUsage(latestSub) as CopilotSubscriptionState;
        setSubscription(updatedSub);
        const left = getRemainingFreeRuns(updatedSub);
        pushLog({ kind: 'user', text: taskText });
        pushLog({
          kind: 'success',
          text:
            updatedSub.tier === 'pro'
              ? `Đã thực thi nhanh thao tác "${sampleNav.label}". (Mẹo: Gắn thêm Gemini API Key để bật điều khiển AI đa bước thông minh).`
              : `Đã thực thi lệnh mẫu cơ bản: mở "${sampleNav.label}" (Còn ${left}/${FREE_TRIAL_MAX_RUNS} lượt trải nghiệm miễn phí).`,
        });
        setLiveStatus(
          updatedSub.tier === 'pro'
            ? 'Pro · Đã mở mục yêu cầu'
            : `Cơ bản · Còn ${left}/${FREE_TRIAL_MAX_RUNS} lượt`,
        );
        return;
      }

      setIsAuthModalOpen(true);
      setAuthFeedback({
        ok: false,
        text: 'Vui lòng cấp quyền khóa API Google Gemini (hoặc đăng nhập Cọ Nhí Studio) để trợ lý thao tác lệnh tùy chỉnh trên trang.',
      });
      return;
    }

    if (!rawCommand) {
      setCommandInput('');
    }

    setIsRunning(true);
    setLiveStatus(
      accessCheck.tier === 'pro'
        ? `Pro · Đang khởi chạy ${currentAuth.model}...`
        : 'Đang khởi tạo Trợ lý AI...',
    );
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
      if (proModalRootRef.current) {
        const proModalEl = proModalRootRef.current;
        blacklist.push(() => proModalEl);
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
        maxSteps: accessCheck.maxSteps,
        stepDelay: accessCheck.tier === 'pro' ? 0.25 : 0.35,
        transformRequestBody: (body) => transformGeminiRequestBody(body),
        instructions: {
          system: buildPageAgentSystemInstructions(appName, appContext, accessCheck.tier),
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

      const updatedSub = (
        accessCheck.tier === 'free' ? recordFreeRunUsage(latestSub) : latestSub
      ) as CopilotSubscriptionState;
      setSubscription(updatedSub);

      if (result.success) {
        const left = getRemainingFreeRuns(updatedSub);
        setLiveStatus(
          updatedSub.tier === 'pro'
            ? 'Pro · Đã hoàn tất'
            : `Đã hoàn tất · Còn ${left}/${FREE_TRIAL_MAX_RUNS} lượt`,
        );
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
            className="w-[380px] max-w-[calc(100vw-2rem)] max-h-[78vh] flex flex-col rounded-3xl border border-white/75 bg-white/88 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.32)] ring-1 ring-slate-900/10 overflow-hidden"
          >
            {/* Header kính mờ */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-amber-500/95 via-orange-500/95 to-rose-500/95 text-white backdrop-blur-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                  {isPro ? (
                    <Crown className="w-5 h-5 text-amber-200" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold truncate">Trợ lý Thao tác Trang</h2>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        isPro
                          ? 'bg-slate-900/35 border-amber-200/80 text-amber-100'
                          : 'bg-white/20 border-white/25 text-white'
                      }`}
                    >
                      {isPro ? 'PRO' : 'Cơ bản'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/95 truncate">
                    {isPro
                      ? `Không giới hạn · ${liveStatus}`
                      : `Còn ${remainingFreeRuns}/${FREE_TRIAL_MAX_RUNS} lượt thử · ${liveStatus}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenProModal}
                  title={isPro ? 'Thông tin gói Trợ lý AI Pro' : 'Nâng cấp gói Pro không giới hạn'}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                    isPro
                      ? 'bg-slate-900/30 border-amber-200/70 text-amber-100 hover:bg-slate-900/45'
                      : 'bg-white text-orange-700 border-white hover:bg-amber-50 shadow-sm'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isPro ? 'Gói Pro' : 'Nâng cấp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Cấp quyền Google Gemini & Ưu đãi Workspace"
                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer border ${
                    authConfig?.apiKey
                      ? 'bg-emerald-500/35 border-emerald-200/70 text-white hover:bg-emerald-500/45'
                      : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {authConfig?.apiKey ? 'Gemini OK' : 'Cấp quyền'}
                  </span>
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
              {!isPro && remainingFreeRuns <= 2 && (
                <div className="rounded-2xl border border-orange-200/90 bg-gradient-to-r from-amber-50/90 to-orange-50/90 p-3 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">
                      {remainingFreeRuns === 0
                        ? 'Bạn đã hoàn tất 5/5 lượt trải nghiệm cơ bản'
                        : `Còn ${remainingFreeRuns}/${FREE_TRIAL_MAX_RUNS} lượt trải nghiệm miễn phí`}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Nâng cấp Pro để chạy không giới hạn & tự động điền biểu mẫu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenProModal}
                    className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-2.5 py-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Crown className="w-3 h-3 text-amber-200" />
                    <span>Mở Pro</span>
                  </button>
                </div>
              )}

              {!authConfig?.apiKey && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/85 backdrop-blur-sm p-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        {isPro
                          ? 'Gắn Gemini API Key để chạy toàn lực AI Pro'
                          : 'Chế độ Cơ bản sẵn sàng 5 lượt mẫu'}
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Bạn có thể thử ngay các lệnh mẫu bên dưới, hoặc cấp quyền Google Gemini API Key để AI tự động suy luận & điền biểu mẫu thật.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-1.5 px-3 shadow-sm transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Cấp quyền Gemini & Nhận ưu đãi 10%</span>
                  </button>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600">
                      Lệnh thao tác mẫu (Cơ bản — 5 lượt thử):
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          disabled={isRunning}
                          onClick={() => void handleRunCommand(prompt)}
                          className="text-left px-3 py-2 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-amber-50/80 hover:border-amber-300 text-xs font-medium text-slate-700 transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span>{prompt}</span>
                          <Play className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Tác vụ chuyên sâu (Gói Pro):</span>
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {proPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          disabled={isRunning}
                          onClick={() => void handleRunCommand(prompt)}
                          className="text-left px-3 py-2 rounded-xl border border-amber-200/80 bg-amber-50/60 hover:bg-amber-100/70 text-xs font-medium text-slate-800 transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span>{prompt}</span>
                          {isPro ? (
                            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl px-3 py-2 text-xs leading-relaxed border ${
                        item.kind === 'user'
                          ? 'bg-orange-600 text-white border-orange-600 ml-6'
                          : item.kind === 'success'
                            ? 'bg-emerald-50/90 text-emerald-950 border-emerald-200 mr-2'
                            : item.kind === 'error'
                              ? 'bg-rose-50/90 text-rose-900 border-rose-200 mr-2'
                              : item.kind === 'upsell'
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 text-slate-800 border-amber-200 mr-1 space-y-2'
                                : item.kind === 'step'
                                  ? 'bg-white/80 text-slate-600 border-slate-200/80 mr-4 flex items-center gap-2'
                                  : 'bg-slate-100/90 text-slate-700 border-slate-200 mr-2'
                      }`}
                    >
                      {item.kind === 'step' && (
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      )}
                      <span className="whitespace-pre-wrap block">{item.text}</span>
                      {item.kind === 'upsell' && (
                        <button
                          type="button"
                          onClick={handleOpenProModal}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:brightness-110 text-white font-bold text-xs px-3 py-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-200" />
                          <span>Xem Gói Pro & Nâng Cấp Ngay</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pendingQuestion && (
                <form
                  onSubmit={handleSubmitPendingAnswer}
                  className="rounded-2xl border border-orange-200 bg-orange-50/90 p-3 space-y-2"
                >
                  <p className="text-xs font-bold text-orange-950">
                    Trợ lý cần xác nhận: {pendingQuestion.question}
                  </p>
                  <input
                    type="text"
                    value={questionAnswer}
                    onChange={(e) => setQuestionAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-400"
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
                      className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-xs font-semibold text-white cursor-pointer"
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
              className="p-3 border-t border-slate-200/70 bg-white/75 backdrop-blur-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  disabled={isRunning}
                  placeholder={
                    isPro
                      ? 'Ra lệnh AI Pro (điền SMAS, xử lý giáo án...)'
                      : 'Ra lệnh tiếng Việt (vd: Mở Bảng Vẽ...)'
                  }
                  className="flex-1 min-w-0 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
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
                    className="inline-flex items-center gap-1 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-2 shadow-sm transition cursor-pointer shrink-0"
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
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Ưu đãi Google Workspace -10%</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenProModal}
                  className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-semibold cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>{isPro ? 'Pro · Không giới hạn' : 'Nâng cấp Pro'}</span>
                </button>
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
                  : isPro
                    ? 'bg-amber-400'
                    : authConfig?.apiKey
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning
                  ? 'bg-sky-400'
                  : isPro
                    ? 'bg-amber-400'
                    : authConfig?.apiKey
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
              }`}
            />
          </span>
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
          ) : isPro ? (
            <Crown className="w-4 h-4 text-amber-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span className="text-xs font-bold tracking-tight">Trợ lý AI</span>
          {isPro && (
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] font-black">
              PRO
            </span>
          )}
        </button>
      </div>

      {/* Modal Nâng Cấp Gói Pro (Glassmorphism Luxury) */}
      {isProModalOpen && (
        <div
          ref={proModalRootRef}
          data-browser-use-ignore="true"
          data-page-agent-not-interactive="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="page-agent-pro-title"
          className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md"
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/75 bg-white/90 backdrop-blur-2xl shadow-[0_32px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-orange-500/15 p-5 sm:p-6 space-y-5 text-slate-900">
            {/* Header Modal Pro */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="page-agent-pro-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                      Nâng Cấp Trợ Lý AI Pro
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        isPro
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isPro
                        ? `Đang kích hoạt (${subscription.billingCycle === 'monthly' ? 'Gói Tháng' : 'Gói Năm'})`
                        : `Đang dùng Cơ bản (${remainingFreeRuns}/${FREE_TRIAL_MAX_RUNS} lượt)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mở khóa tốc độ cao Gemini 2.0/1.5 Flash, tự động điền biểu mẫu, xử lý dữ liệu thông minh và không giới hạn lượt thực thi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProModalOpen(false)}
                aria-label="Đóng hộp thoại nâng cấp Pro"
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Chọn Gói Cước Pro (Gói Tháng / Gói Năm ưu đãi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_SUBSCRIPTION_PLANS.map((plan) => {
                const selected = selectedProCycle === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedProCycle(plan.id as ProBillingCycle);
                      setProModalFeedback(null);
                    }}
                    className={`relative text-left rounded-2xl border p-4 transition cursor-pointer ${
                      selected
                        ? 'border-orange-600 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 ring-2 ring-orange-500/25 shadow-md'
                        : 'border-slate-200 bg-white/80 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{plan.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.highlight
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-orange-700">{plan.priceLabel}</span>
                      <span className="text-xs font-semibold text-slate-500">{plan.periodLabel}</span>
                    </div>
                    {plan.equivalentLabel && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                        {plan.equivalentLabel}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1.5">{plan.description}</p>

                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* 2. Thanh toán QR nhanh & Kích hoạt tự động / Nhập mã */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/85 p-4">
              {/* Cột trái: Mã QR Thanh Toán Nhanh */}
              <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-center space-y-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-700">
                    <QrCode className="w-4 h-4" />
                    <span>
                      {quickPayPayload.mode === 'vietqr'
                        ? 'Quét mã VietQR Thanh Toán Nhanh'
                        : 'Quét mã QR Kích Hoạt Nhanh (Zalo Admin)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {activeProPlan.name} ·{' '}
                    <strong className="text-slate-800">{activeProPlan.priceLabel}</strong>
                  </p>
                </div>

                <div className="w-40 h-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-inner flex items-center justify-center">
                  {quickPayPayload.mode === 'vietqr' && quickPayPayload.qrImageUrl ? (
                    <img
                      src={quickPayPayload.qrImageUrl}
                      alt={`Mã VietQR thanh toán ${activeProPlan.name}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <svg
                      viewBox={`-2 -2 ${qrSvg.size + 4} ${qrSvg.size + 4}`}
                      role="img"
                      aria-label={`Mã QR thanh toán nhanh đơn ${proOrderCode}`}
                      className="w-full h-full"
                    >
                      <rect
                        x={-2}
                        y={-2}
                        width={qrSvg.size + 4}
                        height={qrSvg.size + 4}
                        fill="#ffffff"
                      />
                      <path d={qrSvg.path} fill="#0f172a" />
                    </svg>
                  )}
                </div>

                {quickPayPayload.bankInfo ? (
                  <div className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-left text-[11px] space-y-1">
                    <div>
                      Ngân hàng: <strong>{quickPayPayload.bankInfo.bankName}</strong>
                    </div>
                    <div>
                      STK: <strong className="font-mono">{quickPayPayload.bankInfo.accountNo}</strong>
                    </div>
                    <div>
                      Nội dung: <strong className="font-mono text-orange-700">{proOrderCode}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <div className="rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2 text-[11px] text-slate-700">
                      Mã đơn hàng: <strong className="font-mono text-orange-700">{proOrderCode}</strong>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={PRO_SUPPORT_CONTACT.zaloUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-2.5 py-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Zalo {PRO_SUPPORT_CONTACT.zaloDisplay}</span>
                      </a>
                      <a
                        href={`mailto:${PRO_SUPPORT_CONTACT.email}?subject=${encodeURIComponent(`Kích hoạt Trợ lý AI Pro - ${proOrderCode}`)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold px-2.5 py-1.5 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Admin</span>
                      </a>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void handleCopyOrderSummary()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-700 hover:text-orange-800 cursor-pointer"
                >
                  {copiedOrderInfo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép thông tin đơn</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép nội dung đơn hàng</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cột phải: Kích hoạt tự động tức thì + Nhập mã Pro */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Kích hoạt tự động tức thì</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sau khi hoàn tất quét mã thanh toán cho đơn{' '}
                    <strong className="font-mono text-slate-800">{proOrderCode}</strong>, bấm nút bên dưới để hệ thống xác nhận và mở khóa Pro ngay lập tức.
                  </p>
                  <button
                    type="button"
                    disabled={isActivatingPro}
                    onClick={handleInstantQrActivation}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-60 text-white text-xs font-extrabold py-2.5 px-3 shadow-sm transition cursor-pointer"
                  >
                    {isActivatingPro ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xác nhận & mở khóa Pro...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác nhận đã thanh toán · Kích hoạt Pro</span>
                      </>
                    )}
                  </button>
                </div>

                <form
                  onSubmit={handleActivateByCode}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <KeyRound className="w-4 h-4 text-orange-600" />
                    <span>Hoặc nhập mã kích hoạt Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proActivationCodeInput}
                      onChange={(e) => setProActivationCodeInput(e.target.value)}
                      placeholder="Nhập mã kích hoạt (VD: PRO-...)"
                      className="flex-1 min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 transition cursor-pointer"
                    >
                      Kích hoạt
                    </button>
                  </div>
                </form>

                {proModalFeedback && (
                  <div
                    className={`rounded-xl px-3 py-2 text-xs font-medium border ${
                      proModalFeedback.ok
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {proModalFeedback.text}
                  </div>
                )}

                {isPro && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Đang ở chế độ Trợ lý AI Pro</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubscription(resetCopilotToFree() as CopilotSubscriptionState);
                        setProModalFeedback({
                          ok: true,
                          text: 'Đã chuyển về chế độ Cơ bản (5 lượt thử) để xem thử.',
                        });
                      }}
                      className="underline hover:text-slate-800 cursor-pointer"
                    >
                      Chuyển về Cơ bản (xem thử)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Giữ nguyên Banner Ưu đãi Thành viên Pro Google Workspace (-10%) */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-sky-50/80 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span>Đặc quyền Thành viên Pro · {GOOGLE_WORKSPACE_AFFILIATE.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">{GOOGLE_WORKSPACE_AFFILIATE.subtitle}</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {GOOGLE_WORKSPACE_AFFILIATE.plans.map((plan) => {
                  const isCopied = copiedPlanId === `pro-${plan.id}`;
                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-emerald-200/80 bg-white/90 p-2.5 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-slate-900">{plan.name}</div>
                      <div className="text-[11px] text-slate-500">{plan.englishName}</div>
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <code className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800">
                          {plan.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => void handleCopyCode(`pro-${plan.id}`, plan.code)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
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
                <span className="text-xs font-bold uppercase tracking-wide text-orange-700">
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
                          ? 'border-orange-500 bg-orange-50/90 ring-2 ring-orange-500/20'
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
                      className="w-full rounded-xl border border-slate-300 bg-white pl-3 pr-9 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 shadow-sm transition cursor-pointer"
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
                  <p className="text-xs text-slate-600">{GOOGLE_WORKSPACE_AFFILIATE.subtitle}</p>
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
