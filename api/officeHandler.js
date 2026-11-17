import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Đường dẫn chuẩn của ONLYOFFICE Desktop Editors (Bản mặc định của Thầy/Cô)
const ONLYOFFICE_PATHS = [
  'C:\\Program Files\\ONLYOFFICE\\DesktopEditors\\DesktopEditors.exe',
  'C:\\Program Files (x86)\\ONLYOFFICE\\DesktopEditors\\DesktopEditors.exe',
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'ONLYOFFICE', 'DesktopEditors', 'DesktopEditors.exe')
];

/**
 * Tự động nhận diện ONLYOFFICE Desktop Editors trên máy tính
 */
export function detectInstalledOffice() {
  let onlyofficeExe = null;
  for (const p of ONLYOFFICE_PATHS) {
    if (fs.existsSync(p)) {
      onlyofficeExe = p;
      break;
    }
  }

  // Kiểm tra thư mục Portable đi kèm (nếu Thầy/Cô copy app sang máy khác)
  const portablePath = path.resolve(process.cwd(), 'ONLYOFFICE', 'DesktopEditors.exe');
  if (!onlyofficeExe && fs.existsSync(portablePath)) {
    onlyofficeExe = portablePath;
  }

  const hasOffice = Boolean(onlyofficeExe);

  return {
    hasOffice: true, // Luôn true vì Windows luôn có trình mở file mặc định
    hasOnlyOffice: hasOffice,
    primary: hasOffice ? 'ONLYOFFICE Desktop Editors' : 'Trình xem Office mặc định của Windows',
    exePath: onlyofficeExe,
    supportedFormats: ['.pptx', '.docx', '.xlsx']
  };
}

/**
 * Kích hoạt trực tiếp file Office trên máy tính bằng ONLYOFFICE (hoặc trình xem mặc định khi ở máy khác)
 */
export async function openOfficeDocument({ type = 'pptx', fileName = '', buffer = null }) {
  const detected = detectInstalledOffice();
  const ext = (type.startsWith('.') ? type.slice(1) : type).toLowerCase();
  const safeName = (fileName ? fileName.replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '_') : `BaiGiang_MiThuat_GDPT2018`) + `.${ext}`;
  const targetFile = path.join(os.tmpdir(), safeName);

  if (buffer) {
    fs.writeFileSync(targetFile, buffer);
  }

  const targetExe = detected.exePath;
  const appName = detected.primary;

  // Lệnh chạy: Nếu có ONLYOFFICE thì mở bằng ONLYOFFICE, nếu ở máy tính khác chưa cài thì mở bằng ứng dụng mặc định của Windows
  const cmd = targetExe
    ? `start "" "${targetExe}" "${targetFile}"`
    : `start "" "${targetFile}"`;

  spawn('cmd.exe', ['/c', cmd], { windowsHide: true, detached: true });

  return {
    success: true,
    hasOnlyOffice: detected.hasOnlyOffice,
    appName,
    targetFile,
    message: detected.hasOnlyOffice
      ? `Đã mở tệp thành công bằng ONLYOFFICE Desktop Editors!`
      : `Đã mở tệp bằng ứng dụng Office mặc định của máy tính!`
  };
}
