import { useId, useState } from "react";
import { ImagePlus, LoaderCircle, Plus, X, Film } from "lucide-react";
import type { UploadedMedia } from "../../api/postpilotApi";

export function MediaUpload({ media, disabled, uploading, onUpload, onRemove }: {
  media: UploadedMedia[]; disabled: boolean; uploading: boolean;
  onUpload: (files: File[]) => void; onRemove: (id: string) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  return <section aria-label="รูปภาพและวิดีโอ">
    <h4 className="text-sm font-medium">รูปภาพและวิดีโอ <span className="font-normal text-postpilot-secondary">{media.length > 0 ? `(${media.length})` : ""}</span></h4>
    <div className={`media-upload mt-3 ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) onUpload(Array.from(event.dataTransfer.files)); }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item, index) => <div className="media-tile relative" key={item.id}>
          {item.mimeType.startsWith("video/") ? <><video src={item.publicUrl} preload="metadata" className="h-full w-full object-cover" /><Film aria-hidden="true" className="absolute bottom-2 right-2 text-white drop-shadow" size={18} /></> : <img src={item.publicUrl} alt={`ภาพที่ ${index + 1}: ${item.fileName}`} className="h-full w-full object-cover" />}
          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">{index + 1}</span>
          <button type="button" aria-label={`นำ ${item.fileName} ออก`} title={item.fileName} disabled={disabled} onClick={() => onRemove(item.id)} className="absolute right-1.5 top-1.5 rounded-full bg-white p-1 text-postpilot-text hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-postpilot-accent"><X size={14} /></button>
        </div>)}
        <label htmlFor={id} className={`media-add ${media.length === 0 ? "col-span-full min-h-40" : "aspect-square"} ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
          {uploading ? <LoaderCircle size={25} className="animate-spin motion-reduce:animate-none" /> : media.length ? <Plus size={25} /> : <ImagePlus size={28} />}
          <span className="mt-2 text-sm font-medium">{uploading ? "กำลังอัปโหลด..." : media.length ? "เพิ่มสื่อ" : "เพิ่มรูปภาพหรือวิดีโอ"}</span>
          {!media.length && !uploading ? <span className="mt-1 text-xs text-postpilot-secondary">คลิกเลือกไฟล์ หรือลากมาวางในกรอบนี้</span> : null}
        </label>
      </div>
      <input id={id} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" disabled={disabled} className="sr-only peer" onChange={(event) => { onUpload(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
    </div>
    <p className="mt-2 text-xs leading-5 text-postpilot-secondary">รูปภาพไม่เกิน 10 MB · วิดีโอ MP4, WebM, MOV ไม่เกิน 100 MB ต่อไฟล์</p>
  </section>;
}
