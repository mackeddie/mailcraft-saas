import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Trash2, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Subscribers() {
  const { data: subscribers, isLoading, refetch } = trpc.subscribers.list.useQuery();
  const createMutation = trpc.subscribers.create.useMutation();
  const deleteMutation = trpc.subscribers.delete.useMutation();
  const importMutation = trpc.subscribers.import.useMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "" });
  const [importData, setImportData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = async () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        email: formData.email,
        name: formData.name,
      });
      setFormData({ email: "", name: "" });
      setIsCreateOpen(false);
      refetch();
      toast.success("Subscriber added successfully");
    } catch (error) {
      toast.error("Failed to add subscriber");
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Please provide data to import");
      return;
    }

    const lines = importData.split('\n').filter(l => l.trim());
    const parsedSubscribers = lines.map(line => {
      const [email, ...nameParts] = line.split(',').map(s => s.trim());
      const name = nameParts.join(',').trim();
      return { email, name: name || undefined, tags: [] };
    }).filter(s => s.email && s.email.includes('@'));

    if (parsedSubscribers.length === 0) {
      toast.error("No valid subscribers found. Check your format.");
      return;
    }

    try {
      await importMutation.mutateAsync({ subscribers: parsedSubscribers });
      setImportData("");
      setIsImportOpen(false);
      refetch();
      toast.success(`Successfully imported ${parsedSubscribers.length} subscribers`);
    } catch (error) {
      toast.error("Failed to import subscribers");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        toast.success("Subscriber deleted");
      } catch (error) {
        toast.error("Failed to delete subscriber");
      }
    }
  };

  const filteredSubscribers = subscribers?.filter((sub: any) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>;
      case "unsubscribed":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Unsubscribed</span>;
      case "bounced":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Bounced</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Subscribers</h1>
          <Skeleton className="w-32 h-10" />
        </div>
        <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold text-foreground">Subscribers</h1>
          <p className="text-muted-foreground mt-2">Manage your email list</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                <Plus size={18} />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-foreground">Bulk Import Subscribers</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Paste CSV Data (email, name)</Label>
                  <textarea
                    placeholder="john@example.com, John Doe&#10;jane@example.com, Jane Smith"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="mt-2 w-full h-48 p-3 rounded-md bg-input text-foreground border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">One subscriber per line. Format: email, name (optional)</p>
                </div>
                <Button
                  onClick={handleImport}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? "Importing..." : `Import ${importData.split('\n').filter(l => l.trim()).length} Subscribers`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} />
                Add Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add Subscriber</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="subscriber@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 bg-input text-foreground border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Name (Optional)</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-input text-foreground border-border"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Subscriber"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by email or name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-input text-foreground border-border"
      />

      {/* Subscribers Table */}
      <Card className="border-border bg-card overflow-hidden">
        {filteredSubscribers && filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber: any) => (
                  <tr key={subscriber.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 text-foreground font-medium flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      {subscriber.email}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{subscriber.name || "—"}</td>
                    <td className="py-4 px-6">{getStatusBadge(subscriber.status)}</td>
                    <td className="py-4 px-6 text-muted-foreground text-xs">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-6 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No subscribers match your search." : "No subscribers yet. Add your first subscriber to get started."}
            </p>
            {!searchTerm && (
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} />
                Add Subscriber
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
