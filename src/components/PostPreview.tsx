import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Heart, Home, Menu, MoreHorizontal, Music2, Plus, Search, Send, Share2, ShoppingBag, ShoppingCart, Signal, ThumbsUp, Truck, Wifi, X as Close } from "lucide-react";
import type { Profile, PostingTarget } from "../types/postpilot";
import type { UploadedMedia } from "../api/postpilotApi";
import { getTargetLabel } from "../utils/displayText";
import { platformFor, productPlatforms } from "../utils/postComposer";
import { PlatformLogo } from "./profile/PlatformPicker";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { Card } from "./ui/Card";

type Product = { title: string; caption: string; price: string; media: UploadedMedia[] };
type PreviewProps = { profile: Profile; targets: PostingTarget[]; caption: string; media: UploadedMedia[]; product: Product };

function Media({ item, fill = false }: { item?: UploadedMedia; fill?: boolean }) {
  return item ? item.mimeType.startsWith("video/") ? <video controls playsInline preload="metadata" src={item.publicUrl} className={`preview-media ${fill ? "object-cover" : "object-contain"}`} /> : <img loading="lazy" draggable={false} alt={item.fileName} src={item.publicUrl} className={`preview-media ${fill ? "object-cover" : "object-contain"}`} /> : <div className="preview-placeholder">รูปภาพหรือวิดีโอจะแสดงที่นี่</div>;
}

function Gallery({ media, collage = false, side = false }: { media: UploadedMedia[]; collage?: boolean; side?: boolean }) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, media.length - 1));
  return <div>
    <div className={side && media.length > 1 ? "preview-gallery-side" : ""}>
      <div className={`preview-image-area ${collage && safeIndex === 0 && media.length > 1 ? "preview-collage" : ""}`}>
        {collage && safeIndex === 0 && media.length > 1 ? media.slice(0, 4).map((item, i) => <div key={item.id} className={i === 0 ? "collage-main" : ""}><Media item={item} fill /></div>) : <Media item={media[safeIndex]} />}
        {media.length > 1 ? <><button type="button" aria-label="สื่อก่อนหน้า" className="gallery-arrow left-2" onClick={() => setIndex((safeIndex - 1 + media.length) % media.length)}><ChevronLeft size={18} /></button><button type="button" aria-label="สื่อถัดไป" className="gallery-arrow right-2" onClick={() => setIndex((safeIndex + 1) % media.length)}><ChevronRight size={18} /></button><span className="preview-image-count">{safeIndex + 1} / {media.length}</span></> : null}
      </div>
      {media.length > 1 ? <div className={`preview-thumbnails ${side ? "is-side" : ""}`}>{media.map((item, i) => <button type="button" key={item.id} aria-label={`ดูสื่อที่ ${i + 1}`} aria-pressed={i === safeIndex} className={i === safeIndex ? "is-active" : ""} onClick={() => setIndex(i)}>{item.mimeType.startsWith("video/") ? <span className="flex h-full items-center justify-center text-xs">วิดีโอ {i + 1}</span> : <img loading="lazy" alt="" src={item.publicUrl} />}</button>)}</div> : null}
    </div>
  </div>;
}

function Caption({ value }: { value: string }) {
  return <p className="preview-caption">{value ? value.split(/([#@][^\s]+)/g).map((part, i) => part.startsWith("#") || part.startsWith("@") ? <span key={i} className="preview-tag">{part}</span> : part) : <span className="text-postpilot-secondary">ข้อความโพสต์จะแสดงที่นี่</span>}</p>;
}

function Account({ profile, dark = false }: { profile: Profile; dark?: boolean }) {
  return <div className={`preview-account ${dark ? "is-dark" : ""}`}><ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{profile.name}</p><p className="text-[10px] opacity-70">{profile.shopName || profile.name}</p></div><MoreHorizontal size={18} /></div>;
}

function PlatformScreen({ target, profile, caption, media, product }: PreviewProps & { target: PostingTarget }) {
  const platform = platformFor(target);
  const shop = productPlatforms.includes(platform);
  const story = target.includes("Story");
  const tiktok = target === "TikTok";
  const instagram = platform === "Instagram";
  const [storyIndex, setStoryIndex] = useState(0);
  const safeStoryIndex = Math.min(storyIndex, Math.max(0, media.length - 1));
  const price = product.price && Number.isFinite(Number(product.price)) ? `฿${Number(product.price).toLocaleString("th-TH", { minimumFractionDigits: platform === "eBay" ? 2 : 0, maximumFractionDigits: 2 })}` : "฿—";
  if (story || tiktok) return <div className={`preview-phone preview-vertical ${instagram ? "instagram-story" : ""}`}>
    <div className="vertical-background"><Media item={media[safeStoryIndex]} fill /></div>
    <div className="vertical-top"><div className="preview-status"><span>9:41</span><span className="flex gap-1"><Signal size={12} /><Wifi size={12} /><span className="battery" /></span></div>
      {story ? <><div className="story-progress">{(media.length ? media : [null]).map((_, i) => <span key={i} className={i <= safeStoryIndex ? "is-filled" : ""} />)}</div><div className="flex items-center gap-2 px-3"><ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} size="sm" /><span className="min-w-0 flex-1 truncate text-xs font-semibold">{profile.name}</span><MoreHorizontal size={18} /><Close size={19} /></div></> : <div className="flex items-center justify-between px-4 py-3 text-xs"><span>กำลังติดตาม</span><strong className="border-b-2 border-white pb-1">สำหรับคุณ</strong><Search size={20} /></div>}
    </div>
    {media.length > 1 ? <div className="vertical-media-nav"><button type="button" aria-label="สื่อก่อนหน้า" onClick={() => setStoryIndex((safeStoryIndex - 1 + media.length) % media.length)}><ChevronLeft size={22} /></button><button type="button" aria-label="สื่อถัดไป" onClick={() => setStoryIndex((safeStoryIndex + 1) % media.length)}><ChevronRight size={22} /></button></div> : null}
    <div className="vertical-caption"><p className="mb-2 text-xs font-semibold">{profile.name}</p><Caption value={caption} />{tiktok ? <div className="mt-3 flex items-center gap-2 text-[10px]"><Music2 size={13} />เสียงต้นฉบับ</div> : null}</div>
    <div aria-hidden="true" className={tiktok ? "tiktok-actions" : "story-actions"}><Heart size={23} />{tiktok ? <Bookmark size={22} /> : null}<Send size={22} /></div>
    {tiktok ? <div aria-hidden="true" className="tiktok-footer"><Home size={19} /><ShoppingBag size={19} /><span className="rounded-md bg-white px-3 py-1 text-black"><Plus size={20} /></span><Menu size={19} /></div> : null}
  </div>;

  if (shop) return <div className={`preview-phone preview-shop shop-${platform.toLowerCase().replace(/\s/g, "")}`}>
    <div aria-hidden="true" className="preview-status"><span>9:41</span><span className="flex gap-1"><Signal size={12} /><Wifi size={12} /><span className="battery" /></span></div>
    <div className="shop-header"><PlatformLogo platform={platform} size="sm" /><strong>{platform}</strong><Search size={17} className="ml-auto" /><ShoppingCart size={18} /><MoreHorizontal size={18} /></div>
    <Gallery media={product.media} side={platform === "eBay"} collage={platform === "Lazada" || platform === "TikTok Shop"} />
    <div className="shop-details">
      {platform === "Etsy" ? <Account profile={profile} /> : null}
      <h4 className="shop-title">{product.title || "ชื่อสินค้าจะแสดงที่นี่"}</h4>
      {platform === "eBay" ? <Account profile={profile} /> : null}
      <p className="shop-price">{price}</p>
      {platform !== "Etsy" && platform !== "eBay" ? <div className="mt-3 flex items-center gap-2 text-xs"><ProfileAvatar avatarUrl={profile.avatarUrl} name={profile.name} size="sm" /><span>{profile.shopName || profile.name}</span></div> : null}
      <div className="shop-description"><h5 className="mb-2 text-xs font-semibold">รายละเอียดสินค้า</h5><Caption value={product.caption} /></div>
      <div aria-hidden="true" className="shop-shipping"><Truck size={17} /><span>ข้อมูลการจัดส่ง</span><ChevronRight size={15} className="ml-auto" /></div>
      <div aria-hidden="true" className="shop-cta"><span>{platform === "eBay" ? "ซื้อตอนนี้" : platform === "Etsy" ? "เพิ่มลงในตะกร้า" : "ซื้อเลย"}</span>{platform !== "Etsy" ? <span>เพิ่มลงรถเข็น</span> : null}</div>
    </div>
  </div>;

  return <div className={`preview-phone preview-social social-${platform.toLowerCase()}`}>
    <div aria-hidden="true" className="preview-status"><span>9:41</span><span className="flex gap-1"><Signal size={12} /><Wifi size={12} /><span className="battery" /></span></div>
    <div aria-hidden="true" className="social-brand">{platform === "Facebook" ? <><strong className="facebook-wordmark">facebook</strong><span className="ml-auto flex gap-3"><Plus size={19} /><Search size={19} /></span></> : instagram ? <><strong className="instagram-wordmark">Instagram</strong><Heart size={22} className="ml-auto" /></> : <><ArrowLeft size={18} /><PlatformLogo platform="X" size="sm" /><MoreHorizontal size={18} /></>}</div>
    <Account profile={profile} />
    {!instagram ? <div className="px-3 pb-3"><Caption value={caption} /></div> : null}
    <Gallery media={media} collage={!instagram} />
    <div aria-hidden="true" className="social-actions">{platform === "Facebook" ? <><span className="flex items-center gap-1"><ThumbsUp size={18} />ถูกใจ</span><span className="ml-auto flex items-center gap-1"><Share2 size={18} />แชร์</span></> : <><Heart size={21} /><Send size={20} /><Bookmark className="ml-auto" size={20} /></>}</div>
    {instagram ? <div className="px-3 pb-4"><Caption value={caption} /></div> : null}
    <div aria-hidden="true" className="social-footer"><Home size={20} /><Search size={20} /><Plus size={20} /><Menu size={20} /></div>
  </div>;
}

export function PostPreview(props: PreviewProps) {
  const { targets } = props;
  const [selected, setSelected] = useState<PostingTarget | null>(null);
  const [screenHeight, setScreenHeight] = useState<number>();
  const viewport = useRef<HTMLDivElement>(null);
  const target = selected && targets.includes(selected) ? selected : targets[0];
  const activeIndex = Math.max(0, targets.indexOf(target));
  const targetKey = targets.join(",");
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const wheelTime = useRef(0);
  const rail = useRef<HTMLDivElement>(null);
  function choose(index: number) {
    const next = targets[Math.max(0, Math.min(index, targets.length - 1))];
    if (!next) return;
    setSelected(next);
  }
  useEffect(() => {
    const icon = rail.current?.querySelector<HTMLButtonElement>(`[data-active="true"]`);
    if (icon && rail.current) rail.current.scrollTo({ left: icon.offsetLeft - rail.current.offsetLeft - (rail.current.clientWidth - icon.clientWidth) / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    viewport.current?.querySelectorAll("video").forEach((video) => { if (video.closest("[data-preview-active]")?.getAttribute("data-preview-active") !== "true") video.pause(); });
  }, [targetKey, activeIndex]);
  useEffect(() => {
    const screen = viewport.current?.querySelector<HTMLElement>('[data-preview-active="true"] .preview-phone');
    if (!screen) return;
    const observer = new ResizeObserver(() => setScreenHeight(screen.getBoundingClientRect().height));
    observer.observe(screen);
    return () => observer.disconnect();
  }, [targetKey, activeIndex]);
  return <Card className="min-w-0 preview-card">
    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">ตัวอย่างโพสต์</h3><span className="text-xs text-postpilot-secondary">{activeIndex + 1} / {targets.length}</span></div>
    <div className="preview-channel-nav" onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); choose(activeIndex + (event.key === "ArrowRight" ? 1 : -1)); } }}><button type="button" aria-label="แพลตฟอร์มก่อนหน้า" disabled={activeIndex === 0} onClick={() => choose(activeIndex - 1)}><ChevronLeft size={19} /></button>
      <div ref={rail} className="preview-icon-rail" aria-label="แพลตฟอร์มตัวอย่าง">{targets.map((item, i) => <button key={item} type="button" title={getTargetLabel(item)} aria-label={getTargetLabel(item)} aria-pressed={item === target} data-active={item === target} onClick={() => choose(i)} className={`preview-icon ${item === target ? "is-active" : ""}`}><span className="preview-icon-circle"><PlatformLogo platform={platformFor(item)} size="sm" /></span><span className="preview-icon-label">{item.includes("Story") ? "Story" : platformFor(item) === "TikTok Shop" ? "Shop" : platformFor(item)}</span></button>)}</div>
      <button type="button" aria-label="แพลตฟอร์มถัดไป" disabled={activeIndex === targets.length - 1} onClick={() => choose(activeIndex + 1)}><ChevronRight size={19} /></button>
    </div>
    <p className="mb-3 text-center text-xs font-medium">{target ? getTargetLabel(target) : "เลือกช่องทางเผยแพร่เพื่อดูตัวอย่าง"}</p>
    <div ref={viewport} style={{ height: screenHeight }} className="preview-carousel" aria-label="เลื่อนดูตัวอย่างแต่ละแพลตฟอร์ม"
      onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => { const start = gesture.current; gesture.current = null; if (start && Math.abs(event.clientX - start.x) > 40 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) choose(activeIndex + (event.clientX < start.x ? 1 : -1)); }}
      onPointerCancel={() => { gesture.current = null; }}
      onWheel={(event) => { if (Math.abs(event.deltaX) > 20 && Math.abs(event.deltaX) > Math.abs(event.deltaY) && Date.now() - wheelTime.current > 350) { wheelTime.current = Date.now(); choose(activeIndex + (event.deltaX > 0 ? 1 : -1)); } }}>
      <div className="preview-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>{targets.map((item) => <div className="preview-slide" key={item} data-preview-active={item === target} inert={item !== target}><PlatformScreen {...props} target={item} /></div>)}</div>
    </div>
    <p className="mt-3 text-center text-xs leading-5 text-postpilot-secondary">เลื่อนซ้าย–ขวา หรือเลือกไอคอนเพื่อเปลี่ยนแพลตฟอร์ม</p>
  </Card>;
}
