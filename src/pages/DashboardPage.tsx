import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { mockDashboardMetrics, mockRecentPosts } from "../data/mockData";

export function DashboardPage() {
  const metrics = mockDashboardMetrics;
  const metricCards = [
    { label: "Total posts", value: metrics.totalPosts },
    { label: "Queued posts", value: metrics.queuedPosts },
    { label: "Posted posts", value: metrics.postedPosts },
    { label: "Failed posts", value: metrics.failedPosts },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-postpilot-text">Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-postpilot-secondary">
          A calm snapshot of posting activity for the selected profile.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-6 flex h-32 items-end gap-3 rounded-2xl bg-postpilot-soft p-4">
            {[42, 64, 48, 82, 56, 72, 90].map((height, index) => (
              <div
                aria-hidden="true"
                className="w-full rounded-t-lg bg-postpilot-accent/80"
                key={index}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-postpilot-text">Engagement snapshot</h3>
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
          <Badge tone="info">Mock data</Badge>
        </div>
        <div className="mt-5 divide-y divide-postpilot-borderSoft">
          {mockRecentPosts.map((post) => (
            <div className="py-4" key={post.id}>
              <p className="text-sm leading-6 text-postpilot-text">{post.caption}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={post.status === "Failed" ? "error" : post.status === "Posted" ? "success" : "warning"}>
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
        </div>
      </Card>
    </div>
  );
}
