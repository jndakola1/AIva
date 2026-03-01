'use server';
/**
 * @fileOverview An AI agent that generates AI Music or Audio snippets.
 *
 * - generateMusic - A function that handles music/audio generation.
 * - GenerateMusicInput - The input type for the function.
 * - GenerateMusicOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';

const GenerateMusicInputSchema = z.object({
  prompt: z.string().describe('A description of the music or sound to generate.'),
});
export type GenerateMusicInput = z.infer<typeof GenerateMusicInputSchema>;

const GenerateMusicOutputSchema = z.object({
  audioUrl: z.string().describe('The generated audio as a data URI.'),
  description: z.string().describe('A description of the generated audio.'),
});
export type GenerateMusicOutput = z.infer<typeof GenerateMusicOutputSchema>;

export async function generateMusic(input: GenerateMusicInput): Promise<GenerateMusicOutput> {
  return generateMusicFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

const generateMusicFlow = ai.defineFlow(
  {
    name: 'generateMusicFlow',
    inputSchema: GenerateMusicInputSchema,
    outputSchema: GenerateMusicOutputSchema,
  },
  async ({ prompt }) => {
    try {
      // Currently using TTS as a proxy for 'Audio Generation' demonstration
      // In a real scenario, this would call a dedicated MusicLM or similar model
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: `Creating a musical atmosphere based on your request: ${prompt}. [Simulated Audio Output]`,
      });

      if (!media) throw new Error('No media returned');

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      return {
        audioUrl: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
        description: `AI generated music for: ${prompt}`,
      };
    } catch (error: any) {
      console.error("Music Gen Error:", error);
      throw new Error("Failed to generate audio.");
    }
  }
);
