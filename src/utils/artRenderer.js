// Bộ Tạo Tranh Mẫu Mĩ Thuật Tiểu Học Tức Thì (Instant Procedural Art Generator)
// Chuẩn SGK GDPT 2018 Kết Nối Tri Thức Với Cuộc Sống
// Sinh tranh tỉ lệ 16:9 (800x450), 100% Cục bộ Offline, 0 giây chờ đợi, Không phụ thuộc bên ngoài
// Tạo liên tục không giới hạn, không bao giờ bị nghẽn 'Free limit reached: 1 image every 45s'

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

  const isCat = lower.includes('mèo') || lower.includes('cat');
  const isFish = lower.includes('cá') || lower.includes('thủy cung');
  const isBoat = lower.includes('thuyền') || lower.includes('biển') || lower.includes('buồm');
  const isHouse = lower.includes('nhà') || lower.includes('phố') || lower.includes('làng');
  const isFlower = lower.includes('hoa') || lower.includes('sen') || lower.includes('hướng dương');
  const isTree = lower.includes('cây') || lower.includes('rừng');

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

  // 2. VẼ CHỦ THỂ NGHỆ THUẬT THEO TỪ KHÓA
  if (isCat) {
    // VẼ CON MÈO DỄ THƯƠNG (CUTE CAT - NHƯ TRONG HÌNH 1)
    const catX = 400 + (rnd() - 0.5) * 40;
    const catY = 270;

    // Chọn màu lông mèo theo phong cách
    const coatColors = [
      { body: '#fb923c', inner: '#fed7aa', stroke: '#c2410c' }, // Mèo mướp vàng rực
      { body: '#f8fafc', inner: '#fbcfe8', stroke: '#475569' }, // Mèo trắng tinh
      { body: '#94a3b8', inner: '#fed7aa', stroke: '#334155' }, // Mèo xám tro
      { body: '#f59e0b', inner: '#fef3c7', stroke: '#b45309' }  // Mèo tam thể
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
    // Vành tai hồng trong
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
    // Vành tai hồng trong
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
    // Đốm sáng trong mắt
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

    // Miệng mèo cười xinh
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
    // Râu trái
    ctx.beginPath();
    ctx.moveTo(catX - 28, catY - 36);
    ctx.lineTo(catX - 78, catY - 45);
    ctx.moveTo(catX - 28, catY - 30);
    ctx.lineTo(catX - 82, catY - 28);
    ctx.moveTo(catX - 28, catY - 24);
    ctx.lineTo(catX - 76, catY - 12);
    // Râu phải
    ctx.moveTo(catX + 28, catY - 36);
    ctx.lineTo(catX + 78, catY - 45);
    ctx.moveTo(catX + 28, catY - 30);
    ctx.lineTo(catX + 82, catY - 28);
    ctx.moveTo(catX + 28, catY - 24);
    ctx.lineTo(catX + 76, catY - 12);
    ctx.stroke();

    // Cuộn len sắc màu hoặc bướm nhỏ chơi cùng mèo
    const ballX = catX + 120;
    const ballY = catY + 75;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Nét len quấn
    ctx.strokeStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(ballX - 5, ballY - 5, 16, 0.4, Math.PI * 1.5);
    ctx.stroke();
    // Dây len uốn lượn tới chân mèo
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(ballX - 24, ballY + 12);
    ctx.bezierCurveTo(ballX - 40, ballY + 28, catX + 50, ballY + 30, catX + 38, catY + 95);
    ctx.stroke();

  } else if (isFish) {
    // VẼ CON CÁ RỰC RỠ SẮC MÀU
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

    // Vảy cá trang trí
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
    // VẼ CON THUYỀN RA KHƠI
    const bx = 390;
    const by = 265;

    // Thân thuyền
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
    // VẼ NGÔI NHÀ VÀ KHU VƯỜN
    const hx = 360;
    const hy = 240;

    // Thân nhà
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

  } else {
    // VẼ CÂY CỐI & VƯỜN HOA THIÊN NHIÊN
    const tx = 380;
    const ty = 280;

    // Thân cây
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(tx - 25, ty - 60, 50, 140);

    // Tán lá xanh nhiều tầng
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

    // Quả táo đỏ trên cây
    for (let ap = 0; ap < 5; ap++) {
      const apx = tx - 45 + (ap % 3) * 45;
      const apy = ty - 150 + Math.floor(ap / 3) * 40;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(apx, apy, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. HIỆU ỨNG PHONG CÁCH CUỐI CÙNG
  if (isWatercolor) {
    // Lớp phủ màu nước trong trẻo
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
