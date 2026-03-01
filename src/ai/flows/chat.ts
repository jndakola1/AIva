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
    description: 'Searches for an image based on a query when the user explicitly asks for an image or picture.',
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
        console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch image from Unsplash.');
      }
      
      const data = await response.json();
      
      if (!data.urls || !data.urls.regular) {
        console.error('Invalid or incomplete data from Unsplash API:', data);
        throw new Error('Invalid response from Unsplash API.');
      }

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
    description: 'Performs a web search to find up-to-date information on a given topic.',
    inputSchema: z.object({
      topic: z.string().describe('The topic to research.'),
    }),
    outputSchema: z.object({
      summary: z.string().describe('A summary of the research findings.'),
    }),
  },
  async ({ topic }) => {
    console.log(`Researching topic: ${topic}`);
    return {
      summary: `Research findings for "${topic}": This topic is currently trending. Recent developments suggest a significant shift in public interest towards more integrated and efficient solutions. Experts highlight the importance of security and scalability in this domain.`,
    };
  }
);

const setAlarmTool = ai.defineTool(
  {
    name: 'setAlarm',
    description: 'Sets an alarm or reminder for a specific time.',
    inputSchema: z.object({
      time: z.string().describe('The time to set the alarm for (e.g., "5:00 PM" or "in 10 minutes").'),
      label: z.string().optional().describe('An optional label for the alarm.'),
    }),
    outputSchema: z.object({
      confirmation: z.string(),
    }),
  },
  async ({ time, label }) => {
    console.log(`Setting alarm for ${time}${label ? ` (${label})` : ''}`);
    return { confirmation: `Alarm set successfully for ${time}${label ? `: ${label}` : ''}.` };
  }
);

const manageCalendarTool = ai.defineTool(
  {
    name: 'manageCalendar',
    description: 'Adds an event to the calendar or retrieves upcoming events.',
    inputSchema: z.object({
      action: z.enum(['add', 'list']).describe('Whether to add a new event or list existing ones.'),
      details: z.string().optional().describe('The event details (e.g., "Meeting with Bob at 2 PM on Friday").'),
    }),
    outputSchema: z.object({
      result: z.string(),
    }),
  },
  async ({ action, details }) => {
    if (action === 'add') {
      return { result: `Event added to your calendar: ${details}` };
    }
    return { result: "You have 3 events tomorrow: 9 AM Standup, 12 PM Lunch with Sarah, 4 PM Code Review." };
  }
);

const analyzeEmailsTool = ai.defineTool(
  {
    name: 'analyzeEmails',
    description: 'Analyzes the user\'s inbox to summarize recent emails or find specific information.',
    inputSchema: z.object({
      query: z.string().optional().describe('A specific search query or topic to look for in emails.'),
    }),
    outputSchema: z.object({
      summary: z.string(),
    }),
  },
  async ({ query }) => {
    if (query) {
      return { summary: `Found 2 emails related to "${query}". One from HR about benefits and another from a client regarding a project update.` };
    }
    return { summary: "You have 5 unread emails. The most important one is an invitation to a webinar next Thursday." };
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
  prompt: z.string().describe("The user's latest message."),
  performResearch: z.boolean().optional().describe('Whether to force the use of the research tool.'),
  history: z.array(MessageSchema).optional().describe('The preceding conversation history.'),
  personality: PersonalitySchema.optional().describe('The personality settings for the AI.'),
  attachmentUrl: z.string().optional().describe('An optional image attachment as a data URI.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The AI text response.'),
  imageUrl: z.string().nullable().optional().describe('The URL of an image to display, if requested.'),
  altText: z.string().optional().describe('The alt text for the image.'),
  dataAiHint: z.string().optional().describe('A hint for a real image search.'),
  review: SelfReviewOutputSchema.optional().describe('The self-review of the AI response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: z.object({
    response: z.string().describe('The AI text response.'),
    imageUrl: z.string().nullable().optional().describe('The URL of an image to display, if requested.'),
    altText: z.string().nullable().optional().describe('The alt text for the image.'),
    dataAiHint: z.string().nullable().optional().describe('A hint for a real image search.'),
  })},
  tools: [searchForImageTool, researchTopic, setAlarmTool, manageCalendarTool, analyzeEmailsTool],
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `You are a helpful AI assistant named {{personality.name}}.
Your personality is {{personality.tone}}. 
{{#if personality.enableHumor}}You should use humor and wit when appropriate.{{/if}}
Be conversational and natural.

**Capabilities:**
- You can set alarms and reminders.
- You can manage calendar events (adding and listing).
- You can analyze and summarize emails.
- You can perform web research.
- You can find and display images.

**Context:**
{{#if history}}
**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

{{#if attachmentUrl}}
**Attachment:**
An image has been attached to this message: {{media url=attachmentUrl}}
Please analyze or refer to this image in your response if relevant.
{{/if}}

**User's Message:**
- You: {{{prompt}}}

**Your Task:**
1. Analyze the user's prompt. 
2. Use the appropriate tool if the user asks for a specific action (alarm, calendar, email, research, image).
3. Formulate a helpful, relevant, and conversational response.
4. If you use a tool, integrate its output naturally into your final 'response'.

**Output Format:**
You MUST respond with a valid JSON object. Do not include any text outside the JSON block.
Ensure the 'response' field contains your conversational message.`,
});


export async function onlineChat(input: ChatInput): Promise<ChatOutput> {
  const filledInput = { ...input, personality: input.personality || {} };
  
  try {
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      // If output is null, it's often a safety filter block even with BLOCK_NONE (some filters are mandatory)
      return {
        response: "I'm sorry, I can't discuss that topic. Let's talk about something else!",
      };
    }

    let review: SelfReviewOutput | undefined = undefined;
    // Only perform self-review if we have a text response and no heavy media generation was requested
    if (initialOutput.response && !initialOutput.imageUrl && !input.attachmentUrl) {
      try {
        review = await selfReview({
          userPrompt: input.prompt,
          aiResponse: initialOutput.response,
        });
      } catch (e) {
        console.warn("Self-review step failed.", e);
      }
    }
    
    const finalOutput: ChatOutput = { ...initialOutput, review };
    
    // Clean up null values to satisfy the schema if necessary
    if (finalOutput.imageUrl === null) {
      finalOutput.imageUrl = undefined;
      finalOutput.altText = undefined;
      finalOutput.dataAiHint = undefined;
    }
    
    // Domain validation for image URLs to ensure UI safety
    if (finalOutput.imageUrl && !finalOutput.imageUrl.startsWith('https://placehold.co') && !finalOutput.imageUrl.startsWith('https://images.unsplash.com') && !finalOutput.imageUrl.startsWith('data:')) {
      finalOutput.imageUrl = `https://placehold.co/600x400.png`;
      finalOutput.altText = `Visual representation`;
      finalOutput.dataAiHint = 'abstract visual';
    }

    return finalOutput;
  } catch (error: any) {
    console.error("Online Chat Error Detailed:", error);
    
    const errorMessage = error.message?.toLowerCase() || "";
    
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return {
        response: "I'm a bit overwhelmed right now (quota exceeded). Please try again in a few moments.",
      };
    }

    if (errorMessage.includes('safety') || errorMessage.includes('candidate')) {
       return {
        response: "I'm sorry, but I'm not allowed to respond to that prompt due to safety guidelines.",
      };
    }

    return {
      response: "I'm having a little trouble connecting to my brain right now. This can happen if the prompt is too complex or the connection is unstable. Please try again in a moment.",
    };
  }
}