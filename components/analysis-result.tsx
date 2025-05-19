'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Analysis } from '@/components/ecg-analyzer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisResultProps {
  analysis: Analysis;
  imagePreview: string | null;
  onBackToUpload: () => void;
}

export function AnalysisResult({
  analysis,
  imagePreview,
  onBackToUpload,
}: AnalysisResultProps) {
  if (!imagePreview) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No ECG image uploaded yet</p>
        <Button onClick={onBackToUpload} variant="link" className="mt-2">
          Go to upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 shrink-0">
          <div className="rounded-md overflow-hidden border">
            <Image
              src={imagePreview}
              alt="ECG"
              width={300}
              height={200}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Analysis Results</h3>
            
            {analysis.loading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
            )}
            
            {analysis.error && (
              <Alert variant="destructive">
                <AlertDescription>{analysis.error}</AlertDescription>
              </Alert>
            )}
            
            {!analysis.loading && analysis.result && (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="prose prose-sm max-w-none">
                  {analysis.result.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBackToUpload}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    </div>
  );
}