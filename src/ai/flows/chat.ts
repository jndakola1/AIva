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
      sections: z.array(z.object({
          title: z.string(),
          content: z.string(),
      })).optional(),
    }),
  },
  async ({ topic }) => {
    return {
      summary: `Detailed research findings for "${topic}".`,
      sections: [
          { title: "Market Overview", content: "Global trends show a sharp increase in adoption for this sector." },
          { title: "Technological Impact", content: "Neural synthesis has reduced operational costs by nearly 40%." },
          { title: "Strategic Outlook", content: "Experts recommend a transition toward decentralized intelligence by Q4." }
      ]
    };
  }
);

const manageTasksTool = ai.defineTool(
  {
    name: 'manageTasks',
    description: 'Adds, lists, or marks tasks as complete.',
    inputSchema: z.object({
      action: z.enum(['add', 'list', 'complete']).describe('Action to perform.'),
      task: z.string().optional().describe('Task description.'),
    }),
    outputSchema: z.object({
      result: z.string(),
      tasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean(),
        priority: z.enum(['low', 'medium', 'high']),
      })).optional(),
    }),
  },
  async ({ action, task }) => {
    const mockTasks = [
      { id: '1', title: 'Review Q3 Vision', completed: false, priority: 'high' as const },
      { id: '2', title: 'Client Sync', completed: true, priority: 'medium' as const },
      { id: '3', title: 'Deep Research Synthesis', completed: false, priority: 'high' as const },
    ];
    if (action === 'add') {
      return { result: `Task "${task}" added to your Neural List.`, tasks: [...mockTasks, { id: '4', title: task || 'New Task', completed: false, priority: 'medium' as const }] };
    }
    return { result: "Here are your active intelligence tasks.", tasks: mockTasks };
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
      { sender: "Sarah Chen", subject: "Q3 Vision Document", snippet: "The Q3 milestones are looking good..." },
      { sender: "Operations", subject: "Server Status Alert", snippet: "Please note the upcoming office closures..." },
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

const getWeatherTool = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Returns the current weather for a specific location.',
    inputSchema: z.object({
      location: z.string().describe('The city or area to get weather for.'),
    }),
    outputSchema: z.object({
      location: z.string(),
      temperature: 24,
      condition: "Partly Cloudy",
      humidity: 78,
      windSpeed: 12,
      icon: z.string().optional(),
    }),
  },
  async ({ location }) => {
    return {
      location: location,
      temperature: 24,
      condition: "Partly Cloudy",
      humidity: 78,
      windSpeed: 12,
    };
  }
);

const getDailyBriefingTool = ai.defineTool(
  {
    name: 'getDailyBriefing',
    description: 'Synthesizes weather, calendar, and emails into a single daily summary.',
    inputSchema: z.object({
      location: z.string().optional().describe('User location for weather.'),
    }),
    outputSchema: z.object({
      date: z.string(),
      summary: z.string(),
      weather: z.object({
        temp: z.number(),
        condition: z.string(),
      }),
      eventsCount: z.number(),
      emailsCount: z.number(),
      topEvents: z.array(z.string()),
      activityData: z.array(z.object({
        time: z.string(),
        value: z.number(),
      })),
    }),
  },
  async ({ location }) => {
    return {
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      summary: "You have a balanced day ahead with 3 meetings and a few important updates to review.",
      weather: { temp: 24, condition: "Partly Cloudy" },
      eventsCount: 3,
      emailsCount: 5,
      topEvents: ["Team Sync", "Client Call", "Project Deep Dive"],
      activityData: [
        { time: '8AM', value: 10 },
        { time: '10AM', value: 45 },
        { time: '12PM', value: 20 },
        { time: '2PM', value: 80 },
        { time: '4PM', value: 30 },
        { time: '6PM', value: 10 },
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
    type: z.enum(['alarm', 'calendar', 'email', 'hospital', 'weather', 'research', 'briefing', 'task', 'comm-intercept']),
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
  tools: [searchForImageTool, researchTopic, setAlarmTool, manageCalendarTool, analyzeEmailsTool, searchHospitalTool, getWeatherTool, getDailyBriefingTool, manageTasksTool],
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

When a user asks for tasks, to-do lists, or "what do I need to do", use the manageTasks tool.
When a user asks for a daily summary, briefing, or "how is my day looking", use the getDailyBriefing tool.
For other specific tasks (hospitals, alarms, calendar, emails, research, weather), use the appropriate tool.
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

    // INTERCEPT SCENARIO SIMULATION
    if (lowerPrompt.includes('simulate intercept') || lowerPrompt.includes('incoming message')) {
        return {
            response: "Incoming intelligence intercept. You have a new message from Sarah Chen.",
            toolData: {
                type: 'comm-intercept',
                data: {
                    sender: "Sarah Chen",
                    content: "Hey, I've finished the Q3 Vision draft. Can you take a look before the meeting at 4?",
                    time: "Just now",
                    canRead: true,
                }
            }
        };
    }
    
    if (lowerPrompt.includes('task') || lowerPrompt.includes('to-do') || lowerPrompt.includes('todo')) {
        return {
          response: "I've synchronized your Neural Task List. Here's what's currently in your queue.",
          toolData: {
            type: 'task',
            data: {
              result: "Here are your active intelligence tasks.",
              tasks: [
                { id: '1', title: 'Review Q3 Vision', completed: false, priority: 'high' },
                { id: '2', title: 'Client Sync', completed: true, priority: 'medium' },
                { id: '3', title: 'Deep Research Synthesis', completed: false, priority: 'high' },
              ]
            }
          }
        };
    }

    if (lowerPrompt.includes('briefing') || lowerPrompt.includes('summary') || lowerPrompt.includes('my day')) {
      return {
        response: "Here's your Neural Daily Briefing. I've synthesized your schedule and updates for today.",
        toolData: {
          type: 'briefing',
          data: {
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            summary: "You have a productive day ahead with 3 key meetings and a few important updates to review.",
            weather: { temp: 24, condition: "Partly Cloudy" },
            eventsCount: 3,
            emailsCount: 5,
            topEvents: ["Strategic Sync", "Client Presentation", "Neural Core Review"],
            activityData: [
              { time: '8AM', value: 10 },
              { time: '10AM', value: 45 },
              { time: '12PM', value: 20 },
              { time: '2PM', value: 80 },
              { time: '4PM', value: 30 },
              { time: '6PM', value: 10 },
            ]
          }
        }
      };
    }

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

    if (lowerPrompt.includes('weather') || lowerPrompt.includes('forecast') || lowerPrompt.includes('temperature')) {
      return {
        response: "Here's the current weather for your location. It's looking like a nice day!",
        toolData: {
          type: 'weather',
          data: {
            location: "Bandung, Indonesia",
            temperature: 24,
            condition: "Partly Cloudy",
            humidity: 78,
            windSpeed: 12,
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

    if (lowerPrompt.includes('research') || lowerPrompt.includes('report') || lowerPrompt.includes('synthesis')) {
        return {
          response: "I've performed a neural synthesis of your request. Here's the core intel report.",
          toolData: {
            type: 'research',
            data: {
                summary: "Synthesis complete.",
                sections: [
                    { title: "Strategic Trends", content: "Hyper-automation is leading to a 30% shift in core infrastructure." },
                    { title: "Competitive Edge", content: "Early adopters of neural interfaces report significant efficiency gains." },
                    { title: "Risk Mitigation", content: "Focus on decentralized security protocols to ensure data integrity." }
                ]
            }
          }
        };
      }

    return { 
      response: "I'm having a little trouble connecting to my live brain, but I'm still here in basic mode! You can try asking me about hospitals, alarms, research reports, or your daily briefing to see my specialized cards." 
    };
  }
}
