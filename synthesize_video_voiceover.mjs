import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import https from 'https';
import fs from 'fs';
import path from 'path';

const segments = [
  {
    id: 1,
    title: 'Phần 1: Giới thiệu tổng quan & Khởi đầu với trang trắng',
    time: '0:00 - 0:45',
    sentences: [
      'Kính chào quý Thầy Cô giáo dạy Mĩ thuật Tiểu học trên mọi miền Tổ quốc!',
      'Một tiết học vẽ thành công luôn bắt đầu từ niềm cảm hứng và sự chuẩn bị chu đáo của Thầy Cô.',
      'Nhưng làm sao để vừa có những trang slide bài giảng sinh động, vừa thị phạm nét vẽ dễ hiểu, lại vừa chấm bài và nhận xét học sinh theo Thông tư 27 thật nhanh chóng mà hoàn toàn miễn phí?',
      'Chào mừng quý Thầy Cô đến với Cọ Nhí Studio, phần mềm soạn giảng và trình chiếu mĩ thuật chuyên biệt đầu tiên dành cho Thầy Cô tiểu học theo bộ sách Kết nối tri thức với cuộc sống.',
      'Ngay khi mở ứng dụng, Thầy Cô sẽ có ngay một không gian làm việc trắng tinh, sạch sẽ, không quảng cáo, sẵn sàng cho những ý tưởng sáng tạo tuyệt vời!'
    ]
  },
  {
    id: 2,
    title: 'Phần 2: Soạn slide 16:9, Tải lên & Xuất PowerPoint',
    time: '0:45 - 1:45',
    sentences: [
      'Thao tác trên Cọ Nhí Studio vô cùng quen thuộc và trực quan giống như PowerPoint.',
      'Màn hình trung tâm luôn giữ đúng tỉ lệ vàng 16 chia 9, đảm bảo khi trình chiếu trên tivi hay máy chiếu ở lớp học sẽ vừa khít, không bao giờ bị méo hình hay tràn viền.',
      'Thầy Cô có thể dễ dàng thêm chữ, đổi màu sắc tươi sáng, chèn hình khối và hình ảnh minh họa.',
      'Khi cần xóa ảnh hay đối tượng, chỉ cần rê chuột và nhấp vào biểu tượng thùng rác màu đỏ ngay trên ảnh, hoặc ấn phím Delete trên bàn phím.',
      'Đặc biệt, nếu Thầy Cô đã có sẵn các bài giảng PowerPoint cũ, chỉ cần bấm Tải giáo án PowerPoint lên, hệ thống sẽ phân tích và mở toàn bộ slide ngay trong trình duyệt.',
      'Soạn xong, Thầy Cô có thể bấm Xuất PowerPoint để mang đi giảng dạy ở bất cứ đâu!'
    ]
  },
  {
    id: 3,
    title: 'Phần 3: Trợ lý Sư phạm AI & Giọng đọc Thầy Nam / Cô Nữ Neural',
    time: '1:45 - 2:45',
    sentences: [
      'Điểm khác biệt lớn nhất của Cọ Nhí Studio chính là người bạn Trợ Giảng Sư Phạm luôn túc trực ở góc màn hình.',
      'Thầy Cô chỉ cần chọn khối lớp và bài học, Trợ giảng sẽ gợi ý ngay mục tiêu cần đạt theo Thông tư 32, thiết kế trò chơi đố vui khởi động và hướng dẫn 4 bước tạo hình.',
      'Thầy Cô có thể dùng trợ giảng Cục bộ ngoại tuyến không cần mạng, hoặc dùng AI Pollinations miễn phí 100%.',
      'Hơn thế nữa, hệ thống trang bị công nghệ giọng đọc tiếng Việt chuẩn Neural: Thầy Cô có thể chọn giọng Thầy giáo Nam Minh trầm ấm, hào sảng; hoặc giọng Cô giáo Hoài My nhẹ nhàng, truyền cảm để đọc nội dung slide và lời dặn dò cho các em học sinh nghe ngay trong tiết dạy!'
    ]
  },
  {
    id: 4,
    title: 'Phần 4: Xưởng Ý Tưởng – Sinh bài dạy & Tranh mẫu theo ý tưởng',
    time: '2:45 - 3:45',
    sentences: [
      'Mỗi khi Thầy Cô cần một ý tưởng bài dạy mới lạ hay muốn thiết kế bài theo chủ đề địa phương, hãy ghé thăm Xưởng Ý Tưởng.',
      'Chỉ cần gõ một dòng ý tưởng đơn giản, ví dụ: Vẽ con thuyền buồm ra khơi trong ánh bình minh, hệ thống sẽ tự động xây dựng một kế hoạch dạy học chi tiết từ kiến thức, kỹ năng đến câu hỏi gợi mở.',
      'Đặc biệt, Cọ Nhí Studio sẽ tự động vẽ một bức tranh mẫu minh họa theo phong cách sáp màu và màu nước trong trẻo của học sinh tiểu học.',
      'Thầy Cô cũng có thể tải ảnh ý tưởng từ máy lên, bấm Chèn vào slide để có ngay một bài giảng hoàn chỉnh chỉ sau vài giây!'
    ]
  },
  {
    id: 5,
    title: 'Phần 5: Bảng vẽ thị phạm 11 khối 3D & Mini-Game mĩ thuật',
    time: '3:45 - 4:45',
    sentences: [
      'Để giúp học sinh nắm vững cách phác hình và dựng khối, tab Bảng Vẽ Thị Phạm được trang bị đầy đủ 11 hình học phẳng và khối không gian 3D như hình hộp, hình trụ, hình nón.',
      'Nét vẽ được tối ưu bằng thuật toán đường cong Bézier bậc 2, giúp Thầy Cô vẽ bằng chuột vẫn mềm mại, tròn trịa.',
      'Vẽ xong, chỉ cần bấm Chèn Tranh Vào Slide là tác phẩm đã nằm ngay trên bài giảng!',
      'Bên cạnh đó, hệ thống còn có 3 Mini-game mĩ thuật tương tác theo chuẩn phân phối chương trình: Ghép màu nóng lạnh, nhận biết hình học và tìm chi tiết tranh.',
      'Thầy Cô có thể chiếu cho học sinh thi đua giữa các tổ ngay trong lớp, tạo nên không khí học tập vô cùng sôi nổi, hào hứng!'
    ]
  },
  {
    id: 6,
    title: 'Phần 6: Cam Chấm Tranh Rubric TT27 & Xuất SMAS',
    time: '4:45 - 5:45',
    sentences: [
      'Đến khâu đánh giá sản phẩm, chức năng Cam Chấm Tranh sẽ là trợ thủ đắc lực cho Thầy Cô.',
      'Thầy Cô có thể dùng webcam máy tính hoặc tải ảnh chụp bài vẽ của học sinh lên.',
      'Ứng dụng phân tích hòa sắc và bố cục trực tiếp trên máy tính mà không gửi ảnh lên mạng, tuyệt đối bảo vệ quyền riêng tư của các em.',
      'Dựa trên Thang Rubric 4 tiêu chí chuẩn GDPT 2018, app sẽ gợi ý 3 bước cải thiện cụ thể và soạn sẵn câu nhận xét ấm áp, khích lệ.',
      'Thầy Cô luôn là người quyết định cuối cùng.',
      'Đặc biệt, tại tab Đánh giá Thông tư 27, Thầy Cô chỉ cần tải danh sách lớp từ Excel lên, hệ thống sẽ gợi ý nhận xét phong phú cho từng em và xuất file Excel hoàn chỉnh để đồng bộ ngay sang hệ thống SMAS hoặc vnEdu!'
    ]
  },
  {
    id: 7,
    title: 'Phần 7: Trình chiếu F5 lớp học & Hướng dẫn truy cập',
    time: '5:45 - 7:00',
    sentences: [
      'Khi bước vào giờ dạy, Thầy Cô chỉ cần bấm F5 hoặc nút Trình Chiếu.',
      'Giao diện toàn màn hình sắc nét, điều khiển mượt mà bằng phím bấm hoặc chuột, tích hợp đồng hồ bấm giờ và lời giảng sinh động sẽ giúp tiết mĩ thuật trở thành một hành trình khám phá nghệ thuật đầy ắp tiếng cười!',
      'Cọ Nhí Studio được xuất bản trực tuyến tại địa chỉ ngắn gọn, dễ nhớ: co-nhi-studio.vercel.app.',
      'Ứng dụng chạy mượt trên mọi máy tính, máy tính bảng mà không cần cài đặt phức tạp, và luôn được tự động cập nhật những tính năng mới nhất hoàn toàn miễn phí.',
      'Kính chúc quý Thầy Cô có những tiết dạy mĩ thuật tràn đầy niềm vui và chắp cánh cho những ước mơ hội họa của các thế hệ học trò thân yêu!',
      'Xin chân thành cảm ơn quý Thầy Cô!'
    ]
  }
];

const outDir = path.resolve('public/video-guide/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function fetchGoogleTtsSingleChunk(text) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Google TTS status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function fetchGoogleTts(text) {
  const words = text.split(/\s+/);
  const segments = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= 130) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) segments.push(current);
      current = word;
    }
  }
  if (current) segments.push(current);

  const buffers = [];
  for (const seg of segments) {
    const buf = await fetchGoogleTtsSingleChunk(seg);
    buffers.push(buf);
    await new Promise(r => setTimeout(r, 120));
  }
  return Buffer.concat(buffers);
}

async function synthSentence(sentence) {
  // First attempt: Edge TTS Nam Minh Neural
  try {
    const tts = new MsEdgeTTS({ enableLogger: false });
    await tts.setMetadata('vi-VN-NamMinhNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(sentence, { rate: '+0%', pitch: '+0Hz', volume: '+0%' });
    const chunks = [];

    const buf = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (chunks.length > 0) resolve(Buffer.concat(chunks));
        else reject(new Error('Edge TTS timeout'));
      }, 15000);

      audioStream.on('data', c => chunks.push(c));
      audioStream.on('end', () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks));
      });
      audioStream.on('error', err => {
        clearTimeout(timer);
        if (chunks.length > 0) resolve(Buffer.concat(chunks));
        else reject(err);
      });
    });

    if (buf && buf.length > 500) {
      return buf;
    }
  } catch (err) {
    console.warn(`    Edge TTS không khả dụng (${err.message}), chuyển sang Google TTS fallback...`);
  }

  // Fallback: Google TTS with chunking
  return await fetchGoogleTts(sentence);
}

async function run() {
  console.log('=== BẮT ĐẦU TỔNG HỢP ÂM THANH VIDEO HƯỚNG DẪN 7 PHÚT CỌ NHÍ STUDIO ===\n');
  const metadata = [];

  for (const seg of segments) {
    const filePath = path.join(outDir, `part${seg.id}.mp3`);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
      console.log(`⚡ [${seg.title}] đã tồn tại (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB), bỏ qua.`);
      metadata.push({
        id: seg.id,
        title: seg.title,
        time: seg.time,
        audioFile: `/video-guide/audio/part${seg.id}.mp3`,
        sizeBytes: fs.statSync(filePath).size,
        sentences: seg.sentences
      });
      continue;
    }

    console.log(`\n▶ Đang xử lý [${seg.title}] (${seg.time})...`);
    const sentenceBuffers = [];

    for (let i = 0; i < seg.sentences.length; i++) {
      const s = seg.sentences[i];
      process.stdout.write(`  [${i + 1}/${seg.sentences.length}] "${s.slice(0, 45)}..." `);
      const buf = await synthSentence(s);
      sentenceBuffers.push(buf);
      console.log(`-> ${buf.length} bytes OK`);
      // Nghỉ nhẹ 250ms giữa các câu
      await new Promise(r => setTimeout(r, 250));
    }

    const combined = Buffer.concat(sentenceBuffers);
    fs.writeFileSync(filePath, combined);
    console.log(`✓ XUẤT THÀNH CÔNG: part${seg.id}.mp3 (${(combined.length / 1024).toFixed(1)} KB)`);

    metadata.push({
      id: seg.id,
      title: seg.title,
      time: seg.time,
      audioFile: `/video-guide/audio/part${seg.id}.mp3`,
      sizeBytes: combined.length,
      sentences: seg.sentences
    });
  }

  const metaPath = path.join(outDir, 'metadata.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`\n✓ Đã lưu metadata vào ${metaPath}`);
  console.log('\n=== HOÀN TẤT 100% 7 PHẦN THUYẾT MINH VIDEO! ===');
}

run().catch(err => {
  console.error('Lỗi nghiêm trọng:', err);
  process.exit(1);
});
