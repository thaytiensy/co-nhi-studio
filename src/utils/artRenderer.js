// Bộ Tạo Tranh Mẫu Mĩ Thuật Tiểu Học Tức Thì (Instant Procedural Art Generator)
// Chuẩn SGK GDPT 2018 Kết Nối Tri Thức Với Cuộc Sống
// Sinh tranh tỉ lệ 16:9 (800x450), 100% Cục bộ Offline, 0 giây chờ đợi, Không phụ thuộc bên ngoài
// Tạo liên tục không giới hạn, bám sát chính xác ý tưởng người dùng (Con heo, con mèo, con cá, v.v...)

function createRnd(seed) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1234567;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateProceduralArtwork(topicText = '', seed = 100, styleKey = 'crayon') {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rnd = createRnd(seed);
  const lower = (topicText || '').toLowerCase();

  // Nhận diện chủ đề mĩ thuật chi tiết
  const isPig = lower.includes('heo') || lower.includes('lợn') || lower.includes('ủn') || lower.includes('pig');
  const isCat = lower.includes('mèo') || lower.includes('cat');
  const isDog = lower.includes('chó') || lower.includes('cún') || lower.includes('dog') || lower.includes('puppy');
  const isChicken = lower.includes('gà') || lower.includes('chicken') || lower.includes('rooster');
  const isFish = lower.includes('cá') || lower.includes('thủy cung') || lower.includes('fish');
  const isBoat = lower.includes('thuyền') || lower.includes('biển') || lower.includes('buồm') || lower.includes('boat');
  const isHouse = lower.includes('nhà') || lower.includes('phố') || lower.includes('làng') || lower.includes('house');
  const isFlower = lower.includes('hoa') || lower.includes('sen') || lower.includes('hướng dương') || lower.includes('flower');
  const isTree = lower.includes('cây') || lower.includes('rừng') || lower.includes('tree');
  const isFruit = lower.includes('quả') || lower.includes('trái cây') || lower.includes('táo') || lower.includes('fruit');
  const isVehicle = lower.includes('xe') || lower.includes('ô tô') || lower.includes('giao thông') || lower.includes('car') || lower.includes('bus');

  // Cấu hình phong cách
  const isWatercolor = styleKey === 'watercolor';
  const isPaperCut = styleKey === 'paper-cut';
  const isPencil = styleKey === 'colored-pencil';

  ctx.save();

  if (isPaperCut) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
  }

  // 1. VẼ NỀN (BACKGROUND)
  if (isFish) {
    // Đáy biển thủy cung
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 450);
    oceanGrad.addColorStop(0, '#38bdf8');
    oceanGrad.addColorStop(0.5, '#0284c7');
    oceanGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 800, 450);

    // Cát đáy biển
    const sandGrad = ctx.createLinearGradient(0, 380, 0, 450);
    sandGrad.addColorStop(0, '#fde047');
    sandGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, 390);
    ctx.bezierCurveTo(200, 370, 400, 410, 800, 380);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Rong biển
    for (let i = 0; i < 6; i++) {
      const rx = 60 + i * 130 + rnd() * 40;
      ctx.strokeStyle = i % 2 === 0 ? '#22c55e' : '#16a34a';
      ctx.lineWidth = isPencil ? 4 : 8;
      ctx.beginPath();
      ctx.moveTo(rx, 420);
      ctx.bezierCurveTo(rx - 30, 320, rx + 40, 260, rx - 10, 180 + rnd() * 40);
      ctx.stroke();
    }

    // Bọt khí
    for (let b = 0; b < 12; b++) {
      const bx = rnd() * 780;
      const by = 80 + rnd() * 280;
      const br = 4 + rnd() * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (isBoat) {
    // Biển bình minh và thuyền
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
    skyGrad.addColorStop(0, '#fbcfe8');
    skyGrad.addColorStop(0.5, '#fed7aa');
    skyGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 240);

    // Mặt trời bình minh
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(400, 220, 65, Math.PI, 0, false);
    ctx.fill();

    // Mặt biển
    const seaGrad = ctx.createLinearGradient(0, 240, 0, 450);
    seaGrad.addColorStop(0, '#0284c7');
    seaGrad.addColorStop(0.5, '#0369a1');
    seaGrad.addColorStop(1, '#075985');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 240, 800, 210);

    // Sóng biển
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    for (let w = 0; w < 5; w++) {
      const wy = 260 + w * 35;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      for (let x = 0; x <= 800; x += 40) {
        ctx.quadraticCurveTo(x + 20, wy - 8, x + 40, wy);
      }
      ctx.stroke();
    }
  } else {
    // Phong cảnh sân vườn / đồi cỏ mĩ thuật tiểu học
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 280);
    skyGrad.addColorStop(0, isWatercolor ? '#bae6fd' : '#7dd3fc');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 280);

    // Mặt trời cười
    const sunX = 110 + rnd() * 40;
    const sunY = 90 + rnd() * 20;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();

    // Tia nắng mặt trời
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI) / 4;
      const x1 = sunX + Math.cos(angle) * 44;
      const y1 = sunY + Math.sin(angle) * 44;
      const x2 = sunX + Math.cos(angle) * 58;
      const y2 = sunY + Math.sin(angle) * 58;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Đám mây trắng bồng bềnh
    const drawCloud = (cx, cy, scale) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 25 * scale, cy - 10 * scale, 28 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 55 * scale, cy, 22 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(520, 95, 1.1);
    drawCloud(670, 130, 0.8);

    // Đồi cỏ xa
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, 270);
    ctx.bezierCurveTo(240, 220, 520, 290, 800, 240);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Thảm cỏ gần rực rỡ
    const grassGrad = ctx.createLinearGradient(0, 290, 0, 450);
    grassGrad.addColorStop(0, '#4ade80');
    grassGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = grassGrad;
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.bezierCurveTo(260, 340, 560, 280, 800, 320);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.closePath();
    ctx.fill();

    // Những bông hoa nhỏ trên cỏ
    const flowerColors = ['#f43f5e', '#ec4899', '#f59e0b', '#a855f7', '#3b82f6'];
    for (let f = 0; f < 14; f++) {
      const fx = 30 + f * 55 + (rnd() - 0.5) * 30;
      const fy = 350 + rnd() * 70;
      ctx.fillStyle = flowerColors[f % flowerColors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. VẼ CHỦ THỂ NGHỆ THUẬT THEO ĐÚNG TỪ KHÓA Ý TƯỞNG CỦA NGƯỜI DÙNG

  if (isPig) {
    // === CHỦ THỂ: CON HEO / CON LỢN ĐẶC SẮC (ĐÃ SỬA THEO YÊU CẦU ẢNH 2) ===
    const px = 400 + (rnd() - 0.5) * 40;
    const py = 250;

    const pigColors = [
      { body: '#f472b6', inner: '#fbcfe8', stroke: '#db2777', snout: '#fb7185' },
      { body: '#f9a8d4', inner: '#fdf2f8', stroke: '#e11d48', snout: '#f43f5e' },
      { body: '#fda4af', inner: '#fff1f2', stroke: '#e11d48', snout: '#fb7185' },
      { body: '#f472b6', inner: '#fce7f3', stroke: '#be185d', snout: '#f43f5e' }
    ];
    const pc = pigColors[Math.abs(seed) % pigColors.length];

    ctx.lineWidth = isPencil ? 3 : 5;
    ctx.strokeStyle = pc.stroke;

    // Vũng bùn hoặc bóng thảm cỏ dưới chân
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(px + 10, py + 100, 140, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đuôi heo xoăn tít đặc trưng
    ctx.strokeStyle = pc.stroke;
    ctx.lineWidth = isPencil ? 4 : 6;
    ctx.beginPath();
    ctx.moveTo(px + 95, py + 25);
    ctx.bezierCurveTo(px + 130, py + 15, px + 145, py - 10, px + 120, py - 15);
    ctx.bezierCurveTo(px + 100, py - 20, px + 105, py + 5, px + 135, py - 5);
    ctx.stroke();

    // 4 Chân heo mập mạp và móng guốc
    ctx.fillStyle = pc.body;
    ctx.strokeStyle = pc.stroke;
    ctx.lineWidth = isPencil ? 2.5 : 4;
    [-65, -28, 38, 75].forEach(ox => {
      ctx.beginPath();
      ctx.rect(px + ox - 12, py + 72, 24, 32);
      ctx.fill();
      ctx.stroke();
      // Móng guốc
      ctx.fillStyle = '#831843';
      ctx.fillRect(px + ox - 10, py + 97, 20, 7);
      ctx.fillStyle = pc.body;
    });

    // Thân heo mập mạp tròn xoe
    ctx.fillStyle = pc.body;
    ctx.beginPath();
    ctx.ellipse(px + 10, py + 30, 95, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bụng heo màu hồng sáng
    ctx.fillStyle = pc.inner;
    ctx.beginPath();
    ctx.ellipse(px + 15, py + 38, 55, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Đầu heo tròn đáng yêu
    ctx.fillStyle = pc.body;
    ctx.beginPath();
    ctx.arc(px - 45, py - 10, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tai heo cụp mềm mại
    // Tai trái
    ctx.beginPath();
    ctx.moveTo(px - 95, py - 40);
    ctx.bezierCurveTo(px - 130, py - 85, px - 75, py - 95, px - 60, py - 55);
    ctx.closePath();
    ctx.fillStyle = pc.body;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 92, py - 45);
    ctx.bezierCurveTo(px - 118, py - 78, px - 80, py - 85, px - 68, py - 58);
    ctx.closePath();
    ctx.fillStyle = pc.inner;
    ctx.fill();

    // Tai phải
    ctx.beginPath();
    ctx.moveTo(px - 15, py - 55);
    ctx.bezierCurveTo(px + 10, py - 95, px - 35, py - 90, px - 40, py - 45);
    ctx.closePath();
    ctx.fillStyle = pc.body;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 18, py - 58);
    ctx.bezierCurveTo(px + 2, py - 85, px - 30, py - 82, px - 35, py - 48);
    ctx.closePath();
    ctx.fillStyle = pc.inner;
    ctx.fill();

    // Mõm heo to hình bầu dục nổi bật
    ctx.fillStyle = pc.snout;
    ctx.beginPath();
    ctx.ellipse(px - 65, py + 5, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hai lỗ mũi heo
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.ellipse(px - 75, py + 5, 5, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(px - 55, py + 5, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mắt heo to tròn long lanh
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px - 68, py - 32, 8, 0, Math.PI * 2);
    ctx.arc(px - 28, py - 32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px - 71, py - 34, 3, 0, Math.PI * 2);
    ctx.arc(px - 31, py - 34, 3, 0, Math.PI * 2);
    ctx.fill();

    // Má hồng
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px - 85, py - 8, 12, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(px - 20, py - 8, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Miệng cười
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px - 65, py + 26, 12, 0.2, Math.PI - 0.2, false);
    ctx.stroke();

  } else if (isCat) {
    // === CHỦ THỂ: CON MÈO ===
    const catX = 400 + (rnd() - 0.5) * 40;
    const catY = 270;

    const coatColors = [
      { body: '#fb923c', inner: '#fed7aa', stroke: '#c2410c' },
      { body: '#f8fafc', inner: '#fbcfe8', stroke: '#475569' },
      { body: '#94a3b8', inner: '#fed7aa', stroke: '#334155' },
      { body: '#f59e0b', inner: '#fef3c7', stroke: '#b45309' }
    ];
    const coat = coatColors[Math.abs(seed) % coatColors.length];

    ctx.lineWidth = isPencil ? 3 : 5;
    ctx.strokeStyle = coat.stroke;

    // Đuôi mèo cong vút
    ctx.beginPath();
    ctx.moveTo(catX - 60, catY + 50);
    ctx.bezierCurveTo(catX - 130, catY + 60, catX - 140, catY - 20, catX - 100, catY - 30);
    ctx.lineWidth = isPencil ? 8 : 16;
    ctx.strokeStyle = coat.body;
    ctx.stroke();
    ctx.lineWidth = isPencil ? 2 : 4;
    ctx.strokeStyle = coat.stroke;
    ctx.stroke();

    // Thân mèo tròn trịa
    ctx.fillStyle = coat.body;
    ctx.beginPath();
    ctx.ellipse(catX, catY + 45, 80, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bụng mèo sáng màu
    ctx.fillStyle = coat.inner;
    ctx.beginPath();
    ctx.ellipse(catX + 5, catY + 52, 45, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chân mèo trước
    ctx.fillStyle = coat.body;
    ctx.beginPath();
    ctx.ellipse(catX - 30, catY + 95, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(catX + 30, catY + 95, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Đầu mèo tròn
    ctx.fillStyle = coat.body;
    ctx.beginPath();
    ctx.arc(catX, catY - 50, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tai trái
    ctx.beginPath();
    ctx.moveTo(catX - 48, catY - 80);
    ctx.lineTo(catX - 58, catY - 135);
    ctx.lineTo(catX - 12, catY - 95);
    ctx.closePath();
    ctx.fillStyle = coat.body;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(catX - 44, catY - 83);
    ctx.lineTo(catX - 52, catY - 125);
    ctx.lineTo(catX - 18, catY - 95);
    ctx.closePath();
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    // Tai phải
    ctx.beginPath();
    ctx.moveTo(catX + 12, catY - 95);
    ctx.lineTo(catX + 58, catY - 135);
    ctx.lineTo(catX + 48, catY - 80);
    ctx.closePath();
    ctx.fillStyle = coat.body;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(catX + 18, catY - 95);
    ctx.lineTo(catX + 52, catY - 125);
    ctx.lineTo(catX + 44, catY - 83);
    ctx.closePath();
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    // Mắt mèo to tròn long lanh
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(catX - 22, catY - 52, 9, 0, Math.PI * 2);
    ctx.arc(catX + 22, catY - 52, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(catX - 25, catY - 55, 3.5, 0, Math.PI * 2);
    ctx.arc(catX + 19, catY - 55, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Mũi tam giác hồng
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(catX - 6, catY - 38);
    ctx.lineTo(catX + 6, catY - 38);
    ctx.lineTo(catX, catY - 31);
    ctx.closePath();
    ctx.fill();

    // Miệng cười
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(catX, catY - 31);
    ctx.lineTo(catX, catY - 24);
    ctx.arc(catX - 8, catY - 24, 8, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(catX, catY - 24);
    ctx.arc(catX + 8, catY - 24, 8, 0, Math.PI, false);
    ctx.stroke();

    // Râu mèo 2 bên
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(catX - 28, catY - 36);
    ctx.lineTo(catX - 78, catY - 45);
    ctx.moveTo(catX - 28, catY - 30);
    ctx.lineTo(catX - 82, catY - 28);
    ctx.moveTo(catX - 28, catY - 24);
    ctx.lineTo(catX - 76, catY - 12);
    ctx.moveTo(catX + 28, catY - 36);
    ctx.lineTo(catX + 78, catY - 45);
    ctx.moveTo(catX + 28, catY - 30);
    ctx.lineTo(catX + 82, catY - 28);
    ctx.moveTo(catX + 28, catY - 24);
    ctx.lineTo(catX + 76, catY - 12);
    ctx.stroke();

    // Cuộn len
    const ballX = catX + 120;
    const ballY = catY + 75;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2.5;
    ctx.stroke();

  } else if (isDog) {
    // === CHỦ THỂ: CHÚ CÚN CON (DOG) ===
    const dx = 400 + (rnd() - 0.5) * 40;
    const dy = 260;
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = isPencil ? 3 : 5;

    // Thân cún
    ctx.beginPath();
    ctx.ellipse(dx + 10, dy + 30, 85, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Đuôi ngoe nguẩy
    ctx.beginPath();
    ctx.moveTo(dx + 90, dy + 20);
    ctx.quadraticCurveTo(dx + 140, dy - 20, dx + 120, dy - 40);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.lineWidth = isPencil ? 3 : 5;

    // Chân cún
    [-45, -15, 35, 65].forEach(ox => {
      ctx.beginPath();
      ctx.rect(dx + ox - 10, dy + 70, 20, 28);
      ctx.fill();
      ctx.stroke();
    });

    // Đầu cún
    ctx.beginPath();
    ctx.arc(dx - 45, dy - 15, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tai cụp
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(dx - 95, dy - 10, 18, 38, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx + 5, dy - 10, 18, 38, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mõm cún và mũi đen
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(dx - 45, dy + 10, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(dx - 45, dy + 2, 9, 0, Math.PI * 2);
    ctx.fill();

    // Mắt cún
    ctx.beginPath();
    ctx.arc(dx - 62, dy - 25, 7, 0, Math.PI * 2);
    ctx.arc(dx - 28, dy - 25, 7, 0, Math.PI * 2);
    ctx.fill();

  } else if (isChicken) {
    // === CHỦ THỂ: CHÚ GÀ TRỐNG / GÀ CON ===
    const gx = 400;
    const gy = 260;
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = isPencil ? 3 : 5;

    // Đuôi gà nhiều màu xòe rộng
    const tailColors = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b'];
    tailColors.forEach((tc, idx) => {
      ctx.fillStyle = tc;
      ctx.beginPath();
      ctx.moveTo(gx + 60, gy);
      ctx.quadraticCurveTo(gx + 120 + idx * 10, gy - 80 - idx * 15, gx + 150, gy - 50 + idx * 20);
      ctx.quadraticCurveTo(gx + 100, gy + 10, gx + 60, gy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Thân gà
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(gx, gy + 10, 75, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cánh gà
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(gx - 10, gy + 15, 45, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cổ và đầu gà
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(gx - 45, gy + 10);
    ctx.lineTo(gx - 60, gy - 60);
    ctx.arc(gx - 60, gy - 70, 32, 0, Math.PI * 2);
    ctx.lineTo(gx - 15, gy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mào gà đỏ rực
    ctx.fillStyle = '#dc2626';
    for (let m = 0; m < 3; m++) {
      ctx.beginPath();
      ctx.arc(gx - 75 + m * 15, gy - 105, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mỏ vàng
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(gx - 88, gy - 72);
    ctx.lineTo(gx - 115, gy - 65);
    ctx.lineTo(gx - 88, gy - 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mắt gà
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(gx - 70, gy - 75, 5, 0, Math.PI * 2);
    ctx.fill();

    // Chân gà
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    [-20, 20].forEach(cx => {
      ctx.beginPath();
      ctx.moveTo(gx + cx, gy + 70);
      ctx.lineTo(gx + cx, gy + 105);
      ctx.lineTo(gx + cx - 15, gy + 110);
      ctx.moveTo(gx + cx, gy + 105);
      ctx.lineTo(gx + cx + 15, gy + 110);
      ctx.stroke();
    });

  } else if (isFish) {
    // === CHỦ THỂ: CON CÁ THỦY CUNG ===
    const fx = 400 + (rnd() - 0.5) * 50;
    const fy = 220 + (rnd() - 0.5) * 30;

    // Đuôi cá
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(fx - 70, fy);
    ctx.lineTo(fx - 150, fy - 55);
    ctx.quadraticCurveTo(fx - 110, fy, fx - 150, fy + 55);
    ctx.closePath();
    ctx.fill();

    // Vây lưng
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(fx - 30, fy - 65);
    ctx.quadraticCurveTo(fx, fy - 110, fx + 30, fy - 60);
    ctx.closePath();
    ctx.fill();

    // Thân cá
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(fx, fy, 95, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Vảy cá
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(fx - 20 + c * 25, fy - 15, 16, 0.2, Math.PI * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(fx - 10 + c * 25, fy + 15, 16, 0.2, Math.PI * 0.9);
      ctx.stroke();
    }

    // Mắt cá
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fx + 55, fy - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(fx + 58, fy - 18, 7, 0, Math.PI * 2);
    ctx.fill();

  } else if (isBoat) {
    // === CHỦ THỂ: CON THUYỀN RA KHƠI ===
    const bx = 390;
    const by = 265;

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(bx - 120, by);
    ctx.lineTo(bx + 140, by);
    ctx.lineTo(bx + 90, by + 50);
    ctx.lineTo(bx - 90, by + 50);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Cột buồm
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - 160);
    ctx.stroke();

    // Cánh buồm lớn
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(bx + 5, by - 150);
    ctx.lineTo(bx + 110, by - 15);
    ctx.lineTo(bx + 5, by - 15);
    ctx.closePath();
    ctx.fill();

    // Cánh buồm nhỏ
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(bx - 5, by - 135);
    ctx.lineTo(bx - 75, by - 25);
    ctx.lineTo(bx - 5, by - 25);
    ctx.closePath();
    ctx.fill();

  } else if (isHouse) {
    // === CHỦ THỂ: NGÔI NHÀ VÀ KHU VƯỜN ===
    const hx = 360;
    const hy = 240;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(hx - 100, hy - 40, 200, 140);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.strokeRect(hx - 100, hy - 40, 200, 140);

    // Mái ngói đỏ
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(hx - 120, hy - 40);
    ctx.lineTo(hx, hy - 140);
    ctx.lineTo(hx + 120, hy - 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Cửa chính
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(hx - 25, hy + 20, 50, 80);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(hx + 14, hy + 60, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cửa sổ
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(hx - 80, hy, 40, 40);
    ctx.strokeRect(hx - 80, hy, 40, 40);
    ctx.fillRect(hx + 40, hy, 40, 40);
    ctx.strokeRect(hx + 40, hy, 40, 40);

  } else if (isFruit) {
    // === CHỦ THỂ: ĐĨA / GIỎ HOA QUẢ TRÁI CÂY ===
    const fx = 400;
    const fy = 270;

    // Giỏ đựng quả
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(fx, fy + 20, 120, 0, Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Dưa hấu đỏ
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(fx - 40, fy, 60, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Quả cam tròn
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(fx + 50, fy - 10, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Quả táo đỏ
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(fx, fy - 35, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.stroke();

  } else if (isFlower) {
    // === CHỦ THỂ: VƯỜN HOA RỰC RỠ SẮC MÀU ===
    const fx = 400;
    const fy = 250;

    // Bông hoa hướng dương lớn ở giữa
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 40);
    ctx.lineTo(fx, fy + 150);
    ctx.stroke();

    // Lá cây xanh
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(fx - 30, fy + 90, 35, 18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(fx + 30, fy + 110, 35, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cánh hoa hướng dương vàng rực rỡ
    ctx.fillStyle = '#facc15';
    for (let p = 0; p < 12; p++) {
      const angle = (p * Math.PI) / 6;
      const px = fx + Math.cos(angle) * 60;
      const py = fy + Math.sin(angle) * 60;
      ctx.beginPath();
      ctx.ellipse(px, py, 26, 12, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Nhụy hoa nâu sẫm
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(fx, fy, 40, 0, Math.PI * 2);
    ctx.fill();

    // Những bông hoa nhỏ 2 bên
    const sideColors = ['#f43f5e', '#a855f7', '#3b82f6'];
    [-180, 180].forEach((ox, sIdx) => {
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(fx + ox, fy + 70);
      ctx.lineTo(fx + ox, fy + 150);
      ctx.stroke();

      ctx.fillStyle = sideColors[sIdx % sideColors.length];
      for (let sp = 0; sp < 6; sp++) {
        const sAngle = (sp * Math.PI) / 3;
        const spx = fx + ox + Math.cos(sAngle) * 30;
        const spy = fy + 50 + Math.sin(sAngle) * 30;
        ctx.beginPath();
        ctx.arc(spx, spy, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fx + ox, fy + 50, 14, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (isVehicle) {
    // === CHỦ THỂ: XE CỘ / Ô TÔ GIAO THÔNG ===
    const vx = 380;
    const vy = 260;

    // Con đường
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 310, 800, 140);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(800, 380);
    ctx.stroke();
    ctx.setLineDash([]);

    // Thân xe ô tô đỏ
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(vx - 140, vy, 280, 75, [12, 12, 4, 4]) : ctx.rect(vx - 140, vy, 280, 75);
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Mui xe / Cabin
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(vx - 90, vy);
    ctx.lineTo(vx - 50, vy - 55);
    ctx.lineTo(vx + 60, vy - 55);
    ctx.lineTo(vx + 100, vy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cửa sổ xe
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(vx - 80, vy - 5);
    ctx.lineTo(vx - 45, vy - 48);
    ctx.lineTo(vx - 5, vy - 48);
    ctx.lineTo(vx - 5, vy - 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vx + 5, vy - 5);
    ctx.lineTo(vx + 5, vy - 48);
    ctx.lineTo(vx + 52, vy - 48);
    ctx.lineTo(vx + 88, vy - 5);
    ctx.closePath();
    ctx.fill();

    // 2 Bánh xe
    [-80, 80].forEach(bx => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(vx + bx, vy + 75, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(vx + bx, vy + 75, 14, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (isTree) {
    // === CHỦ THỂ: CÂY CỐI & RỪNG CÂY ===
    const tx = 380;
    const ty = 280;

    ctx.fillStyle = '#9a3412';
    ctx.fillRect(tx - 25, ty - 60, 50, 140);

    const leafColors = ['#15803d', '#16a34a', '#22c55e', '#4ade80'];
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = leafColors[l];
      ctx.beginPath();
      ctx.arc(tx - 50 + l * 35, ty - 120 + (l % 2) * 20, 55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(tx, ty - 160, 65, 0, Math.PI * 2);
    ctx.fill();

    for (let ap = 0; ap < 5; ap++) {
      const apx = tx - 45 + (ap % 3) * 45;
      const apy = ty - 150 + Math.floor(ap / 3) * 40;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(apx, apy, 10, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // === CHỦ THỂ MĨ THUẬT TỔNG HỢP: GIÁ VẼ NGHỆ THUẬT VÀ CHỦ ĐỀ SÁNG TẠO ===
    const ex = 400;
    const ey = 250;

    // Giá vẽ 3 chân gỗ
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(ex, ey - 150);
    ctx.lineTo(ex - 90, ey + 130);
    ctx.moveTo(ex, ey - 150);
    ctx.lineTo(ex + 90, ey + 130);
    ctx.moveTo(ex, ey - 150);
    ctx.lineTo(ex, ey + 130);
    ctx.stroke();

    // Khung tranh vải Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex - 120, ey - 95, 240, 150);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.strokeRect(ex - 120, ey - 95, 240, 150);

    // Cầu vồng nghệ thuật trên khung tranh
    const rbColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8'];
    rbColors.forEach((rc, rIdx) => {
      ctx.strokeStyle = rc;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(ex, ey + 40, 60 + rIdx * 6, Math.PI, 0, false);
      ctx.stroke();
    });

    // Bảng màu pha màu bên cạnh
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(ex + 140, ey + 60, 45, 32, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Các vệt màu trên bảng pha
    ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].forEach((clr, idx) => {
      ctx.fillStyle = clr;
      ctx.beginPath();
      ctx.arc(ex + 120 + (idx % 3) * 18, ey + 50 + Math.floor(idx / 3) * 18, 5.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 3. HIỆU ỨNG PHONG CÁCH CUỐI CÙNG
  if (isWatercolor) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 0, 800, 450);
  }

  // Khung viền tranh mĩ thuật chuẩn sư phạm
  ctx.strokeStyle = isPencil ? 'rgba(100, 116, 139, 0.4)' : 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 788, 438);

  ctx.restore();

  try {
    return canvas.toDataURL('image/jpeg', 0.92);
  } catch (_) {
    return '';
  }
}
