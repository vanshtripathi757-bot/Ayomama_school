import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  getCurrentStoryChapter,
  getDeterministicStoryPack,
  validateStoryDirectorPack,
} from './src/game/core/rules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ChatHistoryEntry {
  sender: 'player' | 'npc';
  text: string;
}

interface NpcChatRequestBody {
  npcId?: string;
  npcName?: string;
  npcRole?: string;
  npcPersona?: string;
  playerMessage?: string;
  schoolPeriod?: string;
  history?: ChatHistoryEntry[];
}

interface StoryDirectorRequestBody {
  xp?: number;
  chapter?: string;
  location?: string;
  completedStoryPackIds?: string[];
  discoveredClues?: string[];
}

function safeRequestText(value: unknown, maxLength: number, fallback = ''): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback;
}

/**
 * Intelligent contextual reply generator used when GEMINI_API_KEY is not configured
 * or if the upstream call times out, ensuring the NPC always understands and replies
 * meaningfully to English, Hindi, or Hinglish messages.
 */
function buildSmartContextualReply(body: NpcChatRequestBody): {
  reply: string;
  affinityBonus: number;
} {
  const npcId = body.npcId || 'npc_hana';
  const npcName = body.npcName || 'Aiko Hoshino';
  const msg = (body.playerMessage || '').trim();
  const lower = msg.toLowerCase();

  // Detect Hinglish / Hindi keywords
  const isHinglish =
    /\b(kya|kaise|kaisa|kaisi|kaha|kahan|tum|aap|naam|bhai|dost|chalo|batao|accha|theek|haan|nahi|kar|rahe|ho|hai|mera|mujhe|school|class)\b/i.test(
      lower
    );

  // Project Hoshikaze / Mystery / Archive
  if (/\b(mystery|project|hoshikaze|archive|clue|emblem|record|secret|cabinet|history|past)\b/i.test(lower)) {
    if (isHinglish) {
      return {
        reply: `Project Hoshikaze humare Hoshino Academy ka purana student weather-and-starlight project tha! Library Archive, Train Station aur East Research Dome mein iske clues milenge!`,
        affinityBonus: 15,
      };
    }
    return {
      reply: `Project Hoshikaze was a student-led weather and starlight research project! Its records were separated between the Library Archive, Train Station, and East Research Centre.`,
      affinityBonus: 15,
    };
  }

  // Greeting / How are you
  if (/\b(hi|hello|hey|namaste|kaise ho|kaisi ho|how are you|sup|yo)\b/i.test(lower)) {
    if (isHinglish) {
      if (npcId === 'npc_hana') {
        return {
          reply: `Hello! Main Aiko hoon! Hoshino Academy mein tumhara swagat hai. Nayi grand 4-story building, Class A Homeroom aur Library Archive dekha?`,
          affinityBonus: 12,
        };
      }
      if (npcId === 'npc_ren') {
        return {
          reply: `Hey dost! Main Ren hoon, North Athletic Track aur East Gymnasium mein practice kar raha tha. Friendly quiz ya sprint challenge karoge?`,
          affinityBonus: 12,
        };
      }
      if (npcId === 'npc_aoi') {
        return {
          reply: `Namaste! Main Mika hoon—East Wing Library ke locked archive cabinet mein Project Hoshikaze ke notes dhoondh rahi thi!`,
          affinityBonus: 12,
        };
      }
      return {
        reply: `Hey! Hoshino Academy mein swagat hai! School Festival aur Project Hoshikaze ki story explore karne mein bahut maza aayega!`,
        affinityBonus: 12,
      };
    }

    if (npcId === 'npc_hana') {
      return {
        reply: `Good to see you! Welcome to Hoshino Academy—have you explored Class A Homeroom, the Library Archive, and the Student Dormitory yet?`,
        affinityBonus: 12,
      };
    }
    if (npcId === 'npc_ren') {
      return {
        reply: `Hey there! Feeling energized—I just finished a lap on the North Athletic Track. Ready for a fair quiz or sprint challenge?`,
        affinityBonus: 12,
      };
    }
    if (npcId === 'npc_aoi') {
      return {
        reply: `Hello! I was just sketching the faded star emblem and checking the locked archive cabinet in the East Wing Library.`,
        affinityBonus: 12,
      };
    }
    return {
      reply: `Hey! Great timing—we are preparing the Hoshino School Festival and researching the old campus archive records!`,
      affinityBonus: 12,
    };
  }

  // Name / Introduction questions
  if (/\b(name|naam|who are you|kaun ho|intro)\b/i.test(lower)) {
    if (isHinglish) {
      return {
        reply: `Mera naam ${npcName} hai (${body.npcRole || 'Hoshino Academy Student'}). Chalo saath mein Hoshino Academy aur Project Hoshikaze explore karte hain!`,
        affinityBonus: 10,
      };
    }
    return {
      reply: `I'm ${npcName}, ${body.npcRole || 'a student'} here at Hoshino Academy. Whenever you need advice about classes, clubs, or Project Hoshikaze, just chat with me!`,
      affinityBonus: 10,
    };
  }

  // Default thoughtful response referencing the user's message
  if (isHinglish) {
    return {
      reply: `Tumne bilkul sahi kaha ("${msg.slice(0, 48)}")! Hoshino Academy mein har din nayi discovery hoti hai—Story Chronicle button bhi zaroor check karna!`,
      affinityBonus: 10,
    };
  }

  return {
    reply: `That's a great point about "${msg.slice(0, 52)}"! Life at Hoshino Academy is full of discoveries—feel free to ask me about classes, clubs, or Project Hoshikaze!`,
    affinityBonus: 10,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/npc-chat', async (req, res) => {
    const rawBody = (req.body && typeof req.body === 'object' ? req.body : {}) as NpcChatRequestBody;
    const body: NpcChatRequestBody = {
      npcId: safeRequestText(rawBody.npcId, 80, 'npc_hana'),
      npcName: safeRequestText(rawBody.npcName, 80, 'Aiko Hoshino'),
      npcRole: safeRequestText(rawBody.npcRole, 100, 'Hoshino Academy student'),
      npcPersona: safeRequestText(rawBody.npcPersona, 400, 'Friendly, observant school student'),
      schoolPeriod: safeRequestText(rawBody.schoolPeriod, 60, 'Courtyard Recess'),
      playerMessage: safeRequestText(rawBody.playerMessage, 600),
      history: Array.isArray(rawBody.history)
        ? rawBody.history.slice(-6).map((entry) => ({
            sender: entry?.sender === 'player' ? 'player' as const : 'npc' as const,
            text: safeRequestText(entry?.text, 300),
          }))
        : [],
    };
    const playerMessage = body.playerMessage ?? '';
    if (!playerMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallback = buildSmartContextualReply(body);
      res.json({
        reply: fallback.reply,
        affinityBonus: fallback.affinityBonus,
        source: 'contextual-engine',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const historyTranscript = (body.history || [])
        .slice(-6)
        .map((h) => `${h.sender === 'player' ? 'Transfer Student' : body.npcName}: ${h.text}`)
        .join('\n');

      const systemInstruction = [
        `You are ${body.npcName || 'Aiko Hoshino'}, ${body.npcRole || 'Orientation Guide & Student Council'} at Hoshino Academy in the 3D open-world school-life adventure "THE SCHOOL CHRONICLES".`,
        `Persona details: ${body.npcPersona || 'Warm, observant, welcoming anime high-school classmate at Hoshino Academy.'}`,
        `Current school timetable period: ${body.schoolPeriod || 'Courtyard Recess'}.`,
        `Campus lore: The transfer student is exploring Hoshino Academy (Class A Homeroom, Library Archive, Cafeteria, Gymnasium, Student Dormitory, Town District, Train Station, Research Centre Dome, and Mountain Shrine) and gradually uncovering the warm, non-dangerous mystery of "Project Hoshikaze"—a forgotten student-led weather and starlight research project.`,
        `Rules:`,
        `1. Reply directly, warmly, and naturally to what the Transfer Student just said.`,
        `2. Match the player's language style: if the player writes in Hindi or Hinglish (Roman Hindi), reply warmly in natural Hinglish/English anime style; if they write in English, reply in English.`,
        `3. Keep your reply concise (1 to 3 sentences, max 55 words) so it fits cleanly inside the translucent in-game dialogue box.`,
        `4. Keep all interactions age-appropriate, friendship-focused, and grounded in Hoshino Academy life.`,
      ].join('\n');

      const prompt = historyTranscript
        ? `Recent conversation:\n${historyTranscript}\n\nTransfer Student says: "${playerMessage}"\n${body.npcName}'s reply:`
        : `Transfer Student says: "${playerMessage}"\n${body.npcName}'s reply:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        const fallback = buildSmartContextualReply(body);
        res.json({
          reply: fallback.reply,
          affinityBonus: fallback.affinityBonus,
          source: 'contextual-engine',
        });
        return;
      }

      res.json({
        reply: text,
        affinityBonus: 12,
        source: 'gemini',
      });
    } catch {
      const fallback = buildSmartContextualReply(body);
      res.json({
        reply: fallback.reply,
        affinityBonus: fallback.affinityBonus,
        source: 'contextual-engine',
      });
    }
  });

  // Section 11 & 14: Gemini AI Story Director Contract
  app.post('/api/story-director', async (req, res) => {
    const rawBody = (req.body && typeof req.body === 'object' ? req.body : {}) as StoryDirectorRequestBody;
    const xp = typeof rawBody.xp === 'number' && Number.isFinite(rawBody.xp)
      ? Math.max(0, Math.min(100000, Math.floor(rawBody.xp)))
      : 10;
    const completedIds = Array.isArray(rawBody.completedStoryPackIds)
      ? rawBody.completedStoryPackIds
          .filter((value): value is string => typeof value === 'string')
          .slice(-30)
          .map((value) => value.slice(0, 100))
      : [];
    const activeChapter = getCurrentStoryChapter(xp);
    const chapter = safeRequestText(rawBody.chapter, 120, activeChapter.title);
    const location = safeRequestText(rawBody.location, 100, 'Hoshino Academy Courtyard');
    const deterministicPack = getDeterministicStoryPack(xp, completedIds);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        pack: deterministicPack,
        source: 'canonical-director',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = [
        `You are the Narrative Director and Quest Designer for "The School Chronicles" at Hoshino Academy.`,
        `Current Chapter: ${chapter}.`,
        `Player XP: ${xp}. Current Location: ${location}.`,
        `Unlocked Regions: ${activeChapter.unlockedRegions.join(', ')}.`,
        `Generate a safe, age-appropriate, warm, curious school-life story activity pack connected to daily life at Hoshino Academy (Aiko, Ren, Mika, Sensei Takeda) and the forgotten student-led weather-and-starlight research project "Project Hoshikaze".`,
        `Never include violence, horror, crime, or romance pressure. Make the 4-option question fair and educational, with a supportive explanation.`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create the next Story Director activity pack for ${activeChapter.title} at ${location || deterministicPack.location}. Base it around ${deterministicPack.title} or the next step in uncovering Project Hoshikaze.`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kind: {
                type: Type.STRING,
                description: 'One of: adventure, quiz, test, event',
              },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              chapter: { type: Type.STRING },
              location: { type: Type.STRING },
              storyText: { type: Type.STRING },
              unlockAtXp: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctOption: {
                type: Type.INTEGER,
                description: 'Integer index from 0 to 3',
              },
              explanation: { type: Type.STRING },
            },
            required: [
              'kind',
              'title',
              'summary',
              'chapter',
              'location',
              'storyText',
              'unlockAtXp',
              'question',
              'options',
              'correctOption',
              'explanation',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const validated = validateStoryDirectorPack(
        {
          ...deterministicPack,
          ...parsed,
          id: deterministicPack.id,
        },
        xp,
        completedIds
      );

      res.json({
        pack: validated,
        source: 'gemini-director',
      });
    } catch {
      res.json({
        pack: deterministicPack,
        source: 'canonical-director',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`THE SCHOOL CHRONICLES server running on http://0.0.0.0:${port}`);
  });
}

void startServer();

