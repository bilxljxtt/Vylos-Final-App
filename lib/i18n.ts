"use client";

import { useAppStore } from "./AppContext";

const TRANSLATIONS: Record<string, Record<string, string>> = {
  "English (US)": {
    dashboard: "Dashboard",
    budgets: "Budgets",
    goals: "Goals",
    progress: "Progress",
    settings: "Settings",
    welcome: "Good morning",
    overview: "Here's your financial overview for today.",
    balance: "Liquid Balance",
    health: "Financial Health",
    addTx: "Add Transaction",
    importTx: "Import Data",
    transactions: "Transactions",
    search: "Search...",
  },
  "Afrikaans": {
    dashboard: "Paneelbord",
    budgets: "Begrotings",
    goals: "Doelwitte",
    progress: "Vordering",
    settings: "Instellings",
    welcome: "Goeie môre",
    overview: "Hier is jou finansiële oorsig vir vandag.",
    balance: "Vloeibare Balans",
    health: "Finansiële Gesondheid",
    addTx: "Voeg Transaksie by",
    importTx: "Voer Data in",
    transactions: "Transaksies",
    search: "Soek...",
  },
  "Zulu": {
    dashboard: "Ideshibhodi",
    budgets: "Izabelomali",
    goals: "Izinjongo",
    progress: "Inqubekelaphambili",
    settings: "Izilungiselelo",
    welcome: "Sawubona",
    overview: "Nguwo lo umbono wakho wezezimali namuhla.",
    balance: "Ibhalansi",
    health: "Impilo Yezezimali",
    addTx: "Faka Okwenziwayo",
    importTx: "Landa Idatha",
    transactions: "Okwenziwayo",
    search: "Funa...",
  },
  "Xhosa": {
    dashboard: "Ideshibhodi",
    budgets: "Uhlahlo-lwabiwo-mali",
    goals: "Izinto ekujoliswe kuzo",
    progress: "Inkqubela",
    settings: "Izilungiselelo",
    welcome: "Molo",
    overview: "Nolu uhlahlo-lwabiwo-mali lwakho lanamhlanje.",
    balance: "Ibhalansi",
    health: "Impilo Yezezimali",
    addTx: "Faka Intengiselwano",
    importTx: "Ngenisa Idatha",
    transactions: "Intengiselwano",
    search: "Khangela...",
  }
};

export function useTranslation() {
  const { state } = useAppStore();
  const lang = state.userProfile.language || "English (US)";
  
  const t = (key: string) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["English (US)"][key] || key;
  };

  return { t, currentLang: lang };
}
