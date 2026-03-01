'use server';
/**
 * @fileOverview A deep research AI agent that performs multi-step information synthesis.
 *
 * - deepResearch - A function that performs an intensive research task.
 * - DeepResearchInput - The input type for the function.
 * - DeepResearchOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepResearchInputSchema = z.object({
  topic: z.string().describe('The topic to perform deep research on.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const DeepResearchOutputSchema = z.object({
  report: z.string().describe('A comprehensive, multi-section research report.'),
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const researchPrompt = ai.definePrompt({
  name: 'researchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  prompt: `You are an expert research analyst. Perform a deep, multi-faceted investigation into the following topic: "{{{topic}}}".

Your report should include:
1. **Executive Summary**: A high-level overview of the findings.
2. **Key Trends & Developments**: Current state of the field.
3. **Competitive Landscape/Context**: How it fits into the broader world.
4. **Future Outlook**: Predictions and potential impacts.
5. **Conclusion**: A final synthesis.

Be thorough, professional, and insightful.`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async input => {
    // Simulate a multi-step "deep" process with a short delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    const {output} = await researchPrompt(input);
    if (!output) throw new Error("Research flow failed.");
    return output;
  }
);
