import {
  CAMPUS_AABB_COLLIDERS,
  CAMPUS_INTERACTABLES,
} from '../../config/defaults';
import {
  AABBCollider2D,
  CampusInteractable,
  NPCRuntimeState,
  PlayerSkills,
  Vector3Tuple,
} from '../../types/game';

export type InteractableObjectType =
  | 'seat'
  | 'desk'
  | 'bookshelf'
  | 'book_return'
  | 'librarian_desk'
  | 'computer'
  | 'door'
  | 'blackboard'
  | 'notice_board'
  | 'food_counter'
  | 'cafeteria_seat'
  | 'tray_station'
  | 'water_dispenser'
  | 'water_fountain'
  | 'vending_machine'
  | 'microscope'
  | 'bed'
  | 'wardrobe'
  | 'locker'
  | 'elevator'
  | 'map_board'
  | 'sports_equipment'
  | 'scoreboard'
  | 'stage_control'
  | 'medical_bed';

export type InteractionPosture =
  | 'none'
  | 'sit'
  | 'study'
  | 'read'
  | 'use_computer'
  | 'eat'
  | 'rest';

export type ActiveObjectModalType =
  | 'none'
  | 'library_bookshelf'
  | 'book_reader'
  | 'computer_terminal'
  | 'science_microscope'
  | 'cafeteria_menu'
  | 'campus_map'
  | 'elevator_floor'
  | 'wardrobe_outfit'
  | 'notice_reader';

export interface WorldInteractableObject {
  id: string;
  objectType: InteractableObjectType;
  displayName: string;
  label: string;
  subtitle: string;
  locationName: string;
  position: Vector3Tuple;
  interactionRange: number;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  exitActionLabel?: string;
  icon: string;
  postureWhenActive: InteractionPosture;
  defaultPosture: 'none' | 'sit' | 'study' | 'read' | 'use_computer' | 'eat';
  /** Exact anchor where the player/NPC aligns when sitting or using workstation */
  anchorPosition: Vector3Tuple;
  anchorYaw: number;
  modalToOpen?: ActiveObjectModalType;
  opensModal?: ActiveObjectModalType;
  bookshelfCategory?: LibraryBookCategory;
  doorId?: string;
  noticeTitle?: string;
  noticeBody?: string;
  xpBonus?: number;
  xpReward?: number;
  skillBoost?: 'academics' | 'creativity' | 'sports' | 'problemSolving' | 'observation';
}

export type LibraryBookCategory =
  | 'Fiction'
  | 'Science'
  | 'Mathematics'
  | 'History'
  | 'Literature'
  | 'Reference';

export interface LibraryBookItem {
  id: string;
  title: string;
  author: string;
  category: LibraryBookCategory;
  shelfId: string;
  coverColor: string;
  summary: string;
  pages: string[];
  skillReward: keyof PlayerSkills;
  skillBonus: {
    skill: keyof PlayerSkills;
    amount: number;
  };
}

export interface CafeteriaMenuItem {
  id: string;
  name: string;
  category: 'Main Dish' | 'Noodles' | 'Bento' | 'Dessert' | 'Beverage';
  pricePp: number;
  xpBonus: number;
  description: string;
}

export interface ContextualPromptCandidate {
  kind: 'object' | 'npc';
  sourceKind: 'object' | 'npc';
  id: string;
  displayName: string;
  label: string;
  subtitle: string;
  actionLabel: string;
  actionVerb: string;
  secondaryActions: string[];
  icon: string;
  distance: number;
  score: number;
  objectRef?: WorldInteractableObject;
  objectTarget?: WorldInteractableObject;
  npcRef?: CampusInteractable;
  npcTarget?: CampusInteractable;
}

export interface ActivePlayerObjectInteraction {
  objectId: string;
  objectType: InteractableObjectType;
  label: string;
  displayName?: string;
  locationName?: string;
  posture: 'none' | 'sit' | 'study' | 'read' | 'use_computer' | 'eat';
  exitLabel?: string;
  anchorPosition: Vector3Tuple;
  anchorYaw: number;
  startedAt?: number;
  startedAtMs?: number;
}

// ============================================================================
// 1. ORIGINAL IN-GAME LIBRARY CATALOGUE (6 Categories, 12 Readable Books)
// ============================================================================
const RAW_LIBRARY_BOOKS: Array<Omit<LibraryBookItem, 'skillBonus'>> = [
  {
    id: 'book_fic_01',
    title: 'Chronicles of the Starlit Clocktower',
    author: 'Haruka Minami (Hoshino Alumni)',
    category: 'Fiction',
    shelfId: 'obj_shelf_fiction',
    coverColor: '#6366f1',
    summary: 'An original school-life mystery novel set beneath Hoshino Academy’s 36-meter belfry.',
    pages: [
      'Page 1 — Beneath the sakura petals of the central courtyard, four students from Classes A, B, C, and D discovered that the clocktower chimes resonated with an astronomical dial on the fourth floor.',
      'Page 2 — Each class held one quarter of the bronze cipher: Class A guarded precision, Class B fostered harmony, Class C preserved creativity, and Class D possessed the courage to question the impossible.',
      'Page 3 — When the four chimes rang together at sunset, the archive doors opened—not to a prize of gold, but to a shared observatory built for every generation to come.',
    ],
    skillReward: 'creativity',
  },
  {
    id: 'book_fic_02',
    title: 'The Vermilion Bridge at Twilight',
    author: 'Satsuki Kurosawa',
    category: 'Fiction',
    shelfId: 'obj_shelf_fiction',
    coverColor: '#ec4899',
    summary: 'A collection of short stories inspired by the West Koi Garden and autumn cultural festivals.',
    pages: [
      'Page 1 — Across the vermilion wooden bridge of the West Garden, lanterns reflect like fallen stars upon the koi pond.',
      'Page 2 — Students who pause on the bridge after club hours often trade sketches and musical notes before the evening bell.',
      'Page 3 — "True rival classes," wrote the founder, "are like the two banks of a river—linked by the bridges they choose to build."',
    ],
    skillReward: 'creativity',
  },
  {
    id: 'book_sci_01',
    title: 'Atmospheric Optics & The Hoshikaze Dome',
    author: 'Dr. Emi Kuroda & Science Department',
    category: 'Science',
    shelfId: 'obj_shelf_science',
    coverColor: '#0ea5e9',
    summary: 'Principles of meteorological instrumentation, solar chronometers, and optical refraction.',
    pages: [
      'Page 1 — Rayleigh scattering and golden-hour refraction explain why the sky over Hoshino Valley shifts from crisp azure at 08:15 to warm amber at 17:10.',
      'Page 2 — The East Research Centre’s silver dome houses a barometric array originally calibrated by student researchers during Project Hoshikaze.',
      'Page 3 — By comparing wind vectors between the courtyard weather vane and the mountain shrine ridge, students can forecast valley cloud formations with 94% accuracy.',
    ],
    skillReward: 'academics',
  },
  {
    id: 'book_sci_02',
    title: 'Cellular Microscopy & Botanical Atlas',
    author: 'Hoshino Biology Lab Press',
    category: 'Science',
    shelfId: 'obj_shelf_science',
    coverColor: '#10b981',
    summary: 'A laboratory guide to sakura petal vascular structure and aquatic pond ecosystems.',
    pages: [
      'Page 1 — Under 400x magnification in the Science Laboratory, Prunus serrulata (sakura) petals reveal delicate epidermal cells that scatter soft rose light.',
      'Page 2 — Symbiotic nitrifying bacteria in the West Koi Pond maintain crystal-clear water quality throughout all four seasons.',
      'Page 3 — Careful observation and clean slide preparation are the hallmarks of every Hoshino Academy researcher.',
    ],
    skillReward: 'observation',
  },
  {
    id: 'book_math_01',
    title: 'Discrete Logic, Game Theory & Class Points',
    author: 'Prof. Kenji Takeda',
    category: 'Mathematics',
    shelfId: 'obj_shelf_mathematics',
    coverColor: '#f59e0b',
    summary: 'Mathematical foundations of cooperative strategy, graph routing, and fair competition.',
    pages: [
      'Page 1 — In a four-party ranking system (Classes A, B, C, and D), zero-sum competition often yields lower total outcomes than positive-sum inter-class cooperation.',
      'Page 2 — By modeling campus walkways as a weighted planar graph, one can prove that the Central Courtyard serves as the minimum-eccentricity hub of Hoshino Academy.',
      'Page 3 — Theorem 4.2: Consistent daily study increments compound faster than last-minute cramming before terminal examinations.',
    ],
    skillReward: 'problemSolving',
  },
  {
    id: 'book_math_02',
    title: 'Spherical Trigonometry for Young Astronomers',
    author: 'Hoshino Mathematics Circle',
    category: 'Mathematics',
    shelfId: 'obj_shelf_mathematics',
    coverColor: '#8b5cf6',
    summary: 'Calculating celestial altitude, azimuth, and sundial shadow lengths.',
    pages: [
      'Page 1 — Given the 36.0-meter height of the Central Clock Tower, the shadow length L at solar altitude θ satisfies L = 36 / tan(θ).',
      'Page 2 — During the spring equinox, the tip of the clocktower spire shadow aligns directly with the octagonal courtyard fountain at 15:30.',
      'Page 3 — This geometric alignment was intentionally engineered by the architects of Hoshino Academy.',
    ],
    skillReward: 'problemSolving',
  },
  {
    id: 'book_hist_01',
    title: 'Founding Charter of Hoshino Academy',
    author: 'Academy Historical Archives',
    category: 'History',
    shelfId: 'obj_shelf_history',
    coverColor: '#d97706',
    summary: 'The complete architectural and educational history of the four-class academy system.',
    pages: [
      'Page 1 — Established on the terraced hills above Hoshino Town, the academy was designed so that no single class could monopolize excellence.',
      'Page 2 — Class A, Class B, Class C, and Class D were placed on the same campus level to encourage daily dialogue, shared club rooms, and merit-based growth.',
      'Page 3 — "Project Hoshikaze" was the first all-class initiative, uniting science, art, athletics, and civic leadership into a living campus archive.',
    ],
    skillReward: 'academics',
  },
  {
    id: 'book_hist_02',
    title: 'Railways & Shrines of Hoshino Valley',
    author: 'Municipal Heritage Society',
    category: 'History',
    shelfId: 'obj_shelf_history',
    coverColor: '#ef4444',
    summary: 'How the South Electric Railway Station and North Mountain Shrine shaped the town.',
    pages: [
      'Page 1 — The North Mountain Torii Shrine predates the modern campus by two centuries, serving as a quiet overlook for scholars and travelers.',
      'Page 2 — When the Hoshino Electric Railway opened at the South Boulevard terminus, students helped design the station’s solar-synchronized departure clock.',
      'Page 3 — Transit ledgers from that era remain preserved between the Station Master’s office and the East Library Archive.',
    ],
    skillReward: 'observation',
  },
  {
    id: 'book_lit_01',
    title: 'Anthology of Classical & Modern Haiku',
    author: 'Hoshino Literature Club',
    category: 'Literature',
    shelfId: 'obj_shelf_literature',
    coverColor: '#14b8a6',
    summary: 'Seasonal poetry composed by students and faculty across the academy grounds.',
    pages: [
      'Page 1 — "Morning bell rings clear / Cherry petals cross the stone / Four paths meet as one."',
      'Page 2 — "Silver dome at dusk / Counting stars above the pool / Quiet pencils write."',
      'Page 3 — Literature teaches us to listen to the unspoken rhythms of our classmates’ hopes and struggles.',
    ],
    skillReward: 'creativity',
  },
  {
    id: 'book_lit_02',
    title: 'Rhetoric, Debate & Ethical Leadership',
    author: 'Student Council Press',
    category: 'Literature',
    shelfId: 'obj_shelf_literature',
    coverColor: '#3b82f6',
    summary: 'A handbook for persuasive speaking, auditorium presentations, and council deliberations.',
    pages: [
      'Page 1 — Strong leadership begins not with giving orders, but with understanding the distinct goals of every participant.',
      'Page 2 — In the Hoshino Auditorium, speakers are evaluated on clarity of evidence, fairness to opposing views, and constructive solutions.',
      'Page 3 — Whether representing Class D or Class A, integrity earns lasting trust.',
    ],
    skillReward: 'academics',
  },
  {
    id: 'book_ref_01',
    title: 'Hoshino Campus Architecture & Facility Directory',
    author: 'Office of Campus Administration',
    category: 'Reference',
    shelfId: 'obj_shelf_reference',
    coverColor: '#64748b',
    summary: 'Complete floor plans and room listings for all academic, club, sports, and residential buildings.',
    pages: [
      'Page 1 — Main Academic Complex: Central Lobby & Reception, Classrooms A, B, C, and D, Multi-Section Library, Student Council Office, Medical Room, and Faculty Suite.',
      'Page 2 — Specialist & Athletics Facilities: Science Laboratory, Computer Laboratory, West Cafeteria & Dining Hall, East Gymnasium, 25m Aquatics Pool, and West Auditorium.',
      'Page 3 — Residential & Surrounding World: 4-Story Student Dormitory, South Commercial & Residential Town District, Electric Train Station, East Research Centre, and North Mountain Shrine.',
    ],
    skillReward: 'observation',
  },
  {
    id: 'book_ref_02',
    title: 'Project Hoshikaze Index & Catalogue Key',
    author: 'Archive Preservation Committee',
    category: 'Reference',
    shelfId: 'obj_shelf_reference',
    coverColor: '#eab308',
    summary: 'Cross-reference index connecting the Library, Research Dome, and Town Station records.',
    pages: [
      'Page 1 — Record Vol. I (Charter & Blueprints): Stored in the East Wing Library Archive Cabinet.',
      'Page 2 — Record Vol. II (Community Transit Log): Documented at the South Town Electric Railway Station.',
      'Page 3 — Record Vol. III (Meteorological & Star Chronometer Logs): Housed inside the Northeast Research Centre Rotunda.',
    ],
    skillReward: 'problemSolving',
  },
];

export const LIBRARY_BOOKS: LibraryBookItem[] = RAW_LIBRARY_BOOKS.map((b) => ({
  ...b,
  skillBonus: {
    skill: b.skillReward,
    amount: 3,
  },
}));

// ============================================================================
// 2. CAFETERIA MENU ITEMS (In-Game Economy using Personal Points PP)
// ============================================================================
export const CAFETERIA_MENU_ITEMS: CafeteriaMenuItem[] = [
  {
    id: 'food_katsu_curry',
    name: 'Hoshino Special Katsu Curry Set',
    category: 'Main Dish',
    pricePp: 25,
    xpBonus: 20,
    description: 'Crispy golden pork cutlet over steamed rice with rich academy curry, salad, and miso soup.',
  },
  {
    id: 'food_kitsune_udon',
    name: 'Warm Kitsune Udon Bowl',
    category: 'Noodles',
    pricePp: 20,
    xpBonus: 15,
    description: 'Handmade udon noodles in dashi broth topped with sweet seasoned tofu and green onions.',
  },
  {
    id: 'meal_bento_deluxe',
    name: 'Four-Class Harmony Bento Box',
    category: 'Bento',
    pricePp: 30,
    xpBonus: 25,
    description: 'Balanced nutrition box with grilled salmon, tamagoyaki, sesame spinach, and onigiri.',
  },
  {
    id: 'food_matcha_parfait',
    name: 'Kyoto Matcha & Sakura Parfait',
    category: 'Dessert',
    pricePp: 15,
    xpBonus: 15,
    description: 'Layered Uji matcha gelato, red bean paste, mochi pearls, and sakura whipped cream.',
  },
];

// ============================================================================
// 3. UNIVERSAL WORLD INTERACTABLE OBJECT REGISTRY (Every Facility & District)
// ============================================================================
const RAW_WORLD_INTERACTABLE_OBJECTS: Array<
  Omit<WorldInteractableObject, 'label' | 'defaultPosture' | 'opensModal' | 'xpReward'>
> = [
  // --- A. MAIN ENTRANCE & COURTYARD ---
  {
    id: 'obj_main_gate_reception',
    objectType: 'notice_board',
    displayName: 'Main Gate Security & Reception Booth',
    subtitle: 'Campus Entry Log & Visitor Check-In',
    locationName: 'Main Entrance Plaza',
    position: { x: -6.2, y: 0, z: 33.4 },
    interactionRange: 3.4,
    primaryActionLabel: 'Check In at Reception',
    icon: '🛡️',
    postureWhenActive: 'none',
    anchorPosition: { x: -5.2, y: 0, z: 33.4 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Hoshino Academy Main Gate Reception',
    noticeBody:
      'Welcome to Hoshino Academy! Student ID verified for all Campus Wings (Classrooms A, B, C, D, Library, Labs, Cafeteria, Gymnasium, Dormitory) and off-campus passes for the Town District, Train Station, Research Centre, and Mountain Shrine.',
    xpBonus: 10,
    skillBoost: 'observation',
  },
  {
    id: 'obj_entrance_map_board',
    objectType: 'map_board',
    displayName: 'Academy Campus & World Map Board',
    subtitle: 'Interactive 3D Campus & District Directory',
    locationName: 'Main Entrance Plaza',
    position: { x: 6.2, y: 0, z: 33.4 },
    interactionRange: 3.5,
    primaryActionLabel: 'View Campus Map',
    icon: '🗺️',
    postureWhenActive: 'none',
    anchorPosition: { x: 6.2, y: 0, z: 31.8 },
    anchorYaw: 0,
    modalToOpen: 'campus_map',
    xpBonus: 10,
    skillBoost: 'observation',
  },
  {
    id: 'obj_courtyard_bench_west',
    objectType: 'seat',
    displayName: 'Courtyard Sakura Bench (West)',
    subtitle: 'Central Fountain Plaza Seating',
    locationName: 'Hoshino Academy Courtyard',
    position: { x: -6.5, y: 0, z: 10.0 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit',
    exitActionLabel: 'Stand Up',
    icon: '🪑',
    postureWhenActive: 'sit',
    anchorPosition: { x: -6.1, y: 0, z: 10.0 },
    anchorYaw: Math.PI / 2,
    xpBonus: 5,
  },
  {
    id: 'obj_courtyard_bench_east',
    objectType: 'seat',
    displayName: 'Courtyard Sakura Bench (East)',
    subtitle: 'Central Fountain Plaza Seating',
    locationName: 'Hoshino Academy Courtyard',
    position: { x: 6.5, y: 0, z: 10.0 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit',
    exitActionLabel: 'Stand Up',
    icon: '🪑',
    postureWhenActive: 'sit',
    anchorPosition: { x: 6.1, y: 0, z: 10.0 },
    anchorYaw: -Math.PI / 2,
    xpBonus: 5,
  },
  {
    id: 'obj_courtyard_bench_south',
    objectType: 'seat',
    displayName: 'Courtyard South Plaza Bench',
    subtitle: 'Fountain Overlook Bench',
    locationName: 'Hoshino Academy Courtyard',
    position: { x: 0, y: 0, z: 16.5 },
    interactionRange: 4.8,
    primaryActionLabel: 'Sit',
    exitActionLabel: 'Stand Up',
    icon: '🪑',
    postureWhenActive: 'sit',
    anchorPosition: { x: 0, y: 0, z: 16.1 },
    anchorYaw: Math.PI,
    xpBonus: 5,
  },
  {
    id: 'obj_courtyard_bench_north',
    objectType: 'seat',
    displayName: 'Courtyard Portico Bench',
    subtitle: 'Main Academic Hall Approach Bench',
    locationName: 'Hoshino Academy Courtyard',
    position: { x: 0, y: 0, z: 3.5 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit',
    exitActionLabel: 'Stand Up',
    icon: '🪑',
    postureWhenActive: 'sit',
    anchorPosition: { x: 0, y: 0, z: 3.9 },
    anchorYaw: 0,
    xpBonus: 5,
  },

  // --- B. MAIN ACADEMIC BUILDING LOBBY, DOORS, LOCKERS & ELEVATOR ---
  {
    id: 'obj_door_main_entrance',
    objectType: 'door',
    displayName: 'Main Academic Hall Entrance Doors',
    subtitle: 'Double Glass Doors · Ground Floor Lobby',
    locationName: 'Main Academic Building Portico',
    position: { x: -2.4, y: 0, z: -9.5 },
    interactionRange: 3.2,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: 0, y: 0, z: -8.8 },
    anchorYaw: Math.PI,
    doorId: 'door_main_front',
  },
  {
    id: 'obj_lobby_reception_desk',
    objectType: 'notice_board',
    displayName: 'Academic Building Information & Floor Directory',
    subtitle: '1F Classrooms A–D, Library · 2F Labs & Council · 3F Clubs & Faculty',
    locationName: 'Hoshino Entrance Hall',
    position: { x: 0, y: 0, z: -15.8 },
    interactionRange: 3.0,
    primaryActionLabel: 'View Floor Directory',
    icon: '🏢',
    postureWhenActive: 'none',
    anchorPosition: { x: 0, y: 0, z: -14.6 },
    anchorYaw: Math.PI,
    modalToOpen: 'elevator_floor',
    xpBonus: 10,
  },
  {
    id: 'obj_lobby_shoe_locker',
    objectType: 'locker',
    displayName: 'Student Shoe Locker (Getabako)',
    subtitle: 'Personal Indoor Shoes & Storage',
    locationName: 'Hoshino Entrance Hall',
    position: { x: -4.8, y: 0, z: -11.9 },
    interactionRange: 2.6,
    primaryActionLabel: 'Open Locker',
    icon: '🔐',
    postureWhenActive: 'none',
    anchorPosition: { x: -3.9, y: 0, z: -11.9 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Student Locker #D-07 (Your Assigned Locker)',
    noticeBody:
      'Indoor loafers neatly stored. Inside your locker shelf: Class D Timetable, Homeroom Notebook, and a friendly welcome note from Sora Amamiya & Aiko Hoshino.',
    xpBonus: 10,
  },
  {
    id: 'obj_lobby_water_fountain',
    objectType: 'water_dispenser',
    displayName: 'Hallway Chilled Water Fountain',
    subtitle: 'Refreshes Focus & Stamina',
    locationName: 'Hoshino Entrance Hall',
    position: { x: 4.7, y: 0, z: -19.2 },
    interactionRange: 2.6,
    primaryActionLabel: 'Use Water Fountain',
    icon: '💧',
    postureWhenActive: 'none',
    anchorPosition: { x: 3.9, y: 0, z: -19.2 },
    anchorYaw: Math.PI / 2,
    xpBonus: 5,
  },
  {
    id: 'obj_lobby_elevator',
    objectType: 'elevator',
    displayName: 'Academic Building Elevator & Staircase Access',
    subtitle: 'Connects 1F Homerooms, 2F Science/Computer Labs, 3F Club Rooms & Rooftop',
    locationName: 'Hoshino Entrance Hall',
    position: { x: -4.7, y: 0, z: -19.5 },
    interactionRange: 2.8,
    primaryActionLabel: 'Select Floor / Facility',
    icon: '🛗',
    postureWhenActive: 'none',
    anchorPosition: { x: -3.8, y: 0, z: -19.5 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'elevator_floor',
  },

  // --- C. FOUR CLASSROOMS: CLASS A, CLASS B, CLASS C, CLASS D ---
  // 1) CLASS A CLASSROOM (North-West Main Wing: x = -14.2, z = -16.1)
  {
    id: 'obj_door_class_a',
    objectType: 'door',
    displayName: 'Class A Classroom Door',
    subtitle: 'Class A Homeroom Entrance',
    locationName: 'Main Academic Corridor',
    position: { x: -5.6, y: 0, z: -16.0 },
    interactionRange: 2.8,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: -4.8, y: 0, z: -16.0 },
    anchorYaw: -Math.PI / 2,
    doorId: 'door_class_a',
  },
  {
    id: 'obj_class_a_seat_front',
    objectType: 'desk',
    displayName: 'Class A Student Desk & Chair (Front Row)',
    subtitle: 'Sit at Desk or Study Lesson Notes',
    locationName: 'Class A Classroom',
    position: { x: -10.2, y: 0, z: -16.6 },
    interactionRange: 2.6,
    primaryActionLabel: 'Sit & Study',
    exitActionLabel: 'Stand Up',
    icon: '✍️',
    postureWhenActive: 'study',
    anchorPosition: { x: -10.2, y: 0, z: -16.52 },
    anchorYaw: Math.PI,
    xpBonus: 15,
    skillBoost: 'academics',
  },
  {
    id: 'obj_class_a_seat_center',
    objectType: 'desk',
    displayName: 'Class A Student Desk & Chair (Center Row)',
    subtitle: 'Sit at Desk or Take Class Notes',
    locationName: 'Class A Classroom',
    position: { x: -14.2, y: 0, z: -14.4 },
    interactionRange: 2.6,
    primaryActionLabel: 'Sit & Study',
    exitActionLabel: 'Stand Up',
    icon: '✍️',
    postureWhenActive: 'study',
    anchorPosition: { x: -14.2, y: 0, z: -14.32 },
    anchorYaw: Math.PI,
    xpBonus: 15,
    skillBoost: 'academics',
  },
  {
    id: 'obj_class_a_blackboard',
    objectType: 'blackboard',
    displayName: 'Class A Interactive Blackboard & Timetable',
    subtitle: 'Start Lesson · Review Honour Roll Curriculum',
    locationName: 'Class A Classroom',
    position: { x: -14.2, y: 0, z: -21.2 },
    interactionRange: 3.4,
    primaryActionLabel: 'Read Blackboard',
    icon: '📋',
    postureWhenActive: 'none',
    anchorPosition: { x: -14.2, y: 0, z: -20.1 },
    anchorYaw: Math.PI,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Class A — Academic & Leadership Timetable',
    noticeBody:
      '08:30 Period 1: Advanced Calculus & Logic (Sensei Takeda) · 10:30 Period 2: Classical Literature · 13:30 Period 3: Physics & Observatory Seminar · 15:30 Period 4: Inter-Class Debate & Track Conditioning. Current Class A Standing: 420 CP.',
    xpBonus: 15,
    skillBoost: 'academics',
  },

  // 2) CLASS B CLASSROOM (South-West Academic Wing: x = -21.2, z = -2.5)
  {
    id: 'obj_door_class_b',
    objectType: 'door',
    displayName: 'Class B Classroom Door',
    subtitle: 'Class B Homeroom Entrance',
    locationName: 'West Academic Wing',
    position: { x: -15.0, y: 0, z: -2.5 },
    interactionRange: 3.0,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: -14.0, y: 0, z: -2.5 },
    anchorYaw: -Math.PI / 2,
    doorId: 'door_class_b',
  },
  {
    id: 'obj_class_b_desk',
    objectType: 'desk',
    displayName: 'Class B Student Desk & Chair',
    subtitle: 'Aiko Hoshino’s Homeroom Seating',
    locationName: 'Class B Classroom',
    position: { x: -20.5, y: 0, z: -1.6 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit & Study',
    exitActionLabel: 'Stand Up',
    icon: '✍️',
    postureWhenActive: 'study',
    anchorPosition: { x: -20.5, y: 0, z: -1.52 },
    anchorYaw: Math.PI,
    xpBonus: 15,
    skillBoost: 'academics',
  },
  {
    id: 'obj_class_b_board',
    objectType: 'blackboard',
    displayName: 'Class B Blackboard & Orientation Roster',
    subtitle: 'Civic Leadership & Cultural Festival Planning',
    locationName: 'Class B Classroom',
    position: { x: -21.2, y: 0, z: -7.8 },
    interactionRange: 3.4,
    primaryActionLabel: 'Read Blackboard',
    icon: '📋',
    postureWhenActive: 'none',
    anchorPosition: { x: -21.2, y: 0, z: -6.5 },
    anchorYaw: Math.PI,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Class B — Harmony & Student Council Coordination',
    noticeBody:
      'Class B Representative: Aiko Hoshino. Today’s Focus: Cross-Class Cultural Festival Planning, Communications Workshop, and Campus Orientation Mentoring. Current Class B Standing: 395 CP.',
    xpBonus: 15,
    skillBoost: 'academics',
  },

  // 3) CLASS C CLASSROOM (South-East Academic Wing: x = 21.2, z = -2.5)
  {
    id: 'obj_door_class_c',
    objectType: 'door',
    displayName: 'Class C Classroom Door',
    subtitle: 'Class C Homeroom Entrance',
    locationName: 'East Academic Wing',
    position: { x: 15.0, y: 0, z: -2.5 },
    interactionRange: 3.0,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: 14.0, y: 0, z: -2.5 },
    anchorYaw: Math.PI / 2,
    doorId: 'door_class_c',
  },
  {
    id: 'obj_class_c_desk',
    objectType: 'desk',
    displayName: 'Class C Student Desk & Chair',
    subtitle: 'Mika Aozora & Riku’s Creative Homeroom',
    locationName: 'Class C Classroom',
    position: { x: 21.9, y: 0, z: -1.6 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit & Study',
    exitActionLabel: 'Stand Up',
    icon: '✍️',
    postureWhenActive: 'study',
    anchorPosition: { x: 21.9, y: 0, z: -1.52 },
    anchorYaw: Math.PI,
    xpBonus: 15,
    skillBoost: 'creativity',
  },
  {
    id: 'obj_class_c_board',
    objectType: 'blackboard',
    displayName: 'Class C Digital Display & Design Board',
    subtitle: 'Visual Arts, Media & Historical Archives',
    locationName: 'Class C Classroom',
    position: { x: 21.2, y: 0, z: -7.8 },
    interactionRange: 3.4,
    primaryActionLabel: 'Read Blackboard',
    icon: '📋',
    postureWhenActive: 'none',
    anchorPosition: { x: 21.2, y: 0, z: -6.5 },
    anchorYaw: Math.PI,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Class C — Creative Arts, Photography & Archive Research',
    noticeBody:
      'Class C Representative: Mika Aozora. Today’s Focus: Architectural Sketching of the 36m Clock Tower, Exhibition Curation, and Project Hoshikaze Visual Documentation. Current Class C Standing: 375 CP.',
    xpBonus: 15,
    skillBoost: 'creativity',
  },

  // 4) CLASS D CLASSROOM (North-West Academic Annex: x = -30.5, z = -16.1 — Your Assigned Homeroom!)
  {
    id: 'obj_door_class_d',
    objectType: 'door',
    displayName: 'Class D Classroom Door',
    subtitle: 'Your Assigned Homeroom Entrance (Class D)',
    locationName: 'West Academic Annex',
    position: { x: -23.0, y: 0, z: -16.0 },
    interactionRange: 3.0,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: -22.0, y: 0, z: -16.0 },
    anchorYaw: -Math.PI / 2,
    doorId: 'door_class_d',
  },
  {
    id: 'obj_class_d_player_desk',
    objectType: 'desk',
    displayName: 'Your Assigned Class D Desk & Chair',
    subtitle: 'Transfer Student Seat · Next to Sora Amamiya',
    locationName: 'Class D Classroom',
    position: { x: -29.5, y: 0, z: -14.4 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit at Your Desk',
    exitActionLabel: 'Stand Up',
    icon: '🪑',
    postureWhenActive: 'study',
    anchorPosition: { x: -29.5, y: 0, z: -14.32 },
    anchorYaw: Math.PI,
    xpBonus: 20,
    skillBoost: 'problemSolving',
  },
  {
    id: 'obj_class_d_board',
    objectType: 'blackboard',
    displayName: 'Class D Strategy Blackboard & Timetable',
    subtitle: 'Road from Rank #4 to Rank #1 · Class D',
    locationName: 'Class D Classroom',
    position: { x: -30.5, y: 0, z: -21.0 },
    interactionRange: 3.5,
    primaryActionLabel: 'Read Blackboard',
    icon: '📋',
    postureWhenActive: 'none',
    anchorPosition: { x: -30.5, y: 0, z: -19.6 },
    anchorYaw: Math.PI,
    modalToOpen: 'notice_reader',
    noticeTitle: 'Class D — Strategic Rise & Daily Timetable',
    noticeBody:
      'Class D Representative: Sora Amamiya · Strategist: Kenzo Fujimoto. Goal: Earn Class Points (CP) through full attendance, high exam scores, club collaborations, and solving the Project Hoshikaze mystery!',
    xpBonus: 15,
    skillBoost: 'problemSolving',
  },

  // --- D. MULTI-SECTION LIBRARY (Fiction, Science, Mathematics, History, Literature, Reference) ---
  {
    id: 'obj_door_library',
    objectType: 'door',
    displayName: 'Academic Library Entrance Door',
    subtitle: 'East Wing Multi-Section Library',
    locationName: 'Main Academic Corridor',
    position: { x: 5.6, y: 0, z: -16.0 },
    interactionRange: 2.8,
    primaryActionLabel: 'Open Door',
    icon: '🚪',
    postureWhenActive: 'none',
    anchorPosition: { x: 4.8, y: 0, z: -16.0 },
    anchorYaw: Math.PI / 2,
    doorId: 'door_library',
  },
  {
    id: 'obj_shelf_fiction',
    objectType: 'bookshelf',
    displayName: 'Library Bookshelf — Fiction & Literature Section',
    subtitle: 'Browse, Take & Read Original Academy Books',
    locationName: 'East Wing Library',
    position: { x: 9.8, y: 0, z: -20.8 },
    interactionRange: 2.9,
    primaryActionLabel: 'Browse Books',
    icon: '📚',
    postureWhenActive: 'read',
    anchorPosition: { x: 9.8, y: 0, z: -19.8 },
    anchorYaw: Math.PI,
    modalToOpen: 'library_bookshelf',
    bookshelfCategory: 'Fiction',
    xpBonus: 10,
    skillBoost: 'creativity',
  },
  {
    id: 'obj_shelf_science',
    objectType: 'bookshelf',
    displayName: 'Library Bookshelf — Science & Mathematics Section',
    subtitle: 'Physics, Biology, Logic & Astronomy Volumes',
    locationName: 'East Wing Library',
    position: { x: 14.2, y: 0, z: -20.8 },
    interactionRange: 2.9,
    primaryActionLabel: 'Browse Books',
    icon: '🔬',
    postureWhenActive: 'read',
    anchorPosition: { x: 14.2, y: 0, z: -19.8 },
    anchorYaw: Math.PI,
    modalToOpen: 'library_bookshelf',
    bookshelfCategory: 'Science',
    xpBonus: 10,
    skillBoost: 'academics',
  },
  {
    id: 'obj_shelf_history',
    objectType: 'bookshelf',
    displayName: 'Library Bookshelf — History & Reference Archive',
    subtitle: 'Hoshino Founding Charter & Project Hoshikaze Index',
    locationName: 'East Wing Library',
    position: { x: 18.6, y: 0, z: -20.8 },
    interactionRange: 2.9,
    primaryActionLabel: 'Browse Books',
    icon: '📜',
    postureWhenActive: 'read',
    anchorPosition: { x: 18.6, y: 0, z: -19.8 },
    anchorYaw: Math.PI,
    modalToOpen: 'library_bookshelf',
    bookshelfCategory: 'History',
    xpBonus: 15,
    skillBoost: 'observation',
  },
  {
    id: 'obj_library_reading_desk',
    objectType: 'desk',
    displayName: 'Library Quiet Reading Table & Chair',
    subtitle: 'Sit & Study with Lamp Illumination',
    locationName: 'East Wing Library',
    position: { x: 14.2, y: 0, z: -14.32 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit & Read',
    exitActionLabel: 'Stand Up',
    icon: '📖',
    postureWhenActive: 'study',
    anchorPosition: { x: 14.2, y: 0, z: -14.32 },
    anchorYaw: Math.PI,
    xpBonus: 15,
    skillBoost: 'academics',
  },
  {
    id: 'obj_library_return_station',
    objectType: 'book_return',
    displayName: 'Library Book-Return & Catalogue Terminal',
    subtitle: 'Return Borrowed Books & Search Digital Catalogue',
    locationName: 'East Wing Library',
    position: { x: 8.2, y: 0, z: -12.6 },
    interactionRange: 2.8,
    primaryActionLabel: 'Return / Search Books',
    icon: '🗂️',
    postureWhenActive: 'none',
    anchorPosition: { x: 8.2, y: 0, z: -13.6 },
    anchorYaw: 0,
    modalToOpen: 'library_bookshelf',
    xpBonus: 10,
  },

  // --- E & F. SCIENCE LABORATORY & COMPUTER LABORATORY (East Annex & Research Centre) ---
  {
    id: 'obj_science_lab_microscope',
    objectType: 'microscope',
    displayName: 'Science Laboratory Optical Microscope Station',
    subtitle: 'Inspect Botanical & Meteorological Specimens',
    locationName: 'Science & Research Laboratory',
    position: { x: 52.5, y: 0, z: -22.0 },
    interactionRange: 3.4,
    primaryActionLabel: 'Inspect Microscope',
    exitActionLabel: 'Leave Lab Bench',
    icon: '🔬',
    postureWhenActive: 'study',
    anchorPosition: { x: 52.5, y: 0, z: -20.8 },
    anchorYaw: Math.PI,
    modalToOpen: 'science_microscope',
    xpBonus: 20,
    skillBoost: 'observation',
  },
  {
    id: 'obj_computer_lab_terminal',
    objectType: 'computer',
    displayName: 'Computer Lab Workstation Terminal #01',
    subtitle: 'Complete Coding Logic Puzzle & View Assignments',
    locationName: 'Computer Laboratory & Tech Wing',
    position: { x: 30.5, y: 0, z: -15.4 },
    interactionRange: 3.2,
    primaryActionLabel: 'Use Computer',
    exitActionLabel: 'Exit Computer',
    icon: '💻',
    postureWhenActive: 'use_computer',
    anchorPosition: { x: 30.5, y: 0, z: -15.15 },
    anchorYaw: Math.PI,
    modalToOpen: 'computer_terminal',
    xpBonus: 20,
    skillBoost: 'problemSolving',
  },

  // --- G. CAFETERIA & DINING PAVILION (West Campus: x = -38.8, z = 8.0) ---
  {
    id: 'obj_cafeteria_counter',
    objectType: 'food_counter',
    displayName: 'Cafeteria Food & Payment Counter',
    subtitle: 'View Menu & Order Fresh Campus Meals',
    locationName: 'West Cafeteria Pavilion',
    position: { x: -30.2, y: 0, z: 8.0 },
    interactionRange: 3.4,
    primaryActionLabel: 'View Menu & Order',
    icon: '🍱',
    postureWhenActive: 'none',
    anchorPosition: { x: -29.0, y: 0, z: 8.0 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'cafeteria_menu',
    xpBonus: 10,
  },
  {
    id: 'obj_cafeteria_seat_north',
    objectType: 'seat',
    displayName: 'Cafeteria Terrace Dining Table & Chair (North)',
    subtitle: 'Sit & Enjoy Lunch with Classmates',
    locationName: 'West Cafeteria Pavilion',
    position: { x: -27.5, y: 0, z: 3.8 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit at Table',
    exitActionLabel: 'Stand Up',
    icon: '🍽️',
    postureWhenActive: 'eat',
    anchorPosition: { x: -26.2, y: 0, z: 3.8 },
    anchorYaw: -Math.PI / 2,
    xpBonus: 10,
  },
  {
    id: 'obj_cafeteria_seat_south',
    objectType: 'seat',
    displayName: 'Cafeteria Terrace Dining Table & Chair (South)',
    subtitle: 'Sit & Enjoy Lunch with Classmates',
    locationName: 'West Cafeteria Pavilion',
    position: { x: -27.5, y: 0, z: 12.2 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit at Table',
    exitActionLabel: 'Stand Up',
    icon: '🍽️',
    postureWhenActive: 'eat',
    anchorPosition: { x: -26.2, y: 0, z: 12.2 },
    anchorYaw: -Math.PI / 2,
    xpBonus: 10,
  },

  // --- H, K, L. AUDITORIUM, GYMNASIUM & STUDENT DORMITORY ---
  {
    id: 'obj_auditorium_seat',
    objectType: 'seat',
    displayName: 'Auditorium & Amphitheater Spectator Seat',
    subtitle: 'Watch Cultural Festival & Assembly Presentations',
    locationName: 'Festival Concert Amphitheater',
    position: { x: -66.0, y: 0, z: -18.5 },
    interactionRange: 3.4,
    primaryActionLabel: 'Sit in Audience',
    exitActionLabel: 'Stand Up',
    icon: '🎭',
    postureWhenActive: 'sit',
    anchorPosition: { x: -66.0, y: 0, z: -18.5 },
    anchorYaw: Math.PI,
    xpBonus: 10,
  },
  {
    id: 'obj_gym_bleachers',
    objectType: 'seat',
    displayName: 'Gymnasium & Sports Complex Spectator Bench',
    subtitle: 'Watch Basketball & Volleyball Practice',
    locationName: 'East Gymnasium & Sports Arena',
    position: { x: 29.5, y: 0, z: 8.0 },
    interactionRange: 3.2,
    primaryActionLabel: 'Sit on Bench',
    exitActionLabel: 'Stand Up',
    icon: '🏀',
    postureWhenActive: 'sit',
    anchorPosition: { x: 29.0, y: 0, z: 8.0 },
    anchorYaw: Math.PI / 2,
    xpBonus: 10,
    skillBoost: 'sports',
  },
  {
    id: 'obj_dormitory_room_bed',
    objectType: 'bed',
    displayName: 'Student Dormitory Room Desk & Rest Lounge',
    subtitle: 'Rest, Study, or Change School Outfit',
    locationName: 'Hoshino Student Dormitory',
    position: { x: -34.8, y: 0, z: -34.5 },
    interactionRange: 3.5,
    primaryActionLabel: 'Change Outfit / Rest',
    exitActionLabel: 'Stand Up',
    icon: '🛏️',
    postureWhenActive: 'sit',
    anchorPosition: { x: -34.2, y: 0, z: -34.5 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'wardrobe_outfit',
    xpBonus: 15,
  },
  {
    id: 'obj_dormitory_vending',
    objectType: 'vending_machine',
    displayName: 'Campus Drink Vending Machine',
    subtitle: 'Chilled Green Tea, Milk Coffee & Sports Drink',
    locationName: 'Hoshino Student Dormitory Plaza',
    position: { x: -34.8, y: 0, z: -28.0 },
    interactionRange: 3.0,
    primaryActionLabel: 'Use Vending Machine',
    icon: '🥤',
    postureWhenActive: 'none',
    anchorPosition: { x: -33.8, y: 0, z: -28.0 },
    anchorYaw: -Math.PI / 2,
    modalToOpen: 'cafeteria_menu',
    xpBonus: 5,
  },

  // --- SURROUNDING OPEN WORLD: TOWN CAFE, BOOKSTORE & TRAIN STATION BENCH ---
  {
    id: 'obj_town_cafe_seat',
    objectType: 'seat',
    displayName: 'Town Boulevard Ramen & Cafe Terrace Seat',
    subtitle: 'Sit at Outdoor Shopping Street Table',
    locationName: 'Hoshino Town District',
    position: { x: -14.5, y: 0, z: 58.0 },
    interactionRange: 2.8,
    primaryActionLabel: 'Sit at Cafe',
    exitActionLabel: 'Stand Up',
    icon: '🍜',
    postureWhenActive: 'eat',
    anchorPosition: { x: -13.2, y: 0, z: 58.0 },
    anchorYaw: -Math.PI / 2,
    xpBonus: 10,
  },
  {
    id: 'obj_station_bench',
    objectType: 'seat',
    displayName: 'Hoshino Railway Station Platform Bench',
    subtitle: 'Wait for the Hoshino Express Commuter Train',
    locationName: 'Hoshino Train Station',
    position: { x: -8.0, y: 0, z: 92.5 },
    interactionRange: 3.2,
    primaryActionLabel: 'Sit on Platform Bench',
    exitActionLabel: 'Stand Up',
    icon: '🚆',
    postureWhenActive: 'sit',
    anchorPosition: { x: -8.0, y: 0, z: 92.0 },
    anchorYaw: 0,
    xpBonus: 10,
  },
];

export const WORLD_INTERACTABLE_OBJECTS: WorldInteractableObject[] =
  RAW_WORLD_INTERACTABLE_OBJECTS.map((obj) => ({
    ...obj,
    label: obj.displayName,
    defaultPosture:
      obj.postureWhenActive === 'rest' ? 'sit' : obj.postureWhenActive,
    opensModal: obj.modalToOpen ?? 'none',
    xpReward: obj.xpBonus ?? 15,
  }));

// ============================================================================
// 4. LINE-OF-SIGHT WALL OCCLUSION CHECK & PRIORITY TARGET SELECTION
// ============================================================================

/**
 * Checks whether a 2D line segment between (x0, z0) and (x1, z1) is blocked by any
 * solid wall AABB (prevents interacting with objects behind walls!).
 */
export function isInteractionBlockedByWall(
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  wallAabbs: AABBCollider2D[]
): boolean {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.2) return false;

  for (const box of wallAabbs) {
    // Only check structural wall colliders (not desks/benches/lockers that are the target themselves)
    if (
      !box.id.includes('wall') &&
      !box.id.includes('front_') &&
      !box.id.includes('back_') &&
      !box.id.includes('part_') &&
      !box.id.includes('wall')
    ) {
      continue;
    }

    let t0 = 0.05;
    let t1 = 0.92; // Stop slightly before target surface so wall-mounted boards aren't self-occluded
    const p = [-dx, dx, -dz, dz];
    const q = [x0 - box.minX, box.maxX - x0, z0 - box.minZ, box.maxZ - z0];
    let intersects = true;

    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-6) {
        if (q[i] < 0) {
          intersects = false;
          break;
        }
      } else {
        const t = q[i] / p[i];
        if (p[i] < 0) {
          if (t > t1) {
            intersects = false;
            break;
          }
          if (t > t0) t0 = t;
        } else {
          if (t < t0) {
            intersects = false;
            break;
          }
          if (t < t1) t1 = t;
        }
      }
    }

    if (intersects && t0 < t1) {
      return true;
    }
  }

  return false;
}

export interface FindBestContextualOptions {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  objects?: WorldInteractableObject[];
  npcs?: CampusInteractable[];
  npcRuntimeStates?: NPCRuntimeState[];
  openDoorIds?: string[];
  wallAabbs?: AABBCollider2D[];
  currentStickyId?: string | null;
}

/**
 * Universal Proximity & Facing-Priority Target Selector (Section 5A–5E).
 * Supports both an options object and positional arguments.
 */
export function findBestContextualInteraction(
  arg1: number | FindBestContextualOptions,
  arg2?: number,
  arg3?: number,
  arg4: WorldInteractableObject[] = WORLD_INTERACTABLE_OBJECTS,
  arg5: CampusInteractable[] = CAMPUS_INTERACTABLES,
  arg6: NPCRuntimeState[] = [],
  arg7: string[] = [],
  arg8: AABBCollider2D[] = CAMPUS_AABB_COLLIDERS,
  arg9: string | null = null
): ContextualPromptCandidate | null {
  const playerX = typeof arg1 === 'object' ? arg1.playerX : arg1;
  const playerZ = typeof arg1 === 'object' ? arg1.playerZ : (arg2 ?? 0);
  const playerYaw = typeof arg1 === 'object' ? arg1.playerYaw : (arg3 ?? 0);
  const objects =
    typeof arg1 === 'object' ? (arg1.objects ?? WORLD_INTERACTABLE_OBJECTS) : arg4;
  const npcs = typeof arg1 === 'object' ? (arg1.npcs ?? CAMPUS_INTERACTABLES) : arg5;
  const npcRuntimeStates =
    typeof arg1 === 'object' ? (arg1.npcRuntimeStates ?? []) : arg6;
  const openDoorIds = typeof arg1 === 'object' ? (arg1.openDoorIds ?? []) : arg7;
  const wallAabbs =
    typeof arg1 === 'object' ? (arg1.wallAabbs ?? CAMPUS_AABB_COLLIDERS) : arg8;
  const currentTargetId =
    typeof arg1 === 'object' ? (arg1.currentStickyId ?? null) : arg9;

  const forwardX = Math.sin(playerYaw);
  const forwardZ = Math.cos(playerYaw);

  let bestCandidate: ContextualPromptCandidate | null = null;
  let bestScore = Infinity;

  // 1. Evaluate World Interactable Objects
  for (const obj of objects) {
    const dx = obj.position.x - playerX;
    const dz = obj.position.z - playerZ;
    const dist = Math.hypot(dx, dz);
    if (dist > obj.interactionRange) continue;

    if (
      wallAabbs.length > 0 &&
      isInteractionBlockedByWall(playerX, playerZ, obj.position.x, obj.position.z, wallAabbs)
    ) {
      continue;
    }

    const dirX = dist > 0.001 ? dx / dist : forwardX;
    const dirZ = dist > 0.001 ? dz / dist : forwardZ;
    const dot = dirX * forwardX + dirZ * forwardZ;

    const facingFactor = 1.0 - dot * 0.28;
    const stabilityBonus = obj.id === currentTargetId ? -0.35 : 0;
    const score = dist * facingFactor + stabilityBonus;

    let actionLabel = obj.primaryActionLabel;
    if (obj.objectType === 'door') {
      const doorKey = obj.doorId ?? obj.id;
      const isOpen = openDoorIds.includes(doorKey);
      actionLabel = isOpen ? 'Close Door' : 'Open Door';
    }

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = {
        kind: 'object',
        sourceKind: 'object',
        id: obj.id,
        displayName: obj.displayName,
        label: obj.label,
        subtitle: obj.subtitle,
        actionLabel,
        actionVerb: actionLabel,
        secondaryActions: obj.secondaryActionLabel ? [obj.secondaryActionLabel] : [],
        icon: obj.icon,
        distance: Number(dist.toFixed(2)),
        score: Number(score.toFixed(3)),
        objectRef: obj,
        objectTarget: obj,
      };
    }
  }

  // 2. Evaluate Campus NPCs & Landmarks
  for (const item of npcs) {
    let ix = item.position.x;
    let iz = item.position.z;
    if (item.kind === 'npc' && npcRuntimeStates.length > 0) {
      const live = npcRuntimeStates.find((n) => n.id === item.id);
      if (live) {
        ix = live.x;
        iz = live.z;
      }
    }

    const dx = ix - playerX;
    const dz = iz - playerZ;
    const dist = Math.hypot(dx, dz);
    if (dist > item.interactionRadius) continue;

    if (
      wallAabbs.length > 0 &&
      isInteractionBlockedByWall(playerX, playerZ, ix, iz, wallAabbs)
    ) {
      continue;
    }

    const dirX = dist > 0.001 ? dx / dist : forwardX;
    const dirZ = dist > 0.001 ? dz / dist : forwardZ;
    const dot = dirX * forwardX + dirZ * forwardZ;
    const facingFactor = 1.0 - dot * 0.28;
    const stabilityBonus = item.id === currentTargetId ? -0.35 : 0;
    const score = dist * facingFactor + stabilityBonus;

    const firstName = item.name.split(' ')[0];
    const actionLabel = item.kind === 'npc' ? `Talk to ${firstName}` : `Inspect ${firstName}`;
    const liveItem: CampusInteractable = {
      ...item,
      position: { x: ix, y: item.position.y, z: iz },
    };

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = {
        kind: 'npc',
        sourceKind: 'npc',
        id: item.id,
        displayName: item.name,
        label: item.name,
        subtitle: item.role,
        actionLabel,
        actionVerb: actionLabel,
        secondaryActions:
          item.kind === 'npc'
            ? ['Ask About School', 'Invite to Study', 'Start Mission']
            : [],
        icon: item.kind === 'npc' ? '💬' : '📋',
        distance: Number(dist.toFixed(2)),
        score: Number(score.toFixed(3)),
        npcRef: liveItem,
        npcTarget: liveItem,
      };
    }
  }

  return bestCandidate;
}

