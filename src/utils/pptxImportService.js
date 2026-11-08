// Dịch Vụ Phân Tích & Nhập Tệp PowerPoint (.pptx) Trực Tiếp Trên Trình Duyệt
// 100% Cục bộ - Tương thích chuẩn OpenXML - Tối ưu bộ nhớ với Blob URL
// Hỗ trợ trích xuất toàn diện: Slide, Văn Bản, Hình Khối, Ảnh Nhúng, Video (MP4) và Nhạc (WAV/MP3)

import JSZip from 'jszip';

// Kích thước logic chuẩn của Cọ Nhí Studio: 960 x 540 (16:9)
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

// Đơn vị EMU chuẩn của PowerPoint: 1 inch = 914400 EMUs, slide 16:9 chuẩn là 12192000 x 6858000 EMUs
const DEFAULT_SLIDE_EMU_W = 12192000;
const DEFAULT_SLIDE_EMU_H = 6858000;

// Bản đồ định dạng MIME cho hình ảnh, video và âm thanh
const getMediaMimeType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeMap = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    // Audios
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',
    ogg: 'audio/ogg',
  };
  return mimeMap[ext] || 'application/octet-stream';
};

// Trích xuất chính xác tọa độ & kích thước từ <a:xfrm> trong OpenXML
// Tránh nhầm lẫn với thẻ <a:extLst><a:ext uri="...">
function extractTransform(element) {
  const xfrms = element.getElementsByTagName('a:xfrm');
  const xfrm = xfrms.length > 0 ? xfrms[0] : (element.getElementsByTagName('xfrm')[0] || null);

  let offX = null;
  let offY = null;
  let extCx = null;
  let extCy = null;

  if (xfrm) {
    const offs = xfrm.getElementsByTagName('a:off');
    const off = offs.length > 0 ? offs[0] : (xfrm.getElementsByTagName('off')[0] || null);
    if (off) {
      offX = parseInt(off.getAttribute('x') || '0', 10);
      offY = parseInt(off.getAttribute('y') || '0', 10);
    }

    const exts = xfrm.getElementsByTagName('a:ext');
    const ext = exts.length > 0 ? exts[0] : (xfrm.getElementsByTagName('ext')[0] || null);
    if (ext) {
      extCx = parseInt(ext.getAttribute('cx') || '0', 10);
      extCy = parseInt(ext.getAttribute('cy') || '0', 10);
    }
  }

  // Fallback an toàn: nếu không có thẻ a:xfrm bọc ngoài, quét tìm a:ext có thuộc tính cx
  if (extCx === null || isNaN(extCx)) {
    const allExts = Array.from(element.getElementsByTagName('a:ext')).concat(
      Array.from(element.getElementsByTagName('ext'))
    );
    for (const e of allExts) {
      if (e.getAttribute('cx') && e.getAttribute('cy')) {
        extCx = parseInt(e.getAttribute('cx'), 10);
        extCy = parseInt(e.getAttribute('cy'), 10);
        break;
      }
    }
  }

  if (offX === null || isNaN(offX)) {
    const allOffs = Array.from(element.getElementsByTagName('a:off')).concat(
      Array.from(element.getElementsByTagName('off'))
    );
    for (const o of allOffs) {
      if (o.getAttribute('x') && o.getAttribute('y')) {
        offX = parseInt(o.getAttribute('x'), 10);
        offY = parseInt(o.getAttribute('y'), 10);
        break;
      }
    }
  }

  return { offX, offY, extCx, extCy };
}

export const parsePPTXFile = async (file) => {
  try {
    if (!file) throw new Error('Không có tệp nào được chọn.');
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      throw new Error('Định dạng tệp không hợp lệ. Vui lòng chọn tệp có đuôi .pptx');
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Kiểm tra cấu trúc tệp PPTX chuẩn OpenXML
    const presentationXmlFile = zip.file('ppt/presentation.xml');
    if (!presentationXmlFile) {
      throw new Error('Tệp không đúng cấu trúc OpenXML của PowerPoint (thiếu ppt/presentation.xml).');
    }

    const presentationXmlText = await presentationXmlFile.async('text');
    const parser = new DOMParser();
    const presDoc = parser.parseFromString(presentationXmlText, 'application/xml');

    // Đọc kích thước slide gốc từ p:sldSz
    let slideWidthEmu = DEFAULT_SLIDE_EMU_W;
    let slideHeightEmu = DEFAULT_SLIDE_EMU_H;
    const sldSz = presDoc.getElementsByTagName('p:sldSz')[0];
    if (sldSz) {
      const cx = parseInt(sldSz.getAttribute('cx'), 10);
      const cy = parseInt(sldSz.getAttribute('cy'), 10);
      if (cx && cy) {
        slideWidthEmu = cx;
        slideHeightEmu = cy;
      }
    }

    // Đọc danh sách relationships từ ppt/_rels/presentation.xml.rels
    const presRelsFile = zip.file('ppt/_rels/presentation.xml.rels');
    const rIdToTarget = {};
    if (presRelsFile) {
      const relsText = await presRelsFile.async('text');
      const relsDoc = parser.parseFromString(relsText, 'application/xml');
      const rels = relsDoc.getElementsByTagName('Relationship');
      for (let i = 0; i < rels.length; i++) {
        const id = rels[i].getAttribute('Id');
        const target = rels[i].getAttribute('Target');
        rIdToTarget[id] = target;
      }
    }

    // Đọc danh sách slideId theo thứ tự trình chiếu
    const sldIds = presDoc.getElementsByTagName('p:sldId');
    const slidePaths = [];
    for (let i = 0; i < sldIds.length; i++) {
      const rId = sldIds[i].getAttribute('r:id');
      if (rId && rIdToTarget[rId]) {
        let target = rIdToTarget[rId];
        if (!target.startsWith('ppt/')) {
          target = 'ppt/' + target.replace(/^\//, '');
        }
        slidePaths.push(target);
      }
    }

    // Fallback nếu không parse được danh sách sldId
    if (slidePaths.length === 0) {
      const files = Object.keys(zip.files).filter(k => /^ppt\/slides\/slide\d+\.xml$/i.test(k));
      files.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });
      slidePaths.push(...files);
    }

    if (slidePaths.length === 0) {
      throw new Error('Không tìm thấy trang slide nào bên trong tệp PowerPoint.');
    }

    // Helper quy đổi tọa độ EMU sang canvas 960 x 540
    const emuToX = (emu) => Math.round((emu / slideWidthEmu) * CANVAS_WIDTH);
    const emuToY = (emu) => Math.round((emu / slideHeightEmu) * CANVAS_HEIGHT);

    const parsedSlides = [];
    let totalImagesExtracted = 0;
    let totalVideosExtracted = 0;
    let totalAudiosExtracted = 0;
    let totalNotesExtracted = 0;

    // Tách cache data URL ảnh (có thể lưu/export lại) khỏi Blob URL video tạm thời.
    const mediaCache = {};
    const imageDataCache = {};
    const layoutMasterCache = {};

    const findZipFile = (zipPath) => {
      if (!zipPath) return null;
      const clean = zipPath.replace(/\\/g, '/').replace(/^\/+/, '');
      let f = zip.file(clean);
      if (f) return f;
      if (!clean.startsWith('ppt/')) {
        f = zip.file('ppt/' + clean);
        if (f) return f;
      }
      const cleanLower = clean.toLowerCase();
      const pptCleanLower = ('ppt/' + clean).toLowerCase();
      const matchKey = Object.keys(zip.files).find(k => {
        const kLower = k.toLowerCase();
        return kLower === cleanLower || kLower === pptCleanLower || kLower.endsWith('/' + cleanLower);
      });
      return matchKey ? zip.file(matchKey) : null;
    };

    const getMediaBlobUrl = async (zipPath) => {
      const mediaFile = findZipFile(zipPath);
      if (!mediaFile) return null;
      if (mediaCache[mediaFile.name]) return mediaCache[mediaFile.name];

      const mimeType = getMediaMimeType(mediaFile.name);
      const blob = await mediaFile.async('blob');
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
      mediaCache[mediaFile.name] = blobUrl;
      return blobUrl;
    };

    const getMediaDataUrl = async (zipPath) => {
      const mediaFile = findZipFile(zipPath);
      if (!mediaFile) return null;
      if (imageDataCache[mediaFile.name]) return imageDataCache[mediaFile.name];

      const mimeType = getMediaMimeType(mediaFile.name);
      const bytes = await mediaFile.async('uint8array');
      let binary = '';
      const chunkSize = 0x8000;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
      }
      const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
      imageDataCache[mediaFile.name] = dataUrl;
      return dataUrl;
    };

    // Duyệt qua từng slide
    for (let sIdx = 0; sIdx < slidePaths.length; sIdx++) {
      const slidePath = slidePaths[sIdx];
      const slideFile = zip.file(slidePath);
      if (!slideFile) continue;

      const slideXmlText = await slideFile.async('text');
      const slideDoc = parser.parseFromString(slideXmlText, 'application/xml');

      // Đọc quan hệ của slide này (slideX.xml.rels) để lấy ảnh, video, âm thanh và ghi chú
      const slideRelPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
      const slideRelsFile = zip.file(slideRelPath);
      const slideRels = {};
      let notesSlidePath = null;
      let slideLayoutPath = null;

      if (slideRelsFile) {
        const slideRelsText = await slideRelsFile.async('text');
        const sRelsDoc = parser.parseFromString(slideRelsText, 'application/xml');
        const rels = sRelsDoc.getElementsByTagName('Relationship');
        for (let r = 0; r < rels.length; r++) {
          const id = rels[r].getAttribute('Id');
          const target = rels[r].getAttribute('Target');
          const type = rels[r].getAttribute('Type') || '';
          slideRels[id] = { target, type };

          if (type.includes('notesSlide') || target.includes('notesSlide')) {
            notesSlidePath = 'ppt/' + target.replace(/^\.\.\//, '');
          }
          if (type.includes('slideLayout') || target.includes('slideLayout')) {
            slideLayoutPath = 'ppt/' + target.replace(/^\.\.\//, '');
          }
        }
      }

      // 1. Trích xuất ghi chú lời giảng (Speaker Notes)
      let notesText = '';
      if (notesSlidePath) {
        const notesFile = zip.file(notesSlidePath);
        if (notesFile) {
          const notesXml = await notesFile.async('text');
          const notesDoc = parser.parseFromString(notesXml, 'application/xml');
          const paragraphs = notesDoc.getElementsByTagName('a:p');
          const noteLines = [];
          for (let p = 0; p < paragraphs.length; p++) {
            const texts = paragraphs[p].getElementsByTagName('a:t');
            let pText = '';
            for (let t = 0; t < texts.length; t++) {
              pText += texts[t].textContent;
            }
            if (pText.trim() && !/^\d+$/.test(pText.trim())) {
              noteLines.push(pText.trim());
            }
          }
          if (noteLines.length > 0) {
            notesText = noteLines.join('\n\n');
            totalNotesExtracted++;
          }
        }
      }

      // 2. Trích xuất nền slide (Màu sắc hoặc Hình ảnh nền)
      let slideBackground = '#ffffff';
      let backgroundElements = [];

      // Kiểm tra màu nền solidFill
      const bgClr = slideDoc.getElementsByTagName('a:srgbClr')[0];
      if (bgClr) {
        const val = bgClr.getAttribute('val');
        if (val && /^[0-9A-Fa-f]{6}$/.test(val)) {
          slideBackground = `#${val}`;
        }
      }

      // Kiểm tra ảnh nền trong <p:bg><p:bgPr><a:blipFill>
      const bgEl = slideDoc.getElementsByTagName('p:bg')[0];
      if (bgEl) {
        const blip = bgEl.getElementsByTagName('a:blip')[0];
        if (blip) {
          const embedId = blip.getAttribute('r:embed');
          const relObj = slideRels[embedId];
          const target = typeof relObj === 'string' ? relObj : relObj?.target;
          if (target) {
            const imgPath = 'ppt/' + target.replace(/^\.\.\//, '');
            const bgUrl = await getMediaBlobUrl(imgPath);
            if (bgUrl) {
              backgroundElements.push({
                id: `bg-img-${sIdx}-${Date.now()}`,
                type: 'image',
                src: bgUrl,
                x: 0,
                y: 0,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                isBackground: true,
              });
              totalImagesExtracted++;
            }
          }
        }
      }

      // 2b. Nếu slide không có ảnh nền riêng, tự động kế thừa từ SlideLayout / SlideMaster của mẫu thiết kế
      if (backgroundElements.length === 0 && slideLayoutPath) {
        if (!layoutMasterCache[slideLayoutPath]) {
          try {
            let masterBgUrl = null;
            let masterBgClr = null;
            const layoutRelPath = slideLayoutPath.replace('slideLayouts/', 'slideLayouts/_rels/') + '.rels';
            const layoutRelFile = zip.file(layoutRelPath);
            let slideMasterPath = null;

            if (layoutRelFile) {
              const lRelDoc = parser.parseFromString(await layoutRelFile.async('text'), 'application/xml');
              const rels = lRelDoc.getElementsByTagName('Relationship');
              for (let lr = 0; lr < rels.length; lr++) {
                const rType = rels[lr].getAttribute('Type') || '';
                const rTgt = rels[lr].getAttribute('Target') || '';
                if (rType.includes('slideMaster') || rTgt.includes('slideMaster')) {
                  slideMasterPath = 'ppt/' + rTgt.replace(/^\.\.\//, '');
                  break;
                }
              }
            }

            if (slideMasterPath) {
              const mRelPath = slideMasterPath.replace('slideMasters/', 'slideMasters/_rels/') + '.rels';
              const mRelFile = zip.file(mRelPath);
              const masterRels = {};
              if (mRelFile) {
                const mRelDoc = parser.parseFromString(await mRelFile.async('text'), 'application/xml');
                const rels = mRelDoc.getElementsByTagName('Relationship');
                for (let mr = 0; mr < rels.length; mr++) {
                  masterRels[rels[mr].getAttribute('Id')] = 'ppt/' + rels[mr].getAttribute('Target').replace(/^\.\.\//, '');
                }
              }

              const masterFile = zip.file(slideMasterPath);
              if (masterFile) {
                const mDoc = parser.parseFromString(await masterFile.async('text'), 'application/xml');
                let blip = mDoc.getElementsByTagName('p:bg')[0]?.getElementsByTagName('a:blip')[0];
                if (!blip) {
                  const mPics = mDoc.getElementsByTagName('p:pic');
                  for (let mp = 0; mp < mPics.length; mp++) {
                    const mBlip = mPics[mp].getElementsByTagName('a:blip')[0];
                    if (mBlip) {
                      blip = mBlip;
                      break;
                    }
                  }
                }

                if (blip) {
                  const rId = blip.getAttribute('r:embed');
                  const target = masterRels[rId];
                  if (target) {
                    masterBgUrl = await getMediaBlobUrl(target);
                  }
                }

                const mBgClr = mDoc.getElementsByTagName('a:srgbClr')[0];
                if (mBgClr && mBgClr.getAttribute('val')) {
                  masterBgClr = '#' + mBgClr.getAttribute('val');
                }
              }
            }

            layoutMasterCache[slideLayoutPath] = { bgUrl: masterBgUrl, bgClr: masterBgClr };
          } catch (e) {
            layoutMasterCache[slideLayoutPath] = { bgUrl: null, bgClr: null };
          }
        }

        const cached = layoutMasterCache[slideLayoutPath];
        if (cached?.bgUrl) {
          backgroundElements.push({
            id: `bg-master-${sIdx}-${Date.now()}`,
            type: 'image',
            src: cached.bgUrl,
            x: 0,
            y: 0,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            isBackground: true,
          });
          totalImagesExtracted++;
        } else if (cached?.bgClr && slideBackground === '#ffffff') {
          slideBackground = cached.bgClr;
        }
      }

      const elements = [];
      const processedVideos = new Set();

      // 3. Trích xuất hình ảnh & Video nhúng (p:pic)
      const pics = slideDoc.getElementsByTagName('p:pic');
      for (let p = 0; p < pics.length; p++) {
        const pic = pics[p];

        // A. KIỂM TRA XEM CÓ PHẢI ĐỐI TƯỢNG VIDEO KHÔNG
        const videoFile = pic.getElementsByTagName('a:videoFile')[0] || pic.getElementsByTagName('videoFile')[0];
        const p14Media = pic.getElementsByTagName('p14:media')[0] || pic.getElementsByTagName('media')[0];
        const hlinkClick = pic.getElementsByTagName('a:hlinkClick')[0];
        const isMediaAction = hlinkClick && hlinkClick.getAttribute('action')?.includes('media');

        let videoRelId = null;
        if (videoFile) videoRelId = videoFile.getAttribute('r:link');
        else if (p14Media) videoRelId = p14Media.getAttribute('r:embed');

        let videoTarget = videoRelId ? (slideRels[videoRelId]?.target || slideRels[videoRelId]) : null;

        // Quét fallback trong slideRels nếu có action media
        if (!videoTarget && isMediaAction) {
          const vEntry = Object.values(slideRels).find(r => {
            const tgt = typeof r === 'string' ? r : r.target;
            const typ = typeof r === 'string' ? '' : r.type;
            return typ.includes('video') || /\.(mp4|webm|mov|avi|wmv)$/i.test(tgt);
          });
          if (vEntry) videoTarget = typeof vEntry === 'string' ? vEntry : vEntry.target;
        }

        if (videoTarget && /\.(mp4|webm|mov|avi|wmv)$/i.test(videoTarget)) {
          const videoZipPath = 'ppt/' + videoTarget.replace(/^\.\.\//, '');
          const videoUrl = await getMediaBlobUrl(videoZipPath);

          if (videoUrl) {
            const tf = extractTransform(pic);
            let x = 0;
            let y = 0;
            let w = CANVAS_WIDTH;
            let h = CANVAS_HEIGHT;

            if (tf.extCx !== null && tf.extCy !== null) {
              if (tf.extCx >= slideWidthEmu * 0.9 && tf.extCy >= slideHeightEmu * 0.9) {
                x = 0; y = 0; w = CANVAS_WIDTH; h = CANVAS_HEIGHT;
              } else {
                const rawX = tf.offX !== null ? emuToX(tf.offX) : 0;
                const rawY = tf.offY !== null ? emuToY(tf.offY) : 0;
                const rawW = emuToX(tf.extCx);
                const rawH = emuToY(tf.extCy);
                x = Math.max(0, Math.min(CANVAS_WIDTH - 20, rawX));
                y = Math.max(0, Math.min(CANVAS_HEIGHT - 20, rawY));
                w = Math.max(40, Math.min(CANVAS_WIDTH - x, rawW));
                h = Math.max(40, Math.min(CANVAS_HEIGHT - y, rawH));
              }
            } else {
              x = 80; y = 60; w = 800; h = 420;
            }

            // Lấy ảnh bìa video (poster) nếu có
            let posterUrl = null;
            const blip = pic.getElementsByTagName('a:blip')[0];
            if (blip) {
              const posterEmbedId = blip.getAttribute('r:embed');
              const posterRel = slideRels[posterEmbedId];
              const posterTarget = typeof posterRel === 'string' ? posterRel : posterRel?.target;
              if (posterTarget) {
                posterUrl = await getMediaDataUrl('ppt/' + posterTarget.replace(/^\.\.\//, ''));
              }
            }

            elements.push({
              id: `video-${sIdx}-${p}-${Date.now()}`,
              type: 'video',
              src: videoUrl,
              poster: posterUrl || undefined,
              x,
              y,
              width: w,
              height: h,
              title: videoTarget.split('/').pop() || 'Video Bài Giảng'
            });
            processedVideos.add(videoTarget.toLowerCase());
            totalVideosExtracted++;
            continue; // Đã trích xuất video thành công, không thêm thành ảnh tĩnh
          }
        }

        // B. NẾU LÀ ẢNH TĨNH THÔNG THƯỜNG
        const blip = pic.getElementsByTagName('a:blip')[0];
        if (!blip) continue;

        const embedId = blip.getAttribute('r:embed');
        const relObj = slideRels[embedId];
        const imgRelTarget = typeof relObj === 'string' ? relObj : relObj?.target;

        if (imgRelTarget) {
          const imgZipPath = 'ppt/' + imgRelTarget.replace(/^\.\.\//, '');
          const dataUrl = await getMediaDataUrl(imgZipPath);

          if (dataUrl) {
            const tf = extractTransform(pic);
            let x = 0;
            let y = 0;
            let w = CANVAS_WIDTH;
            let h = CANVAS_HEIGHT;
            let isFullSlide = false;

            if (tf.extCx !== null && tf.extCy !== null) {
              if (tf.extCx >= slideWidthEmu * 0.9 && tf.extCy >= slideHeightEmu * 0.9) {
                x = 0; y = 0; w = CANVAS_WIDTH; h = CANVAS_HEIGHT;
                isFullSlide = true;
              } else {
                const rawX = tf.offX !== null ? emuToX(tf.offX) : 0;
                const rawY = tf.offY !== null ? emuToY(tf.offY) : 0;
                const rawW = emuToX(tf.extCx);
                const rawH = emuToY(tf.extCy);
                x = Math.max(0, Math.min(CANVAS_WIDTH - 20, rawX));
                y = Math.max(0, Math.min(CANVAS_HEIGHT - 20, rawY));
                w = Math.max(20, Math.min(CANVAS_WIDTH - x, rawW));
                h = Math.max(20, Math.min(CANVAS_HEIGHT - y, rawH));
              }
            } else {
              x = 100; y = 80; w = 400; h = 300;
            }

            const imgEl = {
              id: `img-${sIdx}-${p}-${Date.now()}`,
              type: 'image',
              src: dataUrl,
              x,
              y,
              width: w,
              height: h,
              isBackground: isFullSlide,
            };

            if (isFullSlide) {
              backgroundElements.push(imgEl);
            } else {
              elements.push(imgEl);
            }
            totalImagesExtracted++;
          }
        }
      }

      // 4. Trích xuất các hộp văn bản & hình khối (p:sp)
      const shapes = slideDoc.getElementsByTagName('p:sp');
      for (let i = 0; i < shapes.length; i++) {
        const sp = shapes[i];
        const tf = extractTransform(sp);

        let x = 80;
        let y = 80 + i * 50;
        let w = 400;
        let h = 80;

        if (tf.extCx !== null && tf.extCy !== null) {
          const rawX = tf.offX !== null ? emuToX(tf.offX) : 0;
          const rawY = tf.offY !== null ? emuToY(tf.offY) : 0;
          const rawW = emuToX(tf.extCx);
          const rawH = emuToY(tf.extCy);

          x = Math.max(0, Math.min(CANVAS_WIDTH - 30, rawX));
          y = Math.max(0, Math.min(CANVAS_HEIGHT - 25, rawY));
          w = Math.max(30, Math.min(CANVAS_WIDTH - x, rawW));
          h = Math.max(20, Math.min(CANVAS_HEIGHT - y, rawH));
        }

        // Lấy nội dung chữ trong p:txBody
        const txBody = sp.getElementsByTagName('p:txBody')[0];
        if (txBody) {
          const paragraphs = txBody.getElementsByTagName('a:p');
          const textRuns = [];
          let maxFontSize = 18;
          let isBold = false;
          let textColor = '#1e293b';

          for (let p = 0; p < paragraphs.length; p++) {
            const pEl = paragraphs[p];
            const tEls = pEl.getElementsByTagName('a:t');
            let pStr = '';
            for (let t = 0; t < tEls.length; t++) {
              pStr += tEls[t].textContent;
            }
            if (pStr) textRuns.push(pStr);

            const rPr = pEl.getElementsByTagName('a:rPr')[0];
            if (rPr) {
              const sz = parseInt(rPr.getAttribute('sz') || '0', 10);
              if (sz > 0) {
                maxFontSize = Math.max(maxFontSize, Math.round(sz / 100));
              }
              if (rPr.getAttribute('b') === '1') isBold = true;
              const clr = rPr.getElementsByTagName('a:srgbClr')[0];
              if (clr && clr.getAttribute('val')) {
                textColor = '#' + clr.getAttribute('val');
              }
            }
          }

          const fullText = textRuns.join('\n');
          if (fullText.trim()) {
            elements.push({
              id: `text-${sIdx}-${i}-${Date.now()}`,
              type: 'text',
              x,
              y,
              width: w,
              height: h,
              text: fullText,
              fontSize: Math.min(maxFontSize, 42),
              fontWeight: isBold ? 'bold' : 'normal',
              color: textColor,
              textAlign: x < 250 && w > 450 ? 'center' : 'left',
            });
            continue;
          }
        }

        // Nếu là hình khối thuần túy không chữ (Shape)
        const prstGeom = sp.getElementsByTagName('a:prstGeom')[0];
        if (prstGeom) {
          const geom = prstGeom.getAttribute('prst') || 'rect';
          let shapeType = 'roundedRect';
          if (geom.includes('ellipse') || geom.includes('circle')) shapeType = 'circle';
          else if (geom.includes('triangle')) shapeType = 'triangle';
          else if (geom.includes('star')) shapeType = 'star';

          let fillColor = '#cbd5e1';
          const fillClr = sp.getElementsByTagName('a:srgbClr')[0];
          if (fillClr && fillClr.getAttribute('val')) {
            fillColor = '#' + fillClr.getAttribute('val');
          }

          elements.push({
            id: `shape-${sIdx}-${i}-${Date.now()}`,
            type: 'shape',
            shapeType,
            x,
            y,
            width: w,
            height: h,
            fill: fillColor,
          });
        }
      }

      // 4b. Trích xuất bảng biểu & khung đồ họa (p:graphicFrame)
      const frames = slideDoc.getElementsByTagName('p:graphicFrame');
      for (let f = 0; f < frames.length; f++) {
        const frame = frames[f];
        const tf = extractTransform(frame);
        let x = 80;
        let y = 100 + f * 60;
        let w = 800;
        let h = 300;

        if (tf.extCx !== null && tf.extCy !== null) {
          const rawX = tf.offX !== null ? emuToX(tf.offX) : 0;
          const rawY = tf.offY !== null ? emuToY(tf.offY) : 0;
          const rawW = emuToX(tf.extCx);
          const rawH = emuToY(tf.extCy);
          x = Math.max(0, Math.min(CANVAS_WIDTH - 30, rawX));
          y = Math.max(0, Math.min(CANVAS_HEIGHT - 25, rawY));
          w = Math.max(30, Math.min(CANVAS_WIDTH - x, rawW));
          h = Math.max(20, Math.min(CANVAS_HEIGHT - y, rawH));
        }

        const tbl = frame.getElementsByTagName('a:tbl')[0];
        if (tbl) {
          const rows = tbl.getElementsByTagName('a:tr');
          const tableLines = [];
          for (let r = 0; r < rows.length; r++) {
            const cells = rows[r].getElementsByTagName('a:tc');
            const rowTexts = [];
            for (let c = 0; c < cells.length; c++) {
              const texts = cells[c].getElementsByTagName('a:t');
              let cellStr = '';
              for (let t = 0; t < texts.length; t++) {
                cellStr += texts[t].textContent;
              }
              if (cellStr.trim()) rowTexts.push(cellStr.trim());
            }
            if (rowTexts.length > 0) {
              tableLines.push(rowTexts.join('  |  '));
            }
          }
          if (tableLines.length > 0) {
            elements.push({
              id: `tbl-${sIdx}-${f}-${Date.now()}`,
              type: 'text',
              text: tableLines.join('\n'),
              x,
              y,
              width: w,
              height: h,
              fontSize: 16,
              color: '#1e293b',
              textAlign: 'left'
            });
          }
        }
      }

      // 4b. Quét bổ sung video nhúng trong slide chưa được gắn vào p:pic
      for (const [rId, relObj] of Object.entries(slideRels)) {
        const target = typeof relObj === 'string' ? relObj : relObj.target || '';
        const type = typeof relObj === 'string' ? '' : relObj.type || '';
        const isVideo = type.includes('video') || /\.(mp4|webm|mov|avi|wmv|m4v)$/i.test(target);

        if (isVideo && !processedVideos.has(target.toLowerCase())) {
          processedVideos.add(target.toLowerCase());
          const videoZipPath = 'ppt/' + target.replace(/^\.\.\//, '');
          const videoUrl = await getMediaBlobUrl(videoZipPath);
          if (videoUrl) {
            elements.push({
              id: `video-${sIdx}-${processedVideos.size}-${Date.now()}`,
              type: 'video',
              src: videoUrl,
              x: 80,
              y: 50,
              width: 800,
              height: 440,
              title: target.split('/').pop() || 'Video Bài Giảng'
            });
            totalVideosExtracted++;
          }
        }
      }

      // 5. Trích xuất âm thanh nhúng (Audio) của slide
      const processedAudios = new Set();
      for (const [rId, relObj] of Object.entries(slideRels)) {
        const target = typeof relObj === 'string' ? relObj : relObj.target || '';
        const type = typeof relObj === 'string' ? '' : relObj.type || '';
        const isAudio = type.includes('audio') || /\.(mp3|wav|m4a|wma|ogg)$/i.test(target);

        if (isAudio && !processedAudios.has(target)) {
          processedAudios.add(target);
          const audioZipPath = 'ppt/' + target.replace(/^\.\.\//, '');
          const audioUrl = await getMediaBlobUrl(audioZipPath);

          if (audioUrl) {
            elements.push({
              id: `audio-${sIdx}-${processedAudios.size}-${Date.now()}`,
              type: 'audio',
              src: audioUrl,
              x: 50,
              y: Math.max(80, CANVAS_HEIGHT - 95),
              width: 380,
              height: 70,
              title: target.split('/').pop() || 'Âm Thanh / Nhạc Nền Bài Giảng'
            });
            totalAudiosExtracted++;
          }
        }
      }

      // Gộp: các ảnh nền (backgroundElements) đặt lên trước (nằm phía dưới), sau đó đến các hình vẽ, video và chữ
      const combinedElements = [...backgroundElements, ...elements];

      parsedSlides.push({
        id: `slide-pptx-${sIdx}-${Date.now()}`,
        background: slideBackground,
        elements: combinedElements,
        notes: notesText,
      });
    }

    if (parsedSlides.length === 0) {
      throw new Error('Không trích xuất được nội dung slide từ tệp PowerPoint này.');
    }

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      slidesCount: parsedSlides.length,
      slides: parsedSlides,
      stats: {
        totalSlides: parsedSlides.length,
        totalImages: totalImagesExtracted,
        totalVideos: totalVideosExtracted,
        totalAudios: totalAudiosExtracted,
        totalNotes: totalNotesExtracted,
      },
      retained: [
        `Trích xuất thành công ${parsedSlides.length} trang slide theo đúng thứ tự`,
        `Đã đọc toàn bộ hộp văn bản, tiêu đề, nội dung và màu chữ`,
        `Trích xuất được ${totalImagesExtracted} ảnh nhúng & ảnh nền nguyên bản`,
        totalVideosExtracted > 0 
          ? `Đã nhận diện và phát được ${totalVideosExtracted} video nhúng nguyên bản trong slide` 
          : 'Tệp không có video nhúng sẵn',
        totalAudiosExtracted > 0 
          ? `Đã nhận diện và phát được ${totalAudiosExtracted} tệp nhạc/âm thanh nhúng trong slide` 
          : 'Tệp không có tệp âm thanh nhúng sẵn',
        `Giữ lại toàn bộ ${totalNotesExtracted} ghi chú lời giảng của giáo viên`,
        'Tự động chuẩn hóa kích thước đối tượng theo tỉ lệ 16:9 của Cọ Nhí Studio'
      ],
      omitted: [
        'Hiệu ứng chuyển cảnh (transitions) & hoạt hình (animations) được chuyển thành slide tĩnh',
        'Biểu đồ SmartArt hoặc sơ đồ phức tạp được bóc tách phần chữ nội dung'
      ]
    };
  } catch (err) {
    console.error('Lỗi phân tích tệp PPTX:', err);
    return {
      success: false,
      error: err.message || 'Lỗi không xác định khi phân tích tệp PowerPoint.'
    };
  }
};
