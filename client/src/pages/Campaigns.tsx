import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Edit2, Trash2, Send, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AICampaignAssistant } from "@/components/AICampaignAssistant";

export default function Campaigns() {
  const { data: campaigns, isLoading, refetch } = trpc.campaigns.list.useQuery();
  const createMutation = trpc.campaigns.create.useMutation();
  const updateMutation = trpc.campaigns.update.useMutation();
  const deleteMutation = trpc.campaigns.delete.useMutation();
  const sendMutation = trpc.campaigns.send.useMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", subject: "" });
  const [scheduleData, setScheduleData] = useState({ segmentId: "", scheduledAt: "" });
  const [useAIAssistant, setUseAIAssistant] = useState(false);

  const { data: segments } = trpc.segments.list.useQuery();
  const scheduleMutation = trpc.campaigns.schedule.useMutation();

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Campaign name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        subject: formData.subject,
      });
      setFormData({ name: "", subject: "" });
      setIsCreateOpen(false);
      refetch();
      toast.success("Campaign created successfully");
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        toast.success("Campaign deleted");
      } catch (error) {
        toast.error("Failed to delete campaign");
      }
    }
  };

  const handleSend = async (id: number) => {
    try {
      await sendMutation.mutateAsync({ id });
      refetch();
      toast.success("Campaign sent successfully");
    } catch (error) {
      toast.error("Failed to send campaign");
    }
  };

  const handleSchedule = async () => {
    if (!selectedCampaignId || !scheduleData.segmentId || !scheduleData.scheduledAt) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        id: selectedCampaignId,
        segmentId: parseInt(scheduleData.segmentId),
        scheduledAt: new Date(scheduleData.scheduledAt),
      });
      setIsScheduleOpen(false);
      refetch();
      toast.success("Campaign scheduled successfully");
    } catch (error) {
      toast.error("Failed to schedule campaign");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <span className="badge-draft">Draft</span>;
      case "scheduled":
        return <span className="badge-scheduled">Scheduled</span>;
      case "sent":
        return <span className="badge-sent">Sent</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <Skeleton className="w-32 h-10" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-2">Create and manage your email campaigns</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={18} />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* AI Assistant Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAIAssistant}
                  onChange={(e) => setUseAIAssistant(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="useAI" className="text-sm text-foreground cursor-pointer">
                  Use AI Assistant to generate campaign details
                </label>
              </div>

              {/* AI Assistant */}
              {useAIAssistant && (
                <AICampaignAssistant
                  onNameSelected={(name) => setFormData({ ...formData, name })}
                  onDescriptionSelected={(desc) => setFormData({ ...formData, subject: desc })}
                />
              )}
              {/* Manual Input */}
              <div>
                <Label className="text-foreground">Campaign Name</Label>
                <Input
                  placeholder="e.g., Summer Sale 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-foreground">Subject Line</Label>
                <Input
                  placeholder="e.g., Don't miss our summer sale!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Table */}
      <Card className="border-border bg-card overflow-hidden">
        {campaigns && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Campaign</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Subject</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Subscribers</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Created</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign: any) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium">{campaign.name}</td>
                    <td className="py-4 px-6 text-muted-foreground truncate max-w-xs">{campaign.subject || "—"}</td>
                    <td className="py-4 px-6">{getStatusBadge(campaign.status)}</td>
                    <td className="py-4 px-6 text-muted-foreground">{campaign.subscriberCount || 0}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {campaign.status === "draft" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => {
                                // Navigate to editor
                                toast("Email builder coming soon");
                              }}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedCampaignId(campaign.id);
                                setIsScheduleOpen(true);
                              }}
                            >
                              <Clock size={16} />
                            </Button>
                          </>
                        )}
                        {campaign.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:bg-green-100"
                            onClick={() => handleSend(campaign.id)}
                            disabled={sendMutation.isPending}
                          >
                            <Send size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(campaign.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-6 text-center">
            <p className="text-muted-foreground mb-4">No campaigns yet. Create your first campaign to get started.</p>
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={18} />
              Create Campaign
            </Button>
          </div>
        )}
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Schedule Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Select Segment</Label>
              <select
                value={scheduleData.segmentId}
                onChange={(e) => setScheduleData({ ...scheduleData, segmentId: e.target.value })}
                className="mt-2 w-full p-2 rounded-md bg-input text-foreground border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Select a segment...</option>
                {segments?.map((segment: any) => (
                  <option key={segment.id} value={segment.id}>{segment.name} ({segment.subscriberCount} subs)</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-foreground">Schedule Date & Time</Label>
              <Input
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                className="mt-2 bg-input text-foreground border-border"
              />
            </div>
            <Button
              onClick={handleSchedule}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? "Scheduling..." : "Schedule Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
