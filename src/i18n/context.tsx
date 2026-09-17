import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import ja from "./locales/ja";
import en from "./locales/en";
import type { Lang } from "../lib/types";

const dicts: Record<Lang, Record<string, string>> = { ja, en };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({ lang: "ja", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem("shigoto-lang");
      if (s === "en" || s === "ja") return s;
      const u = localStorage.getItem("shigoto-user");
      if (u) { const p = JSON.parse(u); if (p.lang === "en" || p.lang === "ja") return p.lang; }
    } catch {}
    return "ja";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("shigoto-lang", l);
      const u = localStorage.getItem("shigoto-user");
      if (u) { const p = JSON.parse(u); p.lang = l; localStorage.setItem("shigoto-user", JSON.stringify(p)); }
    } catch {}
    document.documentElement.lang = l === "ja" ? "ja" : "en";
  };
  useEffect(() => { document.documentElement.lang = lang === "ja" ? "ja" : "en"; }, [lang]);
  const t = (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
