import type { LoteData } from "../types/lote";

const KEY = "frigorifico-eldorado-lotes";

export function getLotes() {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(KEY);

  return data ? JSON.parse(data) : [];
}

export function saveLote(lote: LoteData) {
  const lotes = getLotes();

  lotes.push(lote);

  localStorage.setItem(KEY, JSON.stringify(lotes));
}

export function deleteLote(index: number) {
  const lotes = getLotes();

  lotes.splice(index, 1);

  localStorage.setItem(KEY, JSON.stringify(lotes));
}