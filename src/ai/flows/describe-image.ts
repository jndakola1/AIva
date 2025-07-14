'use server';
/**
 * @fileOverview An AI agent that can describe an image.
 *
 * - describeImage - A function that takes an image and returns a description.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to describe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string().describe('A description of what is seen in the image.'),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(input: DescribeImageInput): Promise<DescribeImageOutput> {
  return describeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'describeImagePrompt',
  input: {schema: DescribeImageInputSchema},
  output: {schema: DescribeImageOutputSchema},
  prompt: `You are an AI assistant in a live video chat. Briefly describe what you see in this image from the user's camera. Be conversational.

Image: {{media url=imageDataUri}}`,
});

const describeImageFlow = ai.defineFlow(
  {
    name: 'describeImageFlow',
    inputSchema: DescribeImageInputSchema,
    outputSchema: DescribeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The describeImage flow failed to produce a valid output. The model may have returned an empty or invalid response.");
    }
    return output;
  }
);
