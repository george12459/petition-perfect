// Gemini API service for OCR text detection

const GEMINI_API_KEY = 'AIzaSyBB2i1pHRUZ1moomQv1pP8_tRIrUu4OweQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface DetectedSignature {
  name: string;
  address: string;
  city: string;
  zip: string;
  confidence: number;
}

export interface GeminiOCRResult {
  signatures: DetectedSignature[];
  rawText: string;
}

export async function extractSignaturesFromImage(imageBase64: string): Promise<GeminiOCRResult> {
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  const prompt = `You are analyzing a petition document image. Extract ALL names and addresses visible on this petition sheet.

For each signature entry you find, extract:
- Full name (as written)
- Street address
- City
- ZIP code

Return your response in this exact JSON format:
{
  "signatures": [
    {
      "name": "Full Name",
      "address": "123 Street Name",
      "city": "City Name",
      "zip": "12345"
    }
  ],
  "rawText": "The complete raw text you detected from the image"
}

Important:
- Extract ALL entries you can see, even if some fields are partially illegible
- If a field is unclear, make your best guess and note low confidence
- Include handwritten text even if difficult to read
- Return ONLY valid JSON, no other text`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text content from Gemini's response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('No text content in Gemini response');
    }

    console.log('Gemini raw response:', textContent);

    // Parse the JSON from Gemini's response
    // Remove markdown code blocks if present
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);
    
    // Add confidence scores (Gemini doesn't provide these, so we estimate based on field completeness)
    const signaturesWithConfidence: DetectedSignature[] = result.signatures.map((sig: any) => {
      const filledFields = [sig.name, sig.address, sig.city, sig.zip].filter(f => f && f.trim()).length;
      return {
        name: sig.name || 'Unknown',
        address: sig.address || 'Unknown',
        city: sig.city || 'Unknown',
        zip: sig.zip || 'Unknown',
        confidence: filledFields / 4, // Simple confidence based on completeness
      };
    });

    return {
      signatures: signaturesWithConfidence,
      rawText: result.rawText || '',
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
