/**
 * Cọ Nhí Studio - Dịch vụ Xuất Bản Bài Giảng HTML Độc Lập & In PDF 16:9
 * Chuẩn THƯƠNG MẠI - Hoạt động ngoại tuyến 100% không cần Internet
 * Cho phép giáo viên lưu vào USB và mở trình chiếu trên bất kỳ máy tính nào
 */

/**
 * Sinh chuỗi HTML độc lập (Single-file Standalone HTML) từ danh sách slide
 * @param {Array|object} slidesOrProject Mảng slide hoặc đối tượng { title, slides }
 * @param {string} customTitle Tiêu đề bài giảng tùy chọn
 * @returns {string} Chuỗi mã nguồn HTML hoàn chỉnh
 */
export function generateStandaloneHtmlString(slidesOrProject, customTitle) {
  let slides = [];
  let title = customTitle || 'Bai_Giang_Mi_Thuat';

  if (Array.isArray(slidesOrProject)) {
    slides = slidesOrProject;
  } else if (slidesOrProject && Array.isArray(slidesOrProject.slides)) {
    slides = slidesOrProject.slides;
    if (slidesOrProject.title && !customTitle) {
      title = slidesOrProject.title;
    }
  }

  if (slides.length === 0) {
    return '';
  }

  const cleanTitle = (customTitle || title).replace(/["'\\]/g, '');
  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - Cô Nhi Studio (Offline Presentation)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #020617;
      color: #f8fafc;
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #stage-container {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #000000;
    }
    #slide-stage {
      position: relative;
      width: 960px;
      height: 540px;
      transform-origin: center center;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      transition: background-color 0.3s ease;
    }
    .slide-element {
      position: absolute;
      box-sizing: border-box;
      transform-style: preserve-3d;
      backface-visibility: hidden;
    }
    .slide-element.text-el {
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      line-height: 1.25;
    }
    .slide-element img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    }
    /* Toolbar */
    #toolbar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 9999px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
      z-index: 50;
      transition: opacity 0.3s, transform 0.3s;
    }
    #toolbar.hidden {
      opacity: 0;
      transform: translate(-50%, 20px);
      pointer-events: none;
    }
    .tool-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tool-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }
    .tool-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    #counter {
      font-size: 12px;
      font-weight: 800;
      color: #e2e8f0;
      padding-right: 8px;
      border-right: 1px solid rgba(51, 65, 85, 0.8);
    }
    /* Blackout / Whiteout screens */
    #focus-overlay {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-align: center;
      padding: 24px;
    }
    #focus-overlay.black {
      background: #000000;
      color: #f59e0b;
    }
    #focus-overlay.white {
      background: #ffffff;
      color: #1e293b;
    }
    #focus-overlay h2 {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    #focus-overlay p {
      font-size: 14px;
      opacity: 0.8;
    }
    /* Laser pointer */
    #laser {
      position: fixed;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 16px 6px rgba(239, 68, 68, 0.95);
      pointer-events: none;
      z-index: 70;
      transform: translate(-50%, -50%);
      display: none;
    }
  </style>
</head>
<body>
  <div id="stage-container">
    <div id="slide-stage"></div>
  </div>

  <div id="laser"></div>

  <div id="focus-overlay">
    <div>
      <h2 id="focus-title">Tạm Dừng Trình Chiếu</h2>
      <p id="focus-subtitle">Nhấn phím bất kỳ hoặc chạm vào màn hình để tiếp tục</p>
    </div>
  </div>

  <div id="toolbar">
    <span id="counter">1 / 1</span>
    <button class="tool-btn" id="btn-prev" title="Lùi lại (Mũi tên Trái / PageUp)">◀ Trước</button>
    <button class="tool-btn" id="btn-next" title="Tiếp theo (Mũi tên Phải / Space / PageDown)">Sau ▶</button>
    <button class="tool-btn" id="btn-black" title="Tắt đen màn hình tập trung (Phím B)">⬛ Tối (B)</button>
    <button class="tool-btn" id="btn-white" title="Trắng màn hình thị phạm (Phím W)">⬜ Trắng (W)</button>
    <button class="tool-btn" id="btn-laser" title="Con trỏ Laser (Phím L)">🔴 Laser (L)</button>
    <button class="tool-btn" id="btn-fullscreen" title="Toàn màn hình (Phím F)">⛶ Toàn màn hình</button>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;
    let isLaser = false;
    let hideTimer = null;
    const stage = document.getElementById('slide-stage');
    const counter = document.getElementById('counter');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const focusOverlay = document.getElementById('focus-overlay');
    const laser = document.getElementById('laser');
    const toolbar = document.getElementById('toolbar');

    // 1. STAGE SCALING 16:9 LOCK
    function resizeStage() {
      const baseW = 960;
      const baseH = 540;
      const scale = Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
      stage.style.transform = 'scale(' + scale + ') translateZ(0)';
    }
    window.addEventListener('resize', resizeStage);
    resizeStage();

    // 2. RENDER SLIDE
    function renderCurrentSlide() {
      const slide = slides[currentIndex];
      if (!slide) return;
      stage.innerHTML = '';
      stage.style.backgroundColor = slide.background || '#ffffff';
      counter.textContent = (currentIndex + 1) + ' / ' + slides.length;
      btnPrev.disabled = currentIndex === 0;
      btnNext.disabled = currentIndex === slides.length - 1;

      (slide.elements || []).forEach(el => {
        const div = document.createElement('div');
        div.className = 'slide-element';
        div.style.left = el.x + 'px';
        div.style.top = el.y + 'px';
        div.style.width = el.width + 'px';
        div.style.height = (el.height || 30) + 'px';

        if (el.type === 'text') {
          div.className += ' text-el';
          div.style.fontSize = (el.fontSize || 16) + 'px';
          div.style.fontWeight = el.fontWeight || 'normal';
          div.style.fontStyle = el.fontStyle || 'normal';
          div.style.color = el.color || '#000000';
          div.style.textAlign = el.textAlign || 'left';
          div.style.backgroundColor = el.background || 'transparent';
          div.textContent = el.text || '';
        } else if (el.type === 'shape') {
          if (el.shapeType === 'circle') {
            div.innerHTML = '<svg width="100%" height="100%"><circle cx="50%" cy="50%" r="48%" fill="' + (el.fill || '#3b82f6') + '" stroke="' + (el.stroke || 'none') + '" stroke-width="' + (el.strokeWidth || 0) + '"/></svg>';
          } else {
            div.style.backgroundColor = el.fill || '#3b82f6';
            div.style.borderRadius = el.shapeType === 'roundedRect' ? '14px' : '4px';
            if (el.stroke) {
              div.style.border = (el.strokeWidth || 2) + 'px solid ' + el.stroke;
            }
          }
          if (el.text) {
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.inset = '0';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.justifyContent = 'center';
            label.style.color = el.color || '#ffffff';
            label.style.fontSize = (el.fontSize || 14) + 'px';
            label.style.fontWeight = 'bold';
            label.textContent = el.text;
            div.appendChild(label);
          }
        } else if (el.type === 'image' && el.src) {
          const img = document.createElement('img');
          img.src = el.src;
          div.appendChild(img);
        }
        stage.appendChild(div);
      });
    }

    // 3. NAVIGATION
    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderCurrentSlide();
      }
    }
    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentSlide();
      }
    }
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

    // 4. FOCUS MODES (BLACK / WHITE)
    function toggleBlackout() {
      if (focusOverlay.style.display === 'flex' && focusOverlay.className === 'black') {
        focusOverlay.style.display = 'none';
      } else {
        focusOverlay.className = 'black';
        focusOverlay.style.display = 'flex';
        document.getElementById('focus-title').textContent = 'Lớp Tạm Dừng Bút';
        document.getElementById('focus-subtitle').textContent = 'Cùng ngước nhìn Thầy Cô hướng dẫn bài học nhé!';
      }
    }
    function toggleWhiteout() {
      if (focusOverlay.style.display === 'flex' && focusOverlay.className === 'white') {
        focusOverlay.style.display = 'none';
      } else {
        focusOverlay.className = 'white';
        focusOverlay.style.display = 'flex';
        document.getElementById('focus-title').textContent = 'Bảng Trắng Thị Phạm';
        document.getElementById('focus-subtitle').textContent = 'Nhấp vào màn hình để quay lại bài giảng';
      }
    }
    document.getElementById('btn-black').addEventListener('click', (e) => { e.stopPropagation(); toggleBlackout(); });
    document.getElementById('btn-white').addEventListener('click', (e) => { e.stopPropagation(); toggleWhiteout(); });
    focusOverlay.addEventListener('click', () => { focusOverlay.style.display = 'none'; });

    // 5. LASER POINTER
    document.getElementById('btn-laser').addEventListener('click', (e) => {
      e.stopPropagation();
      isLaser = !isLaser;
      laser.style.display = isLaser ? 'block' : 'none';
      document.getElementById('btn-laser').style.color = isLaser ? '#ef4444' : '#94a3b8';
    });
    window.addEventListener('mousemove', (e) => {
      if (isLaser) {
        laser.style.left = e.clientX + 'px';
        laser.style.top = e.clientY + 'px';
      }
      toolbar.classList.remove('hidden');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        toolbar.classList.add('hidden');
      }, 3500);
    });

    // 6. FULLSCREEN
    document.getElementById('btn-fullscreen').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // 7. KEYBOARD CONTROLS (PRESENTER ERGONOMICS)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (focusOverlay.style.display === 'flex') {
        focusOverlay.style.display = 'none';
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Backspace') {
        prevSlide();
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBlackout();
      } else if (e.key === 'w' || e.key === 'W') {
        toggleWhiteout();
      } else if (e.key === 'l' || e.key === 'L') {
        document.getElementById('btn-laser').click();
      } else if (e.key === 'f' || e.key === 'F') {
        document.getElementById('btn-fullscreen').click();
      }
    });

    // 8. TOUCH SWIPE CONTROLS
    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX < 0) nextSlide();
          else prevSlide();
        }
      }
    }, { passive: true });

    // Initial render
    renderCurrentSlide();
  </script>
</body>
</html>`;
}

/**
 * Xuất toàn bộ bài giảng thành một tệp HTML duy nhất và tải về máy
 * @param {Array|object} slidesOrProject Mảng slide hoặc đối tượng { title, slides }
 * @param {string} customFileName Tên tệp xuất tùy chọn
 * @returns {boolean} Thành công hay thất bại
 */
export function exportSlideToStandaloneHtml(slidesOrProject, customFileName) {
  const htmlContent = generateStandaloneHtmlString(slidesOrProject, customFileName);
  if (!htmlContent) {
    if (typeof alert === 'function') {
      alert('Không có dữ liệu bài giảng để xuất HTML.');
    }
    return false;
  }

  let title = 'Bai_Giang_Mi_Thuat';
  if (Array.isArray(slidesOrProject)) {
    title = customFileName || 'Bai_Giang_Mi_Thuat';
  } else if (slidesOrProject && slidesOrProject.title) {
    title = slidesOrProject.title;
  }

  if (typeof document === 'undefined') {
    return true; // Môi trường kiểm thử không có DOM
  }

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (customFileName || title).replace(/\s+/g, '_');
  a.href = url;
  a.download = `${safeName}_Offline_Presentation.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/**
 * Kích hoạt hộp thoại in / xuất bài giảng ra PDF chuẩn khổ ngang 16:9
 */
export function printSlideDeckToPdf() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const printStyleId = 'conhi-print-pdf-style';
  let styleEl = document.getElementById(printStyleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = printStyleId;
    styleEl.textContent = `
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
        body {
          background: #ffffff !important;
          color: #000000 !important;
        }
        #stage-container, #slide-stage {
          position: static !important;
          width: 100vw !important;
          height: 56.25vw !important;
          transform: none !important;
          box-shadow: none !important;
        }
        #toolbar, #laser, #focus-overlay, .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  window.print();
}
