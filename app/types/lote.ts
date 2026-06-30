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
  traseiroCapoteBoi: number;
  dianteiroBoi: number;
  pontaBoi: number;

  traseiroVaca: number;
  traseiroCapoteVaca: number;
  dianteiroVaca: number;
  pontaVaca: number;

  miudos: number;

  // Peso usado pelo módulo de miúdos. O custo dos miúdos não é calculado em separado.
  pesoMiudosRecebido?: number;

  valorGado: number;
  precoArrobaBoi: number;
  precoArrobaVaca: number;
  frete: number;
  custoPorCabecaAdicional: number;
  folhaAbateMensal: number;
  diasAbateMes: number;
  taxas: number;
  outrosCustos: number;

  indiceTraseiro: number;
  indiceTraseiroCapoteBoi: number;
  indiceTraseiroCapoteVaca: number;
  indiceDianteiro: number;
  indicePonta: number;
  indiceMiudos: number;

  observacoes: string;
};
