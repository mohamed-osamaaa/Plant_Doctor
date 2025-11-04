import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { PlantDiagnosis } from './interfaces/PlantDiagnosis.interface';

@Injectable()
export class AppService {
  private readonly ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  private readonly modelName = 'gemini-2.5-flash';


  getHello(): string {
    return 'Hello World!';
  }

  async analyzeImage(file: Express.Multer.File): Promise<PlantDiagnosis> {
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB

    if (file.size > MAX_SIZE) {
      throw new InternalServerErrorException('Image file is too large. Please use an image smaller than 4MB.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new InternalServerErrorException('Invalid file type. Only JPEG/PNG images are supported.');
    }

    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });

      const promptText = `
        حلل صورة النبات التالية، وأعطني النتيجة على شكل JSON بالتنسيق التالي:
        {
          "diseaseName": "اسم المرض بالعربية فقط",
          "severity": "درجة الخطورة بالعربية (منخفضة، متوسطة، عالية)",
          "treatmentAdvice": "نصائح العلاج بالتفصيل بالعربية فقط",
          "confidenceScore": "نسبة الثقة كنسبة مئوية (مثلاً 90%)"
        }

        احرص أن تكون جميع المفاتيح والقيم بالعربية فقط دون أي كلمة إنجليزية.
      `;

      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }, imagePart],
          },
        ],
      });

      const rawText = response.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleanText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

      if (!cleanText) {
        throw new Error('Gemini returned an empty response.');
      }

      return JSON.parse(cleanText) as PlantDiagnosis;
    } catch (error) {
      console.error('Gemini API Error:', error.message || error);
      throw new InternalServerErrorException('Failed to analyze image.');
    }
  }
}
