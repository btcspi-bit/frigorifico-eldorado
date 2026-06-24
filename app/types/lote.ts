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

  valorGado: number;
  precoArrobaBoi: number;
  precoArrobaVaca: number;
  frete: number;
  custoPorCabecaAdicional: number;
  folhaAbateMensal: number;
  diasAbateMes: number;
  taxas: number;
  outrosCustos: number;

  indiceTraseiroBoi: number;
  indiceTraseiroCapoteBoi: number;
  indiceDianteiroBoi: number;
  indicePontaBoi: number;

  indiceTraseiroVaca: number;
  indiceTraseiroCapoteVaca: number;
  indiceDianteiroVaca: number;
  indicePontaVaca: number;

  margemPercentual: number;

  observacoes: string;
};
