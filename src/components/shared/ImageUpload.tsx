
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, XCircle, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageClear?: () => void;
  previewUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
  accept?: string;
}

export const ImageUpload = ({
  onImageSelect,
  onImageClear,
  previewUrl,
  isUploading = false,
  uploadProgress = 0,
  className = "",
  accept = "image/*"
}: ImageUploadProps) => {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    
    // Optimize image before upload
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onImageSelect(optimizedFile);
        }
      }, 'image/jpeg', 0.8);
    };
    img.src = objectUrl;
  };
  
  const handleClear = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    onImageClear?.();
  };
  
  const displayUrl = localPreviewUrl || previewUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {displayUrl ? (
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={displayUrl} 
            alt="Preview" 
            className="w-full h-auto max-h-[300px] object-cover"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <Progress value={uploadProgress} className="w-2/3" />
            </div>
          ) : (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <label className="cursor-pointer">
          <Input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleImageSelect}
            disabled={isUploading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload an image
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </label>
      )}
    </div>
  );
};
