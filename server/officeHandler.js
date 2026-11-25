import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Đường dẫn chuẩn của ONLYOFFICE Desktop Editors (chỉ dùng cho môi trường dev cục bộ trên Windows)
const ONLYOFFICE_PATHS = [
  'C:\\Program Files\\ONLYOFFICE\\DesktopEditors\\DesktopEditors.exe',
  'C:\\Program Files (x86)\\ONLYOFFICE\\DesktopEditors\\DesktopEditors.exe',
  path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'ONLYOFFICE', 'DesktopEditors', 'DesktopEditors.exe'),
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

  const portablePath = path.resolve(process.cwd(), 'ONLYOFFICE', 'DesktopEditors.exe');
  if (!onlyofficeExe && fs.existsSync(portablePath)) {
    onlyofficeExe = portablePath;
  }

  const hasOffice = Boolean(onlyofficeExe);

  return {
    hasOffice: true,
    hasOnlyOffice: hasOffice,
    primary: hasOffice ? 'ONLYOFFICE Desktop Editors' : 'Trình xem Office mặc định của Windows',
    exePath: onlyofficeExe,
    supportedFormats: ['.pptx', '.docx', '.xlsx'],
  };
}

/**
 * Kích hoạt trực tiếp file Office trên máy tính bằng ONLYOFFICE (hoặc trình xem mặc định)
 */
export async function openOfficeDocument({ type = 'pptx', fileName = '', buffer = null }) {
  const detected = detectInstalledOffice();
  const ext = (type.startsWith('.') ? type.slice(1) : type).toLowerCase();
  const safeName = (fileName ? fileName.replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '_') : 'BaiGiang_MiThuat_GDPT2018') + `_${Date.now()}.${ext}`;
  const targetFile = path.join(os.tmpdir(), safeName);

  if (buffer) {
    fs.writeFileSync(targetFile, buffer);
  }

  const targetExe = detected.exePath;
  const appName = detected.primary;

  if (targetExe && fs.existsSync(targetExe)) {
    const child = spawn(targetExe, [targetFile], { detached: true, stdio: 'ignore' });
    child.unref();
  } else {
    const child = spawn('cmd.exe', ['/c', 'start', '""', targetFile], { detached: true, stdio: 'ignore' });
    child.unref();
  }

  return {
    success: true,
    hasOnlyOffice: detected.hasOnlyOffice,
    appName,
    targetFile,
    message: detected.hasOnlyOffice
      ? 'Đã mở tệp thành công bằng ONLYOFFICE Desktop Editors!'
      : 'Đã mở tệp bằng ứng dụng Office mặc định của máy tính!',
  };
}
