import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { createPostDraft, publishPostNow } from "../api/postDraftApi";
import { addPostToQueue } from "../api/queueApi";
import { listCategories, uploadMedia, type AuthSession, type UploadedMedia } from "../api/postpilotApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PlatformLogo } from "../components/profile/PlatformPicker";
import { MediaUpload } from "../components/composer/MediaUpload";
import { AnimatedPosition } from "../components/composer/AnimatedPosition";
import { PostPreview } from "../components/PostPreview";
import type { Category, Platform, PostingTarget, Profile } from "../types/postpilot";
import { channelOrder, platformFor, productPlatforms, sortTargets, storyFor, targetFor } from "../utils/postComposer";

type Format = "social" | "product";
type Content = { caption: string; media: UploadedMedia[]; title: string; price: string };
const empty = (): Content => ({ caption: "", media: [], title: "", price: "" });
const fieldClass = "mt-2 w-full rounded-xl border border-postpilot-border bg-white px-4 py-3 text-sm outline-none placeholder:text-postpilot-secondary focus:border-postpilot-accent focus:ring-4 focus:ring-[#1A3D2F]/10 disabled:opacity-60";

export function CreatePostPage({ profile, session }: { profile: Profile; session: AuthSession }) {
  const options = channelOrder.filter((p) => profile.platforms.includes(p));
  const [targets, setTargets] = useState<PostingTarget[]>([]);
  const [content, setContent] = useState<Record<Format, Content>>({ social: empty(), product: empty() });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploading, setUploading] = useState<Format | null>(null);
  const [action, setAction] = useState<"save" | "queue" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const saved = useRef<Partial<Record<Format, string>>>({});
  const queued = useRef(new Set<string>());
  const published = useRef(new Set<string>());
  const busy = action !== null || uploading !== null;
  const socialTargets = sortTargets(targets.filter((t) => !productPlatforms.includes(platformFor(t))));
  const productTargets = sortTargets(targets.filter((t) => productPlatforms.includes(platformFor(t))));
  const hasSocial = socialTargets.length > 0;
  const hasProduct = productTargets.length > 0;
  const dual = hasSocial && hasProduct;
  const category = categories.find((item) => item.id === categoryId);
  const socialCaption = [content.social.caption.trim(), category ? [...category.hashtags, ...category.mentions].filter((tag) => !content.social.caption.split(/\s+/).includes(tag)).join(" ") : ""].filter(Boolean).join("\n\n");
  const priceValue = Number(content.product.price);
  const productCaption = [content.product.title.trim(), content.product.caption.trim(), content.product.price ? `ราคา ฿${priceValue.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""].filter(Boolean).join("\n\n");

  useEffect(() => {
    let mounted = true;
    listCategories(session, profile.id).then((items) => { if (mounted) setCategories(items); }).catch((reason) => { if (mounted) setError(reason instanceof Error ? reason.message : "โหลดกลุ่มแฮชแท็กไม่สำเร็จ"); }).finally(() => { if (mounted) setLoadingCategories(false); });
    return () => { mounted = false; };
  }, [profile.id, session]);

  function changed(format?: Format) {
    if (format) delete saved.current[format]; else saved.current = {};
    setError(null); setNotice(null);
  }
  function update(format: Format, patch: Partial<Content>) {
    changed(format);
    setContent((current) => ({ ...current, [format]: { ...current[format], ...patch } }));
  }
  function togglePlatform(platform: Platform) {
    changed();
    const main = targetFor(platform), story = storyFor(platform);
    setTargets((current) => current.includes(main) ? current.filter((t) => t !== main && t !== story) : [...current, main]);
  }
  async function upload(format: Format, files: File[]) {
    if (busy || !files.length) return;
    changed(format); setUploading(format);
    const failures: string[] = [];
    try {
      for (const file of files) {
        const limit = (file.type.startsWith("video/") ? 100 : 10) * 1024 * 1024;
        if (!["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"].includes(file.type) || !file.size || file.size > limit) { failures.push(`${file.name}: ชนิดหรือขนาดไฟล์ไม่รองรับ`); continue; }
        try {
          const media = await uploadMedia(session, profile.id, file);
          setContent((current) => ({ ...current, [format]: { ...current[format], media: [...current[format].media, media] } }));
        } catch (reason) { failures.push(`${file.name}: ${reason instanceof Error ? reason.message : "อัปโหลดไม่สำเร็จ"}`); }
      }
      if (failures.length) setError(failures.join("\n"));
    } finally { setUploading(null); }
  }
  async function runAction(nextAction: "save" | "queue" | "publish") {
    if (busy) return;
    setError(null); setNotice(null);
    if (!targets.length) { setError("เลือกช่องทางเผยแพร่ก่อนเตรียมโพสต์"); return; }
    if (hasSocial && !content.social.caption.trim()) { setError("กรุณาเขียนข้อความในฟอร์มโซเชียล"); return; }
    if (hasProduct && (!content.product.title.trim() || !content.product.caption.trim() || !content.product.price || !Number.isFinite(priceValue) || priceValue <= 0)) { setError("กรุณากรอกชื่อสินค้า รายละเอียด และราคาที่มากกว่า 0 ในฟอร์มสินค้า"); return; }
    setAction(nextAction);
    const formats: Format[] = [...(hasProduct ? ["product" as const] : []), ...(hasSocial ? ["social" as const] : [])];
    try {
      for (const format of formats) {
        if (!saved.current[format]) {
          const draft = await createPostDraft(session, profile.id, { caption: format === "social" ? socialCaption : productCaption, categoryId: format === "social" ? categoryId : undefined, media: content[format].media, targetPlatforms: format === "social" ? socialTargets : productTargets });
          saved.current[format] = draft.id;
        }
        const id = saved.current[format]!;
        if (nextAction === "queue" && !queued.current.has(id)) { await addPostToQueue(session, profile.id, id); queued.current.add(id); }
        if (nextAction === "publish" && !published.current.has(id)) { await publishPostNow(session, profile.id, id); published.current.add(id); }
      }
      setNotice(nextAction === "save" ? `บันทึกแบบร่าง ${formats.length} ฟอร์มแล้ว` : nextAction === "queue" ? `เพิ่มเข้าคิว ${formats.length} ฟอร์มแล้ว` : "ส่งคำขอเผยแพร่แล้ว ตรวจสอบผลแต่ละช่องทางในประวัติโพสต์");
    } catch (reason) { setError(`${reason instanceof Error ? reason.message : "ทำรายการไม่สำเร็จ"}${Object.keys(saved.current).length ? " · แบบร่างที่บันทึกแล้วเก็บไว้ กดทำรายการอีกครั้งเพื่อดำเนินการต่อ" : ""}`); }
    finally { setAction(null); }
  }
  function editor(format: Format) {
    const product = format === "product", data = content[format];
    return <Card className="space-y-5">
      <div className="border-b border-postpilot-borderSoft pb-4"><div className="flex items-center gap-2">{product ? <ShoppingBag size={19} /> : <Sparkles size={19} />}<h3 className="font-semibold">{product ? "ข้อมูลสินค้า" : "โพสต์โซเชียล"}</h3></div><p className="mt-2 text-xs leading-5 text-postpilot-secondary">{(product ? productTargets : socialTargets).filter((t) => !t.includes("Story")).map(platformFor).join(" · ")}</p></div>
      {product ? <><label className="block text-sm font-medium" htmlFor="product-title">ชื่อสินค้า<input id="product-title" className={fieldClass} value={data.title} disabled={busy} onChange={(e) => update(format, { title: e.target.value })} placeholder="ชื่อสินค้าที่ลูกค้าจะเห็น" /></label><label className="block text-sm font-medium" htmlFor="product-price">ราคา (บาท)<input id="product-price" type="number" inputMode="decimal" min="0.01" step="0.01" className={fieldClass} value={data.price} disabled={busy} onChange={(e) => update(format, { price: e.target.value })} placeholder="0.00" /></label></> : null}
      <label className="block text-sm font-medium" htmlFor={`${format}-caption`}>{product ? "รายละเอียดสินค้า" : "ข้อความโพสต์"}<textarea id={`${format}-caption`} className={`${fieldClass} min-h-52 resize-y leading-7`} value={data.caption} disabled={busy} onChange={(e) => update(format, { caption: e.target.value })} placeholder={product ? "อธิบายสินค้า สภาพ ขนาด และรายละเอียดที่ลูกค้าควรรู้" : "เขียนข้อความที่ต้องการเผยแพร่"} /></label>
      {!product ? <fieldset><legend className="text-sm font-medium">กลุ่มแฮชแท็กและ Mention</legend><div className="mt-3 flex flex-wrap gap-2"><label className="round-choice"><input type="radio" name="hashtag-group" checked={!categoryId} disabled={busy} onChange={() => { changed("social"); setCategoryId(""); }} /><span className="choice-dot">{!categoryId ? <Check size={12} /> : null}</span>ไม่ใช้กลุ่ม</label>{categories.map((item) => <label key={item.id} className="round-choice"><input type="radio" name="hashtag-group" checked={categoryId === item.id} disabled={busy} onChange={() => { changed("social"); setCategoryId(item.id); }} /><span className="choice-dot">{categoryId === item.id ? <Check size={12} /> : null}</span>{item.name}</label>)}</div>{loadingCategories ? <p role="status" className="mt-2 text-xs">กำลังโหลดกลุ่มแฮชแท็ก...</p> : !categories.length ? <p className="mt-2 text-xs text-postpilot-secondary">เพิ่มกลุ่มแฮชแท็กได้ในหน้าหมวดหมู่</p> : null}</fieldset> : null}
      <MediaUpload media={data.media} disabled={busy} uploading={uploading === format} onUpload={(files) => void upload(format, files)} onRemove={(id) => update(format, { media: data.media.filter((item) => item.id !== id) })} />
    </Card>;
  }
  return <div className="composer-page space-y-6">
    <section><h2 className="text-2xl font-semibold">สร้างโพสต์</h2><p className="mt-2 text-sm text-postpilot-secondary">เลือกช่องทาง แล้วเตรียมเนื้อหาให้เหมาะกับแต่ละรูปแบบ</p></section>
    <Card><fieldset disabled={busy}><legend className="text-sm font-semibold">ช่องทางเผยแพร่</legend><div className="channel-strip mt-4">{options.map((platform) => <button type="button" key={platform} aria-pressed={targets.includes(targetFor(platform))} onClick={() => togglePlatform(platform)} className={`channel-choice ${targets.includes(targetFor(platform)) ? "is-selected" : ""}`}><span className="channel-circle"><PlatformLogo platform={platform} />{targets.includes(targetFor(platform)) ? <span className="channel-check"><Check size={11} strokeWidth={3} /></span> : null}</span><span>{platform}</span></button>)}</div>{!options.length ? <p className="mt-3 text-sm text-postpilot-secondary">เลือกแพลตฟอร์มในตั้งค่าโปรไฟล์ก่อนสร้างโพสต์</p> : null}</fieldset>
      {options.some((p) => storyFor(p) && targets.includes(targetFor(p))) ? <fieldset disabled={busy} className="mt-5 border-t border-postpilot-borderSoft pt-4"><legend className="sr-only">ลง Story ด้วย</legend><div className="flex flex-wrap items-center gap-3"><p className="mr-1 text-sm font-medium">ลง Story ด้วย</p>{options.filter((p) => storyFor(p) && targets.includes(targetFor(p))).map((platform) => <label className="round-choice" key={platform}><input type="checkbox" checked={targets.includes(storyFor(platform)!)} onChange={() => { changed("social"); const story = storyFor(platform)!; setTargets((current) => current.includes(story) ? current.filter((t) => t !== story) : [...current, story]); }} /><span className="choice-dot">{targets.includes(storyFor(platform)!) ? <Check size={12} /> : null}</span><PlatformLogo platform={platform} size="sm" />{platform}</label>)}</div></fieldset> : null}
    </Card>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm whitespace-pre-wrap text-red-800">{error}</div> : null}
    {notice ? <div role="status" className="rounded-xl bg-postpilot-accentSoft p-4 text-sm text-postpilot-accent">{notice}</div> : null}
    {!targets.length ? <div className="rounded-xl border border-dashed border-postpilot-border py-16 text-center"><h3 className="font-semibold">เริ่มจากเลือกช่องทางด้านบน</h3><p className="mt-2 text-sm text-postpilot-secondary">ฟอร์มโซเชียลหรือฟอร์มสินค้าจะแสดงตามช่องทางที่คุณเลือก</p></div> : <>
      <div className={`composer-grid ${dual ? "has-two-formats" : "has-one-format"}`}>
        {hasProduct ? <AnimatedPosition className={`composer-editor product-editor ${dual ? "position-left" : "position-center"}`}>{editor("product")}</AnimatedPosition> : null}
        {hasSocial ? <AnimatedPosition className="composer-editor social-editor position-center">{editor("social")}</AnimatedPosition> : null}
        <AnimatedPosition className="composer-preview"><PostPreview profile={profile} targets={sortTargets(targets)} caption={socialCaption} media={content.social.media} product={{ title: content.product.title, caption: content.product.caption, price: content.product.price, media: content.product.media }} /></AnimatedPosition>
      </div>
      <div className="composer-actions flex flex-wrap justify-center gap-3"><Button disabled={busy} onClick={() => void runAction("save")} variant="secondary">{action === "save" ? "กำลังบันทึก..." : "บันทึกแบบร่าง"}</Button><Button disabled={busy} onClick={() => void runAction("queue")} variant="secondary">{action === "queue" ? "กำลังเพิ่ม..." : "เพิ่มเข้าคิว"}</Button><Button disabled={busy} onClick={() => void runAction("publish")}>{action === "publish" ? "กำลังเผยแพร่..." : "เผยแพร่ตอนนี้"}</Button></div>
      <p className="text-center text-xs leading-5 text-postpilot-secondary">{dual ? "สองฟอร์มบันทึกเป็นคนละแบบร่างตามช่องทางที่เลือก · " : ""}การเผยแพร่จริงปัจจุบันรองรับภาพเดี่ยวบน Facebook Page</p>
    </>}
  </div>;
}
