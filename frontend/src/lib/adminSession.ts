const ADMIN_SESSION_KEY =
  "drl_electronik_admin_session";

export function getAdminAccessToken(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "La sesión administrativa solo está disponible en el navegador."
    );
  }

  const savedSession =
    localStorage.getItem(ADMIN_SESSION_KEY);

  if (!savedSession) {
    throw new Error(
      "No hay una sesión administrativa activa."
    );
  }

  try {
    const parsedSession = JSON.parse(
      savedSession
    );

    const accessToken =
      parsedSession?.accessToken;

    if (!accessToken) {
      localStorage.removeItem(
        ADMIN_SESSION_KEY
      );

      throw new Error(
        "No se encontró el token de acceso administrativo."
      );
    }

    return accessToken;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "No se encontró el token"
      )
    ) {
      throw error;
    }

    localStorage.removeItem(
      ADMIN_SESSION_KEY
    );

    throw new Error(
      "La sesión administrativa no es válida."
    );
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    ADMIN_SESSION_KEY
  );
}