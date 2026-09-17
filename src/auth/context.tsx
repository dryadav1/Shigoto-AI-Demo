import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Lang } from "../lib/types";
import { api, setAccessToken } from "../lib/api";

export type Role = "owner" | "admin" | "manager" | "employee" | "viewer";

export interface User { id: number; name: string; email: string; role: Role; lang: Lang; }
interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, ready: false,
  login: async () => {}, register: async () => {}, logout: async () => {},
});

/** Only Owner / Admin may access the Enquiries admin section. */
export function canAccessEnquiries(user: User | null): boolean {
  return !!user && (user.role === "owner" || user.role === "admin");
}

function withLang(u: Omit<User, "lang">): User {
  let lang: Lang = "ja";
  try {
    const s = localStorage.getItem("shigoto-lang");
    if (s === "en" || s === "ja") lang = s;
  } catch {}
  return { ...u, lang };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Boot session: silent refresh via httpOnly cookie, then /me.
  useEffect(() => {
    (async () => {
      try {
        await api<{ accessToken: string }>("/api/auth/refresh", { method: "POST" }).then((d) => {
          setAccessToken(d.accessToken);
          return api<{ user: Omit<User, "lang"> }>("/api/auth/me");
        }).then((d) => setUser(withLang(d.user)));
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const d = await api<{ user: Omit<User, "lang">; accessToken: string }>("/api/auth/login", {
      method: "POST", body: { email, password },
    });
    setAccessToken(d.accessToken);
    setUser(withLang(d.user));
  };
  const register = async (name: string, email: string, password: string) => {
    const d = await api<{ user: Omit<User, "lang">; accessToken: string }>("/api/auth/register", {
      method: "POST", body: { name, email, password },
    });
    setAccessToken(d.accessToken);
    setUser(withLang(d.user));
  };
  const logout = async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch {}
    setAccessToken(null);
    setUser(null);
  };
  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
