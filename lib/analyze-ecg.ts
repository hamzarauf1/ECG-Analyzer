export async function analyzeECG(imageFile: File): Promise<string> {
  // Create a FormData instance to send the file
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze ECG');
    }
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing ECG:', error);
    throw error;
  }
}