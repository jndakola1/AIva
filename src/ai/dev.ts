import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-prompt.ts';
import '@/ai/flows/gemini-switch-chat.ts';
import '@/ai/flows/tts.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/summarize.ts';
import '@/ai/flows/self-review.ts';
import '@/ai/flows/describe-image.ts';
