import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, Copy as CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface AICampaignAssistantProps {
  onNameSelected: (name: string) => void;
  onDescriptionSelected: (description: string) => void;
}

export function AICampaignAssistant({ onNameSelected, onDescriptionSelected }: AICampaignAssistantProps) {
  const [topic, setTopic] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showDescriptionForm, setShowDescriptionForm] = useState(false);

  const suggestNameMutation = trpc.ai.suggestCampaignName.useMutation();
  const suggestDescriptionMutation = trpc.ai.suggestDescription.useMutation();

  const handleSuggestNames = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a campaign topic");
      return;
    }

    try {
      await suggestNameMutation.mutateAsync({ topic });
      setShowNameSuggestions(true);
    } catch (error) {
      toast.error("Failed to generate suggestions");
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedName(name);
    onNameSelected(name);
    setShowDescriptionForm(true);
    toast.success("Campaign name selected!");
  };

  const handleGenerateDescription = async () => {
    if (!selectedName) {
      toast.error("Please select a campaign name first");
      return;
    }

    try {
      const result = await suggestDescriptionMutation.mutateAsync({
        campaignName: selectedName,
        topic,
      });
      onDescriptionSelected(result.description);
      toast.success("Description generated!");
      setShowDescriptionForm(false);
    } catch (error) {
      toast.error("Failed to generate description");
    }
  };

  return (
    <Card className="p-6 border-border bg-card space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Wand2 size={20} />
        AI Campaign Assistant
      </h3>

      {/* Topic Input */}
      <div>
        <Label className="text-foreground">What is your campaign about?</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="e.g., Summer Sale, Product Launch, Newsletter"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 bg-input text-foreground border-border"
            onKeyPress={(e) => e.key === "Enter" && handleSuggestNames()}
          />
          <Button
            onClick={handleSuggestNames}
            disabled={suggestNameMutation.isPending}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {suggestNameMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wand2 size={18} />
            )}
          </Button>
        </div>
      </div>

      {/* Name Suggestions */}
      {showNameSuggestions && suggestNameMutation.data && (
        <div>
          <Label className="text-foreground text-sm">Select a campaign name:</Label>
          <div className="space-y-2 mt-2">
            {suggestNameMutation.data.suggestions.map((name, index) => (
              <button
                key={index}
                onClick={() => handleSelectName(name)}
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  selectedName === name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-foreground hover:border-primary"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description Generation */}
      {showDescriptionForm && selectedName && (
        <div>
          <Button
            onClick={handleGenerateDescription}
            disabled={suggestDescriptionMutation.isPending}
            variant="outline"
            className="w-full gap-2 border-border text-foreground hover:bg-muted"
          >
            {suggestDescriptionMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Description...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate Description
              </>
            )}
          </Button>
        </div>
      )}

      {/* Selected Name Display */}
      {selectedName && (
        <div className="p-3 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Selected Campaign Name:</p>
          <p className="text-foreground font-semibold mt-1">{selectedName}</p>
        </div>
      )}
    </Card>
  );
}
