'use server';
/**
 * @fileOverview An AI agent that generates cinematic videos using the Veo model.
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
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt,
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });

      if (!operation) {
        throw new Error('Failed to initiate video generation.');
      }

      // Wait for the operation to complete
      let attempts = 0;
      while (!operation.done && attempts < 24) { // Max 2 minutes
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

      // We need to fetch the video and convert to base64 for client transfer
      // Since it's a short 5s video, the size should be manageable (~1-3MB)
      const videoResponse = await fetch(`${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`);
      if (!videoResponse.ok) throw new Error('Failed to download generated video.');
      
      const arrayBuffer = await videoResponse.arrayBuffer();
      const base64Video = Buffer.from(arrayBuffer).toString('base64');

      return {
        videoUrl: `data:video/mp4;base64,${base64Video}`,
        altText: `AI generated video: ${prompt}`,
      };
    } catch (error: any) {
      console.error("Veo Error:", error);
      throw new Error(error.message || "Failed to generate video.");
    }
  }
);
