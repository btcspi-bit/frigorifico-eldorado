import { LoteData } from "../types/lote";

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

  const arrobasBoi = carcacaFriaBoi / 15;
  const arrobasVaca = carcacaFriaVaca / 15;
  const arrobasTotal = carcacaFriaTotal / 15;

  const mediaArrobaBoi = safeDiv(arrobasBoi, Number(data.quantidadeBois || 0));
  const mediaArrobaVaca = safeDiv(arrobasVaca, Number(data.quantidadeVacas || 0));
  const mediaArrobaGeral = safeDiv(arrobasTotal, totalCabecas);

  const producaoTraseiroBoi = Number(data.traseiroBoi || 0);
  const producaoDianteiroBoi = Number(data.dianteiroBoi || 0);
  const producaoPontaBoi = Number(data.pontaBoi || 0);

  const producaoTraseiroVaca = Number(data.traseiroVaca || 0);
  const producaoDianteiroVaca = Number(data.dianteiroVaca || 0);
  const producaoPontaVaca = Number(data.pontaVaca || 0);

  const producaoTraseiro = producaoTraseiroBoi + producaoTraseiroVaca;
  const producaoDianteiro = producaoDianteiroBoi + producaoDianteiroVaca;
  const producaoPonta = producaoPontaBoi + producaoPontaVaca;
  const producaoMiudos = Number(data.miudos || 0);
  const producaoSebo = Number(data.sebo || 0);

  const producaoTotal =
    producaoTraseiro +
    producaoDianteiro +
    producaoPonta +
    producaoMiudos +
    producaoSebo;

  const aproveitamentoIndustrial = safeDiv(producaoTotal, carcacaFriaTotal) * 100;

  const rendimentoTraseiroBoi = safeDiv(producaoTraseiroBoi, carcacaFriaBoi) * 100;
  const rendimentoDianteiroBoi = safeDiv(producaoDianteiroBoi, carcacaFriaBoi) * 100;
  const rendimentoPontaBoi = safeDiv(producaoPontaBoi, carcacaFriaBoi) * 100;

  const rendimentoTraseiroVaca = safeDiv(producaoTraseiroVaca, carcacaFriaVaca) * 100;
  const rendimentoDianteiroVaca = safeDiv(producaoDianteiroVaca, carcacaFriaVaca) * 100;
  const rendimentoPontaVaca = safeDiv(producaoPontaVaca, carcacaFriaVaca) * 100;

  const rendimentoTraseiro = safeDiv(producaoTraseiro, carcacaFriaTotal) * 100;
  const rendimentoDianteiro = safeDiv(producaoDianteiro, carcacaFriaTotal) * 100;
  const rendimentoPonta = safeDiv(producaoPonta, carcacaFriaTotal) * 100;
  const rendimentoMiudos = safeDiv(producaoMiudos, carcacaFriaTotal) * 100;
  const rendimentoSebo = safeDiv(producaoSebo, carcacaFriaTotal) * 100;
  const rendimentoMiudosSebo = rendimentoMiudos + rendimentoSebo;

  const traseiroMedioBoi = safeDiv(producaoTraseiroBoi, Number(data.quantidadeBois || 0));
  const dianteiroMedioBoi = safeDiv(producaoDianteiroBoi, Number(data.quantidadeBois || 0));
  const pontaMedioBoi = safeDiv(producaoPontaBoi, Number(data.quantidadeBois || 0));

  const traseiroMedioVaca = safeDiv(producaoTraseiroVaca, Number(data.quantidadeVacas || 0));
  const dianteiroMedioVaca = safeDiv(producaoDianteiroVaca, Number(data.quantidadeVacas || 0));
  const pontaMedioVaca = safeDiv(producaoPontaVaca, Number(data.quantidadeVacas || 0));

  const valorGadoInformado = Number(data.valorGado || 0);
  const valorGadoPorArroba =
    arrobasBoi * Number(data.precoArrobaBoi || 0) +
    arrobasVaca * Number(data.precoArrobaVaca || 0);

  const custoGadoConsiderado =
    valorGadoInformado > 0 ? valorGadoInformado : valorGadoPorArroba;

  const custoTotal =
    custoGadoConsiderado +
    Number(data.frete || 0) +
    Number(data.embalagens || 0) +
    Number(data.etiquetas || 0) +
    Number(data.taxas || 0) +
    Number(data.outrosCustos || 0);

  const custoPorArroba = safeDiv(custoTotal, arrobasTotal);
  const custoPorKg = safeDiv(custoTotal, producaoTotal);

  const produtos = [
    {
      nome: "Traseiro",
      peso: producaoTraseiro,
      indice: Number(data.indiceTraseiro || 0),
      precifica: true,
    },
    {
      nome: "Dianteiro",
      peso: producaoDianteiro,
      indice: Number(data.indiceDianteiro || 0),
      precifica: true,
    },
    {
      nome: "Ponta de Agulha",
      peso: producaoPonta,
      indice: Number(data.indicePonta || 0),
      precifica: true,
    },
    {
      nome: "Miúdos",
      peso: producaoMiudos,
      indice: Number(data.indiceMiudos || 0),
      precifica: false,
    },
    {
      nome: "Sebo",
      peso: producaoSebo,
      indice: Number(data.indiceSebo || 0),
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

  const custoMiudos = produtosCalculados.find((produto) => produto.nome === "Miúdos")?.custoDistribuido || 0;

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
    producaoDianteiroBoi,
    producaoPontaBoi,
    producaoTraseiroVaca,
    producaoDianteiroVaca,
    producaoPontaVaca,
    producaoTraseiro,
    producaoDianteiro,
    producaoPonta,
    producaoMiudos,
    producaoSebo,
    producaoMiudosSebo: producaoMiudos + producaoSebo,
    producaoTotal,

    aproveitamentoIndustrial,

    rendimentoTraseiroBoi,
    rendimentoDianteiroBoi,
    rendimentoPontaBoi,
    rendimentoTraseiroVaca,
    rendimentoDianteiroVaca,
    rendimentoPontaVaca,
    rendimentoTraseiro,
    rendimentoDianteiro,
    rendimentoPonta,
    rendimentoMiudos,
    rendimentoSebo,
    rendimentoMiudosSebo,

    traseiroMedioBoi,
    dianteiroMedioBoi,
    pontaMedioBoi,
    traseiroMedioVaca,
    dianteiroMedioVaca,
    pontaMedioVaca,

    valorGadoPorArroba,
    custoGadoConsiderado,
    custoTotal,
    custoPorArroba,
    custoPorKg,
    custoMiudos,

    produtosCalculados,

    receitaPrevista,
    lucroPrevisto,
    margemPrevista,
  };
}
