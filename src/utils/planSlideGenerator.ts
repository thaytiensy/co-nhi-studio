import type { Slide } from '../types/presentation.ts';

export interface PlanData {
  id?: string;
  title: string;
  grade: number | string;
  week: number;
  period: number;
  objectives: string;
  materials?: string;
}

/**
 * Xây dựng bộ slide chuẩn sư phạm 4 bước (Công văn 2345/BGDĐT & TT27)
 * Dành cho Bộ Sách Mĩ Thuật Kết Nối Tri Thức Với Cuộc Sống
 */
export function buildStandardSlidesForPlan(plan: PlanData): Slide[] {
  const cleanTitle = (plan.title || 'Bài Học Mĩ Thuật').trim();
  const gradeStr = String(plan.grade || '1').replace(/\D/g, '') || '1';
  const cleanObjectives = (plan.objectives || 'Khám phá và sáng tạo mĩ thuật').trim();
  const cleanMaterials = (plan.materials || 'Giấy vẽ A4, bút sáp màu, màu nước, kéo, hồ dán an toàn').trim();

  return [
    // Slide 1: Khởi động & Giới thiệu bài học
    {
      id: `slide-plan-${Date.now()}-1`,
      title: cleanTitle,
      background: '#ffffff',
      elements: [
        {
          id: `el-title-${Date.now()}-1`,
          type: 'text',
          text: `BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG\nMÔN MĨ THUẬT - LỚP ${gradeStr}\n\n${cleanTitle.toUpperCase()}`,
          x: 80,
          y: 70,
          width: 800,
          height: 180,
          fontSize: 24,
          fontFamily: 'Times New Roman',
          fontWeight: 'bold',
          color: '#b45309',
          textAlign: 'center',
        },
        {
          id: `el-obj-${Date.now()}-1`,
          type: 'text',
          text: `Tuần ${plan.week} • Tiết ${plan.period}\n\n🎯 MỤC TIÊU BÀI HỌC:\n${cleanObjectives}\n\n🎨 ĐỒ DÙNG HỌC TẬP:\n${cleanMaterials}`,
          x: 120,
          y: 280,
          width: 720,
          height: 180,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontWeight: 'normal',
          color: '#334155',
          textAlign: 'center',
        },
      ],
      notes: `Thầy/Cô chào các em học sinh yêu quý! Hôm nay chúng mình cùng bước vào bài học "${cleanTitle}" theo SGK Kết Nối Tri Thức Với Cuộc Sống nhé!`,
    },
    // Slide 2: Hoạt động 1 - Quan sát và Khám phá
    {
      id: `slide-plan-${Date.now()}-2`,
      title: 'Hoạt động 1: Quan Sát & Khám Phá',
      background: '#f8fafc',
      elements: [
        {
          id: `el-title-${Date.now()}-2`,
          type: 'text',
          text: `HOẠT ĐỘNG 1: QUAN SÁT VÀ KHÁM PHÁ\n${cleanTitle}`,
          x: 80,
          y: 50,
          width: 800,
          height: 90,
          fontSize: 22,
          fontFamily: 'Times New Roman',
          fontWeight: 'bold',
          color: '#0f766e',
          textAlign: 'center',
        },
        {
          id: `el-content-${Date.now()}-2`,
          type: 'text',
          text: `1. Các em hãy chú ý quan sát hình ảnh và đồ vật xung quanh.\n2. Nhận biết các đường nét, hình khối và màu sắc đặc trưng của chủ đề.\n3. Nhắc lại các màu sắc cơ bản và đồ dùng học tập cần chuẩn bị:\n   • ${cleanMaterials}\n\n❓ Câu hỏi gợi mở: Điểm nào trong hình ảnh làm các em ấn tượng nhất?`,
          x: 100,
          y: 160,
          width: 760,
          height: 280,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontWeight: 'normal',
          color: '#1e293b',
          textAlign: 'left',
        },
      ],
      notes: 'Các em thân yêu, bây giờ chúng mình cùng quan sát để khám phá những điều kì diệu của mĩ thuật trong bài học này nhé!',
    },
    // Slide 3: Hoạt động 2 - Luyện tập và Thực hành sáng tạo
    {
      id: `slide-plan-${Date.now()}-3`,
      title: 'Hoạt động 2: Luyện Tập & Thực Hành Sáng Tạo',
      background: '#fffbeb',
      elements: [
        {
          id: `el-title-${Date.now()}-3`,
          type: 'text',
          text: 'HOẠT ĐỘNG 2: THỰC HÀNH SÁNG TẠO (4 BƯỚC THỊ PHẠM)',
          x: 80,
          y: 50,
          width: 800,
          height: 90,
          fontSize: 22,
          fontFamily: 'Times New Roman',
          fontWeight: 'bold',
          color: '#c2410c',
          textAlign: 'center',
        },
        {
          id: `el-content-${Date.now()}-3`,
          type: 'text',
          text: `BỐN BƯỚC THỰC HIỆN TẠO HÌNH CHUẨN SƯ PHẠM:\n\n• Bước 1: Lên ý tưởng, phác khung hình và bố cục chính cân đối trên trang giấy.\n• Bước 2: Vẽ chi tiết đặc trưng (đường nét, hình dáng cơ bản).\n• Bước 3: Phối hợp màu sắc tươi sáng, tạo mảng đậm nhạt hài hòa.\n• Bước 4: Chấm phá điểm nhấn, chỉnh sửa và hoàn thiện tác phẩm.\n\n💡 Thầy/Cô lưu ý: Khích lệ học sinh tự do sáng tạo, không ép buộc sao chép rập khuôn.`,
          x: 100,
          y: 160,
          width: 760,
          height: 300,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontWeight: 'normal',
          color: '#1e293b',
          textAlign: 'left',
        },
      ],
      notes: 'Đã đến giờ thực hành sáng tạo rồi! Các em hãy chuẩn bị đầy đủ đồ dùng học tập để tạo nên tác phẩm độc đáo của riêng mình nào!',
    },
    // Slide 4: Hoạt động 3 - Trưng bày, Chia sẻ & Đánh giá (TT27)
    {
      id: `slide-plan-${Date.now()}-4`,
      title: 'Hoạt động 3: Trưng Bày & Đánh Giá (TT27)',
      background: '#f5f3ff',
      elements: [
        {
          id: `el-title-${Date.now()}-4`,
          type: 'text',
          text: 'HOẠT ĐỘNG 3: TRƯNG BÀY, CHIA SẺ & CẢM NHẬN',
          x: 80,
          y: 50,
          width: 800,
          height: 90,
          fontSize: 22,
          fontFamily: 'Times New Roman',
          fontWeight: 'bold',
          color: '#6d28d9',
          textAlign: 'center',
        },
        {
          id: `el-content-${Date.now()}-4`,
          type: 'text',
          text: `1. Trưng bày tác phẩm của em lên bảng hoặc giá vẽ của lớp.\n2. Chia sẻ với Thầy/Cô và các bạn:\n   • Em đã sử dụng những màu sắc và chất liệu nào trong bức tranh?\n   • Em thích nhất điều gì ở sản phẩm của bạn mình?\n3. Đánh giá nhận xét theo Thông tư 27/2020/TT-BGDĐT:\n   • Mức T (Hoàn thành tốt): Sáng tạo nổi bật, bố cục cân đối, màu sắc đẹp.\n   • Mức H (Hoàn thành): Đạt yêu cầu cần đạt của bài học.\n   • Mức C (Chưa hoàn thành): Cần Thầy/Cô hỗ trợ thêm thao tác.`,
          x: 100,
          y: 160,
          width: 760,
          height: 300,
          fontSize: 16,
          fontFamily: 'Times New Roman',
          fontWeight: 'normal',
          color: '#1e293b',
          textAlign: 'left',
        },
      ],
      notes: 'Thầy/Cô rất vui khi thấy những tác phẩm rực rỡ sắc màu của các em đã hoàn thành. Bây giờ chúng mình cùng trưng bày và chia sẻ cảm xúc nhé!',
    },
  ];
}
