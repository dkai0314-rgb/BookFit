export type RecommendMode = 'TASTE' | 'MIND';

export interface RecommendationRequest {
    mode: RecommendMode;
    customQuery?: string;
    situation?: string;
}

export interface RecommendedBookBase {
    title: string;
    author: string;
    publisher?: string;
    reason: string;
    coreMessage: string;
    userConnectionPoint: string;
}
