
'use server';
/**
 * @fileOverview An AI agent that generates cinematic videos with sound using the Veo 3.0 model.
 *
 * - generateVideo - A function that handles video generation.
 * - GenerateVideoInput - The input type for the function.
 * - GenerateVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('A cinematic description of the video to generate.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().describe('The generated video as a data URI.'),
  altText: z.string().describe('A description of the generated video.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async ({ prompt }) => {
    try {
      // Using Veo 3.0 for video with sound support
      let { operation } = await ai.generate({
        model: googleAI.model('veo-3.0-generate-preview'),
        prompt,
        config: {
          aspectRatio: '16:9',
          personGeneration: 'allow_all',
        },
      });

      if (!operation) {
        throw new Error('Failed to initiate video generation.');
      }

      // Wait for the operation to complete
      let attempts = 0;
      while (!operation.done && attempts < 36) { // Max 3 minutes for Veo 3
        operation = await ai.checkOperation(operation);
        if (operation.done) break;
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      }

      if (operation.error) {
        throw new Error('Video generation failed: ' + operation.error.message);
      }

      const videoPart = operation.output?.message?.content.find((p) => !!p.media);
      if (!videoPart?.media?.url) {
        throw new Error('Generated video content not found.');
      }

      // Fetch the video and convert to base64. 
      // Using GOOGLE_GENAI_API_KEY which is the standard Genkit variable.
      const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
      const videoResponse = await fetch(`${videoPart.media.url}&key=${apiKey}`);
      if (!videoResponse.ok) throw new Error('Failed to download generated video.');
      
      const arrayBuffer = await videoResponse.arrayBuffer();
      const base64Video = Buffer.from(arrayBuffer).toString('base64');

      return {
        videoUrl: `data:video/mp4;base64,${base64Video}`,
        altText: `AI generated cinematic video (Veo 3): ${prompt}`,
      };
    } catch (error: any) {
      console.error("Veo 3 Error:", error);
      throw new Error(error.message || "Failed to generate video.");
    }
  }
);
