import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('Kiểm định Trí tuệ AI thấu hiểu ngôn ngữ người nói & Tốc độ phát âm 0.3s', async (t) => {
  const { getNaturalPedagogyResponse, getSpokenDialogueResponse } = await import('../src/utils/naturalPedagogyChatService.js');
  const { PEDAGOGY_KNOWLEDGE } = await import('../src/utils/pedagogyKnowledgeBase.js');
  const { AudioQueuePlayer } = await import('../src/utils/audioQueuePlayer.js');

  await t.test('1. Thấu hiểu câu hỏi lý thuyết màu sắc và chất liệu mĩ thuật', () => {
    // Màu cơ bản
    const colorRes = getNaturalPedagogyResponse('Ba màu cơ bản trong mĩ thuật là gì?');
    assert.ok(colorRes.includes('Đỏ, Vàng và Lam'), 'Phải nhận diện và trả lời đúng 3 màu cơ bản');

    // Màu nhị hợp
    const secColorRes = getNaturalPedagogyResponse('Cách pha màu nhị hợp như thế nào?');
    assert.ok(secColorRes.includes('Cam') && secColorRes.includes('Lục') && secColorRes.includes('Tím'), 'Phải hướng dẫn pha màu nhị hợp');

    // Màu bổ túc
    const compColorRes = getNaturalPedagogyResponse('Màu bổ túc là gì?');
    assert.ok(compColorRes.includes('Đỏ - Lục') || compColorRes.includes('Vàng - Tím'), 'Phải trả lời đúng cặp màu bổ túc');

    // Kỹ thuật đất nặn & sáp màu
    const clayRes = getNaturalPedagogyResponse('Hướng dẫn kỹ thuật nặn khối cho học sinh');
    assert.ok(clayRes.includes('đất nặn') && clayRes.includes('mềm dẻo'), 'Phải hiểu câu hỏi về đất nặn');
  });

  await t.test('2. Thấu hiểu tình huống lớp học đa dạng (đổ màu, rách giấy, lười vẽ)', () => {
    const spillRes = getNaturalPedagogyResponse('Học sinh lỡ tay làm đổ màu lem ra giấy thì xử lý sao?');
    assert.ok(spillRes.includes('Thấm khô') || spillRes.includes('bụi cỏ') || spillRes.includes('vết lem'), 'Phải có giải pháp xử lý đổ màu');

    const spokenSpill = getSpokenDialogueResponse('Học sinh làm rách giấy');
    assert.ok(spokenSpill.includes('vết rách') || spokenSpill.includes('xé dán') || spokenSpill.includes('giấy'), 'Robot phải có lời nói ứng biến khi rách giấy');
  });

  await t.test('3. Thấu hiểu ngữ cảnh slide đang mở trên màn hình (Context-Aware)', () => {
    const mockSlide = {
      title: 'Chủ đề 1: Mĩ thuật trong nhà trường',
      elements: [{ type: 'text', text: 'Nhận biết chấm nét mảng màu' }]
    };

    const spokenContext = getSpokenDialogueResponse('Bài này dạy thế nào cô ơi?', 1, '', 'female', mockSlide);
    assert.ok(spokenContext.includes('Mĩ thuật trong nhà trường'), 'Phải nhận diện được tên bài đang mở trên slide');

    const textContext = getNaturalPedagogyResponse('Slide này dạy như thế nào?', 1, '', 'female', mockSlide);
    assert.ok(textContext.includes('Mĩ thuật trong nhà trường'), 'Phải phản hồi đúng tiến trình cho slide hiện tại');
  });

  await t.test('4. Thấu hiểu câu hỏi hướng dẫn sử dụng phần mềm Cọ Nhí Studio', () => {
    const appRes = getNaturalPedagogyResponse('Hướng dẫn tôi cách dùng app Cọ Nhí Studio');
    assert.ok(appRes.includes('Soạn Slide 16:9') && appRes.includes('Bảng Vẽ Thị Phạm'), 'Phải giới thiệu đầy đủ các phân hệ của app');
  });

  await t.test('5. Nhận diện giọng nói liên tục không bị ngắt câu (continuous STT) và kết nối onSubmit', () => {
    const inputBarCode = fs.readFileSync(path.join(rootDir, 'src/components/Assistant/ChatInputBar.jsx'), 'utf-8');
    assert.match(inputBarCode, /recognition\.continuous\s*=\s*true/, 'STT phải bật continuous để người nói không bị ngắt giữa câu');
    assert.match(inputBarCode, /recognition\.interimResults\s*=\s*true/, 'STT phải bật interimResults để nghe trọn vẹn');
    assert.match(inputBarCode, /silenceTimerRef/, 'Phải có bộ đếm thời gian im lặng để gửi câu hoàn chỉnh');

    const assistantCode = fs.readFileSync(path.join(rootDir, 'src/components/Assistant/OfflinePedagogyAssistant.jsx'), 'utf-8');
    assert.match(assistantCode, /transcriptText\s*\|\|\s*userQuery/, 'OfflinePedagogyAssistant phải nhận trực tiếp transcript từ giọng nói');
  });

  await t.test('6. Động cơ âm thanh phản hồi siêu ngắn 0.3s (AudioQueuePlayer fast fallback)', () => {
    const playerCode = fs.readFileSync(path.join(rootDir, 'src/utils/audioQueuePlayer.js'), 'utf-8');
    assert.match(playerCode, /fastTimer\s*=\s*setTimeout/, 'AudioQueuePlayer phải có bộ hẹn giờ dự phòng nhanh');
    assert.match(playerCode, /350/, 'Phải giới hạn thời gian chờ TTS server trong khoảng 350ms');

    const speechCode = fs.readFileSync(path.join(rootDir, 'src/utils/speechService.js'), 'utf-8');
    assert.match(speechCode, /this\.vietnameseVoice/, 'speechService phải ưu tiên phát trực tiếp khi có giọng tiếng Việt bản địa');
  });

  await t.test('7. Vùng làm việc slide tối ưu, không bị thanh thu phóng che chữ, SpeakerNotes thu gọn mặc định', () => {
    const canvasCode = fs.readFileSync(path.join(rootDir, 'src/components/SlideEditor/SlideCanvas.jsx'), 'utf-8');
    assert.ok(!canvasCode.includes('absolute top-3 right-4 z-40 bg-white/95'), 'Thanh kính lúp không được đặt absolute che phủ canvas');
    assert.match(canvasCode, /Tỉ lệ hiển thị slide/, 'SlideCanvas phải có chỉ báo tỉ lệ hiển thị');

    const notesCode = fs.readFileSync(path.join(rootDir, 'src/components/SlideEditor/SpeakerNotes.jsx'), 'utf-8');
    assert.match(notesCode, /co_nhi_notes_expanded/, 'SpeakerNotes phải lưu trạng thái thu gọn vào localStorage');

    const toolbarCode = fs.readFileSync(path.join(rootDir, 'src/components/SlideEditor/Toolbar.jsx'), 'utf-8');
    assert.match(toolbarCode, /Cỡ Chữ Slide \(\+4pt\)/, 'Toolbar phải có nút tăng cỡ chữ slide +4pt');
    assert.match(toolbarCode, /Mở Rộng Không Gian/, 'Toolbar phải có nút mở rộng không gian làm việc');
  });
});
