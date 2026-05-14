import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Mail, Eye, MousePointerClick, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: metrics, isLoading } = trpc.campaigns.getDashboardMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slideIn">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your campaigns.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Emails Sent */}
        <Card className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Emails Sent</p>
              <p className="text-3xl font-bold text-foreground mt-2">{metrics?.totalEmailsSent.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 12.4% vs last period</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Open Rate */}
        <Card className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
              <p className="text-3xl font-bold text-foreground mt-2">{(metrics?.openRate || 0).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 8.7% vs last period</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Click Rate */}
        <Card className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
              <p className="text-3xl font-bold text-foreground mt-2">{(metrics?.clickRate || 0).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 3.1% vs last period</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* New Subscribers */}
        <Card className="p-6 border border-border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Subscribers</p>
              <p className="text-3xl font-bold text-foreground mt-2">{metrics?.newSubscribers.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 15.3% vs last period</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Rate Over Time */}
        <Card className="p-6 border border-border bg-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Open Rate Over Time</h2>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.openRateOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Open Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Subscriber Growth */}
        <Card className="p-6 border border-border bg-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Subscriber Growth</h2>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.subscriberGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[8, 8, 0, 0]}
                name="New Subscribers"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Section: Top Campaigns and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Campaigns */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Top Performing Campaigns</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Campaign</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Sent</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Open Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.topCampaigns && metrics.topCampaigns.length > 0 ? (
                  metrics.topCampaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{campaign.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{(campaign.sent as number).toLocaleString()}</td>
                      <td className="py-3 px-4 text-muted-foreground">{(typeof campaign.openRate === 'string' ? parseFloat(campaign.openRate) : campaign.openRate).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-muted-foreground">{(typeof campaign.clickRate === 'string' ? parseFloat(campaign.clickRate) : campaign.clickRate).toFixed(1)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-muted-foreground">
                      No campaigns yet. Create your first campaign to see performance metrics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${activity.type === 'open' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {activity.type === 'open' ? <Eye className="w-4 h-4" /> : <MousePointerClick className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="font-bold">{activity.subscriberEmail}</span> {activity.type === 'open' ? 'opened' : 'clicked'} <span className="font-bold">{activity.campaignName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
