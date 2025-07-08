// src/ai/tools/get-weather.ts
'use server';
/**
 * @fileOverview A Genkit tool for fetching weather data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get the current weather for a given location. If no location is provided, use a default.',
    inputSchema: z.object({
      location: z.string().optional().describe('The location to get the weather for.'),
    }),
    outputSchema: z.object({
      condition: z.string(),
      temperature: z.number(),
      humidity: z.number(),
      aqi: z.number(),
      notes: z.string(),
    }),
  },
  async (input) => {
    console.log(`Getting weather for: ${input.location || 'default'}`);
    // In a real app, you would call a weather API here.
    // For this demo, we'll return mock data.
    return {
      condition: 'Mostly Sunny',
      temperature: 78,
      humidity: 50,
      aqi: 40,
      notes: "There may be some pollutants present that could pose a risk for sensitive individuals.",
    };
  }
);
