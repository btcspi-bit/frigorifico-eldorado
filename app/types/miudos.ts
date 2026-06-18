export interface MiudosData {
  data: string;
  numeroLote: string;

  quantidadeBois?: number;
  quantidadeVacas?: number;

  pesoRecebido: number;
  custoHerdado: number;

  figado: number;
  coracao: number;
  lingua: number;
  rins: number;
  bucho: number;
  mocoto: number;
  rabada: number;
  outros: number;

  embalagens: number;
  etiquetas: number;
  caixas: number;
  maoObra: number;
  outrosCustos: number;

  indiceFigado: number;
  indiceCoracao: number;
  indiceLingua: number;
  indiceRins: number;
  indiceBucho: number;
  indiceMocoto: number;
  indiceRabada: number;
  indiceOutros: number;

  margemFigado: number;
  margemCoracao: number;
  margemLingua: number;
  margemRins: number;
  margemBucho: number;
  margemMocoto: number;
  margemRabada: number;
  margemOutros: number;

  observacoes: string;
}

export type MiudosProdutoCalculado = {
  key:
    | "figado"
    | "coracao"
    | "lingua"
    | "rins"
    | "bucho"
    | "mocoto"
    | "rabada"
    | "outros";
  nome: string;
  peso: number;
  indice: number;
  margem: number;
  rendimento: number;
  kgPorCabeca: number;
  custoDistribuido: number;
  custoKg: number;
  precoSugerido: number;
  receitaPrevista: number;
  lucroPrevisto: number;
  margemReal: number;
};
