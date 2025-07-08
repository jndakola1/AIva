// src/ai/flows/weather-assistant.ts
'use server';
/**
 * @fileOverview A weather assistant AI agent that uses a tool to get weather data.
 *
 * - weatherAssistant - A function that handles weather-related queries.
 * - WeatherAssistantInput - The input type for the weatherAssistant function.
 * - WeatherAssistantOutput - The return type for the weatherAssistant function.
 */

import { ai } from '@/ai/genkit';
import { getWeather } from '@/ai/tools/get-weather';
import { z } from 'genkit';

const WeatherAssistantInputSchema = z.object({
  prompt: z.string().describe('The user prompt asking about the weather.'),
});
export type WeatherAssistantInput = z.infer<typeof WeatherAssistantInputSchema>;

const WeatherDataSchema = z.object({
  condition: z.string().describe('The weather condition, e.g., "Mostly Sunny".'),
  temperature: z.number().describe('The temperature in Fahrenheit.'),
  humidity: z.number().describe('The humidity percentage.'),
  aqi: z.number().describe('The Air Quality Index.'),
  notes: z.string().optional().describe('Any additional notes or warnings.'),
});

const WeatherAssistantOutputSchema = z.object({
  answer: z
    .string()
    .describe("The conversational answer to the user's query."),
  weatherData: WeatherDataSchema.optional().describe(
    'Structured weather data, if retrieved by the tool.'
  ),
});
export type WeatherAssistantOutput = z.infer<
  typeof WeatherAssistantOutputSchema
>;

export async function weatherAssistant(
  input: WeatherAssistantInput
): Promise<WeatherAssistantOutput> {
  return weatherAssistantFlow(input);
}

const weatherAssistantPrompt = ai.definePrompt({
  name: 'weatherAssistantPrompt',
  input: { schema: WeatherAssistantInputSchema },
  output: { schema: WeatherAssistantOutputSchema },
  tools: [getWeather],
  prompt: `You are a friendly and helpful weather assistant.
Your goal is to answer the user's question about the weather.
If the user asks for the weather, use the getWeather tool to get the current conditions.
If you use the tool, summarize the results in a conversational way in the 'answer' field.
Also, populate the 'weatherData' field in the output with the structured data from the tool.
If the user's prompt is not about weather, politely decline the request.

User prompt: {{{prompt}}}`,
});

const weatherAssistantFlow = ai.defineFlow(
  {
    name: 'weatherAssistantFlow',
    inputSchema: WeatherAssistantInputSchema,
    outputSchema: WeatherAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await weatherAssistantPrompt(input);
    return output!;
  }
);
