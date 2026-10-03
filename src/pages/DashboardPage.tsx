import { useEffect, useState } from "react";
import { getDashboard, type DashboardSummary } from "../api/dashboardApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import type { Profile } from "../types/postpilot";
import { getStatusLabel, getTargetLabel } from "../utils/displayText";

interface DashboardPageProps {
  profile: Profile;
  session: AuthSession;
}

export function DashboardPage({ profile, session }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextDashboard = await getDashboard(session, profile.id);
        if (isMounted) {
          setDashboard(nextDashboard);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถโหลดภาพรวมได้");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [profile.id, session]);

  const metrics = dashboard?.metrics;
  const metricCards = metrics
    ? [
        { label: "โพสต์ทั้งหมด", value: metrics.totalPosts },
        { label: "แบบร่าง", value: dashboard.draftPosts },
        { label: "อยู่ในคิว", value: metrics.queuedPosts },
        { label: "เผยแพร่แล้ว", value: metrics.postedPosts },
        { label: "ไม่สำเร็จ", value: metrics.failedPosts },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">ภาพรวม</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          สรุปกิจกรรมการโพสต์ของ {profile.name}
        </p>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">กำลังโหลดภาพรวม...</Card> : null}

      {!isLoading && !dashboard ? (
        <Card className="text-sm text-postpilot-secondary">
          ยังไม่มีข้อมูล เริ่มต้นด้วยการสร้างโพสต์แบบร่าง
        </Card>
      ) : null}

      {dashboard && metrics ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {metricCards.map((metric) => (
              <Card key={metric.label}>
                <p className="text-sm text-postpilot-secondary">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-postpilot-text">{metric.value}</p>
              </Card>
            ))}
          </section>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <h3 className="text-lg font-semibold text-postpilot-text">สถานะคิวโพสต์</h3>
              <p className="mt-3 text-sm leading-6 text-postpilot-secondary">
                {metrics.queuedPosts > 0
                  ? `มี ${metrics.queuedPosts} โพสต์กำลังรอเผยแพร่ตามลำดับ`
                  : "ยังไม่มีโพสต์ที่รอเผยแพร่"}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs text-postpilot-secondary">แบบร่าง</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{dashboard.draftPosts}</p>
                </div>
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs text-postpilot-secondary">อยู่ในคิว</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{metrics.queuedPosts}</p>
                </div>
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs text-postpilot-secondary">เผยแพร่แล้ว</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{metrics.postedPosts}</p>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-postpilot-text">ภาพรวมการมีส่วนร่วม</h3>
              <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                ข้อมูลวิเคราะห์จาก Meta จะแสดงหลังจากเชื่อมต่อบัญชีแล้ว
              </p>
              <dl className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">การเข้าถึง</dt>
                  <dd className="font-semibold text-postpilot-text">{metrics.reach.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">จำนวนครั้งที่แสดงผล</dt>
                  <dd className="font-semibold text-postpilot-text">
                    {metrics.impressions.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">การมีส่วนร่วม</dt>
                  <dd className="font-semibold text-postpilot-text">
                    {metrics.engagement.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </Card>
          </section>
          <Card>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-postpilot-text">โพสต์ล่าสุด</h3>
              <Badge tone="info">ข้อมูลปัจจุบัน</Badge>
            </div>
            <div className="mt-5 divide-y divide-postpilot-borderSoft">
              {dashboard.recentPosts.map((post) => (
                <div className="py-4" key={post.id}>
                  <p className="text-sm leading-6 text-postpilot-text">{post.caption}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={post.status === "Failed" ? "error" : post.status === "Posted" ? "success" : post.status === "Draft" ? "neutral" : "warning"}>
                      {getStatusLabel(post.status)}
                    </Badge>
                    {post.targets.map((target) => (
                      <Badge key={target} tone="neutral">
                        {getTargetLabel(target)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {dashboard.recentPosts.length === 0 ? (
                <p className="py-8 text-center text-sm text-postpilot-secondary">
                  ยังไม่มีโพสต์ เริ่มสร้างโพสต์แรกได้จากเมนูสร้างโพสต์
                </p>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
