const storageKey = "postpilot.profile-presentation.v1";

export interface ProfilePresentation {
  avatarUrl?: string;
  goal?: string;
}

function readPresentations(): Record<string, ProfilePresentation> {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Record<string, ProfilePresentation>;
  } catch {
    return {};
  }
}

export function getProfilePresentation(profileId: string): ProfilePresentation {
  return readPresentations()[profileId] ?? {};
}

export function saveProfilePresentation(profileId: string, presentation: ProfilePresentation) {
  const presentations = readPresentations();
  presentations[profileId] = presentation;
  localStorage.setItem(storageKey, JSON.stringify(presentations));
}

export async function createProfileAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("กรุณาเลือกไฟล์รูปภาพ");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 8 MB");
  }

  const source = await readFile(file);
  const image = await loadImage(source);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("ไม่สามารถเตรียมรูปโปรไฟล์ได้");
  }

  const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - cropSize) / 2;
  const sourceY = (image.naturalHeight - cropSize) / 2;
  context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ไฟล์รูปภาพไม่ถูกต้องหรือไม่รองรับ"));
    image.src = source;
  });
}
