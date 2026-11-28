export const GEMINI_OPENAI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/';

export const GEMINI_MODEL_OPTIONS = [
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    description: 'Khuyên dùng · Phản hồi tốc độ cao và thao tác chính xác',
  },
  {
    id: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description: 'Ổn định · Phù hợp tác vụ nhẹ và tiết kiệm hạn mức',
  },
];

export const GOOGLE_WORKSPACE_AFFILIATE = {
  url: 'https://sharegoogleworkspace.advocate.impact.com/mzZOnzJ',
  title: 'Ưu đãi Google Workspace & Gemini AI',
  subtitle: 'Giảm ngay 10% chi phí năm đầu tiên qua liên kết đối tác chính thức',
  plans: [
    {
      id: 'starter',
      name: 'Gói Khởi nghiệp',
      englishName: 'Business Starter',
      code: 'JA7YJEWHXXGKRNR',
      highlight: 'Giảm 10% năm đầu',
    },
    {
      id: 'standard',
      name: 'Gói Tiêu chuẩn',
      englishName: 'Business Standard',
      code: 'H9EAXXKKTKHGA3C',
      highlight: 'Giảm 10% năm đầu',
    },
    {
      id: 'plus',
      name: 'Gói Nâng cao',
      englishName: 'Business Plus',
      code: 'H3CNTKW6D3KL74X',
      highlight: 'Giảm 10% năm đầu',
    },
  ],
};

export const FREE_TRIAL_MAX_RUNS = 5;

export const PRO_SUPPORT_CONTACT = {
  zalo: '0353205414',
  zaloDisplay: '0353 205 414',
  zaloUrl: 'https://zalo.me/0353205414',
  email: 'thaytiensy@gmail.com',
};

export const PRO_SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Gói Pro Tháng',
    badge: 'Linh hoạt hằng tháng',
    priceVnd: 199000,
    priceLabel: '199.000đ',
    periodLabel: '/ tháng',
    description: 'Mở khóa Trợ lý AI Pro không giới hạn lượt thực thi trong 30 ngày.',
    features: [
      'Không giới hạn lượt chạy lệnh Trợ lý AI',
      'Tốc độ cao với Gemini 2.0 Flash / 1.5 Flash',
      'Hỗ trợ tự động điền biểu mẫu & xử lý dữ liệu thông minh',
      'Kèm đặc quyền giảm 10% Google Workspace đối tác',
    ],
  },
  {
    id: 'yearly',
    name: 'Gói Pro Năm',
    badge: 'Ưu đãi tiết kiệm 25%',
    priceVnd: 1790000,
    priceLabel: '1.790.000đ',
    periodLabel: '/ năm',
    equivalentLabel: 'Chỉ ~149.000đ / tháng · Tiết kiệm 598.000đ',
    description: 'Trọn gói 12 tháng vận hành mượt mà, tối ưu chi phí cho công việc lâu dài.',
    highlight: true,
    features: [
      'Toàn bộ sức mạnh Gói Pro Tháng suốt 365 ngày',
      'Không giới hạn tác vụ đa bước & điền biểu mẫu phức tạp',
      'Ưu tiên cập nhật kịch bản tự động hóa chuyên sâu mới',
      'Hỗ trợ kỹ thuật ưu tiên 1-1 qua Zalo & Email',
    ],
  },
];

const STORAGE_KEY = 'bigman_page_agent_gemini_auth_v1';
const SAAS_TIER_STORAGE_KEY = 'bigman_page_agent_saas_tier_v1';

const PRO_LICENSE_SALT = 'bigman-pro-license-v1:';
const TRUSTED_OWNER_DIGESTS = [
  {
    salt: 'tochuc-nvai-owner-v1:',
    digest: '9159d424c3bb4a51899f7abff013d76585fd155f03860a987d7f394ba510f362',
  },
];

export function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

export function createChecksummedProCode(seedSegment) {
  const cleanSeed = String(seedSegment || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const body = cleanSeed.padEnd(4, 'X');
  const checksum = sha256Hex(`${PRO_LICENSE_SALT}${body}`).slice(0, 4).toUpperCase();
  return `PRO-${body}-${checksum}`;
}

export function verifyProActivationCode(rawInput) {
  const normalized = String(rawInput || '').trim().toUpperCase();
  if (normalized.length < 6) {
    return {
      ok: false,
      billingCycle: 'yearly',
      message: 'Mã kích hoạt Pro không hợp lệ. Vui lòng kiểm tra lại mã gồm ít nhất 6 ký tự.',
    };
  }

  for (const entry of TRUSTED_OWNER_DIGESTS) {
    if (sha256Hex(`${entry.salt}${normalized}`) === entry.digest) {
      return {
        ok: true,
        billingCycle: 'yearly',
        message: 'Xác nhận mã Chủ sở hữu thành công! Đã mở khóa toàn bộ Trợ lý AI Pro.',
      };
    }
  }

  const licenseMatch = /^PRO-([A-Z0-9]{4,6})-([A-F0-9]{4})$/.exec(normalized);
  if (licenseMatch) {
    const [, body, providedChecksum] = licenseMatch;
    const expectedChecksum = sha256Hex(`${PRO_LICENSE_SALT}${body}`).slice(0, 4).toUpperCase();
    if (providedChecksum === expectedChecksum) {
      const billingCycle = body.startsWith('M') ? 'monthly' : 'yearly';
      return {
        ok: true,
        billingCycle,
        message: 'Kích hoạt mã Pro thành công! Trợ lý AI Pro đã mở khóa không giới hạn lượt.',
      };
    }
  }

  return {
    ok: false,
    billingCycle: 'yearly',
    message: 'Mã kích hoạt Pro chưa đúng hoặc không khớp chữ ký hợp lệ. Vui lòng kiểm tra lại.',
  };
}

export function defaultCopilotSubscription() {
  return {
    tier: 'free',
    billingCycle: null,
    freeRunsUsed: 0,
  };
}

export function loadCopilotSubscription() {
  if (typeof window === 'undefined') return defaultCopilotSubscription();
  try {
    const raw = window.localStorage.getItem(SAAS_TIER_STORAGE_KEY);
    if (!raw) return defaultCopilotSubscription();
    const parsed = JSON.parse(raw);
    const tier = parsed?.tier === 'pro' ? 'pro' : 'free';
    const billingCycle =
      parsed?.billingCycle === 'monthly' || parsed?.billingCycle === 'yearly'
        ? parsed.billingCycle
        : null;
    const freeRunsUsed =
      typeof parsed?.freeRunsUsed === 'number' && Number.isFinite(parsed.freeRunsUsed)
        ? Math.max(0, Math.min(FREE_TRIAL_MAX_RUNS, Math.floor(parsed.freeRunsUsed)))
        : 0;
    return {
      tier,
      billingCycle,
      freeRunsUsed,
      proActivatedAt: typeof parsed?.proActivatedAt === 'string' ? parsed.proActivatedAt : undefined,
      proExpiresAt: typeof parsed?.proExpiresAt === 'string' ? parsed.proExpiresAt : undefined,
      activationMethod:
        parsed?.activationMethod === 'qr_instant' || parsed?.activationMethod === 'activation_code'
          ? parsed.activationMethod
          : undefined,
      orderCode: typeof parsed?.orderCode === 'string' ? parsed.orderCode : undefined,
    };
  } catch {
    return defaultCopilotSubscription();
  }
}

export function saveCopilotSubscription(state) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SAAS_TIER_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Bỏ qua nếu bộ nhớ trình duyệt bị chặn
    }
  }
  return state;
}

export function getRemainingFreeRuns(state) {
  if (state?.tier === 'pro') return Number.POSITIVE_INFINITY;
  return Math.max(0, FREE_TRIAL_MAX_RUNS - (state?.freeRunsUsed || 0));
}

export function recordFreeRunUsage(state) {
  if (state?.tier === 'pro') return state;
  const nextState = {
    ...state,
    tier: 'free',
    freeRunsUsed: Math.min(FREE_TRIAL_MAX_RUNS, (state?.freeRunsUsed || 0) + 1),
  };
  return saveCopilotSubscription(nextState);
}

export function activateProSubscription(params) {
  const now = new Date();
  const billingCycle = params?.billingCycle === 'monthly' ? 'monthly' : 'yearly';
  const days = billingCycle === 'yearly' ? 365 : 30;
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const nextState = {
    tier: 'pro',
    billingCycle,
    freeRunsUsed: params?.currentRunsUsed ?? 0,
    proActivatedAt: now.toISOString(),
    proExpiresAt: expiresAt.toISOString(),
    activationMethod: params?.method || 'qr_instant',
    orderCode: params?.orderCode,
  };
  return saveCopilotSubscription(nextState);
}

export function resetCopilotToFree() {
  return saveCopilotSubscription(defaultCopilotSubscription());
}

const ADVANCED_TASK_PATTERNS = [
  /hàng\s*loạt|hang\s*loat/i,
  /điền\s*biểu\s*mẫu|dien\s*bieu\s*mau|tự\s*động\s*điền|tu\s*dong\s*dien/i,
  /xử\s*lý\s*dữ\s*liệu|xu\s*ly\s*du\s*lieu|phân\s*tích\s*dữ\s*liệu|phan\s*tich\s*du\s*lieu/i,
  /xuất\s*báo\s*cáo|xuat\s*bao\s*cao/i,
  /toàn\s*bộ\s*quy\s*trình|toan\s*bo\s*quy\s*trinh|đa\s*bước|da\s*buoc/i,
  /chuyên\s*sâu|chuyen\s*sau/i,
];

export function isAdvancedCopilotTask(commandText) {
  const trimmed = String(commandText || '').trim();
  if (!trimmed) return false;
  return ADVANCED_TASK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function evaluateCopilotExecutionAccess(state, commandText) {
  if (state?.tier === 'pro') {
    return {
      allowed: true,
      tier: 'pro',
      remainingRuns: Number.POSITIVE_INFINITY,
      maxSteps: 24,
    };
  }

  const remainingRuns = getRemainingFreeRuns(state);

  if (isAdvancedCopilotTask(commandText)) {
    return {
      allowed: false,
      tier: 'free',
      reason: 'pro_feature_required',
      remainingRuns,
      maxSteps: 10,
      message:
        'Tác vụ điền biểu mẫu & xử lý dữ liệu chuyên sâu thuộc gói Trợ lý AI Pro. Bạn có thể nâng cấp Pro để mở khóa không giới hạn!',
    };
  }

  if (remainingRuns <= 0) {
    return {
      allowed: false,
      tier: 'free',
      reason: 'quota_exhausted',
      remainingRuns: 0,
      maxSteps: 10,
      message:
        'Bạn đã sử dụng hết 5/5 lượt trải nghiệm Trợ lý AI Cơ bản. Nâng cấp gói Pro để thao tác không giới hạn lượt và tốc độ cao!',
    };
  }

  return {
    allowed: true,
    tier: 'free',
    remainingRuns,
    maxSteps: 10,
  };
}

export function generateProOrderCode(prefix = 'PRO') {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomDigits}`;
}

export function buildProQuickPayPayload(params) {
  const plan =
    PRO_SUBSCRIPTION_PLANS.find((item) => item.id === params?.planId) || PRO_SUBSCRIPTION_PLANS[1];
  const bankBin = String(params?.vietQrEnv?.bankBin || '').trim();
  const bankName = String(params?.vietQrEnv?.bankName || '').trim();
  const accountNo = String(params?.vietQrEnv?.accountNo || '').trim();
  const accountName = String(params?.vietQrEnv?.accountName || '').trim();
  const template = String(params?.vietQrEnv?.template || 'compact2').trim();

  if (bankBin && bankName && accountNo && accountName) {
    const qrImageUrl = `https://img.vietqr.io/image/${encodeURIComponent(bankBin)}-${encodeURIComponent(accountNo)}-${encodeURIComponent(template)}.png?amount=${plan.priceVnd}&addInfo=${encodeURIComponent(params.orderCode)}&accountName=${encodeURIComponent(accountName)}`;
    return {
      mode: 'vietqr',
      qrImageUrl,
      qrText: qrImageUrl,
      amountVnd: plan.priceVnd,
      orderCode: params.orderCode,
      bankInfo: {
        bankName,
        accountNo,
        accountName,
        transferContent: params.orderCode,
      },
    };
  }

  return {
    mode: 'zalo_qr',
    qrImageUrl: null,
    qrText: PRO_SUPPORT_CONTACT.zaloUrl,
    amountVnd: plan.priceVnd,
    orderCode: params.orderCode,
    bankInfo: null,
  };
}

export function normalizeOpenAiEndpoint(endpoint) {
  const trimmed = String(endpoint || '').trim();
  if (!trimmed) {
    return 'https://generativelanguage.googleapis.com/v1beta/openai';
  }
  return trimmed.replace(/\/+$/, '');
}

export function transformGeminiRequestBody(requestBody) {
  const nextBody = { ...requestBody };
  const model = typeof nextBody.model === 'string' ? nextBody.model.toLowerCase() : '';
  if (model.startsWith('gemini-1.5') || model.startsWith('gemini-2.0')) {
    delete nextBody.reasoning_effort;
  }
  return nextBody;
}

export function loadGeminiAuthConfig() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.apiKey !== 'string' || !parsed.apiKey.trim()) {
      return null;
    }
    const model = parsed.model === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'gemini-2.0-flash';
    return {
      apiKey: parsed.apiKey.trim(),
      model,
      endpoint: GEMINI_OPENAI_ENDPOINT,
      verifiedAt: typeof parsed.verifiedAt === 'string' ? parsed.verifiedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveGeminiAuthConfig(config) {
  const normalized = {
    apiKey: String(config.apiKey || '').trim(),
    model: config.model === 'gemini-1.5-flash' ? 'gemini-1.5-flash' : 'gemini-2.0-flash',
    endpoint: GEMINI_OPENAI_ENDPOINT,
    verifiedAt: config.verifiedAt,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function clearGeminiAuthConfig() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Bỏ qua lỗi bộ nhớ trình duyệt bị khóa
  }
}

export async function verifyGeminiApiKey(apiKey, fetchImpl = fetch) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    return { ok: false, message: 'Vui lòng nhập khóa API Google Gemini trước khi kiểm tra.' };
  }

  try {
    const base = normalizeOpenAiEndpoint(GEMINI_OPENAI_ENDPOINT);
    const response = await fetchImpl(`${base}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanKey}`,
      },
    });

    if (response.ok) {
      return {
        ok: true,
        message: 'Xác thực Google Gemini thành công! Trợ lý AI đã sẵn sàng thao tác trang.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message: 'Khóa API chưa hợp lệ hoặc chưa được cấp quyền Gemini. Vui lòng kiểm tra lại.',
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        message: 'Khóa API đang chạm giới hạn lượt gọi. Vui lòng thử lại sau ít phút.',
      };
    }

    return {
      ok: false,
      message: `Không thể xác thực kết nối (mã HTTP ${response.status}).`,
    };
  } catch {
    return {
      ok: false,
      message: 'Lỗi kết nối mạng tới máy chủ Google Gemini. Vui lòng kiểm tra Internet.',
    };
  }
}

export function buildPageAgentSystemInstructions(appName, appContext, tier = 'free') {
  const baseRules = [
    `Bạn là Trợ lý AI thao tác trang web (Page Agent) tích hợp bên trong ứng dụng "${appName}".`,
    `Bối cảnh ứng dụng: ${appContext}`,
    'Quy tắc bắt buộc:',
    '1. Luôn suy luận, phản hồi, hỏi lại người dùng (nếu cần) và tóm tắt kết quả 100% bằng tiếng Việt tự nhiên, ngắn gọn, dễ hiểu.',
    '2. Chỉ thao tác trên các phần tử giao diện thực sự hiện diện trên trang web hiện tại theo đúng yêu cầu của người dùng.',
    '3. Không tự ý thực hiện hành động xóa dữ liệu vĩnh viễn nếu người dùng chưa yêu cầu rõ ràng; khi không chắc chắn hãy dùng công cụ hỏi người dùng bằng tiếng Việt.',
    '4. Sau khi hoàn thành thao tác, báo cáo ngắn gọn những bước đã làm.',
  ];

  if (tier === 'pro') {
    baseRules.push(
      '5. CHẾ ĐỘ PRO ĐÃ MỞ KHÓA: Hỗ trợ tối đa tác vụ điền biểu mẫu thông minh, xử lý & tổng hợp dữ liệu nhiều bước với tốc độ cao và độ chính xác tối ưu.',
    );
  }

  return baseRules.join('\n');
}
