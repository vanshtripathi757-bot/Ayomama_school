import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { getCurrentStoryChapter, getDeterministicStoryPack, validateStoryDirectorPack } from '../src/game/core/rules';

type RequestLike = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined>; };
type ResponseLike = { status(code: number): ResponseLike; json(body: unknown): void; setHeader(name: string, value: string): void };
const windows = new Map<string, { count: number; resetAt: number }>();
function limited(key: string) {
  const now = Date.now(); const old = windows.get(key);
  if (!old || old.resetAt <= now) { windows.set(key, { count: 1, resetAt: now + 60_000 }); return false; }
  old.count += 1; return old.count > 5;
}
function text(value: unknown, max: number, fallback: string) { return typeof value === 'string' ? value.trim().slice(0, max) : fallback; }
export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) || 'unknown';
  if (limited(ip.slice(0, 80))) return res.status(429).json({ error: 'Story generation limit reached. Try again later.' });
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const xp = typeof body.xp === 'number' && Number.isFinite(body.xp) ? Math.max(0, Math.min(100000, Math.floor(body.xp))) : 10;
  const completed = Array.isArray(body.completedStoryPackIds) ? body.completedStoryPackIds.filter((v): v is string => typeof v === 'string').slice(-30) : [];
  const chapter = text(body.chapter, 120, getCurrentStoryChapter(xp).title);
  const location = text(body.location, 100, 'Hoshino Academy Courtyard');
  const base = getDeterministicStoryPack(xp, completed);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ pack: base, source: 'canonical-director' });
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: `Create one school-life story activity for ${chapter} at ${location}. Base it on ${base.title}. Return one fair four-option educational quiz with one correct answer.`,
      config: {
        systemInstruction: 'Create safe, age-appropriate school-life content. No violence, horror, crime, romance pressure, dangerous dares, personal data, code, HTML or URLs. Use friendly supportive language.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kind: { type: Type.STRING }, title: { type: Type.STRING }, summary: { type: Type.STRING },
            chapter: { type: Type.STRING }, location: { type: Type.STRING }, storyText: { type: Type.STRING },
            unlockAtXp: { type: Type.INTEGER }, question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctOption: { type: Type.INTEGER }, explanation: { type: Type.STRING },
          },
          required: ['kind','title','summary','chapter','location','storyText','unlockAtXp','question','options','correctOption','explanation'],
        },
      },
    });
    const parsed = JSON.parse(result.text || '{}');
    const pack = validateStoryDirectorPack({ ...base, ...parsed, id: base.id }, xp, completed);
    return res.status(200).json({ pack, source: 'gemini-director' });
  } catch {
    return res.status(200).json({ pack: base, source: 'canonical-director' });
  }
}
