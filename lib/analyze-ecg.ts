export async function analyzeECG(imageFiles: File[]): Promise<string> {
  // Create a FormData instance to send the files
  const formData = new FormData();

  // Append each image file to the FormData with the same key 'images'
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to analyze ECG");
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Error analyzing ECG:", error);
    throw error;
  }
}
