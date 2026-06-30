export type MiudosProdutoKey =
  | "carneIndustrialLombinho"
  | "carneIndustrialBifeVazio"
  | "carneIndustrialFraldinha"
  | "carneIndustrialCabeca"
  | "carneIndustrialSangria"
  | "aorta"
  | "omaso"
  | "reticuloColmeia"
  | "gloteB"
  | "tendao"
  | "traqueia"
  | "vergalho"
  | "mocoto"
  | "rumen"
  | "bucho"
  | "figado"
  | "coracao"
  | "lingua"
  | "rins"
  | "rim"
  | "pulmao"
  | "couro"
  | "sangueFetal"
  | "bexiga"
  | "orelha"
  | "casco"
  | "bilis"
  | "rabo"
  | "rabada"
  | "baco"
  | "chifre"
  | "aortaB"
  | "tendaoB"
  | "gordura"
  | "tripa"
  | "residuos"
  | "ligamentoCervical"
  | "ubere"
  | "sebo"
  | "membrana"
  | "vassoura"
  | "sangue"
  | "papila"
  | "outros";

export const MIUDOS_PRODUTOS: {
  key: MiudosProdutoKey;
  nome: string;
  indicePadrao: number;
}[] = [
  { key: "carneIndustrialLombinho", nome: "Carne Industrial Lombinho", indicePadrao: 1 },
  { key: "carneIndustrialBifeVazio", nome: "Carne Industrial Bife Vazio", indicePadrao: 1 },
  { key: "carneIndustrialFraldinha", nome: "Carne Industrial Fraldinha", indicePadrao: 1 },
  { key: "carneIndustrialCabeca", nome: "Carne Industrial de Cabeça", indicePadrao: 1 },
  { key: "carneIndustrialSangria", nome: "Carne Industrial Sangria", indicePadrao: 1 },
  { key: "aorta", nome: "Aorta", indicePadrao: 1 },
  { key: "omaso", nome: "Omaso", indicePadrao: 1 },
  { key: "reticuloColmeia", nome: "Retículo / Colmeia", indicePadrao: 1 },
  { key: "gloteB", nome: "Glote B", indicePadrao: 1 },
  { key: "tendao", nome: "Tendão", indicePadrao: 1 },
  { key: "traqueia", nome: "Traqueia", indicePadrao: 1 },
  { key: "vergalho", nome: "Vergalho", indicePadrao: 1 },
  { key: "mocoto", nome: "Mocotó", indicePadrao: 0.9 },
  { key: "rumen", nome: "Rúmen", indicePadrao: 1 },
  { key: "bucho", nome: "Bucho", indicePadrao: 0.7 },
  { key: "figado", nome: "Fígado", indicePadrao: 1 },
  { key: "coracao", nome: "Coração", indicePadrao: 1.1 },
  { key: "lingua", nome: "Língua", indicePadrao: 2.5 },
  { key: "rins", nome: "Rins", indicePadrao: 0.8 },
  { key: "rim", nome: "Rim", indicePadrao: 1 },
  { key: "pulmao", nome: "Pulmão", indicePadrao: 1 },
  { key: "couro", nome: "Couro", indicePadrao: 1 },
  { key: "sangueFetal", nome: "Sangue Fetal", indicePadrao: 1 },
  { key: "bexiga", nome: "Bexiga", indicePadrao: 1 },
  { key: "orelha", nome: "Orelha", indicePadrao: 1 },
  { key: "casco", nome: "Casco", indicePadrao: 1 },
  { key: "bilis", nome: "Bilis", indicePadrao: 1 },
  { key: "rabo", nome: "Rabo", indicePadrao: 1 },
  { key: "rabada", nome: "Rabada", indicePadrao: 2 },
  { key: "baco", nome: "Baço", indicePadrao: 1 },
  { key: "chifre", nome: "Chifre", indicePadrao: 1 },
  { key: "aortaB", nome: "Aorta B", indicePadrao: 1 },
  { key: "tendaoB", nome: "Tendão B", indicePadrao: 1 },
  { key: "gordura", nome: "Gordura", indicePadrao: 1 },
  { key: "tripa", nome: "Tripa", indicePadrao: 1 },
  { key: "residuos", nome: "Resíduos", indicePadrao: 1 },
  { key: "ligamentoCervical", nome: "Ligamento Cervical", indicePadrao: 1 },
  { key: "ubere", nome: "Úbere", indicePadrao: 1 },
  { key: "sebo", nome: "Sebo", indicePadrao: 1 },
  { key: "membrana", nome: "Membrana", indicePadrao: 1 },
  { key: "vassoura", nome: "Vassoura", indicePadrao: 1 },
  { key: "sangue", nome: "Sangue", indicePadrao: 1 },
  { key: "papila", nome: "Papila", indicePadrao: 1 },
  { key: "outros", nome: "Outros", indicePadrao: 1 },
];
