"use client";

import { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  onAnalyzeClick: () => void;
  imagePreviews: string[];
  isLoading: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 5;

export function ImageUploader({
  onImageUpload,
  onAnalyzeClick,
  imagePreviews,
  isLoading,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);

  const validateFiles = (files: File[]): File[] => {
    return files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);

      if (validFiles.length > 0) {
        if (currentFiles.length + validFiles.length > MAX_IMAGES) {
          toast({
            title: "Too many images",
            description: `You can upload a maximum of ${MAX_IMAGES} images`,
            variant: "destructive",
          });
          return;
        }
        const newFiles = [...currentFiles, ...validFiles];
        setCurrentFiles(newFiles);
        onImageUpload(newFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);

      if (validFiles.length > 0) {
        if (currentFiles.length + validFiles.length > MAX_IMAGES) {
          toast({
            title: "Too many images",
            description: `You can upload a maximum of ${MAX_IMAGES} images`,
            variant: "destructive",
          });
          return;
        }
        const newFiles = [...currentFiles, ...validFiles];
        setCurrentFiles(newFiles);
        onImageUpload(newFiles);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    setCurrentFiles(newFiles);
    onImageUpload(newFiles);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer min-h-[300px]",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          imagePreviews.length > 0
            ? "border-muted"
            : "hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !imagePreviews.length && fileInputRef.current?.click()}
      >
        {imagePreviews.length > 0 ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative max-h-[200px] overflow-hidden rounded-md mb-2">
                    <Image
                      src={preview}
                      alt={`ECG Preview ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {imagePreviews.length < MAX_IMAGES && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }
                  }}
                >
                  Add More Images
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-2">
              <UploadCloud className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Upload your ECG images</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag and drop your ECG images here, or click to browse files
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                JPG, PNG up to 10MB (max {MAX_IMAGES} images)
              </span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-full md:w-auto px-8 transition-all"
          onClick={onAnalyzeClick}
          disabled={!imagePreviews.length || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze ECG"}
        </Button>
      </div>
    </div>
  );
}
