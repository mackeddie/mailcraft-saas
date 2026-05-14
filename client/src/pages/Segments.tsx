import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Segments() {
  const { data: segments, isLoading, refetch } = trpc.segments.list.useQuery();
  const createMutation = trpc.segments.create.useMutation();
  const deleteMutation = trpc.segments.delete.useMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data: previewData, isLoading: isPreviewLoading } = trpc.segments.getPreview.useQuery(
    { id: selectedSegmentId || 0 },
    { enabled: !!selectedSegmentId }
  );

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Segment name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
      });
      setFormData({ name: "", description: "" });
      setIsCreateOpen(false);
      refetch();
      toast.success("Segment created successfully");
    } catch (error) {
      toast.error("Failed to create segment");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this segment?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        toast.success("Segment deleted");
      } catch (error) {
        toast.error("Failed to delete segment");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Segments</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Segments</h1>
          <p className="text-muted-foreground mt-2">Organize subscribers into targeted groups</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={18} />
              New Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Segment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Segment Name</Label>
                <Input
                  placeholder="e.g., Active Customers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-foreground">Description (Optional)</Label>
                <Input
                  placeholder="e.g., Customers who purchased in the last 30 days"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Segment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Segments Grid */}
      {segments && segments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((segment: any) => (
            <Card key={segment.id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{segment.name}</h3>
                    <p className="text-sm text-muted-foreground">{segment.subscriberCount || 0} subscribers</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:bg-primary/10"
                    onClick={() => {
                      setSelectedSegmentId(segment.id);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Users size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(segment.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              {segment.description && (
                <p className="text-sm text-muted-foreground mb-4">{segment.description}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Created {new Date(segment.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 px-6 text-center border-border bg-card">
          <p className="text-muted-foreground mb-4">No segments yet. Create your first segment to get started.</p>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} />
            New Segment
          </Button>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Segment Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Showing up to 10 matching subscribers:</p>
            {isPreviewLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : previewData && previewData.length > 0 ? (
              <div className="border border-border rounded-md overflow-hidden">
                {previewData.map((sub: any) => (
                  <div key={sub.id} className="p-3 border-b border-border last:border-0 hover:bg-muted/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">{sub.name || "No name"}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground italic">No matching subscribers found for this segment.</p>
            )}
            <Button onClick={() => setIsPreviewOpen(false)} className="w-full">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
