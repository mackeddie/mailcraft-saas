import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AITemplateGeneratorProps {
  onTemplateGenerated: (template: { subject: string; body: string; ctaText: string }) => void;
}

export function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const [industry, setIndustry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "friendly" | "urgent">("professional");
  const [targetAudience, setTargetAudience] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const generateMutation = trpc.llm.generateTemplate.useMutation();

  const handleGenerate = async () => {
    if (!industry || !purpose || !targetAudience) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        industry,
        purpose,
        tone,
        targetAudience,
      });
      onTemplateGenerated(result);
      toast.success("Template generated successfully!");
      setIsOpen(false);
      // Reset form
      setIndustry("");
      setPurpose("");
      setTone("professional");
      setTargetAudience("");
    } catch (error) {
      toast.error("Failed to generate template");
    }
  };

  return (
    <div>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="gap-2 border-border text-foreground hover:bg-muted"
      >
        <Wand2 size={18} />
        Generate with AI
      </Button>

      {isOpen && (
        <Card className="mt-4 p-6 border-border bg-card space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Generate Email Template with AI</h3>

          <div>
            <Label className="text-foreground">Industry</Label>
            <Input
              placeholder="e.g., E-commerce, SaaS, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-2 bg-input text-foreground border-border"
            />
          </div>

          <div>
            <Label className="text-foreground">Purpose</Label>
            <Input
              placeholder="e.g., Product Launch, Newsletter, Promotion"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-2 bg-input text-foreground border-border"
            />
          </div>

          <div>
            <Label className="text-foreground">Tone</Label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger className="mt-2 bg-input text-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Target Audience</Label>
            <Input
              placeholder="e.g., Tech-savvy millennials, Business executives"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="mt-2 bg-input text-foreground border-border"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate Template
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
