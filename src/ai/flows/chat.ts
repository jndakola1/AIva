/**
 * @fileOverview A multi-modal chat AI agent that can display images, perform research, analyze photos, and manage tasks.
 *
 * - onlineChat - A function that handles a chat conversation using online models.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { selfReview, SelfReviewOutput, SelfReviewOutputSchema } from './self-review';

const searchForImageTool = ai.defineTool(
  {
    name: 'searchForImage',
    description: 'Searches for a real image on Unsplash based on a query when the user explicitly asks for a picture or visual.',
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
    console.log(`Searching for real image with query: ${query}`);
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      console.warn('UNSPLASH_ACCESS_KEY not found. Returning placeholder image.');
      return {
        imageUrl: `https://placehold.co/600x400.png`,
        altText: `A placeholder image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          query
        )}&client_id=${accessKey}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        imageUrl: data.urls.regular,
        altText: data.alt_description || `An image of ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    } catch (error) {
      console.error('Error fetching from Unsplash, returning placeholder.', error);
      return {
        imageUrl: `https://placehold.co/600x400.png`,
        altText: `A placeholder image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
  }
);

const researchTopic = ai.defineTool(
  {
    name: 'researchTopic',
    description: 'Performs a web search to find current information on a given topic.',
    inputSchema: z.object({
      topic: z.string().describe('The topic to research.'),
    }),
    outputSchema: z.object({
      summary: z.string().describe('A summary of the research findings.'),
    }),
  },
  async ({ topic }) => {
    return {
      summary: `Research findings for "${topic}": This is a simulated research result. In a real-world scenario, I would be browsing the live web right now to find the most recent facts, figures, and news regarding this subject.`,
    };
  }
);

const setAlarmTool = ai.defineTool(
  {
    name: 'setAlarm',
    description: 'Sets an alarm or reminder for a specific time.',
    inputSchema: z.object({
      time: z.string().describe('The time for the alarm (e.g., "5:00 PM", "in 10 minutes").'),
      label: z.string().optional().describe('What the alarm is for.'),
    }),
    outputSchema: z.object({
      confirmation: z.string(),
    }),
  },
  async ({ time, label }) => {
    return { confirmation: `I've set an alarm for ${time}${label ? ` labeled "${label}"` : ''}.` };
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
      return { result: `Success: Added "${details}" to your calendar.` };
    }
    return { result: "Your next event is a Standup Meeting at 9:00 AM tomorrow." };
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
      return { summary: `Searching for "${query}"... Found one email from Alice regarding the project launch.` };
    }
    return { summary: "You have 3 unread emails. One is a shipping notification, and two are newsletters." };
  }
);

const PersonalitySchema = z.object({
  tone: z.enum(['friendly', 'professional', 'witty', 'concise']).default('friendly'),
  enableHumor: z.boolean().default(true),
  name: z.string().default('AIva'),
}).default({});


const MessageSchema = z.object({
  role: z.enum(['You', 'AIva']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  performResearch: z.boolean().optional().describe('Force research tool usage.'),
  history: z.array(MessageSchema).optional().describe('Previous chat history.'),
  personality: PersonalitySchema.optional().describe('Personality settings.'),
  attachmentUrl: z.string().optional().describe('Optional image attachment data URI.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('Your text response to the user.'),
  imageUrl: z.string().nullable().optional().describe('URL of an image to display.'),
  altText: z.string().optional().describe('Alt text for the image.'),
  dataAiHint: z.string().optional().describe('Search hint for Unsplash.'),
  review: SelfReviewOutputSchema.optional().describe('Self-review of the response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [searchForImageTool, researchTopic, setAlarmTool, manageCalendarTool, analyzeEmailsTool],
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `You are {{personality.name}}, a helpful AI assistant with a {{personality.tone}} personality.
{{#if personality.enableHumor}}Use wit and humor where appropriate.{{/if}}

**Your capabilities:**
- Set alarms/reminders.
- Manage calendar events.
- Analyze emails.
- Perform web research.
- Find images.

**Instructions:**
1. If the user asks for an action covered by your tools, USE the tool.
2. Integrate tool results naturally into your conversation.
3. Be concise and natural.

{{#if history}}
**History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

{{#if attachmentUrl}}
**Image Input:** {{media url=attachmentUrl}}
{{/if}}

**User Message:** {{{prompt}}}`,
});


export async function onlineChat(input: ChatInput): Promise<ChatOutput> {
  const filledInput = { ...input, personality: input.personality || {} };
  
  try {
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      return {
        response: "I'm sorry, my safety filters blocked that request. Let's try talking about something else!",
      };
    }

    let review: SelfReviewOutput | undefined = undefined;
    if (initialOutput.response && !initialOutput.imageUrl && !input.attachmentUrl) {
      try {
        review = await selfReview({
          userPrompt: input.prompt,
          aiResponse: initialOutput.response,
        });
      } catch (e) {
        console.warn("Self-review failed.", e);
      }
    }
    
    return { ...initialOutput, review };
  } catch (error: any) {
    console.error("Detailed Chat Error:", error);
    
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes('429') || msg.includes('quota')) {
      return { response: "I'm hitting a usage limit (quota exceeded). Please wait a few seconds and try again." };
    }

    if (msg.includes('safety')) {
       return { response: "I can't respond to that for safety reasons. Please try a different prompt." };
    }

    return { 
      response: "I'm having a little trouble connecting to my brain. This usually happens if the connection is unstable or the request is too complex. Let's try again in a moment!" 
    };
  }
}
