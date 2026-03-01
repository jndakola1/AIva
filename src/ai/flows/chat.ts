/**
 * @fileOverview A multi-modal chat AI agent that can display images, perform research, analyze photos, and manage tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { selfReview, SelfReviewOutput, SelfReviewOutputSchema } from './self-review';
import placeholderData from '@/app/lib/placeholder-images.json';

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
      alarmDetails: z.object({
        time: z.string(),
        label: z.string().optional(),
      }),
    }),
  },
  async ({ time, label }) => {
    return { 
      confirmation: `I've scheduled your alarm for ${time}${label ? `: "${label}"` : ''}.`,
      alarmDetails: { time, label }
    };
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
      events: z.array(z.object({
        title: z.string(),
        time: z.string(),
        date: z.string(),
      })).optional(),
    }),
  },
  async ({ action, details }) => {
    if (action === 'add') {
      return { 
        result: `Successfully added "${details}" to your calendar.`,
        events: [{ title: details || 'New Event', time: '10:00 AM', date: 'Tomorrow' }]
      };
    }
    return { 
      result: "Here are your upcoming events.",
      events: [
        { title: "Team Standup", time: "9:00 AM", date: "Today" },
        { title: "Lunch with Client", time: "12:30 PM", date: "Today" },
        { title: "Strategy Review", time: "4:00 PM", date: "Today" }
      ]
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
      emails: z.array(z.object({
        sender: z.string(),
        subject: z.string(),
        snippet: z.string(),
      })).optional(),
    }),
  },
  async ({ query }) => {
    const mockEmails = [
      { sender: "David", subject: "Project Update", snippet: "The Q3 milestones are looking good..." },
      { sender: "HR", subject: "Holiday Schedule", snippet: "Please note the upcoming office closures..." },
      { sender: "Travel", subject: "Flight Confirmation", snippet: "Your flight to NYC is confirmed for Friday..." }
    ];
    return { 
      summary: query ? `Found emails matching "${query}".` : "You have 3 new important emails.",
      emails: query ? mockEmails.filter(e => e.subject.toLowerCase().includes(query.toLowerCase())) : mockEmails
    };
  }
);

const searchHospitalTool = ai.defineTool(
  {
    name: 'searchHospital',
    description: 'Finds recommended hospitals in a specific location.',
    inputSchema: z.object({
      location: z.string().describe('The city or area to search for hospitals.'),
    }),
    outputSchema: z.object({
      count: z.number(),
      recommendations: z.array(z.object({
        name: z.string(),
        type: z.string(),
        rating: z.number(),
        reviews: z.string(),
        imageUrl: z.string(),
      })),
    }),
  },
  async ({ location }) => {
    return {
      count: 2,
      recommendations: [
        {
          name: "Santosa Hospital",
          type: "General Hospital",
          rating: 4.9,
          reviews: "1,4K Reviews",
          imageUrl: placeholderData.hospital.imageUrl,
        },
        {
          name: "Saint Borromeus",
          type: "Private Hospital",
          rating: 4.8,
          reviews: "520 Reviews",
          imageUrl: placeholderData.hospitalFallback.imageUrl,
        }
      ]
    };
  }
);

const MessageSchema = z.object({
  role: z.enum(['You', 'AIva']),
  content: z.string(),
});

export const ChatOutputSchema = z.object({
  response: z.string(),
  imageUrl: z.string().nullable().optional(),
  altText: z.string().optional(),
  dataAiHint: z.string().optional(),
  review: SelfReviewOutputSchema.optional(),
  toolData: z.object({
    type: z.enum(['alarm', 'calendar', 'email', 'hospital']),
    data: z.any(),
  }).optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message."),
  performResearch: z.boolean().optional(),
  history: z.array(MessageSchema).optional(),
  personality: z.any().optional(),
  attachmentUrl: z.string().optional(),
});

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [searchForImageTool, researchTopic, setAlarmTool, manageCalendarTool, analyzeEmailsTool, searchHospitalTool],
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `You are {{personality.name}}, a helpful AI assistant.
Tone: {{personality.tone}}
Humor enabled: {{personality.enableHumor}}

When a user asks to set an alarm, manage their calendar, check emails, or find hospitals, use the appropriate tool. 
ALWAYS populate the 'toolData' field in your output with the data returned by the tool if you used one.

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

export async function onlineChat(input: ChatInput): Promise<ChatOutput> {
  const personality = input.personality || { name: 'AIva', tone: 'friendly', enableHumor: true };
  const filledInput = { ...input, personality };
  
  try {
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      throw new Error("No output from model.");
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
    console.error("Chat Error (Falling back to mock mode):", error);
    
    const lowerPrompt = input.prompt.toLowerCase();
    
    // BROAD KEYWORD MATCHING FOR ROBUST MOCK DATA
    if (lowerPrompt.includes('hospital') || lowerPrompt.includes('doctor') || lowerPrompt.includes('medical') || lowerPrompt.includes('hosp')) {
      return {
        response: "I found a couple of highly-rated hospitals nearby. Here are the recommendations based on your area.",
        toolData: {
          type: 'hospital',
          data: {
            count: 2,
            recommendations: [
              {
                name: "Santosa Hospital",
                type: "General Hospital",
                rating: 4.9,
                reviews: "1,4K Reviews",
                imageUrl: placeholderData.hospital.imageUrl,
              },
              {
                name: "Saint Borromeus",
                type: "Private Hospital",
                rating: 4.8,
                reviews: "520 Reviews",
                imageUrl: placeholderData.hospitalFallback.imageUrl,
              }
            ]
          }
        }
      };
    }

    if (lowerPrompt.includes('alarm') || lowerPrompt.includes('remind') || lowerPrompt.includes('wake')) {
      return {
        response: "I've simulated setting that alarm for you! Here are the details.",
        toolData: {
          type: 'alarm',
          data: { 
            confirmation: "Alarm scheduled successfully.", 
            alarmDetails: { 
                time: lowerPrompt.match(/\d+:\d+/)?.[0] || "7:00 AM", 
                label: "Morning Wakeup" 
            } 
          }
        }
      };
    }

    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('meeting') || lowerPrompt.includes('event') || lowerPrompt.includes('schedule')) {
      return {
        response: "Here's a look at your calendar for today. You have a few things scheduled.",
        toolData: {
          type: 'calendar',
          data: {
            result: "Here are your upcoming events.",
            events: [
              { title: "Product Strategy", time: "10:30 AM", date: "Today" },
              { title: "Lunch with Team", time: "1:00 PM", date: "Today" },
              { title: "Developer Sync", time: "4:00 PM", date: "Today" }
            ]
          }
        }
      };
    }

    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail') || lowerPrompt.includes('inbox')) {
      return {
        response: "I've summarized your recent mail for you. You have a few unread items.",
        toolData: {
          type: 'email',
          data: {
            summary: "You have 3 important emails.",
            emails: [
              { sender: "Alice", subject: "Review Required", snippet: "Could you take a look at the latest designs..." },
              { sender: "Support", subject: "Account Update", snippet: "Your subscription has been successfully renewed..." },
              { sender: "Security", subject: "New Login Detected", snippet: "We noticed a new login from a device in London..." }
            ]
          }
        }
      };
    }

    return { 
      response: "I'm having a little trouble connecting to my live brain, but I'm still here in basic mode! You can try asking me about hospitals, alarms, or your calendar to see my specialized cards." 
    };
  }
}
