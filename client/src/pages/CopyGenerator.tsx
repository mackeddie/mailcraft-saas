import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Wand2, Copy as CopyIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CopyGenerator() {
  const generateSubjectMutation = trpc.llm.generateSubjectLine.useMutation();
  const generateBodyMutation = trpc.llm.generateBodyCopy.useMutation();

  const [campaignGoal, setCampaignGoal] = useState("");
  const [audienceDescription, setAudienceDescription] = useState("");
  const [generatedSubjects, setGeneratedSubjects] = useState<string[]>([]);
  const [generatedBody, setGeneratedBody] = useState("");
  const [activeTab, setActiveTab] = useState<"subject" | "body">("subject");

  const handleGenerateSubjects = async () => {
    if (!campaignGoal || !audienceDescription) {
      toast.error("Please fill in both campaign goal and audience description");
      return;
    }

    try {
      const result = await generateSubjectMutation.mutateAsync({
        campaignGoal,
        audienceDescription,
      });
      setGeneratedSubjects(result.subjectLines);
      toast.success("Subject lines generated!");
    } catch (error) {
      toast.error("Failed to generate subject lines");
    }
  };

  const handleGenerateBody = async () => {
    if (!campaignGoal || !audienceDescription) {
      toast.error("Please fill in both campaign goal and audience description");
      return;
    }

    try {
      const result = await generateBodyMutation.mutateAsync({
        campaignGoal,
        audienceDescription,
        subject: generatedSubjects[0] || "",
      });
      setGeneratedBody(result.bodyCopy);
      toast.success("Body copy generated!");
    } catch (error) {
      toast.error("Failed to generate body copy");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Copy Generator</h1>
        <p className="text-muted-foreground mt-2">Generate compelling email subject lines and body copy using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="p-6 border-border bg-card lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Campaign Details</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Campaign Goal</Label>
              <Input
                placeholder="e.g., Increase sales, promote new product, build engagement"
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">What do you want to achieve with this campaign?</p>
            </div>

            <div>
              <Label className="text-foreground">Audience Description</Label>
              <Input
                placeholder="e.g., Tech-savvy millennials interested in productivity tools"
                value={audienceDescription}
                onChange={(e) => setAudienceDescription(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">Who are you targeting?</p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleGenerateSubjects}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={generateSubjectMutation.isPending}
              >
                {generateSubjectMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate Subjects
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateBody}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={generateBodyMutation.isPending}
              >
                {generateBodyMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate Body Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Panel */}
        <Card className="p-6 border-border bg-card lg:col-span-2">
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("subject")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "subject"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subject Lines
            </button>
            <button
              onClick={() => setActiveTab("body")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "body"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Body Copy
            </button>
          </div>

          {activeTab === "subject" && (
            <div className="space-y-3">
              {generatedSubjects.length > 0 ? (
                generatedSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted rounded-lg border border-border flex items-start justify-between gap-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Option {index + 1}</p>
                      <p className="text-foreground font-medium">{subject}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10 flex-shrink-0"
                      onClick={() => copyToClipboard(subject)}
                    >
                      <CopyIcon size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Generate subject lines to see suggestions here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "body" && (
            <div className="space-y-3">
              {generatedBody ? (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-sm text-muted-foreground">Generated Body Copy</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => copyToClipboard(generatedBody)}
                    >
                      <CopyIcon size={16} />
                    </Button>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{generatedBody}</p>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Generate body copy to see suggestions here</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Tips */}
      <Card className="p-6 border-border bg-muted">
        <h3 className="font-semibold text-foreground mb-3">Tips for Better Results</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Be specific about your campaign goal (e.g., "Launch summer sale" instead of "Promote products")</li>
          <li>• Describe your audience in detail (e.g., "Busy professionals aged 25-40 interested in productivity")</li>
          <li>• Use the generated copy as a starting point and customize it for your brand voice</li>
          <li>• Test different subject lines to find what resonates with your audience</li>
        </ul>
      </Card>
    </div>
  );
}
