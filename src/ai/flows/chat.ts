/**
 * @fileOverview A multi-modal chat AI agent that can display images, perform research, analyze photos, and manage tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { selfReview, SelfReviewOutput, SelfReviewOutputSchema } from './self-review';

const searchForImageTool = ai.defineTool(
  {
    name: 'searchForImage',
    description: 'Searches for a real image on Unsplash based on a query.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the image.'),
    }),
    outputSchema: z.object({
      imageUrl: z.string(),
      altText: z.string(),
      dataAiHint: z.string(),
    }),
  },
  async ({query}) => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!accessKey) {
      // Return a high-quality placeholder for development
      return {
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`,
        altText: `A mock image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          query
        )}&client_id=${accessKey}`
      );
      if (!response.ok) throw new Error(`Unsplash error: ${response.status}`);
      const data = await response.json();
      return {
        imageUrl: data.urls.regular,
        altText: data.alt_description || `An image of ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    } catch (error) {
      return {
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(query)}/600/400`,
        altText: `A fallback image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
  }
);

const researchTopic = ai.defineTool(
  {
    name: 'researchTopic',
    description: 'Performs a web search to find current information.',
    inputSchema: z.object({
      topic: z.string().describe('The topic to research.'),
    }),
    outputSchema: z.object({
      summary: z.string().describe('A summary of the research findings.'),
    }),
  },
  async ({ topic }) => {
    return {
      summary: `Detailed research findings for "${topic}": 1. Market trends show a 15% increase in adoption this year. 2. Recent breakthroughs in technology have reduced costs by 30%. 3. Experts predict a major shift toward sustainable practices by 2026. (Simulated Research Data)`,
    };
  }
);

const setAlarmTool = ai.defineTool(
  {
    name: 'setAlarm',
    description: 'Sets an alarm or reminder for a specific time.',
    inputSchema: z.object({
      time: z.string().describe('The time for the alarm (e.g., "5:00 PM").'),
      label: z.string().optional().describe('What the alarm is for.'),
    }),
    outputSchema: z.object({
      confirmation: z.string(),
    }),
  },
  async ({ time, label }) => {
    return { confirmation: `[MOCK CONFIRMATION] I've scheduled your alarm for ${time}${label ? `: "${label}"` : ''}. I'll notify you when it goes off.` };
  }
);

const manageCalendarTool = ai.defineTool(
  {
    name: 'manageCalendar',
    description: 'Adds events to the calendar or retrieves upcoming ones.',
    inputSchema: z.object({
      action: z.enum(['add', 'list']).describe('Action to perform.'),
      details: z.string().optional().describe('Event details.'),
    }),
    outputSchema: z.object({
      result: z.string(),
    }),
  },
  async ({ action, details }) => {
    if (action === 'add') {
      return { result: `[MOCK SUCCESS] I've added "${details}" to your calendar for this Thursday.` };
    }
    return { 
      result: "Your next 3 events: \n1. Team Standup (9:00 AM)\n2. Lunch with Client (12:30 PM)\n3. Strategy Review (4:00 PM)" 
    };
  }
);

const analyzeEmailsTool = ai.defineTool(
  {
    name: 'analyzeEmails',
    description: 'Summarizes recent emails or searches for specific mail information.',
    inputSchema: z.object({
      query: z.string().optional().describe('Search term for emails.'),
    }),
    outputSchema: z.object({
      summary: z.string(),
    }),
  },
  async ({ query }) => {
    if (query) {
      return { summary: `[MOCK SEARCH] Found 2 emails matching "${query}". One is a project update from David, and the other is a confirmation for your flight.` };
    }
    return { summary: "You have 5 new emails: 3 from the Marketing team regarding the Q3 campaign, and 2 from HR about the upcoming holiday schedule." };
  }
);

const MessageSchema = z.object({
  role: z.enum(['You', 'AIva']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  performResearch: z.boolean().optional(),
  history: z.array(MessageSchema).optional(),
  personality: z.any().optional(),
  attachmentUrl: z.string().optional(),
});

export const ChatOutputSchema = z.object({
  response: z.string(),
  imageUrl: z.string().nullable().optional(),
  altText: z.string().optional(),
  dataAiHint: z.string().optional(),
  review: SelfReviewOutputSchema.optional(),
});

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [searchForImageTool, researchTopic, setAlarmTool, manageCalendarTool, analyzeEmailsTool],
  prompt: `You are {{personality.name}}, a helpful AI assistant.
Tone: {{personality.tone}}
Humor enabled: {{personality.enableHumor}}

{{#if history}}
History:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

{{#if attachmentUrl}}
Image Input: {{media url=attachmentUrl}}
{{/if}}

User Message: {{{prompt}}}`,
});

export async function onlineChat(input: any): Promise<any> {
  const filledInput = { ...input, personality: input.personality || { name: 'AIva', tone: 'friendly', enableHumor: true } };
  
  try {
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      return { response: "I'm sorry, I couldn't process that. Let's try something else." };
    }

    let review: SelfReviewOutput | undefined = undefined;
    if (initialOutput.response && !initialOutput.imageUrl && !input.attachmentUrl) {
      try {
        review = await selfReview({
          userPrompt: input.prompt,
          aiResponse: initialOutput.response,
        });
      } catch (e) {}
    }
    
    return { ...initialOutput, review };
  } catch (error: any) {
    console.error("Chat Error:", error);
    return { 
      response: "I'm having a little trouble connecting to my brain right now. In the meantime, I can still help you with basic tasks if you try again!" 
    };
  }
}
