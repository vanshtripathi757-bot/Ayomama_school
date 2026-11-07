import { GoogleGenAI, ThinkingLevel } from '@google/genai';

type RequestLike = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined>; };
type ResponseLike = { status(code: number): ResponseLike; json(body: unknown): void; setHeader(name: string, value: string): void };

const windows = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 12;
}
function getClientKey(req: RequestLike): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return (ip || 'unknown').slice(0, 80);
}
function safeText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function fallback(name: string, role: string, message: string) {
  const lower = message.toLowerCase();
  if (/^(hi|hello|hey|namaste|hii)\b/.test(lower)) return { reply: `Hey! I'm ${name}. Welcome to Hoshino Academy. How is your first day going?`, affinityBonus: 8, source: 'fallback' };
  if (/project|hoshikaze|archive|clue|mystery/.test(lower)) return { reply: 'Project Hoshikaze was an old student research project. The library archive and research centre may hold useful clues.', affinityBonus: 8, source: 'fallback' };
  return { reply: `That's interesting. As ${role}, I can help you explore school life, classes, clubs, and the campus story.`, affinityBonus: 5, source: 'fallback' };
}
export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (typeof origin === 'string' && typeof host === 'string') {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Cross-origin request blocked.' });
    } catch {
      return res.status(403).json({ error: 'Invalid request origin.' });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimited(getClientKey(req))) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const message = safeText(body.playerMessage, 600);
  if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });
  const name = safeText(body.npcName, 80) || 'Aiko Hoshino';
  const role = safeText(body.npcRole, 100) || 'Hoshino Academy student';
  const persona = safeText(body.npcPersona, 400) || 'Friendly, observant school student';
  const memories = Array.isArray(body.npcMemories)
    ? body.npcMemories.slice(-8).map((entry) => safeText(entry, 160)).filter(Boolean)
    : [];
  const memoryContext = memories.length ? `Known shared memories with this student:\\n- ${memories.join('\\n- ')}` : 'No shared memories have been recorded yet.';
  const history = Array.isArray(body.history) ? body.history.slice(-6).map((entry) => {
    const item = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
    return `${item.sender === 'player' ? 'Student' : name}: ${safeText(item.text, 300)}`;
  }).join('\n') : '';
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return res.status(200).json(fallback(name, role, message));
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: `${history}\nStudent says: ${message}\nReply as ${name}.`,
      config: {
        systemInstruction: `You are ${name}, ${role} at Hoshino Academy. Persona: ${persona}. Reply naturally to the student's message in their language (English or Hinglish). Keep it age-appropriate, friendly, non-romantic, and under 55 words. Never ask for personal contact details.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    const reply = safeText(result.text, 500);
    return res.status(200).json(reply ? { reply, affinityBonus: 8, source: 'gemini' } : fallback(name, role, message));
  } catch {
    return res.status(200).json(fallback(name, role, message));
  }
}
