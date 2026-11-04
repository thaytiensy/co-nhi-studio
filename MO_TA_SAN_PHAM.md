# BẢN MÔ TẢ SẢN PHẨM: CỌ NHÍ STUDIO
### NỀN TẢNG SOẠN GIẢNG & TRÌNH CHIẾU MĨ THUẬT TIỂU HỌC CHUYÊN BIỆT (GDPT 2018)

---

## 1. TỔNG QUAN SẢN PHẨM (EXECUTIVE SUMMARY)

* **Tên ứng dụng:** Cọ Nhí Studio (Co Nhi Studio)
* **Phiên bản:** 1.0.0 Production (Hỗ trợ Offline & Cloud Vercel)
* **Khẩu hiệu sản phẩm:** *"Phần mềm soạn giảng & trình chiếu mĩ thuật chuyên biệt cho Thầy/Cô tiểu học"*
* **Định vị:** Ứng dụng web tiến bộ (PWA/SPA) kết hợp trình soạn thảo slide kiểu PowerPoint, trợ giảng trí tuệ nhân tạo, bảng vẽ thị phạm hình khối 3D, mắt thần chấm tranh theo Rubric Thông tư 27 và hệ thống trò chơi giáo dục mĩ thuật tương tác.
* **Tôn chỉ cốt lõi:**
  * **100% Miễn phí vĩnh viễn:** Không yêu cầu nạp thẻ, không mua thêm AI credits, không tính phí duy trì.
  * **Ưu tiên hoạt động ngoại tuyến (Offline-First):** Hoạt động mượt mà ngay cả khi phòng học không có internet hoặc đường truyền yếu.
  * **Bảo vệ quyền riêng tư học đường:** Mọi hình ảnh bài vẽ của học sinh và dữ liệu lớp học được xử lý trực tiếp trên trình duyệt máy tính của giáo viên, tuyệt đối không lưu trữ hay tải lên bất kỳ máy chủ trung gian nào.
  * **Bám sát chương trình GDPT 2018:** Xây dựng chuyên sâu theo chuẩn kiến thức, kĩ năng và ma trận chủ đề của bộ sách *"Kết nối tri thức với cuộc sống"* (Thông tư 32/2018/TT-BGDĐT).
* **Địa chỉ triển khai trực tuyến:** [https://co-nhi-studio.vercel.app](https://co-nhi-studio.vercel.app)
* **Kho mã nguồn:** [https://github.com/thaytiensy/co-nhi-studio](https://github.com/thaytiensy/co-nhi-studio)

---

## 2. BỐI CẢNH & GIẢI PHÁP ĐỘT PHÁ

### 2.1. Nỗi niềm của Giáo viên Mĩ thuật Tiểu học hiện nay
1. **Phần mềm trình chiếu phổ thông không có công cụ chuyên môn:** Microsoft PowerPoint hay Canva là công cụ đa năng, thiếu bảng vẽ thị phạm trực tiếp, thiếu các hình khối không gian 3D cơ bản cho môn mĩ thuật, không có sẵn thư viện nét vẽ phân rã từng bước.
2. **Soạn giáo án và bài tập tốn nhiều thời gian:** Việc tìm kiếm hình ảnh minh họa chất lượng cao phù hợp tâm lý lứa tuổi tiểu học, viết lời dẫn bài học, đặt câu hỏi gợi mở cho từng hoạt động theo tiến trình 4 bước thường làm mất từ 2-3 giờ cho mỗi tiết học.
3. **Áp lực đánh giá thường xuyên theo Thông tư 27:** Môn Mĩ thuật đánh giá bằng nhận xét định tính (Tốt, Hoàn thành, Cần cố gắng). Mỗi lớp có từ 35-45 học sinh, giáo viên dạy nhiều lớp phải viết hàng trăm nhận xét mỗi tuần rất vất vả và dễ bị lặp từ ngữ.
4. **Rào cản công nghệ & Chi phí bản quyền:** Nhiều phần mềm đòi hỏi tài khoản đăng nhập phức tạp, bắt trả phí hàng tháng, hoặc phụ thuộc hoàn toàn vào kết nối internet tại trường học.

### 2.2. Giải pháp toàn diện của Cọ Nhí Studio
Cọ Nhí Studio được thiết kế "đo ni đóng giày" cho giáo viên mĩ thuật:
* Mang lại **trải nghiệm thân quen như PowerPoint** nhưng loại bỏ sự cồng kềnh, tập trung 100% vào nghiệp vụ giảng dạy mĩ thuật.
* Tích hợp **Trợ giảng sư phạm AI** sẵn sàng gợi ý mục tiêu, hoạt động khởi động, 4 bước vẽ tranh và đọc lời giảng bằng giọng tiếng Việt chuẩn.
* Cung cấp **Bảng vẽ thị phạm nét mượt** với 11 khối hình học và không gian 3D, hỗ trợ chèn tranh vẽ ngay vào slide bài giảng đang dạy chỉ bằng một cú nhấp.
* Tích hợp **Cam Chấm Tranh Rubric** giúp thẩm định nhanh bài làm của học sinh qua webcam hoặc ảnh chụp, tự động gợi ý nhận xét khích lệ theo đúng Thông tư 27 và xuất bảng điểm trực tiếp sang hệ thống SMAS / vnEdu.

---

## 3. HỆ SINH THÁI TÍNH NĂNG TRỌNG TÂM

### 3.1. Trình Soạn Thảo & Trình Chiếu Slide Mĩ Thuật (Slide Studio 16:9)
* **Giao diện 3 phân vùng chuẩn mực:**
  * *Cột trái:* Danh sách thu nhỏ (Thumbnail List) các slide, hỗ trợ kéo thả đổi vị trí, thêm slide mới, nhân bản và xóa slide.
  * *Vùng trung tâm:* Khung soạn thảo tỉ lệ chuẩn 16:9 (kích thước logic chuẩn 960 x 540 pixels), responsive tự co giãn hoàn hảo theo kích thước màn hình mà không bao giờ bị tràn mép ngang.
  * *Thanh công cụ ribbon trên cùng:* Thao tác trực quan với văn bản (tiêu đề, nội dung, font chữ, kích cỡ, căn lề, màu sắc), chèn hình khối, chèn ảnh từ máy tính, chèn nhạc nền và video minh họa.
* **Tương thích hai chiều với PowerPoint (.pptx):**
  * *Tải giáo án PowerPoint lên:* Đọc và phân tích trực tiếp tệp `.pptx` ngay trong trình duyệt nhờ engine OpenXML tích hợp, giữ nguyên văn bản, hình khối và hình ảnh mà không cần phần mềm Microsoft Office.
  * *Xuất tệp PowerPoint chuẩn:* Cho phép lưu toàn bộ bài giảng về tệp `.pptx` để mang đi giảng dạy ở các máy tính khác.
* **Lưu trữ tệp dự án cục bộ `.conhi`:**
  * Hỗ trợ lưu trữ trạng thái làm việc vào bộ nhớ trình duyệt (LocalStorage) và xuất/nhập tệp dự án riêng `.conhi`, không lo bị mất dữ liệu khi mất mạng hoặc tắt trình duyệt.
* **Chế độ trình chiếu F5 toàn màn hình:**
  * Điều hướng mượt mà qua phím mũi tên hoặc phím cách (Space).
  * Đồng hồ bấm giờ đếm thời lượng tiết dạy giúp giáo viên làm chủ tiến trình bài học.
  * Tích hợp bảng ghi chú sư phạm nổi (Notes Overlay) và nút kích hoạt Mini-game trực tiếp trong giờ dạy.

---

### 3.2. Trợ Giảng Sư Phạm Cọ Nhí & Đọc Lời Giảng Tiếng Việt Neural
* **Khung đàm thoại sư phạm thông minh:**
  * Hỗ trợ giáo viên soạn nhanh: (1) Mục tiêu bài học (Yêu cầu cần đạt), (2) Hoạt động khởi động vui nhộn, (3) Câu hỏi gợi mở phát triển tư duy thẩm mỹ, (4) Lời dẫn giảng giải, (5) Quy trình 4 bước vẽ tranh thị phạm.
* **Linh hoạt lựa chọn 3 nguồn AI miễn phí:**
  * *Chế độ 1: Cọ Nhí Cục Bộ (Offline):* Sử dụng ngân hàng dữ liệu sư phạm lập trình sẵn theo chuẩn SGK Kết nối tri thức, hoạt động không cần mạng.
  * *Chế độ 2: Pollinations AI (Miễn phí 100%):* Sử dụng trí tuệ nhân tạo đám mây không cần đăng nhập hay API key.
  * *Chế độ 3: Google Gemini API cá nhân:* Cho phép giáo viên nhúng API key cá nhân miễn phí từ Google AI Studio để trải nghiệm sức mạnh của Gemini 2.5/3.8 Flash.
* **Phát âm lời giảng Tiếng Việt chuẩn Neural:**
  * Tích hợp công nghệ giọng đọc chuẩn tự nhiên: Giọng **Thầy giáo (Nam - `vi-VN-NamMinhNeural`)** dõng dạc, truyền cảm; và Giọng **Cô giáo (Nữ - `vi-VN-HoaiMyNeural`)** ngọt ngào, ấm áp.
  * Hai chế độ đọc riêng biệt: **📢 Đọc nội dung slide** (chỉ đọc câu chữ, đề bài hiển thị trên màn hình) và **📝 Đọc lời giảng** (đọc phần ghi chú dặn dò sư phạm của giáo viên).
  * Thuật toán tự động nhận diện và loại trừ các dòng chữ bản quyền, số điện thoại hoặc Zalo bên thứ ba từ các slide mẫu tải về trên mạng.

---

### 3.3. Xưởng Ý Tưởng Mĩ Thuật (Idea Workshop)
* **Ma trận thiết kế bài học tự động:**
  * Giáo viên chọn Khối lớp (Lớp 1 đến Lớp 5), Chủ đề bài học theo sách Kết nối tri thức, Chất liệu sử dụng (Sáp màu, Màu nước, Giấy xé dán, Đất nặn, Vật liệu tái chế) và Thời lượng (1 tiết 35 phút hoặc 2 tiết 70 phút).
  * Cho phép giáo viên nhập ý tưởng riêng tự do (ví dụ: *"Vẽ chú cá heo nhào lộn trên sóng biển"*).
* **Sinh tranh mẫu tham khảo tức thời:**
  * Tích hợp bộ từ điển chuyển đổi ngữ nghĩa mĩ thuật Việt - Anh, tự động sinh ra bức tranh minh họa mẫu phong cách sáp màu / màu nước tươi sáng phù hợp tâm lý lứa tuổi học sinh tiểu học.
  * Hỗ trợ giáo viên tải ảnh ý tưởng từ máy tính lên để thị phạm song song.
  * Cung cấp nút **"Chèn tranh vào slide"** để đưa trực tiếp tác phẩm minh họa sang trang slide bài giảng chỉ với 1 cú click.
* **Tự động chuyển ý tưởng thành bộ Slide hoàn chỉnh:**
  * Nút "Tạo Slide Bài Giảng" tự động tạo ra một bộ slide 4 bước hoàn chỉnh bao gồm đầy đủ Khởi động, Khám phá, Thực hành và Đánh giá.

---

### 3.4. Bảng Vẽ Thị Phạm & Mini-Game Mĩ Thuật Tương Tác
* **Bảng vẽ thị phạm mượt mà (Smoothing Canvas):**
  * Ứng dụng thuật toán làm mượt nét vẽ bằng đường cong Bézier bậc 2 (Quadratic Bézier Spline), giúp nét vẽ bằng chuột không bị gấp khúc hay rung giật.
  * Bổ sung **11 hình học & khối không gian 3D** thiết yếu cho mĩ thuật:
    1. Hình Chữ Nhật / Vuông (`rect`)
    2. Hình Tròn (`circle`)
    3. Hình Bầu Dục / Elip (`ellipse`)
    4. Hình Tam Giác (`triangle`)
    5. Hình Thoi (`diamond`)
    6. Ngôi Sao 5 Cánh (`star`)
    7. Hình Trái Tim (`heart`)
    8. Mũi Tên (`arrow`)
    9. Hình Trụ 3D (`cylinder`)
    10. Khối Hộp 3D (`cube`)
    11. Đoạn Thẳng (`line`)
  * Bảng màu mĩ thuật phong phú, bút vẽ nét tự do, bút dạ quang trong suốt, tẩy xóa, hoàn tác (Ctrl+Z) và nút tải ảnh PNG về máy.
  * Nút **"Chèn Tranh Vào Slide"** cho phép đưa hình vẽ thị phạm trực tiếp vào trang slide đang soạn.
* **Hệ thống 3 Mini-Game mĩ thuật chạy cục bộ:**
  * *Trò chơi 1: Ghép Màu Sắc:* Phân biệt gam màu nóng, gam màu lạnh, màu cơ bản và màu bổ túc.
  * *Trò chơi 2: Nhận Biết Hình Khối Cơ Bản:* Luyện mắt nhận biết các hình học ẩn trong đồ vật hàng ngày.
  * *Trò chơi 3: Thử Thách Tìm Chi Tiết Bài Học:* Đố vui quan sát chi tiết tranh theo từng chủ đề bài học.
  * Có thể chơi trực tiếp trên web hoặc nhúng thành 1 trang slide tương tác để cả lớp cùng tham gia.

---

### 3.5. Mắt Thần Cam Chấm Tranh Theo Rubric Sư Phạm
* **Chụp ảnh trực tiếp từ Webcam hoặc chọn ảnh từ máy:**
  * Tương thích hoàn hảo với webcam laptop/PC Windows mà không gặp lỗi ràng buộc thiết bị.
  * Khung xem trước hỗ trợ kéo thả ảnh (Drag & Drop) và nhấp chuột chọn tệp.
  * Nút **🖼️ Tranh Mẫu Thử** giúp trải nghiệm thử tính năng ngay cả khi không có webcam.
* **Thang Rubric 4 tiêu chí chuẩn GDPT 2018:**
  1. *Đúng yêu cầu bài học:* Bám sát chủ đề, hoàn thành sản phẩm.
  2. *Kĩ thuật tạo hình:* Nét vẽ rõ ràng, hình khối cân đối, phối màu hài hòa.
  3. *Ý tưởng sáng tạo riêng:* Thể hiện cảm xúc hồn nhiên, có chi tiết phụ độc đáo.
  4. *Khả năng trình bày ý tưởng:* Tự tin chia sẻ cảm nhận về bài vẽ trước lớp.
* **Đề xuất 3 bước cải thiện & soạn sẵn nhận xét:**
  * Tự động gợi ý 3 bước cải thiện cụ thể (ví dụ: *"Nhấn đậm thêm đường viền chu vi"*, *"Điểm thêm màu nóng ở hình ảnh chính"*).
  * Soạn sẵn đoạn nhận xét khích lệ theo Thông tư 27 để giáo viên chỉnh sửa và sao chép.

---

### 3.6. Đánh Giá Học Sinh Thông Tư 27 & Xuất Dữ Liệu Sang SMAS
* **Nhập danh sách học sinh linh hoạt:** Hỗ trợ nhập tệp bảng tính Excel (`.xlsx`, `.xls`) hoặc tệp văn bản danh sách (`.csv`, `.txt`) của mọi trường học.
* **Ngân hàng lời nhận xét Thông tư 27 phong phú:** Cung cấp hàng chục mẫu câu nhận xét phân loại theo 3 mức độ:
  * **T (Hoàn thành tốt):** Khen ngợi nét vẽ chắc chắn, ý tưởng độc đáo, màu sắc tươi sáng.
  * **H (Hoàn thành):** Động viên hoàn thành đúng yêu cầu, khích lệ tự tin hơn trong phối màu.
  * **C (Chưa hoàn thành):** Nhắc nhở tích cực, hướng dẫn cách tô màu đều tay và hoàn thiện bài.
* **Xuất bảng nhận xét ra Excel:** Tạo tệp bảng tính hoàn chỉnh sẵn sàng đồng bộ trực tiếp lên phần mềm quản lý điểm SMAS của Viettel hoặc vnEdu của VNPT.

---

## 4. BẢNG SO SÁNH: CỌ NHÍ STUDIO VỚI POWERPOINT TRUYỀN THỐNG

| Tiêu chí so sánh | Microsoft PowerPoint truyền thống | Cọ Nhí Studio (Mĩ Thuật Tiểu Học) |
| :--- | :--- | :--- |
| **Tính chuyên biệt cho Mĩ thuật** | Rất chung chung, phục vụ văn phòng kinh doanh | **Chuyên biệt 100% cho giáo viên mĩ thuật tiểu học** |
| **Ngân hàng nội dung SGK** | Không có | **Tích hợp sẵn bộ sách "Kết nối tri thức" Lớp 1 - 5** |
| **Bảng vẽ thị phạm hình khối 3D** | Nét vẽ giật, không có khối 3D mĩ thuật | **Nét mượt Bézier, đầy đủ 11 hình học và khối 3D** |
| **Trợ lý soạn bài & Giọng đọc** | Phải mua Copilot Pro đắt đỏ, giọng đọc rời rạc | **Tích hợp sẵn giọng Thầy Nam / Cô Nữ chuẩn Neural miễn phí** |
| **Tạo tranh mẫu tham khảo** | Không có, phải tự tìm trên Google nhiều rác | **Tự động vẽ tranh mẫu theo ý tưởng giáo viên gõ vào** |
| **Chấm bài & Nhận xét TT27** | Không hỗ trợ | **Hỗ trợ Cam Chấm Tranh Rubric và xuất Excel sang SMAS** |
| **Chi phí bản quyền** | Rất đắt (Microsoft 365 trả phí hàng tháng) | **100% Miễn phí trọn đời, không quảng cáo** |
| **Khả năng chạy không cần mạng** | Có nhưng nặng nề | **Chạy mượt mà, siêu nhẹ trên mọi trình duyệt** |

---

## 5. KẾT LUẬN & CAM KẾT SẢN PHẨM

Cọ Nhí Studio không chỉ là một công cụ phần mềm, mà là **người trợ lý tâm huyết của Thầy/Cô dạy Mĩ thuật Tiểu học**. Sản phẩm giải phóng giáo viên khỏi những gánh nặng hành chính và thao tác kỹ thuật phức tạp, giúp các Thầy Cô dành trọn vẹn tình yêu và cảm hứng để khơi dậy tiềm năng sáng tạo trong mỗi tâm hồn trẻ thơ.
