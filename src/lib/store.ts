import { create } from 'zustand';

export interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string;
    thumbnail: string;
    infoLink: string;
    isbn?: string; // Add ISBN
    viewerUrl?: string; // Add 360 Viewer URL
    reason?: string;
}

// ?¤ë¬¸ ?°ì´???€???•ì˜
export interface SurveyState {
    step: number;
    answers: {
        emotion: string[]; // Step 1: ê¸°ë¶„/ê°ì •
        situation: string[]; // Step 2: ?„ìž¬ ?í™©/ê³ ë?
        style: string; // Step 3: ? í˜¸?˜ëŠ” ?…ì„œ ?¤í???
        userRequest: string; // Step 4: ?¬ìš©???”ì²­ (?ì—°??
    };
    recommendations: Book[]; // API Result
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setAnswer: (key: keyof SurveyState['answers'], value: string | string[]) => void;
    setRecommendations: (books: Book[]) => void;
    reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
    step: 1,
    answers: {
        emotion: [],
        situation: [],
        style: '',
        userRequest: '',
    },
    recommendations: [],
    setStep: (step) => set({ step }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
    setAnswer: (key, value) =>
        set((state) => ({
            answers: { ...state.answers, [key]: value },
        })),
    setRecommendations: (books) => set({ recommendations: books }),
    reset: () =>
        set({
            step: 1,
            answers: { emotion: [], situation: [], style: '', userRequest: '' },
            recommendations: [],
        }),
}));
