
const POS_SESSION_KEY = "drl_electronik_pos_session";

export type PosSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number | null;
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
};

export function savePosSession(session: PosSession): void {
  localStorage.setItem(
    POS_SESSION_KEY,
    JSON.stringify(session)
  );
}

export function getPosSession(): PosSession | null {
  const stored = localStorage.getItem(POS_SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored) as PosSession;

    if (!session.accessToken || !session.user?.id) {
      localStorage.removeItem(POS_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(POS_SESSION_KEY);
    return null;
  }
}

export function getPosAccessToken(): string | null {
  return getPosSession()?.accessToken ?? null;
}

export function clearPosSession(): void {
  localStorage.removeItem(POS_SESSION_KEY);
}
