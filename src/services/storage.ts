import { supabase } from "@/lib/supabase";

/** Comprime imagens no navegador antes do upload (máx. 1600px, JPEG 0.82) */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality)
  );
}

export async function uploadMedia(uid: string, file: File, folder = "media"): Promise<string> {
  const blob = file.type.startsWith("image/") ? await compressImage(file) : file;
  const contentType = blob.type || file.type;

  if (folder === "avatars") {
    const { error } = await supabase.storage.from("avatars").upload(uid, blob, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from("avatars").getPublicUrl(uid).data.publicUrl;
  }

  const path = `${uid}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("media").upload(path, blob, { contentType });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function mediaTypeOf(file: File): "image" | "video" | "gif" {
  if (file.type === "image/gif") return "gif";
  return file.type.startsWith("video/") ? "video" : "image";
}
