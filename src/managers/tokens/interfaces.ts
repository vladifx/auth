export interface TokenPayload {
    userId: string;
    sessionId: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}