'use server';
/**
 * @fileOverview A summarization AI agent.
 *
 * - summarize - A function that summarizes a conversation.
 * - SummarizeInput - The input type for the summarize function.
 * - SummarizeOutput - The return type for the summarize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInputSchema = z.object({
  conversation: z.string().describe('The conversation to summarize.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;

const SummarizeOutputSchema = z.object({
  summary: z.string().describe('The summary of the conversation.'),
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

export async function summarize(input: SummarizeInput): Promise<SummarizeOutput> {
  return summarizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: {schema: SummarizeInputSchema},
  output: {schema: SummarizeOutputSchema},
  prompt: `You are a helpful AI assistant. Summarize the following conversation concisely.

Conversation:
{{{conversation}}}

Summary:`,
});

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
