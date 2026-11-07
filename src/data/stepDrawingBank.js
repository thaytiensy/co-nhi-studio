/**
 * Ngân hàng Dữ liệu Thị Phạm Hoạt Họa 4 Bước (Step-by-Step Drawing Bank)
 * Chuẩn sư phạm Mĩ thuật Tiểu học GDPT 2018 (Từ hình học cơ bản -> Hoàn thiện màu sắc)
 * Hoạt động 100% cục bộ trên Canvas HTML5.
 */

export const STEP_DRAWING_TOPICS = [
  {
    id: 'cat',
    name: 'Chú Mèo Con',
    category: 'Động vật',
    grade: 1,
    icon: '🐱',
    steps: [
      {
        step: 1,
        title: 'Bước 1: Phác Khung Hình Học Cơ Bản',
        instruction: 'Vẽ 1 hình tròn nhỏ làm đầu và 1 hình bầu dục to hơn một chút làm thân mèo.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          // Đầu tròn
          ctx.beginPath();
          ctx.arc(w * 0.45, h * 0.35, 60, 0, Math.PI * 2);
          ctx.stroke();
          // Thân bầu dục
          ctx.beginPath();
          ctx.ellipse(w * 0.55, h * 0.65, 80, 100, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      },
      {
        step: 2,
        title: 'Bước 2: Nối Nét Chính & Tai, Đuôi',
        instruction: 'Vẽ 2 tai tam giác nhọn trên đầu, nối cổ với thân và vẽ chiếc đuôi cong mềm mại.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 4;
          // Tai trái
          ctx.beginPath();
          ctx.moveTo(w * 0.38, h * 0.28);
          ctx.lineTo(w * 0.35, h * 0.18);
          ctx.lineTo(w * 0.45, h * 0.25);
          ctx.stroke();
          // Tai phải
          ctx.beginPath();
          ctx.moveTo(w * 0.48, h * 0.25);
          ctx.lineTo(w * 0.55, h * 0.18);
          ctx.lineTo(w * 0.52, h * 0.28);
          ctx.stroke();
          // Nối cổ và lưng
          ctx.beginPath();
          ctx.moveTo(w * 0.45, h * 0.45);
          ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.55, h * 0.55);
          ctx.stroke();
          // Đuôi cong
          ctx.beginPath();
          ctx.moveTo(w * 0.65, h * 0.72);
          ctx.bezierCurveTo(w * 0.78, h * 0.75, w * 0.85, h * 0.6, w * 0.78, h * 0.5);
          ctx.stroke();
        }
      },
      {
        step: 3,
        title: 'Bước 3: Tỉa Nét Chi Tiết Mắt Mũi & Râu',
        instruction: 'Vẽ đôi mắt tròn long lanh, chiếc mũi tam giác nhỏ xinh và 6 sợi râu mèo dứt khoát.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#0f172a';
          ctx.fillStyle = '#0f172a';
          ctx.lineWidth = 3;
          // Mắt trái
          ctx.beginPath();
          ctx.arc(w * 0.41, h * 0.34, 7, 0, Math.PI * 2);
          ctx.fill();
          // Mắt phải
          ctx.beginPath();
          ctx.arc(w * 0.49, h * 0.34, 7, 0, Math.PI * 2);
          ctx.fill();
          // Mũi tam giác hồng
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(w * 0.43, h * 0.38);
          ctx.lineTo(w * 0.47, h * 0.38);
          ctx.lineTo(w * 0.45, h * 0.41);
          ctx.closePath();
          ctx.fill();
          // Miệng
          ctx.beginPath();
          ctx.arc(w * 0.43, h * 0.43, 6, 0, Math.PI);
          ctx.arc(w * 0.47, h * 0.43, 6, 0, Math.PI);
          ctx.stroke();
          // Râu 2 bên
          ctx.beginPath();
          ctx.moveTo(w * 0.38, h * 0.39); ctx.lineTo(w * 0.28, h * 0.37);
          ctx.moveTo(w * 0.38, h * 0.41); ctx.lineTo(w * 0.27, h * 0.42);
          ctx.moveTo(w * 0.52, h * 0.39); ctx.lineTo(w * 0.62, h * 0.37);
          ctx.moveTo(w * 0.52, h * 0.41); ctx.lineTo(w * 0.63, h * 0.42);
          ctx.stroke();
        }
      },
      {
        step: 4,
        title: 'Bước 4: Lên Màu Tươi Sáng & Đổ Bóng',
        instruction: 'Tô màu vàng cam ấm áp cho chú mèo, thêm vài sọc vằn nâu và đổ bóng nhẹ dưới chân.',
        draw: (ctx, w, h) => {
          // Màu thân vàng cam
          ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
          ctx.beginPath();
          ctx.arc(w * 0.45, h * 0.35, 58, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(w * 0.55, h * 0.65, 78, 98, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          // Bóng đổ dưới chân
          ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
          ctx.beginPath();
          ctx.ellipse(w * 0.55, h * 0.86, 90, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    ]
  },
  {
    id: 'sunflower',
    name: 'Bông Hoa Hướng Dương',
    category: 'Thực vật',
    grade: 1,
    icon: '🌻',
    steps: [
      {
        step: 1,
        title: 'Bước 1: Khung Tròn & Trục Thân',
        instruction: 'Vẽ một hình tròn lớn làm nhụy hoa ở giữa và đường uốn lượn nhẹ làm thân cây.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.38, 55, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.45);
          ctx.quadraticCurveTo(w * 0.52, h * 0.7, w * 0.5, h * 0.9);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      },
      {
        step: 2,
        title: 'Bước 2: Vẽ Các Cánh Hoa Tỏa Đều',
        instruction: 'Vẽ từng cánh hoa hình giọt nước xếp bao quanh nhụy tròn như ánh mặt trời tỏa sáng.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 3.5;
          const cx = w * 0.5;
          const cy = h * 0.38;
          const rInner = 55;
          const rOuter = 110;
          const petals = 12;

          for (let i = 0; i < petals; i++) {
            const angle = (i * 2 * Math.PI) / petals;
            const xTip = cx + Math.cos(angle) * rOuter;
            const yTip = cy + Math.sin(angle) * rOuter;
            const angleL = angle - 0.15;
            const angleR = angle + 0.15;
            const xL = cx + Math.cos(angleL) * rInner;
            const yL = cy + Math.sin(angleL) * rInner;
            const xR = cx + Math.cos(angleR) * rInner;
            const yR = cy + Math.sin(angleR) * rInner;

            ctx.beginPath();
            ctx.moveTo(xL, yL);
            ctx.quadraticCurveTo((xL + xTip) / 2, (yL + yTip) / 2 - 5, xTip, yTip);
            ctx.quadraticCurveTo((xR + xTip) / 2, (yR + yTip) / 2 + 5, xR, yR);
            ctx.stroke();
          }
        }
      },
      {
        step: 3,
        title: 'Bước 3: Vẽ Lá Cây & Hạt Nhụy',
        instruction: 'Vẽ thân dày dặn, thêm 2 chiếc lá to hình trái tim ở hai bên và chấm hạt nhụy hoa.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 5;
          // Thân cây
          ctx.beginPath();
          ctx.moveTo(w * 0.5, h * 0.45);
          ctx.quadraticCurveTo(w * 0.52, h * 0.7, w * 0.5, h * 0.9);
          ctx.stroke();
          // Lá trái
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(w * 0.51, h * 0.65);
          ctx.quadraticCurveTo(w * 0.32, h * 0.58, w * 0.28, h * 0.68);
          ctx.quadraticCurveTo(w * 0.38, h * 0.76, w * 0.51, h * 0.7);
          ctx.stroke();
          // Lá phải
          ctx.beginPath();
          ctx.moveTo(w * 0.51, h * 0.72);
          ctx.quadraticCurveTo(w * 0.68, h * 0.65, w * 0.72, h * 0.75);
          ctx.quadraticCurveTo(w * 0.62, h * 0.83, w * 0.51, h * 0.77);
          ctx.stroke();
        }
      },
      {
        step: 4,
        title: 'Bước 4: Tô Màu Vàng Nắng Rực Rỡ',
        instruction: 'Tô nhụy màu nâu hạt dẻ, cánh màu vàng cam rực rỡ và lá màu xanh mướt mát.',
        draw: (ctx, w, h) => {
          // Nhụy nâu
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.38, 54, 0, Math.PI * 2);
          ctx.fill();
          // Hạt nhụy vàng chấm li ti
          ctx.fillStyle = '#fef08a';
          for (let i = 0; i < 25; i++) {
            const rx = (Math.random() - 0.5) * 70;
            const ry = (Math.random() - 0.5) * 70;
            ctx.beginPath();
            ctx.arc(w * 0.5 + rx, h * 0.38 + ry, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    ]
  },
  {
    id: 'house',
    name: 'Ngôi Nhà Mái Ngói',
    category: 'Đời sống',
    grade: 2,
    icon: '🏡',
    steps: [
      {
        step: 1,
        title: 'Bước 1: Hình Chữ Nhật & Tam Giác',
        instruction: 'Vẽ khung nhà hình chữ nhật lớn và mái nhà hình tam giác cân phía trên.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          // Thân nhà chữ nhật
          ctx.strokeRect(w * 0.3, h * 0.45, w * 0.4, h * 0.4);
          // Mái tam giác
          ctx.beginPath();
          ctx.moveTo(w * 0.26, h * 0.45);
          ctx.lineTo(w * 0.5, h * 0.22);
          ctx.lineTo(w * 0.74, h * 0.45);
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
        }
      },
      {
        step: 2,
        title: 'Bước 2: Cửa Chính & Cửa Sổ',
        instruction: 'Vẽ cửa ra vào hình vòm hoặc chữ nhật đứng ở giữa, hai cửa sổ vuông hai bên.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3.5;
          // Thân và mái viền đậm
          ctx.strokeRect(w * 0.3, h * 0.45, w * 0.4, h * 0.4);
          ctx.beginPath();
          ctx.moveTo(w * 0.26, h * 0.45);
          ctx.lineTo(w * 0.5, h * 0.22);
          ctx.lineTo(w * 0.74, h * 0.45);
          ctx.closePath();
          ctx.stroke();
          // Cửa chính
          ctx.strokeRect(w * 0.45, h * 0.6, w * 0.1, h * 0.25);
          // 2 Cửa sổ
          ctx.strokeRect(w * 0.34, h * 0.55, w * 0.07, h * 0.09);
          ctx.strokeRect(w * 0.59, h * 0.55, w * 0.07, h * 0.09);
        }
      },
      {
        step: 3,
        title: 'Bước 3: Vẽ Ống Khói & Cây Xanh',
        instruction: 'Thêm ống khói tỏa làn mây mỏng và cây xanh rợp bóng mát bên cạnh nhà.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          // Ống khói
          ctx.strokeRect(w * 0.6, h * 0.23, w * 0.05, h * 0.08);
          // Cây xanh tán tròn
          ctx.beginPath();
          ctx.arc(w * 0.8, h * 0.55, 45, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeRect(w * 0.78, h * 0.65, 12, h * 0.2);
        }
      },
      {
        step: 4,
        title: 'Bước 4: Mái Đỏ Tường Vàng Nắng',
        instruction: 'Tô mái ngói màu đỏ cam ấm áp, tường màu vàng tươi và tán cây xanh ngát.',
        draw: (ctx, w, h) => {
          // Mái đỏ
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.beginPath();
          ctx.moveTo(w * 0.26, h * 0.45);
          ctx.lineTo(w * 0.5, h * 0.22);
          ctx.lineTo(w * 0.74, h * 0.45);
          ctx.closePath();
          ctx.fill();
          // Tường vàng
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.fillRect(w * 0.3, h * 0.45, w * 0.4, h * 0.4);
          // Tán cây xanh
          ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
          ctx.beginPath();
          ctx.arc(w * 0.8, h * 0.55, 43, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    ]
  },
  {
    id: 'dongho_rooster',
    name: 'Chú Gà Trống Đông Hồ',
    category: 'Di sản Việt Nam',
    grade: 3,
    icon: '🐓',
    steps: [
      {
        step: 1,
        title: 'Bước 1: Khung Bầu Dục Thân & Mào Gà',
        instruction: 'Vẽ dáng đứng dũng mãnh của gà bằng hình bầu dục nghiêng và vòm tròn đầu gà.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(w * 0.38, h * 0.35, 40, 0, Math.PI * 2);
          ctx.ellipse(w * 0.5, h * 0.58, 65, 90, -Math.PI / 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      },
      {
        step: 2,
        title: 'Bước 2: Mào Đỏ & Đuôi Xòe Rực Rỡ',
        instruction: 'Vẽ mào cờ uốn lượn sắc sảo, mỏ nhọn và dải lông đuôi cong vút kiêu hãnh.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#b91c1c';
          ctx.lineWidth = 4;
          // Mào gà
          ctx.beginPath();
          ctx.moveTo(w * 0.35, h * 0.3);
          ctx.quadraticCurveTo(w * 0.36, h * 0.2, w * 0.4, h * 0.22);
          ctx.quadraticCurveTo(w * 0.42, h * 0.18, w * 0.46, h * 0.24);
          ctx.stroke();
          // Đuôi cong
          ctx.strokeStyle = '#15803d';
          ctx.beginPath();
          ctx.moveTo(w * 0.58, h * 0.55);
          ctx.bezierCurveTo(w * 0.8, h * 0.4, w * 0.85, h * 0.25, w * 0.75, h * 0.15);
          ctx.stroke();
        }
      },
      {
        step: 3,
        title: 'Bước 3: Đôi Cánh & Đôi Chân Vững Chãi',
        instruction: 'Vẽ vây cánh với các lớp lông vũ hoa văn dân gian, đôi chân có cựa vàng sắc sảo.',
        draw: (ctx, w, h) => {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3.5;
          // Chân
          ctx.beginPath();
          ctx.moveTo(w * 0.47, h * 0.72); ctx.lineTo(w * 0.45, h * 0.88);
          ctx.moveTo(w * 0.55, h * 0.7); ctx.lineTo(w * 0.55, h * 0.88);
          ctx.stroke();
        }
      },
      {
        step: 4,
        title: 'Bước 4: Sắc Màu Tranh Dân Gian Điệp',
        instruction: 'Tô sắc màu dân gian: Vàng hoa hòe, đỏ sỏi son, xanh lá chàm và đen than tre đặc trưng.',
        draw: (ctx, w, h) => {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
          ctx.beginPath();
          ctx.ellipse(w * 0.5, h * 0.58, 63, 88, -Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    ]
  }
];
