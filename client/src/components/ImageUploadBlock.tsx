import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadBlockProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
}

export function ImageUploadBlock({ onImageSelect, currentImage }: ImageUploadBlockProps) {
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        // In production, send to backend to upload to S3
        // For now, we'll use a data URL (not recommended for production)
        setPreviewUrl(base64Data);
        onImageSelect(base64Data);
        toast.success("Image uploaded successfully");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    // Validate URL format
    try {
      new URL(urlInput);
      setPreviewUrl(urlInput);
      onImageSelect(urlInput);
      toast.success("Image URL added");
      setUrlInput("");
    } catch {
      toast.error("Please enter a valid image URL");
    }
  };

  const handleClearImage = () => {
    setPreviewUrl("");
    onImageSelect("");
    setUrlInput("");
  };

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg border border-border">
      <Label className="text-foreground font-semibold">Add Image</Label>

      {/* Upload Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setUploadMode("upload")}
          className={`flex-1 px-3 py-2 rounded transition-colors ${
            uploadMode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-input text-foreground hover:bg-muted-foreground/20"
          }`}
        >
          <Upload size={16} className="inline mr-2" />
          Upload
        </button>
        <button
          onClick={() => setUploadMode("url")}
          className={`flex-1 px-3 py-2 rounded transition-colors ${
            uploadMode === "url"
              ? "bg-primary text-primary-foreground"
              : "bg-input text-foreground hover:bg-muted-foreground/20"
          }`}
        >
          <LinkIcon size={16} className="inline mr-2" />
          URL
        </button>
      </div>

      {/* Upload Mode */}
      {uploadMode === "upload" && (
        <div className="space-y-2">
          <label className="block">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
              {isUploading ? (
                <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={24} />
              ) : (
                <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
              )}
              <p className="text-sm text-foreground font-medium">
                {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* URL Mode */}
      {uploadMode === "url" && (
        <div className="space-y-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="bg-input text-foreground border-border"
            onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <Button
            onClick={handleUrlSubmit}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add Image
          </Button>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Preview</Label>
          <div className="relative bg-background rounded-lg border border-border overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-64 object-cover"
              onError={() => {
                toast.error("Failed to load image");
                handleClearImage();
              }}
            />
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground break-all">{previewUrl}</p>
        </div>
      )}
    </div>
  );
}
