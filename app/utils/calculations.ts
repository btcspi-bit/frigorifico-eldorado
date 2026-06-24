import { LoteData } from "../types/lote";

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

function indexValue(primary: number | undefined, legacy: number | undefined, fallback: number) {
  const primaryValue = Number(primary || 0);
  if (primaryValue > 0) return primaryValue;

  const legacyValue = Number(legacy || 0);
  return legacyValue > 0 ? legacyValue : fallback;
}

export function calculate(data: LoteData) {
  const legacyData = data as LoteData & {
    indiceTraseiro?: number;
    indiceDianteiro?: number;
    indicePonta?: number;
  };

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

  const arrobasBoi = carcacaFriaBoi / 15;
  const arrobasVaca = carcacaFriaVaca / 15;
  const arrobasTotal = carcacaFriaTotal / 15;

  const mediaArrobaBoi = safeDiv(arrobasBoi, Number(data.quantidadeBois || 0));
  const mediaArrobaVaca = safeDiv(arrobasVaca, Number(data.quantidadeVacas || 0));
  const mediaArrobaGeral = safeDiv(arrobasTotal, totalCabecas);

  const producaoTraseiroBoi = Number(data.traseiroBoi || 0);
  const producaoTraseiroCapoteBoi = Number(data.traseiroCapoteBoi || 0);
  const producaoDianteiroBoi = Number(data.dianteiroBoi || 0);
  const producaoPontaBoi = Number(data.pontaBoi || 0);

  const producaoTraseiroVaca = Number(data.traseiroVaca || 0);
  const producaoTraseiroCapoteVaca = Number(data.traseiroCapoteVaca || 0);
  const producaoDianteiroVaca = Number(data.dianteiroVaca || 0);
  const producaoPontaVaca = Number(data.pontaVaca || 0);

  const producaoTraseiro = producaoTraseiroBoi + producaoTraseiroVaca;
  const producaoTraseiroCapote = producaoTraseiroCapoteBoi + producaoTraseiroCapoteVaca;
  const producaoDianteiro = producaoDianteiroBoi + producaoDianteiroVaca;
  const producaoPonta = producaoPontaBoi + producaoPontaVaca;
  const producaoCarcacaTotal =
    producaoTraseiro +
    producaoTraseiroCapote +
    producaoDianteiro +
    producaoPonta;

  const producaoTotal = producaoCarcacaTotal;

  const aproveitamentoIndustrial = safeDiv(producaoCarcacaTotal, carcacaFriaTotal) * 100;

  const rendimentoTraseiroBoi = safeDiv(producaoTraseiroBoi, carcacaFriaBoi) * 100;
  const rendimentoTraseiroCapoteBoi = safeDiv(producaoTraseiroCapoteBoi, carcacaFriaBoi) * 100;
  const rendimentoDianteiroBoi = safeDiv(producaoDianteiroBoi, carcacaFriaBoi) * 100;
  const rendimentoPontaBoi = safeDiv(producaoPontaBoi, carcacaFriaBoi) * 100;

  const rendimentoTraseiroVaca = safeDiv(producaoTraseiroVaca, carcacaFriaVaca) * 100;
  const rendimentoTraseiroCapoteVaca = safeDiv(producaoTraseiroCapoteVaca, carcacaFriaVaca) * 100;
  const rendimentoDianteiroVaca = safeDiv(producaoDianteiroVaca, carcacaFriaVaca) * 100;
  const rendimentoPontaVaca = safeDiv(producaoPontaVaca, carcacaFriaVaca) * 100;

  const rendimentoTraseiro = safeDiv(producaoTraseiro, carcacaFriaTotal) * 100;
  const rendimentoTraseiroCapote = safeDiv(producaoTraseiroCapote, carcacaFriaTotal) * 100;
  const rendimentoDianteiro = safeDiv(producaoDianteiro, carcacaFriaTotal) * 100;
  const rendimentoPonta = safeDiv(producaoPonta, carcacaFriaTotal) * 100;

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
    arrobasBoi * Number(data.precoArrobaBoi || 0) +
    arrobasVaca * Number(data.precoArrobaVaca || 0);

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

  const custoPorArroba = safeDiv(custoTotal, arrobasTotal);
  const custoPorCabeca = safeDiv(custoTotal, totalCabecas);
  const custoPorKg = safeDiv(custoTotal, producaoTotal);

  const produtos = [
    {
      nome: "Traseiro Boi",
      peso: producaoTraseiroBoi,
      indice: indexValue(data.indiceTraseiroBoi, legacyData.indiceTraseiro, 1.3),
      precifica: true,
    },
    {
      nome: "Traseiro Capote de Boi",
      peso: producaoTraseiroCapoteBoi,
      indice: indexValue(data.indiceTraseiroCapoteBoi, legacyData.indiceTraseiro, 1.3),
      precifica: true,
    },
    {
      nome: "Dianteiro Boi",
      peso: producaoDianteiroBoi,
      indice: indexValue(data.indiceDianteiroBoi, legacyData.indiceDianteiro, 0.9),
      precifica: true,
    },
    {
      nome: "Ponta de Agulha Boi",
      peso: producaoPontaBoi,
      indice: indexValue(data.indicePontaBoi, legacyData.indicePonta, 0.8),
      precifica: true,
    },
    {
      nome: "Traseiro Vaca",
      peso: producaoTraseiroVaca,
      indice: indexValue(data.indiceTraseiroVaca, legacyData.indiceTraseiro, 1.3),
      precifica: true,
    },
    {
      nome: "Traseiro Capote de Vaca",
      peso: producaoTraseiroCapoteVaca,
      indice: indexValue(data.indiceTraseiroCapoteVaca, legacyData.indiceTraseiro, 1.3),
      precifica: true,
    },
    {
      nome: "Dianteiro Vaca",
      peso: producaoDianteiroVaca,
      indice: indexValue(data.indiceDianteiroVaca, legacyData.indiceDianteiro, 0.9),
      precifica: true,
    },
    {
      nome: "Ponta de Agulha Vaca",
      peso: producaoPontaVaca,
      indice: indexValue(data.indicePontaVaca, legacyData.indicePonta, 0.8),
      precifica: true,
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
    const precoSugerido = produto.precifica
      ? custoKg * (1 + Number(data.margemPercentual || 0) / 100)
      : 0;
    const receitaPrevista = produto.precifica ? precoSugerido * produto.peso : 0;
    const lucroPrevisto = produto.precifica ? receitaPrevista - custoDistribuido : 0;
    const margemPrevista = safeDiv(lucroPrevisto, receitaPrevista) * 100;

    return {
      ...produto,
      custoDistribuido,
      custoKg,
      precoSugerido,
      receitaPrevista,
      lucroPrevisto,
      margemPrevista,
    };
  });

  const receitaPrevista = produtosCalculados.reduce(
    (acc, produto) => acc + produto.receitaPrevista,
    0
  );

  const custoProdutosPrecificados = produtosCalculados.reduce(
    (acc, produto) => acc + (produto.precifica ? produto.custoDistribuido : 0),
    0
  );

  const lucroPrevisto = receitaPrevista - custoProdutosPrecificados;
  const margemPrevista = safeDiv(lucroPrevisto, receitaPrevista) * 100;

  return {
    totalCabecas,

    carcacaQuenteTotal,
    carcacaFriaTotal,
    carcacaFriaBoi,
    carcacaFriaVaca,

    pesoMedioBoi,
    pesoMedioVaca,
    pesoMedioGeral,

    arrobasBoi,
    arrobasVaca,
    arrobasTotal,
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
    producaoTraseiroCapote,
    producaoDianteiro,
    producaoPonta,
    producaoCarcacaTotal,
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
    rendimentoTraseiroCapote,
    rendimentoDianteiro,
    rendimentoPonta,

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
    custoPorCabeca,
    custoPorKg,

    produtosCalculados,

    receitaPrevista,
    lucroPrevisto,
    margemPrevista,
  };
}
