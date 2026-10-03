import { useEffect, useMemo, useState } from "react";
import { listHistory, type HistoryItem } from "../api/historyApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import type { PostStatus, PostingTarget, Profile } from "../types/postpilot";
import { getStatusLabel, getTargetLabel } from "../utils/displayText";

type StatusFilter = "All" | PostStatus;
type PlatformFilter = "All" | PostingTarget;

interface PostHistoryPageProps {
  profile: Profile;
  session: AuthSession;
}

export function PostHistoryPage({ profile, session }: PostHistoryPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("All");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const platformOptions: PostingTarget[] = ["Facebook Page", "Instagram Feed", "Instagram Story"];

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextHistoryItems = await listHistory(session, profile.id);
        if (isMounted) {
          setHistoryItems(nextHistoryItems);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถโหลดประวัติโพสต์ได้");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const filteredHistoryItems = useMemo(
    () =>
      historyItems.filter((item) => {
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        const matchesPlatform = platformFilter === "All" || item.platform === platformFilter;
        return matchesStatus && matchesPlatform;
      }),
    [historyItems, platformFilter, statusFilter],
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">ประวัติโพสต์</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          ตรวจสอบผลการเผยแพร่โพสต์ของ {profile.name}
        </p>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">กำลังโหลดประวัติโพสต์...</Card> : null}

      <Card>
        <div className="grid gap-3 border-b border-postpilot-borderSoft pb-5 md:grid-cols-3">
          <label className="text-sm font-medium text-postpilot-text">
            สถานะ
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-text"
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              value={statusFilter}
            >
              <option value="All">ทั้งหมด</option>
              <option value="Posted">เผยแพร่แล้ว</option>
              <option value="Failed">ไม่สำเร็จ</option>
            </select>
          </label>
          <label className="text-sm font-medium text-postpilot-text">
            แพลตฟอร์ม
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-postpilot-border bg-white px-3 text-sm text-postpilot-text"
              onChange={(event) => setPlatformFilter(event.target.value as PlatformFilter)}
              value={platformFilter}
            >
              <option value="All">ทั้งหมด</option>
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>{getTargetLabel(platform)}</option>
              ))}
            </select>
          </label>
          <div className="rounded-xl bg-postpilot-soft px-4 py-3 text-sm text-postpilot-secondary">
            {filteredHistoryItems.length} รายการ
          </div>
        </div>
        <div className="divide-y divide-postpilot-borderSoft">
          {filteredHistoryItems.map((item) => (
            <article className="py-5" key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-postpilot-text">{item.caption}</p>
                <Badge tone={item.status === "Failed" ? "error" : "success"}>{getStatusLabel(item.status)}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="info">{getTargetLabel(item.platform)}</Badge>
                <Badge tone="neutral">รหัสภายนอก: {item.externalPostId ?? "รอดำเนินการ"}</Badge>
                <Badge tone="neutral">{new Date(item.publishedAt).toLocaleString("th-TH")}</Badge>
              </div>
              {item.errorMessage ? (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  {item.errorMessage}
                </p>
              ) : null}
            </article>
          ))}
          {!isLoading && filteredHistoryItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-postpilot-secondary">
              ยังไม่มีประวัติโพสต์ เริ่มเผยแพร่จากหน้าสร้างโพสต์หรือคิวโพสต์
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
