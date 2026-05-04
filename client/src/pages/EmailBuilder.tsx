import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Copy, Eye, Code } from "lucide-react";
import { toast } from "sonner";

interface EmailBlock {
  id: string;
  type: "text" | "image" | "button" | "divider";
  content: string;
  style?: Record<string, string>;
}

export default function EmailBuilder() {
  const [subject, setSubject] = useState("Welcome to MailCraft");
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: "1",
      type: "text",
      content: "Hello there!",
      style: { fontSize: "24px", fontWeight: "bold", color: "#333" },
    },
    {
      id: "2",
      type: "text",
      content: "This is your email content. You can add text, images, buttons, and more.",
      style: { fontSize: "16px", color: "#666" },
    },
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("1");
  const [previewMode, setPreviewMode] = useState(false);

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content:
        type === "text"
          ? "New text block"
          : type === "image"
            ? "https://via.placeholder.com/600x200"
            : type === "button"
              ? "Click me"
              : "",
      style: type === "divider" ? { height: "2px", backgroundColor: "#ddd" } : {},
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`${type} block added`);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    setSelectedBlockId(null);
    toast.success("Block deleted");
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block) {
      const newBlock = { ...block, id: Date.now().toString() };
      setBlocks([...blocks, newBlock]);
      toast.success("Block duplicated");
    }
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const renderBlock = (block: EmailBlock) => {
    switch (block.type) {
      case "text":
        return (
          <div style={block.style} className="text-foreground">
            {block.content}
          </div>
        );
      case "image":
        return <img src={block.content} alt="Email content" className="w-full rounded" />;
      case "button":
        return (
          <button
            className="px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90"
            style={block.style}
          >
            {block.content}
          </button>
        );
      case "divider":
        return <div style={block.style} className="my-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Builder</h1>
          <p className="text-muted-foreground mt-2">Design your email with drag-and-drop blocks</p>
        </div>
        <Button
          onClick={() => setPreviewMode(!previewMode)}
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted"
        >
          <Eye size={18} />
          {previewMode ? "Edit" : "Preview"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Block Tools */}
        {!previewMode && (
          <Card className="p-6 border-border bg-card h-fit lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">Add Blocks</h3>
            <div className="space-y-2">
              <Button
                onClick={() => addBlock("text")}
                variant="outline"
                className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted"
              >
                <Plus size={16} />
                Text
              </Button>
              <Button
                onClick={() => addBlock("image")}
                variant="outline"
                className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted"
              >
                <Plus size={16} />
                Image
              </Button>
              <Button
                onClick={() => addBlock("button")}
                variant="outline"
                className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted"
              >
                <Plus size={16} />
                Button
              </Button>
              <Button
                onClick={() => addBlock("divider")}
                variant="outline"
                className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted"
              >
                <Plus size={16} />
                Divider
              </Button>
            </div>
          </Card>
        )}

        {/* Editor/Preview Area */}
        <div className={!previewMode ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="p-6 border-border bg-card">
            <div className="mb-6">
              <Label className="text-foreground">Subject Line</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="Enter subject line"
              />
            </div>

            <div className="space-y-4">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    selectedBlockId === block.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/50"
                  }`}
                  onClick={() => !previewMode && setSelectedBlockId(block.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{block.type}</span>
                    {!previewMode && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBlock(block.id);
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!previewMode && selectedBlockId === block.id && (
                    <div className="mb-4 p-3 bg-card border border-border rounded">
                      {block.type !== "divider" && (
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          className="bg-input text-foreground border-border text-sm"
                          placeholder={`Edit ${block.type} content`}
                        />
                      )}
                    </div>
                  )}

                  <div className="text-foreground">{renderBlock(block)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        {!previewMode && (
          <Card className="p-6 border-border bg-card lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye size={18} />
              Preview
            </h3>
            <div className="bg-white rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto border border-border">
              <div className="text-xs font-semibold text-muted-foreground">Subject: {subject}</div>
              <div className="border-t border-border pt-3 space-y-3">
                {blocks.map((block) => (
                  <div key={block.id} className="text-sm">
                    {renderBlock(block)}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Full Preview Mode */}
      {previewMode && (
        <Card className="p-8 border-border bg-card">
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 space-y-4">
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground">Subject:</p>
              <p className="font-semibold text-foreground">{subject}</p>
            </div>
            <div className="space-y-4">
              {blocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
          Save as Draft
        </Button>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Code size={18} />
          View HTML
        </Button>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Send Test Email
        </Button>
      </div>
    </div>
  );
}
