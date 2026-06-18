import { useEffect, useState } from "react";
import { getDashboard, type DashboardSummary } from "../api/dashboardApi";
import type { AuthSession } from "../api/postpilotApi";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import type { Profile } from "../types/postpilot";

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
          setErrorMessage(error instanceof Error ? error.message : "Could not load dashboard.");
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
        { label: "Total posts", value: metrics.totalPosts },
        { label: "Draft posts", value: dashboard.draftPosts },
        { label: "Queued posts", value: metrics.queuedPosts },
        { label: "Posted posts", value: metrics.postedPosts },
        { label: "Failed posts", value: metrics.failedPosts },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          A calm snapshot of posting activity for {profile.name}.
        </p>
      </section>

      {errorMessage ? <Card className="text-sm text-red-700">{errorMessage}</Card> : null}
      {isLoading ? <Card className="text-sm text-postpilot-secondary">Loading dashboard...</Card> : null}

      {!isLoading && !dashboard ? (
        <Card className="text-sm text-postpilot-secondary">
          No dashboard data yet. Create a draft to start filling this workspace.
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
              <h3 className="text-lg font-semibold text-postpilot-text">Queue status</h3>
              <p className="mt-3 text-sm leading-6 text-postpilot-secondary">{metrics.queueStatus}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs uppercase tracking-wide text-postpilot-secondary">Draft</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{dashboard.draftPosts}</p>
                </div>
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs uppercase tracking-wide text-postpilot-secondary">Queue</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{metrics.queuedPosts}</p>
                </div>
                <div className="rounded-2xl bg-postpilot-soft p-4">
                  <p className="text-xs uppercase tracking-wide text-postpilot-secondary">Posted</p>
                  <p className="mt-2 text-2xl font-semibold text-postpilot-text">{metrics.postedPosts}</p>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-postpilot-text">Engagement snapshot</h3>
              <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
                Real Meta analytics is not connected yet, so these stay at zero for now.
              </p>
              <dl className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">Reach</dt>
                  <dd className="font-semibold text-postpilot-text">{metrics.reach.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">Impressions</dt>
                  <dd className="font-semibold text-postpilot-text">
                    {metrics.impressions.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-postpilot-secondary">Engagement</dt>
                  <dd className="font-semibold text-postpilot-text">
                    {metrics.engagement.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </Card>
          </section>
          <Card>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-postpilot-text">Recent posts</h3>
              <Badge tone="info">Live data</Badge>
            </div>
            <div className="mt-5 divide-y divide-postpilot-borderSoft">
              {dashboard.recentPosts.map((post) => (
                <div className="py-4" key={post.id}>
                  <p className="text-sm leading-6 text-postpilot-text">{post.caption}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={post.status === "Failed" ? "error" : post.status === "Posted" ? "success" : post.status === "Draft" ? "neutral" : "warning"}>
                      {post.status}
                    </Badge>
                    {post.targets.map((target) => (
                      <Badge key={target} tone="neutral">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {dashboard.recentPosts.length === 0 ? (
                <p className="py-8 text-center text-sm text-postpilot-secondary">
                  No posts yet. Create your first draft from Create Post.
                </p>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
