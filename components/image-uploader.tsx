"use client";

import { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (file: File | null) => void;
  onAnalyzeClick: () => void;
  imagePreview: string | null;
  isLoading: boolean;
}

export function ImageUploader({
  onImageUpload,
  onAnalyzeClick,
  imagePreview,
  isLoading,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUpload(null);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer min-h-[300px]",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          imagePreview
            ? "border-muted"
            : "hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !imagePreview && fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="relative max-h-[300px] overflow-hidden rounded-md mb-4 flex items-center justify-center">
              <Image
                src={imagePreview}
                alt="ECG Preview"
                width={500}
                height={300}
                className="max-w-full h-auto object-contain"
                unoptimized
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-2">
                <UploadCloud className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Upload your ECG image</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drag and drop your ECG image here, or click to browse files
              </p>
              <div className="flex items-center gap-2 mt-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, GIF up to 10MB
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="w-full md:w-auto px-8 transition-all"
          onClick={onAnalyzeClick}
          disabled={!imagePreview || isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze ECG"}
        </Button>
      </div>
    </div>
  );
}
