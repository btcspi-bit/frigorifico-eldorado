import { LoteData } from "../types/lote";

type IndiceCustoKey =
  | "indiceTraseiro"
  | "indiceTraseiroCapoteBoi"
  | "indiceTraseiroCapoteVaca"
  | "indiceDianteiro"
  | "indicePonta"
  | "indiceMiudos";

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

export function calculate(data: LoteData) {
  const totalCabecas = Number(data.quantidadeBois || 0) + Number(data.quantidadeVacas || 0);

  const carcacaQuenteBoi = Number(data.carcacaQuenteBoi || 0);
  const carcacaQuenteVaca = Number(data.carcacaQuenteVaca || 0);
  const carcacaQuenteTotal = carcacaQuenteBoi + carcacaQuenteVaca;

  const quebraPercentual = Number(data.quebraPercentual || 0);
  const carcacaFriaTotal = carcacaQuenteTotal * (1 - quebraPercentual / 100);
  const carcacaFriaBoi = carcacaQuenteBoi * (1 - quebraPercentual / 100);
  const carcacaFriaVaca = carcacaQuenteVaca * (1 - quebraPercentual / 100);

  const pesoMedioBoi = safeDiv(carcacaQuenteBoi, Number(data.quantidadeBois || 0));
  const pesoMedioVaca = safeDiv(carcacaQuenteVaca, Number(data.quantidadeVacas || 0));
  const pesoMedioGeral = safeDiv(carcacaQuenteTotal, totalCabecas);

  // Compra do boi/vaca: base de arroba quente.
  // Retorno/planejamento: base de arroba fria, após quebra de resfriamento.
  const arrobasQuenteBoi = carcacaQuenteBoi / 15;
  const arrobasQuenteVaca = carcacaQuenteVaca / 15;
  const arrobasQuenteTotal = carcacaQuenteTotal / 15;

  const arrobasFriaBoi = carcacaFriaBoi / 15;
  const arrobasFriaVaca = carcacaFriaVaca / 15;
  const arrobasFriaTotal = carcacaFriaTotal / 15;

  // Mantém nomes antigos como base fria para compatibilidade dos relatórios já existentes.
  const arrobasBoi = arrobasFriaBoi;
  const arrobasVaca = arrobasFriaVaca;
  const arrobasTotal = arrobasFriaTotal;

  const mediaArrobaQuenteBoi = safeDiv(arrobasQuenteBoi, Number(data.quantidadeBois || 0));
  const mediaArrobaQuenteVaca = safeDiv(arrobasQuenteVaca, Number(data.quantidadeVacas || 0));
  const mediaArrobaQuenteGeral = safeDiv(arrobasQuenteTotal, totalCabecas);

  const mediaArrobaFriaBoi = safeDiv(arrobasFriaBoi, Number(data.quantidadeBois || 0));
  const mediaArrobaFriaVaca = safeDiv(arrobasFriaVaca, Number(data.quantidadeVacas || 0));
  const mediaArrobaFriaGeral = safeDiv(arrobasFriaTotal, totalCabecas);

  const mediaArrobaBoi = mediaArrobaFriaBoi;
  const mediaArrobaVaca = mediaArrobaFriaVaca;
  const mediaArrobaGeral = mediaArrobaFriaGeral;

  const producaoTraseiroBoi = Number(data.traseiroBoi || 0);
  const producaoTraseiroCapoteBoi = Number(data.traseiroCapoteBoi || 0);
  const producaoDianteiroBoi = Number(data.dianteiroBoi || 0);
  const producaoPontaBoi = Number(data.pontaBoi || 0);

  const producaoTraseiroVaca = Number(data.traseiroVaca || 0);
  const producaoTraseiroCapoteVaca = Number(data.traseiroCapoteVaca || 0);
  const producaoDianteiroVaca = Number(data.dianteiroVaca || 0);
  const producaoPontaVaca = Number(data.pontaVaca || 0);

  const producaoTraseiro = producaoTraseiroBoi + producaoTraseiroVaca;
  const producaoDianteiro = producaoDianteiroBoi + producaoDianteiroVaca;
  const producaoPonta = producaoPontaBoi + producaoPontaVaca;
  const producaoMiudos = Number(data.miudos || 0);
  const producaoCarnes =
    producaoTraseiro +
    producaoTraseiroCapoteBoi +
    producaoTraseiroCapoteVaca +
    producaoDianteiro +
    producaoPonta;

  const producaoTotal = producaoCarnes + producaoMiudos;

  const aproveitamentoIndustrial = safeDiv(producaoTotal, carcacaFriaTotal) * 100;

  const rendimentoTraseiroBoi = safeDiv(producaoTraseiroBoi, carcacaFriaBoi) * 100;
  const rendimentoTraseiroCapoteBoi = safeDiv(producaoTraseiroCapoteBoi, carcacaFriaBoi) * 100;
  const rendimentoDianteiroBoi = safeDiv(producaoDianteiroBoi, carcacaFriaBoi) * 100;
  const rendimentoPontaBoi = safeDiv(producaoPontaBoi, carcacaFriaBoi) * 100;

  const rendimentoTraseiroVaca = safeDiv(producaoTraseiroVaca, carcacaFriaVaca) * 100;
  const rendimentoTraseiroCapoteVaca = safeDiv(producaoTraseiroCapoteVaca, carcacaFriaVaca) * 100;
  const rendimentoDianteiroVaca = safeDiv(producaoDianteiroVaca, carcacaFriaVaca) * 100;
  const rendimentoPontaVaca = safeDiv(producaoPontaVaca, carcacaFriaVaca) * 100;

  const rendimentoTraseiro = safeDiv(producaoTraseiro, carcacaFriaTotal) * 100;
  const rendimentoTraseiroCapoteBoiGeral = safeDiv(producaoTraseiroCapoteBoi, carcacaFriaTotal) * 100;
  const rendimentoTraseiroCapoteVacaGeral = safeDiv(producaoTraseiroCapoteVaca, carcacaFriaTotal) * 100;
  const rendimentoDianteiro = safeDiv(producaoDianteiro, carcacaFriaTotal) * 100;
  const rendimentoPonta = safeDiv(producaoPonta, carcacaFriaTotal) * 100;
  const rendimentoMiudos = safeDiv(producaoMiudos, carcacaFriaTotal) * 100;

  const traseiroMedioBoi = safeDiv(producaoTraseiroBoi, Number(data.quantidadeBois || 0));
  const traseiroCapoteMedioBoi = safeDiv(producaoTraseiroCapoteBoi, Number(data.quantidadeBois || 0));
  const dianteiroMedioBoi = safeDiv(producaoDianteiroBoi, Number(data.quantidadeBois || 0));
  const pontaMedioBoi = safeDiv(producaoPontaBoi, Number(data.quantidadeBois || 0));

  const traseiroMedioVaca = safeDiv(producaoTraseiroVaca, Number(data.quantidadeVacas || 0));
  const traseiroCapoteMedioVaca = safeDiv(producaoTraseiroCapoteVaca, Number(data.quantidadeVacas || 0));
  const dianteiroMedioVaca = safeDiv(producaoDianteiroVaca, Number(data.quantidadeVacas || 0));
  const pontaMedioVaca = safeDiv(producaoPontaVaca, Number(data.quantidadeVacas || 0));

  const valorGadoInformado = Number(data.valorGado || 0);
  const valorGadoPorArroba =
    arrobasQuenteBoi * Number(data.precoArrobaBoi || 0) +
    arrobasQuenteVaca * Number(data.precoArrobaVaca || 0);

  const custoGadoConsiderado =
    valorGadoInformado > 0 ? valorGadoInformado : valorGadoPorArroba;

  const custoPorCabecaAdicional = Number(data.custoPorCabecaAdicional || 0);
  const custoCabecasAdicional = custoPorCabecaAdicional * totalCabecas;
  const folhaAbateMensal = Number(data.folhaAbateMensal || 0);
  const diasAbateMes = Number(data.diasAbateMes || 0);
  const folhaAbateDia = safeDiv(folhaAbateMensal, diasAbateMes);
  const folhaAbatePorCabeca = safeDiv(folhaAbateDia, totalCabecas);
  const folhaAbateAplicada = folhaAbatePorCabeca * totalCabecas;

  const custoTotal =
    custoGadoConsiderado +
    Number(data.frete || 0) +
    custoCabecasAdicional +
    folhaAbateAplicada +
    Number(data.taxas || 0) +
    Number(data.outrosCustos || 0);

  const custoPorArrobaQuente = safeDiv(custoTotal, arrobasQuenteTotal);
  const custoPorArrobaFria = safeDiv(custoTotal, arrobasFriaTotal);
  const custoPorArroba = custoPorArrobaFria;
  const custoPorCabeca = safeDiv(custoTotal, totalCabecas);
  const custoPorKg = safeDiv(custoTotal, producaoTotal);
  const custoPorKgProducaoInformada = custoPorKg;
  const custoPorKgCarcacaFria = safeDiv(custoTotal, carcacaFriaTotal);
  const custoPorKgCarcacaQuente = safeDiv(custoTotal, carcacaQuenteTotal);

  const produtos = [
    {
      nome: "Traseiro Boi",
      peso: producaoTraseiroBoi,
      indice: Number(data.indiceTraseiro || 0),
      indiceKey: "indiceTraseiro" as IndiceCustoKey,
    },
    {
      nome: "Traseiro Vaca",
      peso: producaoTraseiroVaca,
      indice: Number(data.indiceTraseiro || 0),
      indiceKey: "indiceTraseiro" as IndiceCustoKey,
    },
    {
      nome: "Traseiro Capote de Boi",
      peso: producaoTraseiroCapoteBoi,
      indice: Number(data.indiceTraseiroCapoteBoi || 0),
      indiceKey: "indiceTraseiroCapoteBoi" as IndiceCustoKey,
    },
    {
      nome: "Traseiro Capote de Vaca",
      peso: producaoTraseiroCapoteVaca,
      indice: Number(data.indiceTraseiroCapoteVaca || 0),
      indiceKey: "indiceTraseiroCapoteVaca" as IndiceCustoKey,
    },
    {
      nome: "Dianteiro Boi",
      peso: producaoDianteiroBoi,
      indice: Number(data.indiceDianteiro || 0),
      indiceKey: "indiceDianteiro" as IndiceCustoKey,
    },
    {
      nome: "Dianteiro Vaca",
      peso: producaoDianteiroVaca,
      indice: Number(data.indiceDianteiro || 0),
      indiceKey: "indiceDianteiro" as IndiceCustoKey,
    },
    {
      nome: "Ponta de Agulha Boi",
      peso: producaoPontaBoi,
      indice: Number(data.indicePonta || 0),
      indiceKey: "indicePonta" as IndiceCustoKey,
    },
    {
      nome: "Ponta de Agulha Vaca",
      peso: producaoPontaVaca,
      indice: Number(data.indicePonta || 0),
      indiceKey: "indicePonta" as IndiceCustoKey,
    },
    {
      nome: "Miúdos",
      peso: producaoMiudos,
      indice: Number(data.indiceMiudos || 0),
      indiceKey: "indiceMiudos" as IndiceCustoKey,
    },
  ];

  const pesoIndexadoTotal = produtos.reduce(
    (acc, produto) => acc + produto.peso * produto.indice,
    0
  );

  const produtosCalculados = produtos.map((produto) => {
    const pesoIndexado = produto.peso * produto.indice;

    const custoDistribuido =
      pesoIndexadoTotal > 0 ? (pesoIndexado / pesoIndexadoTotal) * custoTotal : 0;

    const custoKg = safeDiv(custoDistribuido, produto.peso);

    return {
      ...produto,
      custoDistribuido,
      custoKg,
    };
  });

  const custoMiudos = produtosCalculados.find((produto) => produto.nome === "Miúdos")?.custoDistribuido || 0;

  return {
    totalCabecas,

    carcacaQuenteTotal,
    carcacaFriaTotal,
    carcacaFriaBoi,
    carcacaFriaVaca,

    pesoMedioBoi,
    pesoMedioVaca,
    pesoMedioGeral,

    arrobasQuenteBoi,
    arrobasQuenteVaca,
    arrobasQuenteTotal,
    arrobasFriaBoi,
    arrobasFriaVaca,
    arrobasFriaTotal,
    arrobasBoi,
    arrobasVaca,
    arrobasTotal,
    mediaArrobaQuenteBoi,
    mediaArrobaQuenteVaca,
    mediaArrobaQuenteGeral,
    mediaArrobaFriaBoi,
    mediaArrobaFriaVaca,
    mediaArrobaFriaGeral,
    mediaArrobaBoi,
    mediaArrobaVaca,
    mediaArrobaGeral,

    producaoTraseiroBoi,
    producaoTraseiroCapoteBoi,
    producaoDianteiroBoi,
    producaoPontaBoi,
    producaoTraseiroVaca,
    producaoTraseiroCapoteVaca,
    producaoDianteiroVaca,
    producaoPontaVaca,
    producaoTraseiro,
    producaoDianteiro,
    producaoPonta,
    producaoMiudos,
    producaoCarnes,
    producaoTotal,

    aproveitamentoIndustrial,

    rendimentoTraseiroBoi,
    rendimentoTraseiroCapoteBoi,
    rendimentoDianteiroBoi,
    rendimentoPontaBoi,
    rendimentoTraseiroVaca,
    rendimentoTraseiroCapoteVaca,
    rendimentoDianteiroVaca,
    rendimentoPontaVaca,
    rendimentoTraseiro,
    rendimentoTraseiroCapoteBoiGeral,
    rendimentoTraseiroCapoteVacaGeral,
    rendimentoDianteiro,
    rendimentoPonta,
    rendimentoMiudos,

    traseiroMedioBoi,
    traseiroCapoteMedioBoi,
    dianteiroMedioBoi,
    pontaMedioBoi,
    traseiroMedioVaca,
    traseiroCapoteMedioVaca,
    dianteiroMedioVaca,
    pontaMedioVaca,

    valorGadoPorArroba,
    custoGadoConsiderado,
    custoCabecasAdicional,
    folhaAbateDia,
    folhaAbatePorCabeca,
    folhaAbateAplicada,
    custoTotal,
    custoPorArroba,
    custoPorArrobaQuente,
    custoPorArrobaFria,
    custoPorCabeca,
    custoPorKg,
    custoPorKgProducaoInformada,
    custoPorKgCarcacaFria,
    custoPorKgCarcacaQuente,
    custoMiudos,

    produtosCalculados,
  };
}
