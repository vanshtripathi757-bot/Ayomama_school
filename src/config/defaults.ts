import {
  AABBCollider2D,
  AcademyClassId,
  AmbientNpcBanter,
  AtmosphereConfig,
  CameraViewpoint,
  CameraViewpointId,
  CampusInteractable,
  CharacterCustomization,
  CircleCollider2D,
  GameSettings,
  MissionProgressState,
  NPCRelationshipState,
  PlayerSkills,
  SchoolPeriodConfig,
  SchoolPeriodId,
  StoryDirectorPack,
  StoryLibraryItem,
  TimeOfDayPreset,
} from '../types/game';

export const DEFAULT_SETTINGS: GameSettings = {
  graphics: {
    preset: 'high',
    shadowQuality: 'high',
    resolutionScale: 1.0,
  },
  display: {
    fullscreen: false,
    showMobileControls: 'always',
  },
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    muted: false,
  },
  camera: {
    sensitivity: 1.0,
    invertY: false,
  },
};

export const INITIAL_CHARACTER_CUSTOMIZATION: CharacterCustomization = {
  name: 'Kazuki Hoshino',
  age: 16,
  gender: 'Male',
  academyClass: 'Class D',
  faceStyle: 1,
  hairStyle: 'spiky',
  hairColor: 0x1e1b4b,
  eyeColor: 0x38bdf8,
  skinColor: 0xffe4d6,
  heightScale: 1.0,
  bodyScale: 1.0,
  outfit: 'uniform_blazer',
  accessory: 'none',
  personality: 'Curious',
  hometown: 'Sakuragawa Coastal Town',
  previousSchool: 'Minato High School',
  reasonForJoining:
    'Enrolled at Hoshino Academy as a transfer student assigned to Class D, determined to prove Class D’s potential and uncover the school’s hidden history.',
  personalGoal:
    'Lead Class D from Rank #4 to the top of Hoshino Academy, build friendships across Classes D, C, B, and A, and uncover the truth of Project Hoshikaze.',
};

export const INITIAL_PLAYER_SKILLS: PlayerSkills = {
  academics: 15,
  communication: 15,
  leadership: 12,
  creativity: 14,
  sports: 14,
  problemSolving: 16,
  observation: 18,
};

export const INITIAL_CLASS_POINTS: Record<AcademyClassId, number> = {
  'Class A': 420,
  'Class B': 395,
  'Class C': 375,
  'Class D': 340,
};

const STORY_01_PHASES = [
  {
    phaseNumber: 1,
    title: 'Phase 01: First Day at Hoshino',
    description:
      'Arrive at Hoshino Academy gates as a new transfer student assigned to Class D, meet Sora (Class D) and Aiko (Class B) in the courtyard, and learn the 4-Class hierarchy.',
    location: 'Hoshino Academy Courtyard',
    themeColor: '#10b981',
    mainObjectives: [
      'Report to the Hoshino Academy Courtyard as a new Class D transfer student',
      'Speak with Aiko Hoshino (Class B) & Sora Amamiya (Class D Representative)',
      'Inspect the Faded Star-and-Chronicle Emblem on the Main Portico',
    ],
    optionalObjectives: ['Look up at the 36m Clock Tower Spire'],
    relevantNpcIds: ['npc_hana', 'npc_sora', 'npc_takeda'],
    rewardXp: 25,
    rewardCp: 15,
    rewardPp: 50,
    question:
      'When you arrive at Hoshino Academy as a transfer student, which class are you placed into at the start of your journey?',
    options: [
      'Class D — the underdog fourth class with hidden strengths and room to rise',
      'No class at all',
      'Faculty Staff Room',
      'A secret fifth grade',
    ],
    correctOption: 0,
    explanation:
      'You begin your journey in Class D alongside Sora, Yuki, and Kenzo, ready to prove Class D’s worth across Hoshino Academy!',
    clueReward: 'Phase 01 Clue: Class D Transfer Enrollment Charter & Portico Emblem',
  },
  {
    phaseNumber: 2,
    title: 'Phase 02: Meet Your Classmates',
    description:
      'Introduce yourself to your fellow Class D classmates (Sora, Yuki, Kenzo) and meet students from Classes C, B, and A around the courtyard and cafeteria.',
    location: 'Courtyard & West Cafeteria',
    themeColor: '#3b82f6',
    mainObjectives: [
      'Greet Sora Amamiya, Yuki Shirakawa & Kenzo Fujimoto of Class D',
      'Meet Mei Lin and Kaito Sato near the West Cafeteria',
      'Build trust through a friendly custom conversation',
    ],
    optionalObjectives: ['Check Class A–D standings in your Character Profile'],
    relevantNpcIds: ['npc_sora', 'npc_yuki', 'npc_kenzo', 'npc_mei'],
    rewardXp: 30,
    rewardCp: 15,
    rewardPp: 60,
    question:
      'Who is the intelligent Class D Representative who welcomes you and helps strategize Class D’s comeback?',
    options: [
      'Sora Amamiya, Class D Representative & Science/Tech Researcher',
      'An outsider from another town',
      'Nobody—Class D has no students',
      'The cafeteria chef',
    ],
    correctOption: 0,
    explanation:
      'Sora Amamiya is Class D’s sharp strategist who believes your arrival can help Class D climb the academy rankings.',
    clueReward: 'Phase 02 Clue: Class D Student Roster & Strengths Notes',
  },
  {
    phaseNumber: 3,
    title: 'Phase 03: The First Classroom',
    description:
      'Enter the 4-story Main Academic Building and attend your first homeroom lesson with Sensei Kenji Takeda to learn how Class Points (CP) work.',
    location: 'Main Academic Building & Homeroom',
    themeColor: '#6366f1',
    mainObjectives: [
      'Walk through the Main Academic Building front doors',
      'Attend Sensei Takeda’s first homeroom orientation',
      'Learn how Class D can earn Class Points (CP) through exams and activities',
    ],
    optionalObjectives: ['Read the Campus Noticeboard outside the main hall'],
    relevantNpcIds: ['npc_takeda', 'npc_sora', 'npc_hana'],
    rewardXp: 30,
    rewardCp: 20,
    rewardPp: 70,
    question:
      'How can Class D rise from Rank #4 and close the gap with Class C, Class B, and Class A?',
    options: [
      'By earning Class Points (CP) through examinations, club achievements, sports trials, and teamwork',
      'By skipping every class',
      'By breaking campus rules',
      'Class Points can never change',
    ],
    correctOption: 0,
    explanation:
      'Sensei Takeda explains that every examination, club milestone, and helpful mission awards Class Points (CP) to Class D.',
    clueReward: 'Phase 03 Clue: Hoshino Four-Class Point Charter',
  },
  {
    phaseNumber: 4,
    title: 'Phase 04: Exploring the Academy',
    description:
      'Tour the East Wing Library, Gymnasium, Swimming Pool, and Student Dormitory with Aiko (Class B) and Mika (Class C).',
    location: 'East Wing Library & Campus Grounds',
    themeColor: '#06b6d4',
    mainObjectives: [
      'Visit the East Wing Library & Archive Room',
      'Explore the Student Dormitory and West Koi Garden',
      'Speak with Mika Aozora (Class C) about campus clubs',
    ],
    optionalObjectives: ['Cross the Vermilion Bridge over the West Koi Pond'],
    relevantNpcIds: ['npc_hana', 'npc_aoi', 'npc_kaito'],
    rewardXp: 35,
    rewardCp: 20,
    rewardPp: 80,
    question:
      'Which two upper-class representatives warmly befriend you despite you being in Class D?',
    options: [
      'Aiko Hoshino (Class B) and Mika Aozora (Class C)',
      'No one speaks to Class D',
      'Only off-campus strangers',
      'A pair of rival principals',
    ],
    correctOption: 0,
    explanation:
      'Aiko (Class B) and Mika (Class C) value friendship and curiosity over class labels, becoming your closest cross-class allies.',
    clueReward: 'Phase 04 Clue: Hoshino Campus District Map',
  },
  {
    phaseNumber: 5,
    title: 'Phase 05: The First Challenge',
    description:
      'Face Ren Takahashi of Class A on the North Athletic Sports Field as he tests whether a Class D transfer student can keep up with Class A.',
    location: 'North Athletic Sports Field',
    themeColor: '#f59e0b',
    mainObjectives: [
      'Meet Ren Takahashi (Class A Representative) at the North Track',
      'Complete Ren’s speed and focus challenge with Kenzo & Daichi cheering',
      'Earn Ren’s initial respect for Class D',
    ],
    optionalObjectives: ['Sprint a lap on the 400m athletic track'],
    relevantNpcIds: ['npc_ren', 'npc_kenzo', 'npc_daichi'],
    rewardXp: 35,
    rewardCp: 25,
    rewardPp: 85,
    question:
      'Why does Ren Takahashi of Class A challenge you on the North Athletic Field?',
    options: [
      'To test if a Class D transfer student has the discipline and drive to rival Class A fairly',
      'To ban sports from the academy',
      'Because he dislikes athletics',
      'To close the track field',
    ],
    correctOption: 0,
    explanation:
      'Ren respects real effort—when you hold your own in his trial, he acknowledges you as a worthy Class D rival.',
    clueReward: 'Phase 05 Clue: Ren’s Class A Rivalry Badge',
  },
  {
    phaseNumber: 6,
    title: 'Phase 06: New Friendships',
    description:
      'Join Sora (Class D), Mika (Class C), and Aiko (Class B) during after-school club hours to complete your first collaborative club task.',
    location: 'Library & Club Pavilion',
    themeColor: '#a855f7',
    mainObjectives: [
      'Collaborate with Sora, Mika, and Aiko during Period 3 Club Activities',
      'Help Yuki Shirakawa (Class D) organize the Literature & Archive shelf',
      'Strengthen your friendship and trust levels with classmates',
    ],
    optionalObjectives: ['Visit the East Gymnasium indoor court'],
    relevantNpcIds: ['npc_sora', 'npc_aoi', 'npc_yuki', 'npc_hana'],
    rewardXp: 40,
    rewardCp: 25,
    rewardPp: 90,
    question:
      'How does building friendships across Class D, Class C, and Class B help your school journey?',
    options: [
      'It unlocks cooperative club tasks, shared archive clues, and stronger Class D morale',
      'It lowers your score to zero',
      'It locks the library doors',
      'It has no effect on school life',
    ],
    correctOption: 0,
    explanation:
      'Cross-class friendships with Sora, Yuki, Mika, and Aiko open new clues and boost Class D’s standing.',
    clueReward: 'Phase 06 Clue: Joint Club Activity Commendation',
  },
  {
    phaseNumber: 7,
    title: 'Phase 07: The First Examination',
    description:
      'Sit for the first official Hoshino Academy written examination and prove that Class D can score alongside Class A!',
    location: 'Main Academic Building Homeroom',
    themeColor: '#ec4899',
    mainObjectives: [
      'Report to Sensei Takeda and Sensei Kuroda for the First Written Exam',
      'Answer the academic evaluation accurately for Class D',
      'Earn +30 Class Points (CP) to lift Class D’s ranking',
    ],
    optionalObjectives: ['Review study notes with Akari Shinohara & Sora Amamiya'],
    relevantNpcIds: ['npc_takeda', 'npc_kuroda', 'npc_sora', 'npc_akari'],
    rewardXp: 45,
    rewardCp: 30,
    rewardPp: 100,
    question:
      'What happens when you and Sora lead Class D to a high score on the First Written Examination?',
    options: [
      'Class D earns a surge of Class Points (CP) and surprises the entire academy',
      'Class D loses all points',
      'Exams are cancelled forever',
      'Only Class A is allowed to pass',
    ],
    correctOption: 0,
    explanation:
      'Your exam performance proves Class D is a serious contender, earning +30 CP and faculty praise!',
    clueReward: 'Phase 07 Clue: Class D First Exam Honors Transcript',
  },
  {
    phaseNumber: 8,
    title: 'Phase 08: An Unexpected Discovery',
    description:
      'While celebrating Class D’s exam results in the East Wing Library, uncover a hidden reference to "Project Hoshikaze" tied to a former Class D founder!',
    location: 'East Wing Library Archive',
    themeColor: '#f97316',
    mainObjectives: [
      'Inspect the Locked Archive Cabinet in the East Wing Library with Mika and Sora',
      'Discover the faded catalogue card for "Project Hoshikaze"',
      'Learn that Project Hoshikaze was co-founded by a brilliant Class D student years ago',
    ],
    optionalObjectives: ['Compare the library card with the portico star emblem'],
    relevantNpcIds: ['npc_aoi', 'npc_sora', 'npc_takeda'],
    rewardXp: 50,
    rewardCp: 35,
    rewardPp: 120,
    question:
      'What unexpected connection do you, Sora, and Mika discover in the East Library catalogue?',
    options: [
      'The forgotten "Project Hoshikaze" was originally co-founded by students from all four classes, led by a visionary Class D student',
      'The library was built yesterday',
      'There are no books in the library',
      'The cabinet only holds sports shoes',
    ],
    correctOption: 0,
    explanation:
      'Discovering that a former Class D student helped lead Project Hoshikaze inspires your entire class!',
    clueReward: 'Phase 08 Clue: Project Hoshikaze Class D Founder Card',
  },
  {
    phaseNumber: 9,
    title: 'Phase 09: A New Beginning',
    description:
      'Gather by the Courtyard Clock Tower with Sora, Aiko, Mika, and Ren to celebrate Class D’s first milestone and unlock Story 02!',
    location: 'Courtyard Plaza & Clock Tower',
    themeColor: '#eab308',
    mainObjectives: [
      'Meet Sora, Aiko, Mika, and Ren at the Courtyard Fountain',
      'Complete Story 01: A New Beginning at 100%',
      'Unlock Story 02: Hidden Rivalries in the Visual Story Library',
    ],
    optionalObjectives: ['Watch the sunset from the Student Dormitory terrace'],
    relevantNpcIds: ['npc_sora', 'npc_hana', 'npc_aoi', 'npc_ren'],
    rewardXp: 60,
    rewardCp: 45,
    rewardPp: 150,
    question:
      'Having completed all 9 phases of Story 01 as Class D’s rising transfer student, what awaits you next?',
    options: [
      'Story 02: Hidden Rivalries — where Class D challenges Classes C, B, and A while investigating Project Hoshikaze',
      'The school year ends immediately',
      'All classes are dissolved',
      'Nothing else unlocks',
    ],
    correctOption: 0,
    explanation:
      'Completing Phase 09 finishes Story 01 (100%), awards +45 CP to Class D, and unlocks Story 02: Hidden Rivalries!',
    clueReward: 'Phase 09 Milestone: Class D Rising Star Crest',
  },
];

function createStoryPhasesForStory(
  storyId: string,
  storyNumber: number,
  storyTitle: string,
  baseLocation: string,
  themeColor: string
) {
  if (storyNumber === 1) {
    return STORY_01_PHASES.map((p) => ({
      ...p,
      id: `${storyId}_phase_${p.phaseNumber}`,
    }));
  }

  const phaseTemplates = [
    {
      num: 1,
      title: `Phase 01: Class D Strategy for ${storyTitle}`,
      desc: `Gather with Sora, Yuki, and Kenzo of Class D plus Aiko and Mika at ${baseLocation} to begin ${storyTitle}.`,
      q: `How does Class D prepare for ${storyTitle} at ${baseLocation}?`,
      ans: `By uniting Class D’s observation skills with allies from Classes B and C at ${baseLocation}`,
    },
    {
      num: 2,
      title: `Phase 02: Inter-Class Standings Briefing`,
      desc: `Review the Class D vs Class C, B, and A standings with Sensei Takeda and plan how to earn Class Points (CP).`,
      q: `How does Class D climb the rankings during ${storyTitle}?`,
      ans: `Through academic excellence, club teamwork, and honorable competition against Classes C, B, and A`,
    },
    {
      num: 3,
      title: `Phase 03: Allies & Rivals in Motion`,
      desc: `Speak with classmates across Class D, C, B, and A to gather clues and build lasting trust.`,
      q: `Why is speaking with students from all four classes vital in ${storyTitle}?`,
      ans: `Each class holds a piece of the Project Hoshikaze chronicle and unique perspectives`,
    },
    {
      num: 4,
      title: `Phase 04: Class D vs Class A Trial`,
      desc: `Take on Ren Takahashi and Class A in a fair academic and athletics showdown alongside Sora and Kenzo.`,
      q: `What happens when Class D stands up to Class A’s challenge in ${storyTitle}?`,
      ans: `Class D earns Class Points (CP), skill growth, and mutual respect from Ren Takahashi`,
    },
    {
      num: 5,
      title: `Phase 05: Club & Archive Investigation`,
      desc: `Work with Mika (Class C) and Sora (Class D) to inspect historical club equipment and records at ${baseLocation}.`,
      q: `What clue surfaces during the investigation at ${baseLocation}?`,
      ans: `A verified Project Hoshikaze record linking former Class A–D students to ${baseLocation}`,
    },
    {
      num: 6,
      title: `Phase 06: Connecting the Hoshikaze Clues`,
      desc: `Cross-reference the newly found notes with the East Wing Library Archive and Sensei Kuroda.`,
      q: `How do you verify the authenticity of the Project Hoshikaze clue in ${storyTitle}?`,
      ans: `By cross-checking library archive logs with Sensei Takeda and Sensei Kuroda`,
    },
    {
      num: 7,
      title: `Phase 07: Four-Class Breakthrough`,
      desc: `Bring Class D, Class C, Class B, and Class A representatives together to solve the chapter mystery.`,
      q: `What makes the breakthrough in ${storyTitle} possible?`,
      ans: `Class D’s leadership uniting Class A discipline, Class B harmony, and Class C creativity`,
    },
    {
      num: 8,
      title: `Phase 08: Official Chapter Examination`,
      desc: `Complete the chapter examination with Sensei Takeda to boost Class D’s Class Points (CP).`,
      q: `What reward does Class D earn for passing the ${storyTitle} examination?`,
      ans: `XP, a major boost of Class Points (CP) for Class D, Personal Points (PP), and faculty recognition`,
    },
    {
      num: 9,
      title: `Phase 09: ${storyTitle} Milestone`,
      desc: `Celebrate Class D’s rise in ${storyTitle} and unlock the next Story Chronicle in the Library!`,
      q: `What does completing Phase 09 of ${storyTitle} accomplish?`,
      ans: `Marks ${storyTitle} 100% complete, advances Class D’s rank, and unlocks the next Story Chronicle`,
    },
  ];

  return phaseTemplates.map((t) => ({
    id: `${storyId}_phase_${t.num}`,
    phaseNumber: t.num,
    title: t.title,
    description: t.desc,
    location: baseLocation,
    themeColor,
    mainObjectives: [
      `Explore ${baseLocation} as Class D’s representative`,
      `Collaborate with Sora, Aiko, Mika & Ren during ${t.title}`,
      `Complete the Phase 0${t.num} story & quiz checkpoint`,
    ],
    optionalObjectives: [`Earn bonus Class Points (CP) to raise Class D’s standing`],
    relevantNpcIds: ['npc_sora', 'npc_hana', 'npc_ren', 'npc_aoi', 'npc_takeda'],
    rewardXp: 30 + t.num * 4,
    rewardCp: 20 + t.num * 3,
    rewardPp: 60 + t.num * 10,
    question: t.q,
    options: [
      t.ans,
      'Ignore all classmates and forfeit Class D’s points',
      'Break campus rules without permission',
      'Cancel all club activities',
    ],
    correctOption: 0,
    explanation: `${t.ans} — propelling Class D forward in ${storyTitle}!`,
    clueReward: `${storyTitle} · Phase 0${t.num} Archive Record`,
  }));
}

export const INITIAL_STORY_LIBRARY: StoryLibraryItem[] = [
  {
    id: 'story_01',
    storyNumber: 1,
    title: 'A New Beginning',
    subtitle: 'Story 01 · Class D Arrival & Orientation',
    description:
      'Arrive at Hoshino Academy as a new transfer student placed in Class D, meet Sora, Aiko, Mika, and Ren, pass your first exam, and uncover the first clue to Project Hoshikaze.',
    themeGradient: 'from-emerald-600 via-indigo-700 to-slate-900',
    accentColor: '#10b981',
    unlockedByDefault: true,
    phases: createStoryPhasesForStory('story_01', 1, 'A New Beginning', 'Hoshino Academy Courtyard', '#10b981'),
  },
  {
    id: 'story_02',
    storyNumber: 2,
    title: 'Hidden Rivalries',
    subtitle: 'Story 02 · Class D Challenges Class A',
    description:
      'Lead Class D into honorable academic quizzes and track trials against Ren Takahashi and Class A while uncovering an old mentor photograph.',
    themeGradient: 'from-amber-600 via-orange-700 to-slate-900',
    accentColor: '#fbbf24',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_02', 2, 'Hidden Rivalries', 'North Athletic Sports Field', '#fbbf24'),
  },
  {
    id: 'story_03',
    storyNumber: 3,
    title: 'Secrets of Hoshino',
    subtitle: 'Story 03 · The Library Archive',
    description:
      'Team up with Sora (Class D), Mika (Class C), and Sensei Takeda to inspect the Library Archive Cabinet and decode the chronology of Project Hoshikaze.',
    themeGradient: 'from-purple-600 via-fuchsia-800 to-slate-900',
    accentColor: '#c084fc',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_03', 3, 'Secrets of Hoshino', 'Library & Archive Room', '#c084fc'),
  },
  {
    id: 'story_04',
    storyNumber: 4,
    title: 'The Academy Festival',
    subtitle: 'Story 04 · Four-Class Cultural Showcase',
    description:
      'Unite Class D with Classes C, B, and A to prepare the grand Hoshino Cultural Festival at the Amphitheater and discover a hidden blueprint frame.',
    themeGradient: 'from-rose-600 via-pink-700 to-slate-900',
    accentColor: '#fb7185',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_04', 4, 'The Academy Festival', 'Festival Concert Amphitheater', '#fb7185'),
  },
  {
    id: 'story_05',
    storyNumber: 5,
    title: 'Beyond the Campus',
    subtitle: 'Story 05 · Town District & Station',
    description:
      'Follow the festival lead with Haruto and Sora into the South Town District and Hoshino Train Station to trace the former advisor’s transit ledger.',
    themeGradient: 'from-cyan-600 via-teal-800 to-slate-900',
    accentColor: '#22d3ee',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_05', 5, 'Beyond the Campus', 'Hoshino Town District', '#22d3ee'),
  },
  {
    id: 'story_06',
    storyNumber: 6,
    title: 'The Forgotten Project',
    subtitle: 'Story 06 · Research Centre & Shrine',
    description:
      'Inspect the silver-domed Hoshino Research Centre with Sora and read the dedication scroll with Yuki at the North Mountain Shrine.',
    themeGradient: 'from-emerald-600 via-green-800 to-slate-900',
    accentColor: '#34d399',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_06', 6, 'The Forgotten Project', 'Hoshino Research Centre & Dome', '#34d399'),
  },
  {
    id: 'story_07',
    storyNumber: 7,
    title: 'The Final Challenge',
    subtitle: 'Story 07 · Class D’s Rise & Assembly',
    description:
      'Lead Class D to the top of the academy standings and assemble every verified record with Sora, Aiko, Mika, and Ren before the whole school.',
    themeGradient: 'from-blue-600 via-indigo-800 to-slate-950',
    accentColor: '#60a5fa',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_07', 7, 'The Final Challenge', 'Hoshino Academy Courtyard', '#60a5fa'),
  },
  {
    id: 'story_08',
    storyNumber: 8,
    title: 'A New Chapter',
    subtitle: 'Story 08 · Epilogue & Endless Chronicles',
    description:
      'Celebrate the restored archive and Class D’s triumph across Hoshino Academy, unlocking endless AI Story Director chronicles.',
    themeGradient: 'from-violet-600 via-indigo-900 to-slate-950',
    accentColor: '#a78bfa',
    unlockedByDefault: false,
    phases: createStoryPhasesForStory('story_08', 8, 'A New Chapter', 'Mountain Torii Shrine', '#a78bfa'),
  },
];

export const INITIAL_MISSION_PROGRESS: MissionProgressState = {
  distanceWalked: 0,
  talkedToHana: false,
  inspectedCount: 0,
  interactedIds: [],
  reputationPoints: 10,
  customMessagesSent: 0,
  inventoryItems: ['Hoshino Student ID Card (Class D)'],
  visitedInterior: false,
  chapterIndex: 0,
  completedStoryPackIds: [],
  discoveredClues: ['Faded Hoshino Emblem Sketch'],
  characterCustomization: structuredClone(INITIAL_CHARACTER_CUSTOMIZATION),
  skills: structuredClone(INITIAL_PLAYER_SKILLS),
  cpPoints: 50,
  ppPoints: 150,
  classPoints: structuredClone(INITIAL_CLASS_POINTS),
  activeStoryId: 'story_01',
  activePhaseNumber: 1,
  completedPhaseKeys: [],
  completedStoryIds: [],
  npcRelationships: {},
  customStories: [],
};

export const STORY_CHAPTER_ARC: Array<{
  index: number;
  code: string;
  title: string;
  unlockXp: number;
  unlockedRegions: string[];
  objectiveSummary: string;
}> = [
  {
    index: 0,
    code: 'Prologue',
    title: 'Prologue — A New Beginning',
    unlockXp: 0,
    unlockedRegions: ['Hoshino Academy Campus', 'Main Hall & Class A–D Homerooms', 'Library & Cafeteria'],
    objectiveSummary: 'Meet Aiko in the courtyard, visit the Class A Homeroom & Library, and inspect the faded academy emblem.',
  },
  {
    index: 1,
    code: 'Chapter 1',
    title: 'Chapter 1 — Finding Your Place',
    unlockXp: 35,
    unlockedRegions: ['Hoshino Academy Campus', 'Dormitory & Club Pavilion', 'Sports Field'],
    objectiveSummary: 'Learn the daily routine with Aiko and Mika, try a club activity, and uncover a library note about an old student project.',
  },
  {
    index: 2,
    code: 'Chapter 2',
    title: 'Chapter 2 — The Rivalry',
    unlockXp: 75,
    unlockedRegions: ['Hoshino Academy Campus', 'North Athletics Stadium', 'East Gymnasium'],
    objectiveSummary: 'Take Ren’s fair Class A academic & sprint challenge, complete Sensei Takeda’s class quiz, and inspect the old mentor photograph.',
  },
  {
    index: 3,
    code: 'Chapter 3',
    title: 'Chapter 3 — The Forgotten Records',
    unlockXp: 120,
    unlockedRegions: ['Hoshino Academy Campus', 'Library Archive Wing'],
    objectiveSummary: 'Compare clues with Mika at the Library & Noticeboard, and obtain Sensei Takeda’s permission to view historical records.',
  },
  {
    index: 4,
    code: 'Chapter 4',
    title: 'Chapter 4 — The School Festival',
    unlockXp: 170,
    unlockedRegions: ['Hoshino Academy Campus', 'West Festival Amphitheater', 'Koi Garden'],
    objectiveSummary: 'Team up across Classes A, B, C, and D with Aiko, Ren, and Mika to prepare the Hoshino Cultural Festival.',
  },
  {
    index: 5,
    code: 'Chapter 5',
    title: 'Chapter 5 — Beyond the Campus',
    unlockXp: 225,
    unlockedRegions: ['Hoshino Academy Campus', 'Town District', 'Hoshino Train Station'],
    objectiveSummary: 'Join the supervised activity into the Town District & Train Station to trace the community ledger toward the Research Centre.',
  },
  {
    index: 6,
    code: 'Chapter 6',
    title: 'Chapter 6 — The Hidden Project',
    unlockXp: 285,
    unlockedRegions: ['Hoshino Academy Campus', 'Town District', 'Research Centre', 'Mountain Shrine'],
    objectiveSummary: 'Explore the Hoshino Research Centre and Mountain Shrine to understand why the student project records were separated.',
  },
  {
    index: 7,
    code: 'Chapter 7',
    title: 'Chapter 7 — The Final Challenge',
    unlockXp: 350,
    unlockedRegions: ['All Hoshino Regions Unlocked'],
    objectiveSummary: 'Assemble verified clues with Aiko, Ren, and Mika and present the restored student project history to the academy.',
  },
  {
    index: 8,
    code: 'Epilogue',
    title: 'Epilogue — A New Chapter',
    unlockXp: 420,
    unlockedRegions: ['All Hoshino Regions + Seasonal Chronicles'],
    objectiveSummary: 'Celebrate restored records and friendships across Classes A–D with repeatable AI Story Director adventures.',
  },
];

export const CANONICAL_STORY_PACKS: StoryDirectorPack[] = [
  {
    id: 'pack_prologue_arrival',
    kind: 'adventure',
    title: 'Arrival at Hoshino Academy',
    summary: 'Complete your first-day orientation with Aiko and notice the faded emblem near the main hall.',
    chapter: 'Prologue — A New Beginning',
    location: 'Central Courtyard Plaza',
    storyText:
      'As a new transfer student arriving through the grand stone gates of Hoshino Academy, Aiko (Class B Representative) welcomes you by the courtyard fountain. Between the main hall, Class A Homeroom, and the library, you spot a faded star-and-chronicle emblem carved beneath the belfry plaque.',
    unlockAtXp: 0,
    question: 'According to Aiko’s orientation, what is your first priority on arriving at Hoshino Academy?',
    options: [
      'Explore the main hall, find your Class Homeroom, and learn the daily schedule',
      'Break into restricted rooms without permission',
      'Skip homeroom and leave campus immediately',
      'Challenge the principal to a duel',
    ],
    correctOption: 0,
    explanation:
      'In Prologue — A New Beginning, your first step is learning the campus layout, meeting Aiko, and attending your first class in Class A Homeroom.',
    clueReward: 'Faded Hoshino Emblem Note',
    xpReward: 30,
  },
  {
    id: 'pack_ch1_library_clue',
    kind: 'adventure',
    title: 'Mika & The Library Catalogue',
    summary: 'Help Aiko and Mika organize club materials and uncover a note about an old student-led project.',
    chapter: 'Chapter 1 — Finding Your Place',
    location: 'Student Council & Library',
    storyText:
      'Inside the East Wing Library, Mika (Class C Representative) shows you a sketch tucked inside an old club ledger. It mentions "Project Hoshikaze"—a student-led initiative created years ago by Classes A, B, C, and D to connect the campus observatory, weather station, and community archives.',
    unlockAtXp: 35,
    question: 'What was the purpose of the forgotten Project Hoshikaze mentioned in the library ledger?',
    options: [
      'A student-led initiative across Classes A–D designed to benefit the school community',
      'A secret military weapon blueprint',
      'A prank to cancel final exams',
      'A commercial shopping mall plan',
    ],
    correctOption: 0,
    explanation:
      'The library reference reveals that the old project was student-led and intended to support learning and the Hoshino community.',
    clueReward: 'Library Catalogue Reference Card',
    xpReward: 40,
  },
  {
    id: 'pack_ch2_ren_rivalry',
    kind: 'quiz',
    title: 'Ren’s Class A Academic & Track Challenge',
    summary: 'Complete Sensei Takeda’s homeroom quiz and Ren’s fair skill challenge.',
    chapter: 'Chapter 2 — The Rivalry',
    location: 'Inside Class A Homeroom',
    storyText:
      'Ren (Class A Representative) challenges you to prove both your classroom focus and your stride on the North Track. Afterward, Sensei Takeda shares an old campus photograph showing Ren’s former mentor standing beside the original Project Hoshikaze solar chronometer.',
    unlockAtXp: 75,
    question: 'What links Ren’s mentor to Hoshino Academy’s history in the old campus photograph?',
    options: [
      'They helped build and document the student-led Project Hoshikaze chronometer',
      'They tried to demolish the school library',
      'They were never connected to Hoshino Academy',
      'They hid treasure under the swimming pool',
    ],
    correctOption: 0,
    explanation:
      'The photograph shows that Ren’s mentor once collaborated with the students who preserved Project Hoshikaze’s records.',
    clueReward: 'Old Campus Mentor Photograph',
    xpReward: 45,
  },
  {
    id: 'pack_ch3_forgotten_records',
    kind: 'test',
    title: 'Chronology of the Archive Cabinet',
    summary: 'Work with Mika and Sensei Takeda to align the permitted historical records in order.',
    chapter: 'Chapter 3 — The Forgotten Records',
    location: 'Student Council & Library',
    storyText:
      'With Sensei Takeda’s official permission, you and Mika compare three public records from the library catalogue and noticeboard: (1) the founding charter of Project Hoshikaze, (2) the festival exhibition log, and (3) the transfer of technical instruments to the Research Centre during a roof renovation.',
    unlockAtXp: 120,
    question: 'Why were the original Project Hoshikaze records separated across different locations?',
    options: [
      'They were safely divided between the Library, Town Archive, and Research Centre during a renovation',
      'They were stolen by a rival school',
      'They were burned in a fire',
      'They were locked away as a punishment',
    ],
    correctOption: 0,
    explanation:
      'By respecting school rules and comparing permitted records, you learn the documents were separated for safekeeping during a campus renovation.',
    clueReward: 'Official Archive Permission Slip',
    xpReward: 50,
  },
  {
    id: 'pack_ch4_school_festival',
    kind: 'event',
    title: 'Hoshino Autumn Cultural Festival',
    summary: 'Coordinate the festival exhibition with Classes A, B, C, and D to uncover a missing blueprint reference.',
    chapter: 'Chapter 4 — The School Festival',
    location: 'Festival Concert Amphitheater',
    storyText:
      'Aiko manages Class B guest orientation, Ren anchors Class A athletics, Mika curates the Class C historical art booth, and Sora coordinates Class D science displays. While setting up the display frames, your team discovers a map index pointing to the Town District archive and the Hoshino Research Centre.',
    unlockAtXp: 170,
    question: 'How do Classes A, B, C, and D bring the Cultural Festival exhibit together?',
    options: [
      'Through teamwork combining orientation, athletics, creative curation, and science displays',
      'By cancelling all other club booths',
      'By working alone without speaking to each other',
      'By hiring outside actors',
    ],
    correctOption: 0,
    explanation:
      'Teamwork across Aiko, Ren, Mika, and Sora’s strengths makes the festival exhibit a success and reveals the next archive lead.',
    clueReward: 'Festival Exhibit Blueprint Index',
    xpReward: 55,
  },
  {
    id: 'pack_ch5_beyond_campus',
    kind: 'adventure',
    title: 'Supervised Trip to Town & Station',
    summary: 'Follow the festival lead into the Town District and Hoshino Train Station.',
    chapter: 'Chapter 5 — Beyond the Campus',
    location: 'Hoshino Town Shopping Street',
    storyText:
      'With school permission for an after-school community errand, Haruto guides you down the South Town Boulevard to the Hoshino Train Station. A former teacher’s transit log confirms that the remaining weather-chronometer logs are housed at the East Research Centre.',
    unlockAtXp: 225,
    question: 'Where does the former teacher’s community ledger at the Train Station point next?',
    options: [
      'To the Hoshino Research Centre on the east side of the valley',
      'To an abandoned island',
      'Back to the shoe lockers only',
      'To a different city entirely',
    ],
    correctOption: 0,
    explanation:
      'The Town District and Train Station records reliably connect the campus clues to the Hoshino Research Centre.',
    clueReward: 'Town Station Transit Ledger',
    xpReward: 60,
  },
  {
    id: 'pack_ch6_hidden_project',
    kind: 'quiz',
    title: 'Inside the Hoshino Research Centre',
    summary: 'Inspect the dome instruments with Sora and reflect at the North Mountain Shrine with Yuki.',
    chapter: 'Chapter 6 — The Hidden Project',
    location: 'Hoshino Research Centre & Dome',
    storyText:
      'Inside the silver-domed Research Centre, Sora (Class D Representative) helps you inspect the preserved meteorological and star-tracking instruments. Later, at the quiet Mountain Shrine on the north hill, Yuki shares a commemorative plaque explaining how past students hoped future classes would reunite the three archive volumes.',
    unlockAtXp: 285,
    question: 'What is needed to fully restore the forgotten student project’s legacy?',
    options: [
      'Reuniting the verified Library, Town, and Research Centre records for the whole school',
      'Keeping the records secret forever',
      'Replacing all classes with sports',
      'Selling the instruments',
    ],
    correctOption: 0,
    explanation:
      'Understanding why the records were separated allows your team to reunite them responsibly for the school community.',
    clueReward: 'Research Centre Restoration Dossier',
    xpReward: 65,
  },
  {
    id: 'pack_ch7_final_challenge',
    kind: 'test',
    title: 'The Grand Assembly Presentation',
    summary: 'Combine academics, teamwork, and verified clues with Classes A, B, C, and D.',
    chapter: 'Chapter 7 — The Final Challenge',
    location: 'Main Courtyard Plaza',
    storyText:
      'Standing before students and faculty at the grand courtyard podium, you, Aiko, Ren, Mika, and Sora present the complete timeline of Project Hoshikaze—linking the faded emblem, library catalogue, mentor photo, festival blueprint, town ledger, and research dome logs.',
    unlockAtXp: 350,
    question: 'How should the recovered history of Project Hoshikaze be shared with Hoshino Academy?',
    options: [
      'As an open, collaborative student archive that honors past teamwork and inspires future clubs',
      'As a private trophy for one person only',
      'By locking the cabinet again',
      'By erasing the names of past students',
    ],
    correctOption: 0,
    explanation:
      'Presenting the recovered history as a shared community archive fulfills the spirit of Hoshino Academy and earns full school recognition.',
    clueReward: 'Hoshino Heritage Medallion',
    xpReward: 75,
  },
  {
    id: 'pack_epilogue_new_chapter',
    kind: 'event',
    title: 'A New Chapter at Hoshino Academy',
    summary: 'Celebrate restored records, friendships, and new seasonal adventures across the open world.',
    chapter: 'Epilogue — A New Chapter',
    location: 'North Mountain Torii Shrine',
    storyText:
      'With the Project Hoshikaze archive restored in the library and Research Centre, daily life at Hoshino Academy blossoms with new inter-class events. Near the Mountain Shrine overlook, Mika spots an uncatalogued seasonal star-festival map—seeding your next adventure!',
    unlockAtXp: 420,
    question: 'What awaits you after completing the main restoration chronicle at Hoshino Academy?',
    options: [
      'Continuing daily school life, Class A–D competitions, friendships, and new AI-generated adventures',
      'The campus closes permanently',
      'All NPCs leave the world',
      'Movement is disabled',
    ],
    correctOption: 0,
    explanation:
      'In the Epilogue, the entire Hoshino Academy world remains playable with repeatable daily routines and new AI Story Director adventures.',
    clueReward: 'Seasonal Star-Festival Map',
    xpReward: 60,
  },
];

export const SCHOOL_PERIODS: Record<SchoolPeriodId, SchoolPeriodConfig> = {
  homeroom: {
    id: 'homeroom',
    periodNumber: 1,
    label: 'Period 1 · Morning Homeroom',
    timeRange: '08:15 – 10:30',
    defaultAtmosphere: 'morning',
    activityHint: 'Transfer student arrival! Meet Aiko in the courtyard and attend homeroom in Class A.',
  },
  courtyard_recess: {
    id: 'courtyard_recess',
    periodNumber: 2,
    label: 'Period 2 · Lunch & Recess',
    timeRange: '12:15 – 13:15',
    defaultAtmosphere: 'morning',
    activityHint: 'Class A, B, C, and D students are gathering around the courtyard fountain and Cafeteria.',
  },
  club_activities: {
    id: 'club_activities',
    periodNumber: 3,
    label: 'Period 3 · Clubs & Archives',
    timeRange: '15:30 – 17:30',
    defaultAtmosphere: 'golden_hour',
    activityHint: 'Investigate the Library Archive with Mika, train with Ren on the North Track, or visit the Dormitory.',
  },
  after_school: {
    id: 'after_school',
    periodNumber: 4,
    label: 'Period 4 · After-School Discovery',
    timeRange: '17:45 – 19:30',
    defaultAtmosphere: 'twilight',
    activityHint: 'Lanterns glow across Hoshino Academy, the Town District, Research Centre, and Mountain Shrine.',
  },
};

export const CAMERA_VIEWPOINTS: Record<CameraViewpointId, CameraViewpoint> = {
  courtyard_overview: {
    id: 'courtyard_overview',
    label: 'Courtyard Plaza',
    description: 'Central fountain plaza framing Hoshino Academy’s grand 4-story main hall and clock tower.',
    position: [0, 12.5, 42],
    target: [0, 8.5, -10],
  },
  clock_tower: {
    id: 'clock_tower',
    label: 'Clock Tower Spire',
    description: 'Elevated architectural view of the 36m Hoshino belfry and illuminated dials.',
    position: [18, 22.0, 22],
    target: [0, 21.0, -15],
  },
  sakura_avenue: {
    id: 'sakura_avenue',
    label: 'Sakura Promenade',
    description: 'Cherry blossom avenue connecting the South Gate to the Grand Courtyard.',
    position: [-18, 5.2, 28],
    target: [4, 6.5, -8],
  },
  main_gate: {
    id: 'main_gate',
    label: 'Hoshino Main Gate',
    description: 'Monumental stone entrance pillars looking toward the academy and Town Boulevard.',
    position: [15, 6.0, 48],
    target: [0, 5.5, 10],
  },
  rooftop_terrace: {
    id: 'rooftop_terrace',
    label: 'Research & Shrine Overlook',
    description: 'Panoramic vista across the Dormitory, Research Centre Dome, and Mountain Shrine.',
    position: [-36, 19.0, 24],
    target: [4, 7.0, -14],
  },
};

export const ATMOSPHERE_PRESETS: Record<TimeOfDayPreset, AtmosphereConfig> = {
  morning: {
    id: 'morning',
    label: 'Morning Homeroom',
    timeDisplay: '08:15 AM',
    skyTopColor: '#25437a',
    skyHorizonColor: '#9ec5f8',
    fogColor: '#8cb3e8',
    fogDensity: 0.0045,
    sunColor: '#fff6e0',
    sunIntensity: 2.2,
    sunPosition: [42, 48, 28],
    hemiSkyColor: '#a6c8ff',
    hemiGroundColor: '#3a4252',
    hemiIntensity: 0.85,
    windowEmissiveIntensity: 0.15,
    lanternIntensity: 0.0,
  },
  golden_hour: {
    id: 'golden_hour',
    label: 'After-School Sunset',
    timeDisplay: '05:10 PM',
    skyTopColor: '#1b1e3d',
    skyHorizonColor: '#e8836b',
    fogColor: '#8d5b6e',
    fogDensity: 0.0052,
    sunColor: '#ff9d5c',
    sunIntensity: 2.4,
    sunPosition: [-46, 22, 24],
    hemiSkyColor: '#f59e84',
    hemiGroundColor: '#282538',
    hemiIntensity: 0.75,
    windowEmissiveIntensity: 0.85,
    lanternIntensity: 1.4,
  },
  twilight: {
    id: 'twilight',
    label: 'Evening Study',
    timeDisplay: '07:45 PM',
    skyTopColor: '#070b17',
    skyHorizonColor: '#1e2b4f',
    fogColor: '#131c36',
    fogDensity: 0.0058,
    sunColor: '#7b9cff',
    sunIntensity: 1.15,
    sunPosition: [-30, 36, -20],
    hemiSkyColor: '#4c66a8',
    hemiGroundColor: '#121726',
    hemiIntensity: 0.55,
    windowEmissiveIntensity: 1.45,
    lanternIntensity: 2.2,
  },
};

export const CAMPUS_INTERACTABLES: CampusInteractable[] = [
  // ==========================================================================
  // CLASS B — Balanced Leadership & Orientation Class
  // ==========================================================================
  {
    id: 'npc_hana',
    name: 'Aiko Hoshino',
    role: 'Class B Representative · Orientation Guide',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class B',
    personalityType: 'Friendly',
    currentGoal: 'Help the new transfer student settle in and connect Classes A, B, C, and D.',
    longTermGoal: 'Unite all four classes for the Hoshino Cultural Festival and restore the school archive.',
    emotionalState: 'Warm & Welcoming',
    currentActivity: 'Guiding orientation around the Courtyard Fountain & Main Hall',
    position: { x: -3.4, y: 0, z: 14.8 },
    facingYaw: 0.35,
    interactionRadius: 3.8,
    hairColor: 0x312e81,
    blazerColor: 0x1e293b,
    accentColor: 0xf43f5e,
    walkSpeed: 1.85,
    rewardItemName: 'Hoshino Orientation Guidebook',
    greetingAnim: 'bow',
    greetingText: '🙇‍♀️ bows warmly · "Welcome to Hoshino Academy! Ready for your Class A–D campus orientation?"',
    persona:
      'Friendly, observant, welcoming Class B Representative and Campus Orientation Guide at Hoshino Academy. Helps the new transfer student learn campus routines, meet classmates across Classes A, B, C, and D, and notice historical clues.',
    patrolWaypoints: [
      { x: -3.4, y: 0, z: 14.8 },
      { x: -7.8, y: 0, z: 13.5 },
      { x: -7.5, y: 0, z: 5.5 },
      { x: -2.0, y: 0, z: -6.5 },
      { x: 11.5, y: 0, z: -15.5 },
      { x: -5.6, y: 0, z: 7.2 },
    ],
    dialogue: [
      {
        speaker: 'Aiko Hoshino',
        role: 'Class B Representative · Orientation Guide',
        text: 'Welcome to Hoshino Academy! I’m Aiko from Class B. Since today is your first day as a transfer student, let me show you around—the Main Hall doors ahead lead straight to the Class A Homeroom and our East Wing Library!',
        choices: [
          {
            label: 'Where should I go first for Phase 01 orientation?',
            nextLineIndex: 1,
            reputationBonus: 15,
          },
          {
            label: 'What is that faded star emblem near the main portico?',
            nextLineIndex: 2,
            reputationBonus: 15,
          },
        ],
      },
      {
        speaker: 'Aiko Hoshino',
        role: 'Class B Representative · Orientation Guide',
        text: 'Walk through the central portico into the Main Hall: turn left (West) for the Class A Homeroom to meet Sensei Takeda, or right (East) for the Library where Mika from Class C is researching old club records!',
      },
      {
        speaker: 'Aiko Hoshino',
        role: 'Class B Representative · Orientation Guide',
        text: 'You noticed it too! That faded star emblem belongs to "Project Hoshikaze"—an old project built by students from Class A, Class B, Class C, and Class D. Mika found a reference to it in the Library!',
      },
    ],
  },
  {
    id: 'npc_kaito',
    name: 'Kaito Sato',
    role: 'Class B · Festival & Dormitory Chair',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class B',
    personalityType: 'Confident',
    currentGoal: 'Recruit classmates to help decorate the Festival Amphitheater and Student Dormitory.',
    longTermGoal: 'Host the biggest inter-class cultural showcase in Hoshino Academy history.',
    emotionalState: 'Energetic & Upbeat',
    currentActivity: 'Checking Festival banners between the Courtyard and Dormitory',
    position: { x: 4.6, y: 0, z: 7.5 },
    facingYaw: -0.8,
    interactionRadius: 3.8,
    hairColor: 0xb45309,
    blazerColor: 0x1e293b,
    accentColor: 0x10b981,
    walkSpeed: 2.05,
    rewardItemName: 'Hoshino Festival Exhibit Pass',
    greetingAnim: 'cheer',
    greetingText: '✌️ cheers · "Hey! Class B is coordinating the Dormitory welcome and Cultural Festival stage!"',
    persona:
      'Confident, cheerful Class B Festival & Dormitory Coordinator at Hoshino Academy. Organizes festival preparations and welcomes students to the 4-story West Dormitory Hall.',
    patrolWaypoints: [
      { x: 4.6, y: 0, z: 7.5 },
      { x: 3.2, y: 0, z: -1.8 },
      { x: -2.5, y: 0, z: 2.2 },
      { x: -4.2, y: 0, z: 16.8 },
      { x: 3.8, y: 0, z: 17.2 },
    ],
    dialogue: [
      {
        speaker: 'Kaito Sato',
        role: 'Class B · Festival & Dormitory Chair',
        text: 'Yo! Welcome to Hoshino Academy! Class B is teaming up with Classes A, C, and D to run the 4-story Student Dormitory and the Cultural Festival stage!',
        choices: [
          {
            label: 'I’ll help prepare the inter-class Festival exhibit!',
            nextLineIndex: 1,
            reputationBonus: 15,
          },
          {
            label: 'Where is the Student Dormitory located?',
            nextLineIndex: 1,
            reputationBonus: 12,
          },
        ],
      },
      {
        speaker: 'Kaito Sato',
        role: 'Class B · Festival & Dormitory Chair',
        text: 'The 4-story Student Dormitory Hall stands northwest of the Cafeteria Pavilion! While moving display frames there, we found an old blueprint index tied to Project Hoshikaze!',
      },
    ],
  },
  {
    id: 'npc_daichi',
    name: 'Daichi Mori',
    role: 'Class B · Sports & Gymnasium Captain',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class B',
    personalityType: 'Calm',
    currentGoal: 'Keep the East Gymnasium equipment ready for inter-class matches.',
    longTermGoal: 'Help Class B win the seasonal sportsmanship cup fairly.',
    emotionalState: 'Steady & Focused',
    currentActivity: 'Inspecting the East Gymnasium court & walkway',
    position: { x: 25.0, y: 0, z: 8.5 },
    facingYaw: -1.5,
    interactionRadius: 3.8,
    hairColor: 0x1e293b,
    blazerColor: 0x1e293b,
    accentColor: 0x10b981,
    walkSpeed: 1.95,
    rewardItemName: 'Gymnasium Practice Wristband',
    greetingAnim: 'nod',
    greetingText: '🏀 nods calmly · "East Gymnasium is open for Class A, B, C, and D practice."',
    persona:
      'Calm, dependable Class B Sports & Gymnasium Captain. Balances Ren’s intense rivalry with steady teamwork.',
    patrolWaypoints: [
      { x: 25.0, y: 0, z: 8.5 },
      { x: 28.0, y: 0, z: 15.0 },
      { x: 20.0, y: 0, z: 16.0 },
      { x: 18.0, y: 0, z: 6.0 },
    ],
    dialogue: [
      {
        speaker: 'Daichi Mori',
        role: 'Class B · Sports & Gymnasium Captain',
        text: 'Welcome to the East Gymnasium plaza. Whether you’re in Class A, B, C, or D, consistent practice builds both Sports and Leadership skills.',
        choices: [
          {
            label: '🏀 Practice Gymnasium drills with Daichi (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Daichi Mori',
        role: 'Class B · Sports & Gymnasium Captain',
        text: 'Solid form! Take this Gymnasium Practice Wristband—it’ll help when you challenge Ren on the North Track.',
      },
    ],
  },

  // ==========================================================================
  // CLASS A — Top Academic & Competitive Class
  // ==========================================================================
  {
    id: 'npc_ren',
    name: 'Ren Takahashi',
    role: 'Class A Representative · Academic & Track Rival',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class A',
    personalityType: 'Competitive',
    currentGoal: 'Keep Class A at #1 in Class Points and test the new transfer student’s resolve.',
    longTermGoal: 'Honor his mentor’s legacy by uncovering the truth of the Project Hoshikaze solar chronometer.',
    emotionalState: 'Determined & Motivated',
    currentActivity: 'Briskly pacing between the Courtyard and North Track for speed trials',
    position: { x: 7.2, y: 0, z: 19.5 },
    facingYaw: -0.55,
    interactionRadius: 3.8,
    hairColor: 0x7c2d12,
    blazerColor: 0x172554,
    accentColor: 0x38bdf8,
    walkSpeed: 2.55,
    rewardItemName: 'Rival Challenge Chronometer Pin',
    greetingAnim: 'nod',
    greetingText: '💪 nods sharply · "Class A doesn’t hold back. Ready to test your academics and speed?"',
    persona:
      'Competitive, disciplined, and blunt but fair Class A Representative at Hoshino Academy. Motivates the player through academic challenges, sports trials on the North Track, and shares a mentor connection to Project Hoshikaze.',
    patrolWaypoints: [
      { x: 7.2, y: 0, z: 19.5 },
      { x: 8.5, y: 0, z: 11.0 },
      { x: 8.2, y: 0, z: 2.5 },
      { x: 4.5, y: 0, z: 14.5 },
      { x: 6.8, y: 0, z: 25.0 },
    ],
    dialogue: [
      {
        speaker: 'Ren Takahashi',
        role: 'Class A Representative · Academic & Track Rival',
        text: 'So you’re the new transfer student. As Class A Representative, I expect everyone at Hoshino Academy to give their best in classroom quizzes and track trials. Up for a fair challenge?',
        choices: [
          {
            label: 'Accept Ren’s Class A academic & track challenge!',
            nextLineIndex: 1,
            reputationBonus: 15,
          },
          {
            label: 'Did your mentor know about Project Hoshikaze?',
            nextLineIndex: 2,
            reputationBonus: 15,
          },
        ],
      },
      {
        speaker: 'Ren Takahashi',
        role: 'Class A Representative · Academic & Track Rival',
        text: 'That’s the spirit! Test your focus with Sensei Takeda in the Class A Homeroom and run the 100m trial on the North Athletic Track!',
      },
      {
        speaker: 'Ren Takahashi',
        role: 'Class A Representative · Academic & Track Rival',
        text: 'Yeah… an old campus photograph shows my track mentor standing beside the original Project Hoshikaze solar chronometer. If you and Mika check the archive records, count Class A in.',
      },
    ],
  },
  {
    id: 'npc_mei',
    name: 'Mei Lin',
    role: 'Class A · Culinary & Hospitality Lead',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class A',
    personalityType: 'Confident',
    currentGoal: 'Prepare nutritious lunch bentos and festival treats at the West Cafeteria.',
    longTermGoal: 'Prove that culinary artistry and science go hand in hand.',
    emotionalState: 'Cheerful & Hospitable',
    currentActivity: 'Coordinating lunch menus outside the West Cafeteria Hall',
    position: { x: -24.5, y: 0, z: 8.0 },
    facingYaw: 1.2,
    interactionRadius: 4.2,
    hairColor: 0x9d174d,
    blazerColor: 0x172554,
    accentColor: 0xf97316,
    walkSpeed: 1.85,
    rewardItemName: 'Hoshino Lunch Bento',
    greetingAnim: 'wave',
    greetingText: '🍱 waves happily · "Fresh Class A culinary bentos and festival sweets at the Cafeteria!"',
    persona:
      'Confident, hospitable Class A Culinary Club President at Hoshino Academy. Runs lunch routines and shares stories from the West Cafeteria Hall.',
    patrolWaypoints: [
      { x: -24.5, y: 0, z: 8.0 },
      { x: -18.5, y: 0, z: 11.0 },
      { x: -14.0, y: 0, z: 14.5 },
      { x: -22.0, y: 0, z: 13.5 },
    ],
    dialogue: [
      {
        speaker: 'Mei Lin',
        role: 'Class A · Culinary & Hospitality Lead',
        text: 'Welcome to the grand West Cafeteria Hall! Students from Class A, B, C, and D gather here at lunch to compare notes on classes and the school festival.',
        choices: [
          {
            label: '🍱 Enjoy Daily Lunch Bento (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
          {
            label: 'Can I help prepare the Festival food booth?',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
        ],
      },
      {
        speaker: 'Mei Lin',
        role: 'Class A · Culinary & Hospitality Lead',
        text: 'Thank you! Here is a warm Hoshino Lunch Bento for your bag. Check your Story Chronicle or Character Profile anytime to track your Class Points!',
      },
    ],
  },
  {
    id: 'npc_akari',
    name: 'Akari Shinohara',
    role: 'Class A · Honors Quiz & Debate Captain',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class A',
    personalityType: 'Intelligent',
    currentGoal: 'Review historical exam archives inside the Main Hall.',
    longTermGoal: 'Catalog every academic competition between Classes A, B, C, and D.',
    emotionalState: 'Analytical & Polite',
    currentActivity: 'Reviewing study notes near the Main Hall Entrance',
    position: { x: -1.8, y: 0, z: -12.5 },
    facingYaw: 0.2,
    interactionRadius: 3.8,
    hairColor: 0x0f172a,
    blazerColor: 0x172554,
    accentColor: 0x38bdf8,
    walkSpeed: 1.65,
    rewardItemName: 'Class A Honors Study Guide',
    greetingAnim: 'bow',
    greetingText: '📘 adjusts notes politely · "Studying the Hoshino curriculum? Let’s review together."',
    persona:
      'Intelligent, analytical Class A Honors Quiz & Debate Captain. Respects students who prepare thoroughly for exams and archive investigations.',
    patrolWaypoints: [
      { x: -1.8, y: 0, z: -12.5 },
      { x: -8.5, y: 0, z: -15.5 },
      { x: 2.0, y: 0, z: -15.5 },
      { x: 0.0, y: 0, z: -7.5 },
    ],
    dialogue: [
      {
        speaker: 'Akari Shinohara',
        role: 'Class A · Honors Quiz & Debate Captain',
        text: 'Good day. In Class A, we value precision and evidence. While reviewing old debate transcripts in the lobby, I found a reference to an inter-class presentation called Project Hoshikaze.',
        choices: [
          {
            label: '📘 Review Class A Honors Study Notes (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Akari Shinohara',
        role: 'Class A · Honors Quiz & Debate Captain',
        text: 'Impressive reasoning. Take this Class A Honors Study Guide—it boosts your Academics and Problem Solving skills!',
      },
    ],
  },

  // ==========================================================================
  // CLASS C — Creative, Arts & Archive Research Class
  // ==========================================================================
  {
    id: 'npc_aoi',
    name: 'Mika Aozora',
    role: 'Class C Representative · Art & Archive Researcher',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class C',
    personalityType: 'Creative',
    currentGoal: 'Sketch the faded campus emblems and piece together the Project Hoshikaze library records.',
    longTermGoal: 'Curate the restored Project Hoshikaze exhibition at the Hoshino Cultural Festival.',
    emotionalState: 'Curious & Inspired',
    currentActivity: 'Sketching architectural clues between the Courtyard and East Wing Library',
    position: { x: -8.5, y: 0, z: 1.5 },
    facingYaw: 0.7,
    interactionRadius: 3.8,
    hairColor: 0x0f766e,
    blazerColor: 0x1e293b,
    accentColor: 0xa855f7,
    walkSpeed: 1.55,
    rewardItemName: 'Mika’s Archive Clue Sketchbook',
    greetingAnim: 'wave',
    greetingText: '🎨 waves thoughtfully · "Hi! Class C found a fascinating clue in the East Library records!"',
    persona:
      'Creative, thoughtful, and curious Class C Representative at Hoshino Academy. Introduces art, clubs, campus culture, and uncovers clues hidden in old library books and school festival materials.',
    patrolWaypoints: [
      { x: -8.5, y: 0, z: 1.5 },
      { x: -2.2, y: 0, z: -4.2 },
      { x: 1.2, y: 0, z: -14.5 },
      { x: 11.5, y: 0, z: -15.8 },
      { x: -3.8, y: 0, z: 4.8 },
    ],
    dialogue: [
      {
        speaker: 'Mika Aozora',
        role: 'Class C Representative · Art & Archive Researcher',
        text: 'Hello! I’m Mika from Class C. I was sketching in the East Wing Library when I found a faded catalogue card about "Project Hoshikaze"—a forgotten student-led research project!',
        choices: [
          {
            label: 'Let’s compare clues about the forgotten project!',
            nextLineIndex: 1,
            reputationBonus: 15,
          },
          {
            label: 'Tell me about Class C and the Arts & Club spaces.',
            nextLineIndex: 2,
            reputationBonus: 15,
          },
        ],
      },
      {
        speaker: 'Mika Aozora',
        role: 'Class C Representative · Art & Archive Researcher',
        text: 'Look at this note: the project records were divided between our Library Archive, the Town District station ledger, and the East Research Centre during a renovation. We should ask Sensei Takeda for permission to inspect the cabinet!',
      },
      {
        speaker: 'Mika Aozora',
        role: 'Class C Representative · Art & Archive Researcher',
        text: 'Class C loves art, photography, and history! Take my Archive Clue Sketchbook so we can track every discovery across all 9 phases together.',
      },
    ],
  },
  {
    id: 'npc_haruto',
    name: 'Haruto Kurosawa',
    role: 'Class C · Town District & Transit Guide',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class C',
    personalityType: 'Curious',
    currentGoal: 'Trace the old teacher’s transit ledger between the South Gate and Hoshino Train Station.',
    longTermGoal: 'Connect Hoshino Academy’s clubs with the surrounding Town District community.',
    emotionalState: 'Adventurous & Friendly',
    currentActivity: 'Patrolling the South Town Boulevard and Train Station plaza',
    position: { x: 0.0, y: 0, z: 62.0 },
    facingYaw: 3.14,
    interactionRadius: 4.4,
    hairColor: 0x1e293b,
    blazerColor: 0x0f172a,
    accentColor: 0x06b6d4,
    walkSpeed: 2.15,
    rewardItemName: 'Town Archive Transit Ledger',
    greetingAnim: 'cheer',
    greetingText: '🚆 salutes · "Welcome to the Town District Boulevard and Hoshino Train Station!"',
    persona:
      'Curious, street-smart Class C member of the Community & Rail Club. Guides students visiting the South Town District shops, public square, and Hoshino Train Station.',
    patrolWaypoints: [
      { x: 0.0, y: 0, z: 62.0 },
      { x: -5.5, y: 0, z: 74.0 },
      { x: 0.0, y: 0, z: 88.5 },
      { x: 5.5, y: 0, z: 74.0 },
      { x: 0.0, y: 0, z: 50.0 },
    ],
    dialogue: [
      {
        speaker: 'Haruto Kurosawa',
        role: 'Class C · Town District & Transit Guide',
        text: 'Welcome beyond the campus gates to the Hoshino Town District! Down this boulevard is the Town Public Square and the Hoshino Train Station—where a former teacher left a logbook about Project Hoshikaze!',
        choices: [
          {
            label: '🚆 Inspect the Former Teacher’s Station Ledger (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
          {
            label: 'Where does the Train Station lead point?',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Haruto Kurosawa',
        role: 'Class C · Town District & Transit Guide',
        text: 'The station ledger confirms that the weather and astronomy instruments from the student project were delivered safely to the East Hoshino Research Centre!',
      },
    ],
  },
  {
    id: 'npc_riku',
    name: 'Riku Hayakawa',
    role: 'Class C · Photography & Astronomy Archivist',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class C',
    personalityType: 'Introverted',
    currentGoal: 'Photograph the 36m Clock Tower belfry shadow alignment at golden hour.',
    longTermGoal: 'Reconstruct the original star-chart plates from Project Hoshikaze.',
    emotionalState: 'Quiet & Observant',
    currentActivity: 'Quietly observing the Clock Tower and Sakura Promenade',
    position: { x: -14.5, y: 0, z: 20.0 },
    facingYaw: 0.4,
    interactionRadius: 3.8,
    hairColor: 0x334155,
    blazerColor: 0x1e293b,
    accentColor: 0xa855f7,
    walkSpeed: 1.45,
    rewardItemName: 'Clock Tower Telephoto Print',
    greetingAnim: 'nod',
    greetingText: '📷 nods quietly · "If you look closely at the Clock Tower dial, you can see the old star engraving..."',
    persona:
      'Introverted, observant Class C photographer who notices visual details on campus buildings that others walk past.',
    patrolWaypoints: [
      { x: -14.5, y: 0, z: 20.0 },
      { x: -15.5, y: 0, z: 10.0 },
      { x: -9.5, y: 0, z: 18.0 },
    ],
    dialogue: [
      {
        speaker: 'Riku Hayakawa',
        role: 'Class C · Photography & Astronomy Archivist',
        text: 'Oh… hello. I’m Riku from Class C. I don’t talk much, but my camera lens caught an engraving high on the 36m Clock Tower spire that matches the Research Centre dome.',
        choices: [
          {
            label: '📷 Examine Riku’s Clock Tower photograph (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Riku Hayakawa',
        role: 'Class C · Photography & Astronomy Archivist',
        text: 'Here—take a print for your clue log. Your Observation skill just grew stronger.',
      },
    ],
  },

  // ==========================================================================
  // CLASS D — Rising Underdog & Discovery Class
  // ==========================================================================
  {
    id: 'npc_sora',
    name: 'Sora Amamiya',
    role: 'Class D Representative · Research & Aquatics Lead',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class D',
    personalityType: 'Curious',
    currentGoal: 'Show that Class D can lead scientific discoveries at the East Research Centre.',
    longTermGoal: 'Restore the Project Hoshikaze meteorological dome instruments to full operation.',
    emotionalState: 'Spirited & Determined',
    currentActivity: 'Checking instruments between the East Aquatics Pool and Research Centre Dome',
    position: { x: 54.5, y: 0, z: 8.0 },
    facingYaw: -1.57,
    interactionRadius: 4.4,
    hairColor: 0x0284c7,
    blazerColor: 0x1e293b,
    accentColor: 0x38bdf8,
    walkSpeed: 2.0,
    rewardItemName: 'Research Centre Instrument Log',
    greetingAnim: 'wave',
    greetingText: '🔬 waves brightly · "Welcome to the East Aquatics Deck and Hoshino Research Centre!"',
    persona:
      'Spirited, observant Class D Representative and coordinator of the East Aquatics Complex and the Hoshino Research Centre Dome. Helps the player examine the preserved student project instruments.',
    patrolWaypoints: [
      { x: 54.5, y: 0, z: 8.0 },
      { x: 55.5, y: 0, z: 18.0 },
      { x: 55.5, y: 0, z: -2.0 },
      { x: 52.0, y: 0, z: -14.0 },
    ],
    dialogue: [
      {
        speaker: 'Sora Amamiya',
        role: 'Class D Representative · Research & Aquatics Lead',
        text: 'Welcome to the East Campus! As Class D Representative, I’m proud to look after our 25m Aquatics Pool and the silver-domed Hoshino Research Centre where the old student project instruments are preserved!',
        choices: [
          {
            label: '🔬 Examine the Project Hoshikaze Exhibits (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
        ],
      },
      {
        speaker: 'Sora Amamiya',
        role: 'Class D Representative · Research & Aquatics Lead',
        text: 'Here is the Research Centre Instrument Log! It proves that students from Class A, Class B, Class C, and Class D built the weather chronometer together.',
      },
    ],
  },
  {
    id: 'npc_yuki',
    name: 'Yuki Shirakawa',
    role: 'Class D · Mountain Shrine & Botanical Keeper',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Class D',
    personalityType: 'Calm',
    currentGoal: 'Care for the West Koi Garden and the torii path leading to the North Mountain Shrine.',
    longTermGoal: 'Preserve the peaceful traditions and dedication scrolls of Hoshino Academy.',
    emotionalState: 'Serene & Reflective',
    currentActivity: 'Tending the West Koi Garden Bridge & Shrine path',
    position: { x: -53.5, y: 0, z: 8.0 },
    facingYaw: 1.57,
    interactionRadius: 4.4,
    hairColor: 0x4c1d95,
    blazerColor: 0x1e293b,
    accentColor: 0xf43f5e,
    walkSpeed: 1.65,
    rewardItemName: 'Mountain Shrine Dedication Scroll',
    greetingAnim: 'bow',
    greetingText: '⛩️ bows serenely · "Welcome to the Koi Garden Bridge and Mountain Shrine path."',
    persona:
      'Serene, reflective Class D keeper of the West Koi Garden and the North Mountain Shrine. Guides the player to the reflective clue in Story 06 and Story 08.',
    patrolWaypoints: [
      { x: -53.5, y: 0, z: 8.0 },
      { x: -66.0, y: 0, z: 8.0 },
      { x: -78.0, y: 0, z: 8.0 },
      { x: -66.0, y: 0, z: 8.0 },
      { x: -55.0, y: 0, z: -12.0 },
    ],
    dialogue: [
      {
        speaker: 'Yuki Shirakawa',
        role: 'Class D · Mountain Shrine & Botanical Keeper',
        text: 'Welcome! Between this quiet Koi Pond Bridge and the North Mountain Shrine, past students from Classes A–D left a dedication scroll explaining their hope that future classmates would reunite the Hoshino records.',
        choices: [
          {
            label: '⛩️ Read the Mountain Shrine Dedication Scroll (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
        ],
      },
      {
        speaker: 'Yuki Shirakawa',
        role: 'Class D · Mountain Shrine & Botanical Keeper',
        text: 'You now hold the Mountain Shrine Dedication Scroll! With Aiko, Ren, Mika, and Sora beside you, you have everything needed to restore the academy’s history.',
      },
    ],
  },
  {
    id: 'npc_kenzo',
    name: 'Kenzo Fujimoto',
    role: 'Class D · Strategy & Problem-Solving Lead',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Class D',
    personalityType: 'Intelligent',
    currentGoal: 'Help Class D climb the Class Points leaderboard through smart puzzle solving.',
    longTermGoal: 'Prove that resourcefulness matters just as much as starting rank.',
    emotionalState: 'Composed & Perceptive',
    currentActivity: 'Analyzing noticeboard schedules near the West Wing',
    position: { x: -16.0, y: 0, z: 11.5 },
    facingYaw: 0.9,
    interactionRadius: 3.8,
    hairColor: 0x1e1b4b,
    blazerColor: 0x1e293b,
    accentColor: 0x10b981,
    walkSpeed: 1.75,
    rewardItemName: 'Class D Tactical Notebook',
    greetingAnim: 'nod',
    greetingText: '♟️ nods thoughtfully · "Every class has a strength. Have you checked the Class Points standings?"',
    persona:
      'Intelligent, perceptive Class D strategist who enjoys logic puzzles and helping underdog students succeed.',
    patrolWaypoints: [
      { x: -16.0, y: 0, z: 11.5 },
      { x: -10.0, y: 0, z: 11.5 },
      { x: -14.0, y: 0, z: 4.5 },
    ],
    dialogue: [
      {
        speaker: 'Kenzo Fujimoto',
        role: 'Class D · Strategy & Problem-Solving Lead',
        text: 'I’m Kenzo from Class D. Many people underestimate Class D at first, but when it comes to logic puzzles and uncovering hidden archive connections, we never miss a clue.',
        choices: [
          {
            label: '♟️ Solve a logic puzzle with Kenzo (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Kenzo Fujimoto',
        role: 'Class D · Strategy & Problem-Solving Lead',
        text: 'Sharp deduction! Take this Class D Tactical Notebook—it’ll help you connect the Library, Town, and Research Centre records.',
      },
    ],
  },

  // ==========================================================================
  // TEACHERS & FACULTY ADVISORS
  // ==========================================================================
  {
    id: 'npc_takeda',
    name: 'Sensei Kenji Takeda',
    role: 'Homeroom Advisor · Class A & Archive Supervisor',
    kind: 'npc',
    gender: 'male',
    academyClass: 'Faculty',
    personalityType: 'Calm',
    currentGoal: 'Guide the new transfer student through homeroom lessons and archive ethics.',
    longTermGoal: 'See the current generation of Class A, B, C, and D students reunite Project Hoshikaze.',
    emotionalState: 'Supportive & Wise',
    currentActivity: 'Teaching homeroom & supervising archives in Class A',
    position: { x: -13.8, y: 0, z: -17.8 },
    facingYaw: 0,
    interactionRadius: 4.2,
    hairColor: 0x334155,
    blazerColor: 0x0f172a,
    accentColor: 0xf59e0b,
    walkSpeed: 1.25,
    rewardItemName: 'Official Archive Permission Pass',
    greetingAnim: 'nod',
    greetingText: '🎓 nods warmly · "Welcome to the Class A Homeroom! Ready for today’s quiz or archive inquiry?"',
    persona:
      'Warm, wise, supportive Homeroom Teacher of Class A and Archive Advisor at Hoshino Academy. Conducts homeroom quizzes, upholds school rules, and grants official permission to inspect historical archive records.',
    patrolWaypoints: [
      { x: -13.8, y: 0, z: -18.2 },
      { x: -11.2, y: 0, z: -18.2 },
      { x: -16.5, y: 0, z: -18.2 },
    ],
    dialogue: [
      {
        speaker: 'Sensei Kenji Takeda',
        role: 'Homeroom Advisor · Class A & Archive Supervisor',
        text: 'Welcome to the Class A Homeroom at Hoshino Academy! Whether you are here for today’s class quiz or asking for official permission to research the old student project records, I am glad to help.',
        choices: [
          {
            label: '🎓 Take Class Quiz: Hoshino Academy History (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
          {
            label: '📜 Request Official Permission for the Archive Records',
            nextLineIndex: 2,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Sensei Kenji Takeda',
        role: 'Homeroom Advisor · Class A & Archive Supervisor',
        text: 'Question: How should students from Class A, B, C, and D investigate the historical Project Hoshikaze records at Hoshino Academy?',
        choices: [
          {
            label: '✓ With official staff permission, teamwork, and verified clues',
            nextLineIndex: 2,
            reputationBonus: 25,
          },
          {
            label: 'By trespassing into locked rooms at night',
            nextLineIndex: 2,
            reputationBonus: 10,
          },
        ],
      },
      {
        speaker: 'Sensei Kenji Takeda',
        role: 'Homeroom Advisor · Class A & Archive Supervisor',
        text: 'Well answered! Because you respected campus rules and worked thoughtfully with Aiko, Ren, and Mika, here is your Official Archive Permission Pass to inspect the Library, Town District, and Research Centre records!',
      },
    ],
  },
  {
    id: 'npc_kuroda',
    name: 'Sensei Emi Kuroda',
    role: 'Faculty Advisor · Science & Research Archive',
    kind: 'npc',
    gender: 'female',
    academyClass: 'Faculty',
    personalityType: 'Intelligent',
    currentGoal: 'Supervise the East Wing Library Archive and Research Centre instrumentation.',
    longTermGoal: 'Help students publish the restored Project Hoshikaze meteorological data.',
    emotionalState: 'Encouraging & Scholarly',
    currentActivity: 'Reviewing archive ledgers inside the East Wing Library',
    position: { x: 14.2, y: 0, z: -18.5 },
    facingYaw: 0,
    interactionRadius: 4.0,
    hairColor: 0x1e293b,
    blazerColor: 0x0f172a,
    accentColor: 0x38bdf8,
    walkSpeed: 1.3,
    rewardItemName: 'Faculty Science Seal',
    greetingAnim: 'bow',
    greetingText: '🔬 bows politely · "Welcome to the East Wing Library & Archive Room."',
    persona:
      'Scholarly, encouraging Science & Archive Faculty Advisor who oversees the Locked Archive Cabinet and East Research Centre.',
    patrolWaypoints: [
      { x: 14.2, y: 0, z: -18.5 },
      { x: 10.5, y: 0, z: -18.5 },
      { x: 17.5, y: 0, z: -16.0 },
    ],
    dialogue: [
      {
        speaker: 'Sensei Emi Kuroda',
        role: 'Faculty Advisor · Science & Research Archive',
        text: 'Welcome to the East Wing Library. Right behind me stands the Locked Archive Cabinet where the original Project Hoshikaze charter is stored.',
        choices: [
          {
            label: '🔬 Inspect the Archive Charter with Sensei Kuroda (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
        ],
      },
      {
        speaker: 'Sensei Emi Kuroda',
        role: 'Faculty Advisor · Science & Research Archive',
        text: 'Wonderful curiosity! Here is the Faculty Science Seal confirming your inspection of the Library Archive.',
      },
    ],
  },

  // ==========================================================================
  // INTERACTIVE CAMPUS LANDMARKS
  // ==========================================================================
  {
    id: 'landmark_chalkboard',
    name: 'Class A Homeroom Chalkboard',
    role: 'Homeroom Lesson & Archive Timeline',
    kind: 'landmark',
    position: { x: -14.2, y: 0, z: -20.6 },
    facingYaw: 0,
    interactionRadius: 4.0,
    hairColor: 0x10b981,
    blazerColor: 0x14452f,
    accentColor: 0xfbbf24,
    rewardItemName: 'Homeroom Study Notes',
    dialogue: [
      {
        speaker: 'Class A Homeroom Chalkboard',
        role: 'Daily Lesson & Archive Timeline',
        text: 'TODAY’S LESSON: "The Four Classes of Hoshino Academy (Class A, B, C, D) & Student Community Projects." Copying the lesson notes awards +20 XP and unlocks new Story Chronicle clues!',
        choices: [
          {
            label: '✍️ Copy Homeroom Lesson Notes (+20 XP)',
            nextLineIndex: 1,
            reputationBonus: 20,
          },
        ],
      },
      {
        speaker: 'Class A Homeroom Chalkboard',
        role: 'Daily Lesson & Archive Timeline',
        text: 'Notes recorded! Check the 📖 Story button in the top bar to answer your current phase checkpoint or open the Story Library.',
      },
    ],
  },
  {
    id: 'landmark_track_banner',
    name: 'North Track Rivalry Trial',
    role: 'Ren’s Athletics Skill Challenge',
    kind: 'landmark',
    position: { x: 0, y: 0, z: -32.0 },
    facingYaw: 0,
    interactionRadius: 4.5,
    hairColor: 0x38bdf8,
    blazerColor: 0x0f172a,
    accentColor: 0x38bdf8,
    rewardItemName: 'Hoshino Track Merit Ribbon',
    dialogue: [
      {
        speaker: 'North Track Finish Line',
        role: 'Class A–D Friendly Rivalry Trial',
        text: 'Welcome to the North Athletics Stadium! Run a practice sprint trial with Ren—win or lose, every practice run builds your Sports skill and awards +25 XP!',
        choices: [
          {
            label: '🏃 Run Friendly 100m Sprint Trial (+25 XP)',
            nextLineIndex: 1,
            reputationBonus: 25,
          },
        ],
      },
      {
        speaker: 'North Track Finish Line',
        role: 'Class A–D Friendly Rivalry Trial',
        text: 'Great stride! Ren nods in respect and shares a clue about his mentor’s photograph from the old student research project.',
      },
    ],
  },
  {
    id: 'landmark_notice_board',
    name: 'Hoshino Campus Noticeboard',
    role: 'Daily Schedule & Class Standings',
    kind: 'landmark',
    position: { x: 4.8, y: 0, z: -5.8 },
    facingYaw: 0,
    interactionRadius: 4.0,
    hairColor: 0xfbbf24,
    blazerColor: 0x334155,
    accentColor: 0xfbbf24,
    rewardItemName: 'Noticeboard Archive Clipping',
    dialogue: [
      {
        speaker: 'Hoshino Campus Noticeboard',
        role: 'Official Campus & Class A–D Directory',
        text: 'HOSHINO ACADEMY DIRECTORY: Classes A, B, C & D · Central Campus (4-Story Main Hall, Class A Homeroom, Library, Cafeteria, Gym, Dormitory) · Beyond Campus (South Town District & Train Station, East Research Centre, North Mountain Shrine). Pinned in the corner is a faded clipping about Project Hoshikaze!',
      },
    ],
  },
];

export function createInitialNpcRelationships(): Record<string, NPCRelationshipState> {
  const map: Record<string, NPCRelationshipState> = {};
  for (const item of CAMPUS_INTERACTABLES) {
    if (item.kind !== 'npc') continue;
    map[item.id] = {
      npcId: item.id,
      friendship: item.id === 'npc_hana' ? 35 : 20,
      trust: item.id === 'npc_hana' || item.id === 'npc_takeda' ? 30 : 18,
      respect: item.id === 'npc_ren' ? 25 : 20,
      rivalry: item.id === 'npc_ren' ? 40 : 5,
      familiarity: item.id === 'npc_hana' ? 30 : 15,
      memories: [
        `Met ${item.name} (${item.academyClass ?? 'Campus'}) upon arriving at Hoshino Academy.`,
      ],
    };
  }
  return map;
}

export const NPC_AMBIENT_BANTERS: AmbientNpcBanter[] = [
  {
    id: 'banter_aiko_mika',
    speakerA: 'Aiko Hoshino',
    speakerB: 'Mika Aozora',
    lineA: 'Mika, did Class C find another reference to Project Hoshikaze in the library archive?',
    lineB: 'Yes! Once Sensei Takeda gives us permission, Class B and Class C can compare it with the Town Station log!',
  },
  {
    id: 'banter_ren_aiko',
    speakerA: 'Ren Takahashi',
    speakerB: 'Aiko Hoshino',
    lineA: 'Aiko, the new transfer student has impressive focus in Class A Homeroom and on the track.',
    lineB: 'Right? Together across Classes A, B, C, and D we’ll make this year’s Cultural Festival unforgettable!',
  },
  {
    id: 'banter_sora_yuki',
    speakerA: 'Sora Amamiya',
    speakerB: 'Yuki Shirakawa',
    lineA: 'Yuki, Class D’s instruments inside the expanded Hoshino Research Centre dome are ready for inspection!',
    lineB: 'Wonderful, Sora! The dedication scroll at the Mountain Shrine connects right to them.',
  },
  {
    id: 'banter_haruto_kaito',
    speakerA: 'Haruto Kurosawa',
    speakerB: 'Kaito Sato',
    lineA: 'Kaito, the commuter train just arrived at Hoshino Station on the South Town Boulevard!',
    lineB: 'Awesome! The 4-story Dormitory and Town Square look so grand from the main gate.',
  },
];

export const CAMPUS_AABB_COLLIDERS: AABBCollider2D[] = [
  // Main Academic Building Front South Wall (Thick 0.9m collider, split at x = -2.6..+2.6 for open Front Doors)
  { id: 'main_front_left', minX: -23.2, maxX: -2.6, minZ: -10.25, maxZ: -9.35 },
  { id: 'main_front_right', minX: 2.6, maxX: 23.2, minZ: -10.25, maxZ: -9.35 },

  // Main Academic Building Back North Wall (Thick 0.9m collider, split at x = -2.6..+2.6 for open Rear Doors)
  { id: 'main_back_left', minX: -23.2, maxX: -2.6, minZ: -22.75, maxZ: -21.85 },
  { id: 'main_back_right', minX: 2.6, maxX: 23.2, minZ: -22.75, maxZ: -21.85 },

  // Main Academic Building Far West & Far East Exterior Walls (Thick 1.0m colliders)
  { id: 'main_west_wall', minX: -23.4, maxX: -22.3, minZ: -22.8, maxZ: -9.3 },
  { id: 'main_east_wall', minX: 22.3, maxX: 23.4, minZ: -22.8, maxZ: -9.3 },

  // Interior Partition Walls between Central Lobby and Class A Homeroom (West, x = -5.6)
  // Doorway open between z = -18.2 and z = -13.9
  { id: 'interior_west_part_south', minX: -6.0, maxX: -5.2, minZ: -13.9, maxZ: -9.5 },
  { id: 'interior_west_part_north', minX: -6.0, maxX: -5.2, minZ: -22.5, maxZ: -18.2 },

  // Interior Partition Walls between Central Lobby and Library/Council Room (East, x = +5.6)
  // Doorway open between z = -18.2 and z = -13.9
  { id: 'interior_east_part_south', minX: 5.2, maxX: 6.0, minZ: -13.9, maxZ: -9.5 },
  { id: 'interior_east_part_north', minX: 5.2, maxX: 6.0, minZ: -22.5, maxZ: -18.2 },

  // Interior Furniture Colliders: Shoe Lockers, Teacher Podium, Council Table, Library Bookshelves
  { id: 'lobby_locker_west', minX: -5.3, maxX: -4.4, minZ: -13.6, maxZ: -10.2 },
  { id: 'lobby_locker_east', minX: 4.4, maxX: 5.3, minZ: -13.6, maxZ: -10.2 },
  { id: 'classroom_podium', minX: -15.4, maxX: -13.0, minZ: -20.2, maxZ: -18.85 },
  { id: 'council_table', minX: 11.4, maxX: 17.0, minZ: -17.2, maxZ: -14.4 },
  { id: 'library_bookshelves', minX: 7.8, maxX: 20.6, minZ: -22.2, maxZ: -21.1 },

  // ALL 9 Class A Student Desks + Chairs (3 columns: -18.2, -14.2, -10.2 x 3 rows: -17.2, -15.0, -12.8)
  // Prevents walking through any student desk or chair while leaving 2.6m wide aisles between columns!
  { id: 'desk_c0_r0', minX: -18.9, maxX: -17.5, minZ: -17.65, maxZ: -16.15 },
  { id: 'desk_c0_r1', minX: -18.9, maxX: -17.5, minZ: -15.45, maxZ: -13.95 },
  { id: 'desk_c0_r2', minX: -18.9, maxX: -17.5, minZ: -13.25, maxZ: -11.75 },

  { id: 'desk_c1_r0', minX: -14.9, maxX: -13.5, minZ: -17.65, maxZ: -16.15 },
  { id: 'desk_c1_r1', minX: -14.9, maxX: -13.5, minZ: -15.45, maxZ: -13.95 },
  { id: 'desk_c1_r2', minX: -14.9, maxX: -13.5, minZ: -13.25, maxZ: -11.75 },

  { id: 'desk_c2_r0', minX: -10.9, maxX: -9.5, minZ: -17.65, maxZ: -16.15 },
  { id: 'desk_c2_r1', minX: -10.9, maxX: -9.5, minZ: -15.45, maxZ: -13.95 },
  { id: 'desk_c2_r2', minX: -10.9, maxX: -9.5, minZ: -13.25, maxZ: -11.75 },

  // Courtyard Benches (Full 3.2m x 0.85m rectangular colliders) & Notice Board
  { id: 'bench_west_box', minX: -6.95, maxX: -6.05, minZ: 8.35, maxZ: 11.65 },
  { id: 'bench_east_box', minX: 6.05, maxX: 6.95, minZ: 8.35, maxZ: 11.65 },
  { id: 'bench_north_box', minX: -1.65, maxX: 1.65, minZ: 3.05, maxZ: 3.95 },
  { id: 'bench_south_box', minX: -1.65, maxX: 1.65, minZ: 16.05, maxZ: 16.95 },
  { id: 'notice_board_box', minX: 3.7, maxX: 5.9, minZ: -6.1, maxZ: -5.5 },

  // West & East Side Wings (South of the Main Wing, enlarged 3-story wings)
  { id: 'west_wing', minX: -27.2, maxX: -14.8, minZ: -9.6, maxZ: 4.8 },
  { id: 'east_wing', minX: 14.8, maxX: 27.2, minZ: -9.6, maxZ: 4.8 },

  // Enlarged East Gymnasium Arena, West Cafeteria Hall, and Northwest 4-Story Student Dormitory Hall
  { id: 'gym_annex', minX: 30.2, maxX: 46.8, minZ: -3.2, maxZ: 19.2 },
  { id: 'cafe_pavilion', minX: -46.8, maxX: -30.8, minZ: -1.6, maxZ: 17.6 },
  // Dormitory exterior shell split around its south entrance.
  { id: 'student_dormitory_west_wall', minX: -54.5, maxX: -54.0, minZ: -44.0, maxZ: -25.0 },
  { id: 'student_dormitory_east_wall', minX: -36.0, maxX: -35.5, minZ: -44.0, maxZ: -25.0 },
  { id: 'student_dormitory_north_wall', minX: -54.5, maxX: -35.5, minZ: -44.0, maxZ: -43.5 },
  { id: 'student_dormitory_front_left', minX: -54.5, maxX: -48.0, minZ: -25.5, maxZ: -25.0 },
  { id: 'student_dormitory_front_right', minX: -42.0, maxX: -35.5, minZ: -25.5, maxZ: -25.0 },
  { id: 'dormitory_bed_west', minX: -51.6, maxX: -49.2, minZ: -37.9, maxZ: -34.5 },
  { id: 'dormitory_bed_east', minX: -40.8, maxX: -38.4, minZ: -37.9, maxZ: -34.5 },
  { id: 'dormitory_lounge_desk', minX: -48.0, maxX: -42.0, minZ: -41.6, maxZ: -40.4 },

  // South Perimeter Walls & Gate Pillars (leaving central gate open between -4.2 and +4.2)
  { id: 'south_wall_west', minX: -38.0, maxX: -4.2, minZ: 34.0, maxZ: 36.0 },
  { id: 'south_wall_east', minX: 4.2, maxX: 38.0, minZ: 34.0, maxZ: 36.0 },

  // --- EXPANDED HOSHINO WORLD COLLIDERS ---
  // South Hoshino Town District Multi-Story Buildings & Commuter Train at Station
  { id: 'west_town_shop', minX: -34.5, maxX: -17.5, minZ: 51.5, maxZ: 72.5 },
  { id: 'east_town_shop', minX: 17.5, maxX: 34.5, minZ: 51.5, maxZ: 72.5 },
  // Hoshino residential neighbourhood homes.
  { id: 'residential_home_west_south', minX: -53.2, maxX: -42.8, minZ: 56.2, maxZ: 65.8 },
  { id: 'residential_home_east_south', minX: 42.8, maxX: 53.2, minZ: 56.2, maxZ: 65.8 },
  { id: 'residential_home_west_north', minX: -53.2, maxX: -42.8, minZ: 75.2, maxZ: 84.8 },
  { id: 'residential_home_east_north', minX: 42.8, maxX: 53.2, minZ: 75.2, maxZ: 84.8 },
  { id: 'station_train', minX: -28.5, maxX: 28.5, minZ: 98.8, maxZ: 102.6 },

  // East Aquatics 25m Swimming Pool Basin (players walk on the surrounding deck without entering deep water)
  { id: 'swimming_pool_water', minX: 58.0, maxX: 74.0, minZ: -3.0, maxZ: 19.0 },

  // West Koi Pond Water (split North & South of the walkable Vermilion Bridge at z = 6.2..9.8)
  { id: 'koi_pond_north', minX: -75.0, maxX: -57.0, minZ: -4.0, maxZ: 6.2 },
  { id: 'koi_pond_south', minX: -75.0, maxX: -57.0, minZ: 9.8, maxZ: 20.0 },

  // Northwest Festival Amphitheater Stage
  { id: 'festival_stage', minX: -74.5, maxX: -57.5, minZ: -31.0, maxZ: -21.5 },

  // North Mountain Shrine Grand Hall
  { id: 'north_shrine_hall', minX: -9.5, maxX: 9.5, minZ: -95.5, maxZ: -85.0 },
  // Medical room shell with a 6m south entrance kept open.
  { id: 'medical_room_north_wall', minX: 27.0, maxX: 41.0, minZ: -34.0, maxZ: -33.45 },
  { id: 'medical_room_west_wall', minX: 26.9, maxX: 27.45, minZ: -33.75, maxZ: -20.25 },
  { id: 'medical_room_east_wall', minX: 40.55, maxX: 41.1, minZ: -33.75, maxZ: -20.25 },
  { id: 'medical_room_front_left', minX: 27.0, maxX: 31.0, minZ: -20.55, maxZ: -20.0 },
  { id: 'medical_room_front_right', minX: 37.0, maxX: 41.0, minZ: -20.55, maxZ: -20.0 },
];

export const CAMPUS_CIRCLE_COLLIDERS: CircleCollider2D[] = [
  // Central Octagonal Courtyard Fountain
  { id: 'fountain_basin', x: 0, z: 10, radius: 4.8 },
  // Entrance Portico Columns
  { id: 'portico_col_1', x: -5.2, z: -5.8, radius: 0.48 },
  { id: 'portico_col_2', x: -3.1, z: -5.8, radius: 0.48 },
  { id: 'portico_col_3', x: 3.1, z: -5.8, radius: 0.48 },
  { id: 'portico_col_4', x: 5.2, z: -5.8, radius: 0.48 },
  // Outdoor Cafeteria & Town Cafe Parasol Tables
  { id: 'cafe_table_1', x: -27.5, z: 3.8, radius: 1.25 },
  { id: 'cafe_table_2', x: -27.5, z: 12.2, radius: 1.25 },
  { id: 'town_table_1', x: -14.5, z: 58.0, radius: 1.25 },
  { id: 'town_table_2', x: -14.5, z: 66.0, radius: 1.25 },
  // Northeast Hoshino Research Centre & Observatory Rotunda
  { id: 'observatory_rotunda', x: 66.0, z: -26.0, radius: 10.5 },
  // Sakura Avenue & Expanded World Trees
  { id: 'tree_1', x: -11.5, z: 4, radius: 0.65 },
  { id: 'tree_2', x: 11.5, z: 4, radius: 0.65 },
  { id: 'tree_3', x: -11.5, z: 13, radius: 0.65 },
  { id: 'tree_4', x: 11.5, z: 13, radius: 0.65 },
  { id: 'tree_5', x: -11.5, z: 22, radius: 0.65 },
  { id: 'tree_6', x: 11.5, z: 22, radius: 0.65 },
  { id: 'tree_7', x: -11.5, z: 30, radius: 0.65 },
  { id: 'tree_8', x: 11.5, z: 30, radius: 0.65 },
  { id: 'tree_9', x: -21.5, z: 26, radius: 0.7 },
  { id: 'tree_10', x: 21.5, z: 26, radius: 0.7 },
  { id: 'tree_11', x: -11.5, z: 46, radius: 0.65 },
  { id: 'tree_12', x: 11.5, z: 46, radius: 0.65 },
  { id: 'tree_13', x: -11.5, z: 76, radius: 0.65 },
  { id: 'tree_14', x: 11.5, z: 76, radius: 0.65 },
  { id: 'tree_15', x: -50.0, z: 20, radius: 0.7 },
  { id: 'tree_16', x: -50.0, z: -4, radius: 0.7 },
  { id: 'tree_17', x: 50.0, z: 20, radius: 0.7 },
  { id: 'tree_18', x: 50.0, z: -4, radius: 0.7 },
];

export const LOADING_MESSAGES: Array<{ threshold: number; message: string }> = [
  { threshold: 0, message: 'Initializing Hoshino Academy 3D world & Story Chronicles V7.0...' },
  { threshold: 25, message: 'Synthesizing procedural architectural materials & Class A–D halls...' },
  { threshold: 55, message: 'Constructing 4-story Academy, Dormitory, Research Centre & Mountain Shrine...' },
  { threshold: 80, message: 'Calibrating autonomous AI NPC brains, memories & Story Library...' },
  { threshold: 95, message: 'Preparing Hoshino Academy arrival stage...' },
];

export const KEYBOARD_CONTROLS_INFO = [
  { action: 'Move Student Protagonist', binding: 'W A S D or Arrow Keys' },
  { action: 'Sprint / Fast Run', binding: 'Hold Left Shift' },
  { action: 'Jump', binding: 'Spacebar' },
  { action: 'Talk to NPC / Type Custom Chat', binding: 'E Key (or Click Prompt)' },
  { action: 'Rotate Camera Around Player', binding: 'Mouse Drag on Canvas' },
  { action: 'Toggle Follow Cam / Campus Overview', binding: 'C Key or 1 – 5 Keys' },
  { action: 'Character Profile & Story Library', binding: 'P Key / Top-Right Bar' },
  { action: 'Pause / System Menu', binding: 'Esc Key' },
];

export const TOUCH_CONTROLS_INFO = [
  { gesture: 'Left Virtual Thumbstick', description: 'Drag in any 360° direction to walk or run across the campus' },
  { gesture: 'Right Action Pad (Chat / Jump / Run / Cam)', description: 'Tactile thumb buttons for NPC chat, jumping, and sprinting' },
  { gesture: 'Translucent NPC Chat Box', description: 'Type your own message in English or Hinglish or tap a quick reply' },
  { gesture: 'Canvas Touch Drag', description: 'Swipe anywhere on the 3D view to smoothly rotate the third-person camera' },
];
