export type LoteData = {
  data: string;
  numeroLote: string;

  quantidadeBois: number;
  quantidadeVacas: number;

  carcacaQuenteBoi: number;
  carcacaQuenteVaca: number;

  quebraPercentual: number;
  carcacaFriaReal?: number;

  traseiroBoi: number;
  dianteiroBoi: number;
  pontaBoi: number;

  traseiroVaca: number;
  dianteiroVaca: number;
  pontaVaca: number;

  miudos: number;
  sebo: number;

  // Campo mantido como opcional para compatibilidade com lotes antigos.
  miudosSebo?: number;

  // Campos usados pelo módulo de miúdos.
  pesoMiudosRecebido?: number;
  custoBlocoMiudos?: number;

  valorGado: number;
  precoArrobaBoi: number;
  precoArrobaVaca: number;
  frete: number;
  embalagens: number;
  etiquetas: number;
  taxas: number;
  outrosCustos: number;

  indiceTraseiro: number;
  indiceDianteiro: number;
  indicePonta: number;
  indiceMiudos: number;
  indiceSebo: number;

  margemPercentual: number;

  observacoes: string;
};
