

import { World, Quest, LeagueTier, Friend } from './types';

export const XP_PER_LEVEL = 1000;

export const PIANO_KEYS = {
    white: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    black: ['C#', 'D#', null, 'F#', 'G#', 'A#', null],
};

export const WORLDS_DATA: World[] = [
    {
        id: 'w1',
        title: 'The Notes Valley',
        description: 'Help Buddy restore the music to this valley by learning the basic notes.',
        color: 'bg-blue-500',
        lessons: [
            { id: 'l1-1', type: 'note_identification', title: 'Meet C & D', xp: 50, tokens: 1, content: ['C4', 'D4'], fact: "The piano has 88 keys in total!" },
            { id: 'l1-2', type: 'note_identification', title: 'Hello E, F, G', xp: 75, tokens: 1, content: ['E4', 'F4', 'G4'], fact: "The 'Middle C' is the C key closest to the middle of the piano." },
            { id: 'l1-3', type: 'note_identification', title: 'Introducing A & B', xp: 75, tokens: 1, content: ['A4', 'B4'], fact: "Notes repeat in a pattern of 7 white keys and 5 black keys. This pattern is called an octave." },
            { id: 'l1-4', type: 'quiz', title: 'Note Review', xp: 100, tokens: 1, content: [
                { question: "What note comes after F?", options: ["E", "G", "A"], correctAnswer: "G" },
                { question: "Which note comes before C?", options: ["D", "A", "B"], correctAnswer: "B" },
            ]},
            { id: 'l1-5', type: 'note_identification', title: 'Technique: C Major Scale', xp: 120, tokens: 1, content: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], fact: "A scale is a set of musical notes ordered by pitch. The C Major scale uses only white keys." },
            { id: 'l1-6', type: 'note_identification', title: 'Technique: A Minor Scale', xp: 120, tokens: 1, content: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], fact: "The A Minor scale is known as the 'relative minor' of C Major because they share the same keys." },
            { id: 'l1-7', type: 'quiz', title: 'Theory: Note Values', xp: 100, tokens: 1, content: [
                { question: "How many beats does a Crotchet (quarter note) last for?", options: ["1", "2", "4"], correctAnswer: "1" },
                { question: "A Minim (half note) is held for how many beats?", options: ["1", "2", "4"], correctAnswer: "2" },
            ]},
            { id: 'l1-8', type: 'quiz', title: 'Theory: Understanding Rests', xp: 100, tokens: 1, content: [
                { question: "What does a 'rest' in music mean?", options: ["Play loudly", "A moment of silence", "Play faster"], correctAnswer: "A moment of silence" },
            ]},
            { id: 'l1-9', type: 'note_identification', title: 'Scale Practice', xp: 100, tokens: 1, content: ['C4', 'E4', 'G4', 'A4', 'C5'], fact: "Practicing scales helps build finger strength and speed." },
            { id: 'l1-10', type: 'boss', title: 'Valley Guardian', xp: 150, tokens: 1, content: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
        ],
    },
    {
        id: 'w2',
        title: 'Chord Peaks',
        description: 'The mountain is quiet. Bring it to life with the sound of chords!',
        color: 'bg-purple-500',
        lessons: [
            { id: 'l2-1', type: 'chord_identification', title: 'C Major Chord', xp: 100, tokens: 1, content: { name: 'C Major', notes: ['C4', 'E4', 'G4'] } },
            { id: 'l2-2', type: 'chord_identification', title: 'G Major Chord', xp: 100, tokens: 1, content: { name: 'G Major', notes: ['G4', 'B4', 'D5'] } },
            { id: 'l2-3', type: 'chord_identification', title: 'Meet F Major', xp: 100, tokens: 1, content: { name: 'F Major', notes: ['F4', 'A4', 'C5'] } },
            { id: 'l2-4', type: 'chord_identification', title: 'Introducing A Minor', xp: 100, tokens: 1, content: { name: 'A Minor', notes: ['A4', 'C5', 'E5'] } },
            { id: 'l2-5', type: 'quiz', title: 'Chord Challenge', xp: 120, tokens: 1, content: [
                 { question: "What are the notes in a C Major chord?", options: ["C, E, G", "C, D, E", "C, F, G"], correctAnswer: "C, E, G" },
                 { question: "Which of these is a minor chord?", options: ["C Major", "G Major", "A Minor"], correctAnswer: "A Minor" },
            ]},
            { id: 'l2-6', type: 'note_identification', title: 'Technique: C Major Arpeggio', xp: 120, tokens: 1, content: ['C4', 'E4', 'G4', 'C5'], fact: "An arpeggio or 'broken chord' is when you play the notes of a chord one by one." },
            { id: 'l2-7', type: 'note_identification', title: 'Technique: G Major Arpeggio', xp: 120, tokens: 1, content: ['G4', 'B4', 'D5', 'G5'] },
            { id: 'l2-8', 'type': 'quiz', 'title': 'Theory: Loud & Soft', xp: 100, tokens: 1, content: [
                { question: "What does the dynamic 'f' (forte) mean?", options: ["Play quietly", "Play loudly", "Play slowly"], correctAnswer: "Play loudly" },
                { question: "What does the dynamic 'p' (piano) mean?", options: ["Play loudly", "Play quickly", "Play quietly"], correctAnswer: "Play quietly" },
            ]},
            { id: 'l2-9', type: 'chord_identification', title: 'Chord Switching Practice', xp: 150, tokens: 1, content: { name: 'F Major', notes: ['F4', 'A4', 'C5'] } },
            { id: 'l2-10', type: 'boss', title: 'Mountain King', xp: 200, tokens: 1, content: ['C_Major', 'G_Major', 'A_Minor', 'F_Major'] },
        ]
    },
    {
        id: 'w3',
        title: 'The Songbook',
        description: "Let's learn some real songs to impress Buddy and your friends!",
        color: 'bg-rose-500',
        lessons: [
            { id: 'l3-1', type: 'song', title: "Learn: Twinkle, Twinkle", xp: 150, tokens: 1, content: { name: "Twinkle, Twinkle, Little Star", notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'] } },
            { id: 'l3-2', type: 'song', title: "Learn: Mary Had a Little Lamb", xp: 150, tokens: 1, content: { name: "Mary Had a Little Lamb", notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4'] } },
            { id: 'l3-3', type: 'song', title: "Learn: Ode to Joy", xp: 200, tokens: 1, content: { name: "Ode to Joy", notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'] } },
            { id: 'l3-4', type: 'boss', title: 'Songbook Master', xp: 250, tokens: 1, content: { name: "Medley Challenge", notes: ['C4', 'C4', 'G4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'E4', 'E4', 'F4', 'G4'] } },
        ]
    }
];

export const SHOP_COSMETICS = [
    {
        id: 'default',
        name: 'Default',
        cost: 0,
        colors: {
            bgGradient: 'from-slate-900 to-slate-800',
        },
    },
    {
        id: 'sunset',
        name: 'Sunset Groove',
        cost: 500,
        colors: {
            bgGradient: 'from-purple-900 to-rose-700',
        },
    },
    {
        id: 'ocean',
        name: 'Ocean Calm',
        cost: 500,
        colors: {
            bgGradient: 'from-cyan-900 to-blue-800',
        },
    },
    {
        id: 'forest',
        name: 'Forest Mist',
        cost: 500,
        colors: {
            bgGradient: 'from-green-900 to-teal-800',
        },
    },
];

export const DAILY_QUEST_DEFINITIONS: Omit<Quest, 'progress' | 'isClaimed'>[] = [
    { id: 'q1', type: 'earn_xp', description: 'Earn 100 XP', target: 100, reward: { tokens: 10 } },
    { id: 'q2', type: 'complete_lessons', description: 'Complete 2 lessons', target: 2, reward: { tokens: 15 } },
    { id: 'q3', type: 'earn_xp', description: 'Earn 250 XP', target: 250, reward: { tokens: 25 } },
    { id: 'q4', type: 'complete_lessons', description: 'Complete 3 lessons', target: 3, reward: { tokens: 30 } },
    { id: 'q5', type: 'earn_xp', description: 'Earn 50 XP in one lesson', target: 50, reward: { tokens: 5 } },
];

export const MOCK_INITIAL_FRIENDS: Friend[] = [
    { id: 'f1', name: 'Rhythmbot', xp: 15200, avatar: '🤖' },
    { id: 'f2', name: 'Melody', xp: 9800, avatar: '😇' },
    { id: 'f3', name: 'Harmony', xp: 7500, avatar: '🤗' },
];

export const SELECTABLE_AVATARS = ['🎹', '🎸', '🥁', '🎤', '🎧', '🎷', '🎺', '🎻', '🎼', '🎵', '🎶', '🧑‍🎤'];

// FIX: Added missing constants for leaderboards and version log to resolve import errors.
export const MOCK_LEAGUE_MEMBERS = [
    { name: 'Piano Prodigy', xp: 2340, avatar: '😎' },
    { name: 'Key Master', xp: 2110, avatar: '🧐' },
    { name: 'Sharp Shooter', xp: 1980, avatar: '🎯' },
    { name: 'Chord Crusher', xp: 1850, avatar: '💥' },
    { name: 'Rhythm Ace', xp: 1720, avatar: '🎸' },
    { name: 'Note Ninja', xp: 1600, avatar: '🥷' },
    { name: 'Treble Maker', xp: 1450, avatar: '😈' },
    { name: 'Bass King', xp: 1230, avatar: '👑' },
    { name: 'Octave Hopper', xp: 1100, avatar: '🐰' },
    { name: 'Scale Runner', xp: 950, avatar: '🏃' },
    { name: 'Tempo Tapper', xp: 820, avatar: '👆' },
    { name: 'Half Note Harry', xp: 700, avatar: '🤓' },
    { name: 'C Major Carl', xp: 550, avatar: '🙂' },
    { name: 'Middle C Maddy', xp: 400, avatar: '😊' },
];

export const LEAGUE_TIERS: Record<LeagueTier, { icon: string; name: LeagueTier; color: string; }> = {
    Bronze: { icon: '🥉', name: 'Bronze', color: 'text-orange-400' },
    Silver: { icon: '🥈', name: 'Silver', color: 'text-slate-300' },
    Gold: { icon: '🥇', name: 'Gold', color: 'text-yellow-400' },
    Diamond: { icon: '💎', name: 'Diamond', color: 'text-cyan-400' },
};

export const VERSION_LOG = [
    {
        version: '1.0.0',
        date: '2024-07-29',
        notes: [
            'Initial release of Flurn Buddy!',
            'Added Note Valley world with 10 lessons.',
            'Implemented user profiles and streaks.'
        ]
    },
    {
        version: '1.1.0',
        date: '2024-08-05',
        notes: [
            'New World: Chord Peaks!',
            'Added Daily Quests to earn more tokens.',
            'Introduced the Shop with perks and cosmetics.',
            'Added AI Tutor "Talk to Buddy" feature.'
        ]
    }
];
