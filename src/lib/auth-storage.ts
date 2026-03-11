const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const AUTH_EXPIRED_EVENT = "app:auth-expired";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY) || readCookie(AUTH_TOKEN_KEY);
}

export function persistAuthSession(user: unknown, token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function notifyAuthExpired(): void {
  if (typeof window === "undefined") {
    return;
  }

  clearAuthSession();
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

export function onAuthExpired(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => listener();
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);

  return () => {
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
  };
}

export { AUTH_EXPIRED_EVENT, AUTH_TOKEN_KEY, AUTH_USER_KEY };
