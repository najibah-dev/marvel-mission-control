import { env } from 'cloudflare:workers';
import { createExplanationHandler } from '@/lib/explanation-service';

// Keep the credential server-side. The service can be tested without the provider.
export const POST = createExplanationHandler(
  () => (env as unknown as Record<string, string>).GROQ_API_KEY || process.env.GROQ_API_KEY
);
