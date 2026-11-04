// Cọ Nhí Studio - Video Guide Scenes & Visual Rendering Engine
// Rendered on 16:9 Canvas (1920x1080 native resolution)

export const VIDEO_SCENES = [
  {
    id: 1,
    partNumber: 'PHẦN 1 / 7',
    title: 'GIỚI THIỆU TỔNG QUAN & KHỞI ĐẦU VỚI TRANG TRẮNG',
    subtitle: 'Nền tảng soạn giảng & trình chiếu mĩ thuật chuyên biệt cho Tiểu học GDPT 2018',
    time: '0:00 - 0:45',
    activeTab: 'editor',
    audioSrc: '/video-guide/audio/part1.mp3',
    highlights: [
      { text: '100% Cục bộ Offline • Không cần Internet', color: '#10b981' },
      { text: 'Không quảng cáo • Hoàn toàn Miễn phí', color: '#f59e0b' },
      { text: 'Chuẩn GDPT 2018 Kết nối tri thức', color: '#6366f1' }
    ],
    drawPreview: (ctx, t) => {
      // Draw Empty Clean 16:9 Slide Workspace
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;
      
      // Shadow & White Canvas
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Subtle border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, sw, sh);

      // Subtle Grid dots
      ctx.fillStyle = '#f1f5f9';
      for (let x = sx + 40; x < sx + sw - 40; x += 60) {
        for (let y = sy + 40; y < sy + sh - 40; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center Prompt Card
      const cx = sx + sw / 2;
      const cy = sy + sh / 2;
      
      // Card Box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(cx - 360, cy - 140, 720, 280);
      ctx.setLineDash([]);
      ctx.fillRect(cx - 360, cy - 140, 720, 280);

      // Big Sparkle Icon
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      ctx.save();
      ctx.translate(cx, cy - 40);
      ctx.scale(pulse, pulse);
      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎨', 0, 0);
      ctx.restore();

      // Heading
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Không gian làm việc Trắng Tinh Khiết', cx, cy + 35);

      // Subheading
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText('Sẵn sàng cho bài soạn mĩ thuật mới của Thầy Cô • Tỉ lệ chuẩn 16:9', cx, cy + 75);

      // Floating Teacher Avatar in bottom-right of slide
      const tx = sx + sw - 140;
      const ty = sy + sh - 110;
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, 48, 0, Math.PI * 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👨‍🏫', tx, ty);
      ctx.restore();

      // Speech bubble
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(tx - 320, ty - 60, 250, 60);
      ctx.strokeRect(tx - 320, ty - 60, 250, 60);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Thầy Cọ Nhí kính chào Thầy Cô!', tx - 305, ty - 25);

      ctx.restore();
    }
  },
  {
    id: 2,
    partNumber: 'PHẦN 2 / 7',
    title: 'SOẠN SLIDE 16:9, TẢI LÊN & XUẤT POWERPOINT',
    subtitle: 'Thao tác kéo thả trực quan, thanh công cụ xóa ảnh một chạm, tương thích PowerPoint hoàn hảo',
    time: '0:45 - 1:45',
    activeTab: 'editor',
    audioSrc: '/video-guide/audio/part2.mp3',
    highlights: [
      { text: 'Tỉ lệ vàng 16:9 sắc nét cho Tivi & Máy chiếu', color: '#3b82f6' },
      { text: 'Nút xóa ảnh đỏ ngay trên hình + Phím Delete', color: '#ef4444' },
      { text: 'Tải lên & Xuất file PowerPoint (.pptx) tiện lợi', color: '#f59e0b' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      // 16:9 Canvas Background
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 25;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Left Mini Slides Bar
      const lw = 180;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx, sy, lw, sh);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(sx, sy, lw, sh);

      // Slide Thumbnails in sidebar
      for (let i = 0; i < 3; i++) {
        const ty = sy + 30 + i * 110;
        ctx.fillStyle = i === 0 ? '#eff6ff' : '#ffffff';
        ctx.strokeStyle = i === 0 ? '#3b82f6' : '#cbd5e1';
        ctx.lineWidth = i === 0 ? 3 : 1;
        ctx.fillRect(sx + 20, ty, 140, 80);
        ctx.strokeRect(sx + 20, ty, 140, 80);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`Slide ${i + 1}`, sx + 30, ty + 25);
      }

      // Active Slide Main Area
      const mx = sx + lw + 40;
      const my = sy + 40;

      // Title Text Element
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('Bài 1: Sắc Màu Quê Hương Em', mx, my + 40);

      ctx.fillStyle = '#475569';
      ctx.font = '22px sans-serif';
      ctx.fillText('Mĩ thuật Lớp 3 • Chủ đề 1: Đại dương tươi đẹp', mx, my + 80);

      // Main Artwork Box
      const ax = mx + 50;
      const ay = my + 130;
      const aw = 650;
      const ah = 400;

      // Artwork frame with landscape painting preview
      const grad = ctx.createLinearGradient(ax, ay, ax, ay + ah);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(ax, ay, aw, ah);

      // Sun
      ctx.beginPath();
      ctx.arc(ax + 120, ay + 100, 45, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Mountains
      ctx.beginPath();
      ctx.moveTo(ax, ay + 260);
      ctx.lineTo(ax + 180, ay + 140);
      ctx.lineTo(ax + 360, ay + 280);
      ctx.fillStyle = '#059669';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ax + 240, ay + 280);
      ctx.lineTo(ax + 450, ay + 110);
      ctx.lineTo(ax + aw, ay + 290);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Sailboat
      ctx.beginPath();
      ctx.moveTo(ax + 420, ay + 310);
      ctx.lineTo(ax + 480, ay + 230);
      ctx.lineTo(ax + 480, ay + 310);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(ax + 400, ay + 310, 110, 16);

      // Selected element outline & RED TRASH BUTTON
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(ax - 4, ay - 4, aw + 8, ah + 8);

      // Trash Button in top-right of image (Pulsing)
      const trashPulse = 1 + Math.sin(t * 4) * 0.1;
      const bx = ax + aw - 20;
      const by = ay + 20;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(trashPulse, trashPulse);
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🗑️', 0, 0);
      ctx.restore();

      // Tooltip callout: Xóa ảnh [Phím Delete]
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx + 40, by - 24, 210, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Xóa ảnh một chạm [Del]', bx + 55, by + 5);

      // PowerPoint CTA Badges on the right
      const rx = mx + aw + 90;
      const ry = my + 150;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(rx, ry, 260, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📥 Tải lên file .PPTX', rx + 130, ry + 36);

      ctx.fillStyle = '#d97706';
      ctx.fillRect(rx, ry + 90, 260, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('📤 Xuất PowerPoint (.pptx)', rx + 130, ry + 126);

      ctx.restore();
    }
  },
  {
    id: 3,
    partNumber: 'PHẦN 3 / 7',
    title: 'TRỢ LÝ SƯ PHẠM AI & GIỌNG ĐỌC THẦY NAM / CÔ NỮ NEURAL',
    subtitle: 'Soạn mục tiêu Thông tư 32, tổ chức đố vui, phát âm giọng nam trầm ấm & giọng nữ truyền cảm',
    time: '1:45 - 2:45',
    activeTab: 'editor',
    audioSrc: '/video-guide/audio/part3.mp3',
    highlights: [
      { text: 'Trợ giảng Cục bộ 100% Offline hoặc AI Pollinations', color: '#10b981' },
      { text: 'Giọng Thầy giáo Nam Minh trầm ấm, hào sảng', color: '#3b82f6' },
      { text: 'Giọng Cô giáo Hoài My nhẹ nhàng, truyền cảm', color: '#ec4899' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 25;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Left area (Slide Preview)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx, sy, 780, sh);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Bài Giảng: Màu Sắc Trong Thiên Nhiên', sx + 50, sy + 70);

      // Color wheels preview on left
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
      colors.forEach((col, idx) => {
        ctx.beginPath();
        ctx.arc(sx + 100 + idx * 105, sy + 160, 40, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      // Right Side Assistant Drawer
      const dx = sx + 780;
      const dw = sw - 780;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.fillRect(dx, sy, dw, sh);
      ctx.strokeRect(dx, sy, dw, sh);

      // Drawer Header
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(dx, sy, dw, 90);
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(' Trợ Giảng Sư Phạm Mĩ Thuật', dx + 25, sy + 45);
      ctx.fillStyle = '#b45309';
      ctx.font = '16px sans-serif';
      ctx.fillText('Đồng hành soạn bài chuẩn GDPT 2018', dx + 25, sy + 72);

      // Lesson Objective Card
      const cardY = sy + 115;
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#86efac';
      ctx.fillRect(dx + 25, cardY, dw - 50, 140);
      ctx.strokeRect(dx + 25, cardY, dw - 50, 140);
      ctx.fillStyle = '#166534';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🎯 Mục tiêu Thông tư 32 (Khối 3):', dx + 45, cardY + 35);
      ctx.fillStyle = '#1e293b';
      ctx.font = '16px sans-serif';
      ctx.fillText('• Nhận biết được 3 màu cơ bản và màu pha trộn.', dx + 45, cardY + 70);
      ctx.fillText('• Tự tin thể hiện cảm xúc qua tranh phong cảnh.', dx + 45, cardY + 100);

      // Voice Selector Box (Nam Minh vs Hoài My)
      const vy = cardY + 165;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(dx + 25, vy, dw - 50, 220);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(dx + 25, vy, dw - 50, 220);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🎙️ Chọn Giọng Đọc Tiếng Việt Neural:', dx + 45, vy + 35);

      // Voice 1: Thầy Nam Minh (ACTIVE GLOW)
      ctx.fillStyle = '#dbeafe';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.fillRect(dx + 45, vy + 55, dw - 90, 65);
      ctx.strokeRect(dx + 45, vy + 55, dw - 90, 65);
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('👨‍🏫 Thầy Nam Minh (Trầm ấm, hào sảng) • ĐANG CHỌN', dx + 65, vy + 93);

      // Voice 2: Cô Hoài My
      ctx.fillStyle = '#fdf2f8';
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1;
      ctx.fillRect(dx + 45, vy + 135, dw - 90, 65);
      ctx.strokeRect(dx + 45, vy + 135, dw - 90, 65);
      ctx.fillStyle = '#9d174d';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('👩‍🏫 Cô Hoài My (Nhẹ nhàng, truyền cảm)', dx + 65, vy + 173);

      // Equalizer Soundwave in Drawer
      const waveY = vy + 280;
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Âm thanh phát sóng trực tiếp:', dx + 45, waveY);
      for (let i = 0; i < 28; i++) {
        const barH = 15 + Math.sin(t * 8 + i * 0.4) * 20;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(dx + 45 + i * 16, waveY + 20 - barH / 2, 8, barH);
      }

      ctx.restore();
    }
  },
  {
    id: 4,
    partNumber: 'PHẦN 4 / 7',
    title: 'XƯỞNG Ý TƯỞNG – SINH BÀI DẠY & TRANH MẪU THEO Ý TƯỞNG',
    subtitle: 'Gõ một dòng mô tả -> AI tự động xây dựng bài dạy & vẽ tranh sáp màu / màu nước mẫu',
    time: '2:45 - 3:45',
    activeTab: 'ideas',
    audioSrc: '/video-guide/audio/part4.mp3',
    highlights: [
      { text: 'Nhập bất kỳ ý tưởng mĩ thuật nào của Thầy Cô', color: '#f59e0b' },
      { text: 'Tranh minh họa phong cách trẻ thơ trong trẻo', color: '#8b5cf6' },
      { text: 'Bấm một nút "Chèn vào Slide" tức thì', color: '#10b981' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 25;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Top Input Idea Prompt
      ctx.fillStyle = '#fffbeb';
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.fillRect(sx + 50, sy + 40, sw - 100, 90);
      ctx.strokeRect(sx + 50, sy + 40, sw - 100, 90);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('💡 Nhập ý tưởng bài dạy của Thầy Cô:', sx + 80, sy + 70);

      ctx.fillStyle = '#1e293b';
      ctx.font = '22px sans-serif';
      ctx.fillText('"Vẽ con thuyền buồm ra khơi trong ánh bình minh trên biển quê hương"', sx + 80, sy + 105);

      // Left Column: Generated Pedagogical Structure
      const lx = sx + 50;
      const ly = sy + 160;
      const lw = 600;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(lx, ly, lw, 540);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(lx, ly, lw, 540);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('📋 Kế Hoạch Bài Học Tự Động', lx + 30, ly + 45);

      const steps = [
        { title: '1. Khởi động (5 phút):', desc: 'Trò chơi đoán âm thanh tiếng sóng và tiếng hải âu' },
        { title: '2. Khám phá (10 phút):', desc: 'Quan sát hình ảnh con thuyền buồm và các sắc độ màu trời' },
        { title: '3. Luyện tập (15 phút):', desc: '4 bước vẽ: Phác thân thuyền -> Cánh buồm -> Mặt biển' },
        { title: '4. Vận dụng (5 phút):', desc: 'Trưng bày tranh và chia sẻ tình yêu biển đảo quê hương' }
      ];

      steps.forEach((step, idx) => {
        const sy_step = ly + 80 + idx * 105;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.fillRect(lx + 25, sy_step, lw - 50, 90);
        ctx.strokeRect(lx + 25, sy_step, lw - 50, 90);

        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(step.title, lx + 45, sy_step + 32);

        ctx.fillStyle = '#334155';
        ctx.font = '15px sans-serif';
        ctx.fillText(step.desc, lx + 45, sy_step + 62);
      });

      // Right Column: AI Generated Sample Artwork
      const rx = sx + 700;
      const ry = sy + 160;
      const rw = sw - 750;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx, ry, rw, 540);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(rx, ry, rw, 540);

      // Artwork Canvas Preview inside
      const aw = rw - 50;
      const ah = 400;
      const ax = rx + 25;
      const ay = ry + 25;

      const oceanGrad = ctx.createLinearGradient(ax, ay, ax, ay + ah);
      oceanGrad.addColorStop(0, '#fef08a');
      oceanGrad.addColorStop(0.3, '#fed7aa');
      oceanGrad.addColorStop(0.5, '#67e8f9');
      oceanGrad.addColorStop(1, '#0e7490');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(ax, ay, aw, ah);

      // Rising Sun
      ctx.beginPath();
      ctx.arc(ax + aw / 2, ay + 140, 60, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();

      // Big Sailboat
      ctx.beginPath();
      ctx.moveTo(ax + aw / 2 - 20, ay + 260);
      ctx.lineTo(ax + aw / 2 + 50, ay + 150);
      ctx.lineTo(ax + aw / 2 + 50, ay + 260);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(ax + aw / 2 + 65, ay + 260);
      ctx.lineTo(ax + aw / 2 + 110, ay + 180);
      ctx.lineTo(ax + aw / 2 + 65, ay + 260);
      ctx.fillStyle = '#fde047';
      ctx.fill();

      // Boat hull
      ctx.fillStyle = '#b45309';
      ctx.fillRect(ax + aw / 2 - 60, ay + 260, 190, 30);

      // Sea birds
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      for (let b = 0; b < 4; b++) {
        const bx = ax + 100 + b * 110;
        const by = ay + 70 + (b % 2) * 20;
        ctx.beginPath();
        ctx.arc(bx, by, 12, Math.PI, 0);
        ctx.arc(bx + 24, by, 12, Math.PI, 0);
        ctx.stroke();
      }

      // CTA Button: "Chèn vào Slide"
      const btnPulse = 1 + Math.sin(t * 4) * 0.03;
      ctx.save();
      ctx.translate(rx + rw / 2, ry + 475);
      ctx.scale(btnPulse, btnPulse);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-180, -30, 360, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📥 Chèn Tranh Vào Slide Bài Giảng', 0, 0);
      ctx.restore();

      ctx.restore();
    }
  },
  {
    id: 5,
    partNumber: 'PHẦN 5 / 7',
    title: 'BẢNG VẼ THỊ PHẠM 11 KHỐI 3D & MINI-GAME MĨ THUẬT',
    subtitle: 'Nét vẽ Bézier mượt mà, bộ 11 hình khối không gian, 3 trò chơi tương tác sôi nổi',
    time: '3:45 - 4:45',
    activeTab: 'drawing',
    audioSrc: '/video-guide/audio/part5.mp3',
    highlights: [
      { text: 'Nét vẽ bằng chuột mềm mại nhờ Bézier bậc 2', color: '#10b981' },
      { text: 'Đầy đủ 11 khối 3D: Hộp, trụ, nón, cầu, kim tự tháp', color: '#3b82f6' },
      { text: '3 Mini-Game mĩ thuật thi đua giữa các tổ', color: '#ec4899' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 25;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Drawing Tools Bar on top of canvas
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(sx, sy, sw, 80);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(sx, sy, sw, 80);

      // Shapes icons in bar
      const shapes = ['Cọ Vẽ', 'Tẩy', 'Hộp 3D', 'Cầu 3D', 'Trụ 3D', 'Nón 3D', 'Tháp 3D', 'Vòng 3D'];
      shapes.forEach((shName, i) => {
        const bx = sx + 30 + i * 140;
        ctx.fillStyle = i === 2 ? '#3b82f6' : '#ffffff';
        ctx.strokeStyle = i === 2 ? '#1d4ed8' : '#cbd5e1';
        ctx.fillRect(bx, sy + 15, 125, 50);
        ctx.strokeRect(bx, sy + 15, 125, 50);
        ctx.fillStyle = i === 2 ? '#ffffff' : '#334155';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(shName, bx + 62, sy + 46);
      });

      // Left: 3D Shapes demonstration
      const lx = sx + 50;
      const ly = sy + 120;

      // 3D Cube (Hộp)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(lx + 40, ly + 80, 140, 140);
      ctx.strokeRect(lx + 90, ly + 30, 140, 140);
      ctx.beginPath();
      ctx.moveTo(lx + 40, ly + 80); ctx.lineTo(lx + 90, ly + 30);
      ctx.moveTo(lx + 180, ly + 80); ctx.lineTo(lx + 230, ly + 30);
      ctx.moveTo(lx + 40, ly + 220); ctx.lineTo(lx + 90, ly + 170);
      ctx.moveTo(lx + 180, ly + 220); ctx.lineTo(lx + 230, ly + 170);
      ctx.stroke();

      // 3D Cylinder (Trụ)
      const cx = lx + 360;
      ctx.beginPath();
      ctx.ellipse(cx, ly + 70, 60, 25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 60, ly + 70); ctx.lineTo(cx - 60, ly + 220);
      ctx.moveTo(cx + 60, ly + 70); ctx.lineTo(cx + 60, ly + 220);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, ly + 220, 60, 25, 0, 0, Math.PI);
      ctx.stroke();

      // 3D Cone (Nón)
      const nx = lx + 540;
      ctx.beginPath();
      ctx.moveTo(nx, ly + 40);
      ctx.lineTo(nx - 70, ly + 220);
      ctx.lineTo(nx + 70, ly + 220);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(nx, ly + 220, 70, 25, 0, 0, Math.PI);
      ctx.stroke();

      // Smooth Bézier strokes demonstrator
      ctx.beginPath();
      ctx.moveTo(lx + 40, ly + 340);
      ctx.bezierCurveTo(lx + 200, ly + 240 + Math.sin(t * 3) * 50, lx + 450, ly + 440, lx + 620, ly + 340);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Nét vẽ đường cong Bézier bậc 2 tự động khử rung giật chuột', lx + 40, ly + 420);

      // Right: Mini-Games Card
      const rx = sx + 740;
      const ry = sy + 110;
      const rw = sw - 780;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rx, ry, rw, 580);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(rx, ry, rw, 580);

      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🎮 3 Trò Chơi Mĩ Thuật Tương Tác', rx + 30, ry + 45);

      const games = [
        { title: 'Trò chơi 1: Ghép Màu Nóng - Lạnh', icon: '🎨', desc: 'Học sinh phân loại màu sắc rực rỡ và mát dịu' },
        { title: 'Trò chơi 2: Đố Hình Nhận Khối 3D', icon: '🧩', desc: 'Phát triển tư duy không gian và hình học mĩ thuật' },
        { title: 'Trò chơi 3: Mắt Tinh Tìm Chi Tiết', icon: '🔍', desc: 'Khám phá nét vẽ độc đáo trong tranh dân gian' }
      ];

      games.forEach((g, idx) => {
        const gy = ry + 80 + idx * 150;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.fillRect(rx + 25, gy, rw - 50, 130);
        ctx.strokeRect(rx + 25, gy, rw - 50, 130);

        ctx.font = '36px sans-serif';
        ctx.fillText(g.icon, rx + 45, gy + 55);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText(g.title, rx + 105, gy + 45);

        ctx.fillStyle = '#64748b';
        ctx.font = '15px sans-serif';
        ctx.fillText(g.desc, rx + 105, gy + 80);

        ctx.fillStyle = '#4f46e5';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('▶ Chơi ngay trên màn hình chiếu lớp', rx + 105, gy + 110);
      });

      ctx.restore();
    }
  },
  {
    id: 6,
    partNumber: 'PHẦN 6 / 7',
    title: 'CAM CHẤM TRANH RUBRIC TT27 & XUẤT SMAS',
    subtitle: 'Mắt thần thẩm định bố cục, màu sắc ngoại tuyến; soạn sẵn nhận xét ấm áp và xuất file Excel',
    time: '4:45 - 5:45',
    activeTab: 'camera',
    audioSrc: '/video-guide/audio/part6.mp3',
    highlights: [
      { text: 'Phân tích ảnh trực tiếp trên máy • Bảo vệ quyền riêng tư', color: '#10b981' },
      { text: 'Thang Rubric 4 tiêu chí chuẩn GDPT 2018', color: '#f59e0b' },
      { text: 'Xuất file Excel đồng bộ trực tiếp sang SMAS / vnEdu', color: '#8b5cf6' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 25;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Left: Camera Scanner Feed
      const cx = sx + 40;
      const cy = sy + 40;
      const cw = 540;
      const ch = 680;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx, cy, cw, ch);

      // Student drawing inside camera view
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx + 40, cy + 60, cw - 80, ch - 160);

      // Child drawing a colorful tree and house
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx + 120, cy + 320, 160, 120);
      ctx.beginPath();
      ctx.moveTo(cx + 100, cy + 320);
      ctx.lineTo(cx + 200, cy + 240);
      ctx.lineTo(cx + 300, cy + 320);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Big green tree
      ctx.beginPath();
      ctx.arc(cx + 360, cy + 300, 70, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 345, cy + 370, 30, 90);

      // Corner viewfinder scanning brackets
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 5;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(cx + 30, cy + 80); ctx.lineTo(cx + 30, cy + 50); ctx.lineTo(cx + 60, cy + 50); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(cx + cw - 30, cy + 80); ctx.lineTo(cx + cw - 30, cy + 50); ctx.lineTo(cx + cw - 60, cy + 50); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(cx + 30, cy + ch - 120); ctx.lineTo(cx + 30, cy + ch - 90); ctx.lineTo(cx + 60, cy + ch - 90); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(cx + cw - 30, cy + ch - 120); ctx.lineTo(cx + cw - 30, cy + ch - 90); ctx.lineTo(cx + cw - 60, cy + ch - 90); ctx.stroke();

      // Scanning Laser Line
      const scanY = cy + 80 + ((t * 120) % (ch - 200));
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(cx + 40, scanY);
      ctx.lineTo(cx + cw - 40, scanY);
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Right: Rubric 4 Bars & Pedagogical Feedback
      const rx = sx + 620;
      const ry = sy + 40;
      const rw = sw - 660;

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Đánh Giá Rubric Chuẩn GDPT 2018', rx, ry + 30);

      const rubrics = [
        { label: '1. Sáng tạo & Ý tưởng', score: 95, color: '#f59e0b' },
        { label: '2. Bố cục & Không gian', score: 85, color: '#3b82f6' },
        { label: '3. Kỹ thuật nét & Màu sắc', score: 90, color: '#10b981' },
        { label: '4. Cảm xúc & Tính hoàn thiện', score: 95, color: '#ec4899' }
      ];

      rubrics.forEach((rb, idx) => {
        const by = ry + 70 + idx * 65;
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(rb.label, rx, by);

        // Bar background
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(rx, by + 10, rw, 22);

        // Bar progress
        ctx.fillStyle = rb.color;
        ctx.fillRect(rx, by + 10, rw * (rb.score / 100), 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`${rb.score}/100 (Tốt)`, rx + rw * (rb.score / 100) - 80, by + 26);
      });

      // Warm Teacher Comment Card
      const comY = ry + 350;
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2;
      ctx.fillRect(rx, comY, rw, 150);
      ctx.strokeRect(rx, comY, rw, 150);

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('💬 Gợi ý nhận xét Thông tư 27 của Thầy Cô:', rx + 25, comY + 35);

      ctx.fillStyle = '#1e293b';
      ctx.font = '16px sans-serif';
      ctx.fillText('"Bức tranh của con có hòa sắc rực rỡ và nét vẽ rất tự tin. Con hãy nhấn"', rx + 25, comY + 70);
      ctx.fillText('"đậm thêm phần bóng đổ dưới gốc cây để bài vẽ có chiều sâu hơn nhé!"', rx + 25, comY + 100);

      // Export SMAS Excel Button
      const btnY = comY + 180;
      ctx.fillStyle = '#059669';
      ctx.fillRect(rx, btnY, rw, 55);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 19px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📊 Xuất File Excel Chuẩn Đồng Bộ Sang SMAS / vnEdu', rx + rw / 2, btnY + 34);

      ctx.restore();
    }
  },
  {
    id: 7,
    partNumber: 'PHẦN 7 / 7',
    title: 'TRÌNH CHIẾU F5 TOÀN MÀN HÌNH & TRUY CẬP TRỰC TUYẾN',
    subtitle: 'Trình chiếu sắc nét, đồng hồ đếm giờ, địa chỉ trực tuyến chính thức: co-nhi-studio.vercel.app',
    time: '5:45 - 7:00',
    activeTab: 'presentation',
    audioSrc: '/video-guide/audio/part7.mp3',
    highlights: [
      { text: 'Phím tắt F5 bắt đầu tiết học ngay tức thì', color: '#3b82f6' },
      { text: 'Địa chỉ ngắn gọn: co-nhi-studio.vercel.app', color: '#10b981' },
      { text: 'Tự động cập nhật tính năng mới • Miễn phí vĩnh viễn', color: '#f59e0b' }
    ],
    drawPreview: (ctx, t) => {
      ctx.save();
      const sx = 280, sy = 160, sw = 1360, sh = 765;

      // Dark Presentation Mode Background
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 30;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.shadowColor = 'transparent';

      // Inner 16:9 Presentation Slide
      const px = sx + 80;
      const py = sy + 60;
      const pw = sw - 160;
      const ph = sh - 180;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, pw, ph);

      // Slide Content
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chào Mừng Các Em Đến Với Tiết Học Mĩ Thuật!', px + pw / 2, py + 80);

      // Giant Celebratory Art Centerpiece
      ctx.font = '100px sans-serif';
      ctx.fillText('🎨 🌟 🖌️', px + pw / 2, py + 220);

      // Big Web Address Banner
      const urlPulse = 1 + Math.sin(t * 4) * 0.02;
      ctx.save();
      ctx.translate(px + pw / 2, py + 340);
      ctx.scale(urlPulse, urlPulse);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-350, -45, 700, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('co-nhi-studio.vercel.app', 0, 12);
      ctx.restore();

      // Bottom Presentation Toolbar in slide
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx, sy + sh - 80, sw, 80);

      // Timer on bottom left
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⏱️ Thời gian tiết học: 35:00', sx + 40, sy + sh - 35);

      // Slide counter
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Slide 1 / 8 • Phím F5 để mở toàn màn hình', sx + 420, sy + sh - 35);

      // Audio status indicator
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🔊 Thuyết minh tự động: BẬT', sx + sw - 40, sy + sh - 35);

      ctx.restore();
    }
  }
];
