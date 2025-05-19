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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis>({
    result: "",
    loading: false,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<string>("upload");

  const handleImageUpload = (file: File | null) => {
    setImageFile(file);
    if (file === null) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload an ECG image first",
        variant: "destructive",
      });
      return;
    }

    setAnalysis({ result: "", loading: true, error: null });
    setActiveTab("result");

    try {
      const result = await analyzeECG(imageFile);
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
          Upload an ECG image to get AI-powered analysis and interpretation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="result" disabled={!imagePreview}>
              Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <ImageUploader
              onImageUpload={handleImageUpload}
              onAnalyzeClick={handleAnalyzeClick}
              imagePreview={imagePreview}
              isLoading={analysis.loading}
            />
          </TabsContent>
          <TabsContent value="result" className="mt-4">
            <AnalysisResult
              analysis={analysis}
              imagePreview={imagePreview}
              onBackToUpload={() => setActiveTab("upload")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
