import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// 1. Tự động nhận diện toàn bộ các bộ phần mềm Office trên máy tính
export function detectInstalledOffice() {
  const result = {
    hasOffice: false,
    primary: null,
    suites: []
  };

  // Kiểu 1: Microsoft Office (Word, PowerPoint, Excel)
  const msDirs = [
    'C:\\Program Files\\Microsoft Office\\root\\Office16',
    'C:\\Program Files (x86)\\Microsoft Office\\root\\Office16',
    'C:\\Program Files\\Microsoft Office\\Office16',
    'C:\\Program Files (x86)\\Microsoft Office\\Office16',
    'C:\\Program Files\\Microsoft Office\\Office15',
    'C:\\Program Files (x86)\\Microsoft Office\\Office15'
  ];
  for (const d of msDirs) {
    if (fs.existsSync(d)) {
      const ppt = path.join(d, 'POWERPNT.EXE');
      const doc = path.join(d, 'WINWORD.EXE');
      const xls = path.join(d, 'EXCEL.EXE');
      if (fs.existsSync(ppt) || fs.existsSync(doc) || fs.existsSync(xls)) {
        result.suites.push({
          name: 'Microsoft Office',
          type: 'msoffice',
          pptxPath: fs.existsSync(ppt) ? ppt : null,
          docxPath: fs.existsSync(doc) ? doc : null,
          xlsxPath: fs.existsSync(xls) ? xls : null
        });
        break;
      }
    }
  }

  // Kiểu 2: ONLYOFFICE Desktop Editors
  const onlyofficeExe = 'C:\\Program Files\\ONLYOFFICE\\DesktopEditors\\DesktopEditors.exe';
  if (fs.existsSync(onlyofficeExe)) {
    result.suites.push({
      name: 'ONLYOFFICE Desktop Editors',
      type: 'onlyoffice',
      exePath: onlyofficeExe,
      pptxPath: onlyofficeExe,
      docxPath: onlyofficeExe,
      xlsxPath: onlyofficeExe
    });
  }

  // Kiểu 3: WPS Office (Presentation, Writer, Spreadsheets)
  const kingsoftBase = path.join(os.homedir(), 'AppData', 'Local', 'Kingsoft', 'WPS Office');
  if (fs.existsSync(kingsoftBase)) {
    try {
      const subdirs = fs.readdirSync(kingsoftBase);
      for (const sub of subdirs) {
        const off6 = path.join(kingsoftBase, sub, 'office6');
        if (fs.existsSync(off6)) {
          const wpp = path.join(off6, 'wpp.exe');
          const wps = path.join(off6, 'wps.exe');
          const et = path.join(off6, 'et.exe');
          if (fs.existsSync(wpp) || fs.existsSync(wps) || fs.existsSync(et)) {
            result.suites.push({
              name: `WPS Office (${sub})`,
              type: 'wps',
              pptxPath: fs.existsSync(wpp) ? wpp : null,
              docxPath: fs.existsSync(wps) ? wps : null,
              xlsxPath: fs.existsSync(et) ? et : null
            });
            break;
          }
        }
      }
    } catch (_) {}
  }

  // Kiểm tra bộ cài đặt Office 2016 trên ổ đĩa D
  const installerPath = 'D:\\pm\\office\\Office\\office 16 mien phi ProPlusRetail.img';
  result.hasInstaller = fs.existsSync(installerPath);
  result.installerPath = result.hasInstaller ? installerPath : null;

  if (result.suites.length > 0) {
    result.hasOffice = true;
    result.primary = result.suites[0].name;
  }

  return result;
}

// 2. Kích hoạt trực tiếp file Office trên máy tính bằng phần mềm tương ứng
export async function openOfficeDocument({ type = 'pptx', fileName = '', buffer = null }) {
  const detected = detectInstalledOffice();
  const ext = (type.startsWith('.') ? type.slice(1) : type).toLowerCase();
  const safeName = (fileName ? fileName.replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '_') : `BaiGiang_MiThuat_GDPT2018`) + `.${ext}`;
  const targetFile = path.join(os.tmpdir(), safeName);

  if (buffer) {
    fs.writeFileSync(targetFile, buffer);
  }

  // Tìm đường dẫn thực thi phù hợp cho định dạng tệp
  let targetExe = '';
  let appName = 'Trình xem Office mặc định của Windows';

  for (const suite of detected.suites) {
    if (ext === 'pptx' && suite.pptxPath) {
      targetExe = suite.pptxPath;
      appName = suite.name;
      break;
    } else if ((ext === 'docx' || ext === 'doc') && suite.docxPath) {
      targetExe = suite.docxPath;
      appName = suite.name;
      break;
    } else if ((ext === 'xlsx' || ext === 'xls') && suite.xlsxPath) {
      targetExe = suite.xlsxPath;
      appName = suite.name;
      break;
    }
  }

  // Khởi chạy tiến trình độc lập không chặn server
  const cmd = targetExe
    ? `start "" "${targetExe}" "${targetFile}"`
    : `start "" "${targetFile}"`;

  spawn('cmd.exe', ['/c', cmd], { windowsHide: true, detached: true });

  return {
    success: true,
    appName,
    targetFile,
    message: `Đã mở tệp thành công bằng ${appName} trên máy tính!`
  };
}
