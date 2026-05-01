import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Trash2, FileText, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Templates() {
  const { data: templates, isLoading, refetch } = trpc.templates.list.useQuery();
  const createMutation = trpc.templates.create.useMutation();
  const deleteMutation = trpc.templates.delete.useMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", subject: "" });

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        subject: formData.subject,
      });
      setFormData({ name: "", description: "", subject: "" });
      setIsCreateOpen(false);
      refetch();
      toast.success("Template created successfully");
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        toast.success("Template deleted");
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      await createMutation.mutateAsync({
        name: `${template.name} (Copy)`,
        description: template.description,
        subject: template.subject,
        blocks: template.blocks,
      });
      refetch();
      toast.success("Template duplicated");
    } catch (error) {
      toast.error("Failed to duplicate template");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <Skeleton className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
          <p className="text-muted-foreground mt-2">Save and reuse your email designs</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={18} />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Template Name</Label>
                <Input
                  placeholder="e.g., Welcome Email"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-foreground">Subject Line</Label>
                <Input
                  placeholder="e.g., Welcome to our community!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-foreground">Description (Optional)</Label>
                <Input
                  placeholder="e.g., A template for welcoming new subscribers"
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
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: any) => (
            <Card key={template.id} className="p-6 border-border bg-card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
              )}
              {template.subject && (
                <p className="text-xs text-muted-foreground mb-4 bg-muted p-2 rounded line-clamp-1">
                  Subject: {template.subject}
                </p>
              )}
              <div className="flex gap-2 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-border text-foreground hover:bg-muted"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy size={16} />
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 px-6 text-center border-border bg-card">
          <p className="text-muted-foreground mb-4">No templates yet. Create your first template to get started.</p>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={18} />
            New Template
          </Button>
        </Card>
      )}
    </div>
  );
}
