"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { AnalysisResult } from "@/components/analysis-result";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analyzeECG } from "@/lib/analyze-ecg";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Analysis = {
  result: string;
  loading: boolean;
  error: string | null;
};

export function ECGAnalyzer() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>({
    result: "",
    loading: false,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<string>("upload");

  const handleImageUpload = (files: File[]) => {
    setImageFiles(files);
    if (files.length === 0) {
      setImagePreviews([]);
      return;
    }

    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeClick = async () => {
    if (imageFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload one or more ECG images first",
        variant: "destructive",
      });
      return;
    }

    setAnalysis({ result: "", loading: true, error: null });
    setActiveTab("result");

    try {
      const result = await analyzeECG(imageFiles);
      setAnalysis({
        result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAnalysis({
        result: "",
        loading: false,
        error: error instanceof Error ? error.message : "Failed to analyze ECG",
      });
      toast({
        title: "Analysis failed",
        description:
          error instanceof Error ? error.message : "Failed to analyze ECG",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">ECG Analysis Tool</CardTitle>
        <CardDescription>
          Upload one or more ECG images to get AI-powered analysis and
          interpretation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="result" disabled={!imagePreviews.length}>
              Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <ImageUploader
              onImageUpload={handleImageUpload}
              onAnalyzeClick={handleAnalyzeClick}
              imagePreviews={imagePreviews}
              isLoading={analysis.loading}
            />
          </TabsContent>
          <TabsContent value="result" className="mt-4">
            <AnalysisResult
              analysis={analysis}
              imagePreviews={imagePreviews}
              onBackToUpload={() => setActiveTab("upload")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
