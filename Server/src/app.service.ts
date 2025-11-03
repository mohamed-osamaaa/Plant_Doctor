import {
  GoogleGenerativeAI,
  Part,
} from '@google/generative-ai';
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { PlantDiagnosis } from './interfaces/PlantDiagnosis.interface';

const mimeTypeMap: { [key: string]: string } = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

function fileToGenerativePart(buffer: Buffer, mimeType: string): Part {
  const base64Data = Buffer.from(buffer).toString('base64');

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

@Injectable()
export class AppService {
  private readonly ai: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.5-flash';

  private readonly diagnosisSchema: any = {
    type: 'object',
    properties: {
      diseaseName: {
        type: 'string',
        description: 'The name of the disease or primary problem diagnosed in the plant, e.g., "Root Rot" or "Nutrient Deficiency".',
      },
      severity: {
        type: 'string',
        description: 'The severity level of the issue, strictly one of: Low, Medium, High, or None.',
      },
      treatmentAdvice: {
        type: 'string',
        description: 'A detailed, actionable, and comprehensive summary of the steps required to treat and recover the plant. This should be a single, detailed paragraph.',
      },
      confidenceScore: {
        type: 'number',
        description: 'A numeric score from 0.0 to 1.0 indicating the model\'s confidence in the diagnosis.',
      },
    },
    required: ['diseaseName', 'severity', 'treatmentAdvice', 'confidenceScore'],
  };


  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async analyzeImage(file: Express.Multer.File): Promise<PlantDiagnosis> {
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB

    if (file.size > MAX_SIZE) {
      throw new InternalServerErrorException('Image file is too large. Please use an image smaller than 4MB.');
    }

    let correctMimeType = file.mimetype;
    const originalFileName = file.originalname.toLowerCase();

    if (!correctMimeType.startsWith('image/') && originalFileName.includes('.')) {
      const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
      correctMimeType = mimeTypeMap[extension] || correctMimeType;
    }

    if (!correctMimeType.startsWith('image/')) {
      throw new InternalServerErrorException(`Invalid file type: ${file.mimetype}. Only JPEG/PNG images are supported.`);
    }

    console.log(`Analyzing file: ${file.originalname}, Final MimeType used: ${correctMimeType}`);

    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });

      const promptText =
        'Analyze this plant image. Provide the diagnosis and treatment advice as structured JSON according to the provided schema. Diagnose the disease, determine severity, provide comprehensive treatment advice, and estimate confidence (0.0 to 1.0). The output for diseaseName and treatmentAdvice MUST be in ARABIC.';

      const imagePart = fileToGenerativePart(file.buffer, correctMimeType);

      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: promptText }, imagePart]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: this.diagnosisSchema,
        },
      });

      const rawText = response.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const jsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      if (!jsonText) {
        throw new Error('Gemini returned an empty response.');
      }

      return JSON.parse(jsonText) as PlantDiagnosis;

    } catch (error) {
      console.error("Original Gemini API Error:", error.message || error);

      if (error instanceof SyntaxError) {
        console.error("JSON Parsing Error: The model may not have returned valid JSON.");
      }

      throw new InternalServerErrorException('Failed to analyze image and generate structured response.');
    }
  }
}
