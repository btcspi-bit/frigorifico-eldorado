import { MiudosData } from "../types/miudos";

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

export function calculateMiudos(data: MiudosData) {
  const pesoRecebido = Number(data.pesoRecebido || 0);
  const custoHerdado = Number(data.custoHerdado || 0);
  const totalCabecas = Number(data.quantidadeBois || 0) + Number(data.quantidadeVacas || 0);

  const custoProprio =
    Number(data.embalagens || 0) +
    Number(data.etiquetas || 0) +
    Number(data.caixas || 0) +
    Number(data.maoObra || 0) +
    Number(data.outrosCustos || 0);

  const custoTotal = custoHerdado + custoProprio;
  const custoKgBruto = safeDiv(custoHerdado, pesoRecebido);

  const produtosBase = [
    {
      key: "figado" as const,
      nome: "Fígado",
      peso: Number(data.figado || 0),
      indice: Number(data.indiceFigado || 0),
      margem: Number(data.margemFigado || 0),
    },
    {
      key: "coracao" as const,
      nome: "Coração",
      peso: Number(data.coracao || 0),
      indice: Number(data.indiceCoracao || 0),
      margem: Number(data.margemCoracao || 0),
    },
    {
      key: "lingua" as const,
      nome: "Língua",
      peso: Number(data.lingua || 0),
      indice: Number(data.indiceLingua || 0),
      margem: Number(data.margemLingua || 0),
    },
    {
      key: "rins" as const,
      nome: "Rins",
      peso: Number(data.rins || 0),
      indice: Number(data.indiceRins || 0),
      margem: Number(data.margemRins || 0),
    },
    {
      key: "bucho" as const,
      nome: "Bucho",
      peso: Number(data.bucho || 0),
      indice: Number(data.indiceBucho || 0),
      margem: Number(data.margemBucho || 0),
    },
    {
      key: "mocoto" as const,
      nome: "Mocotó",
      peso: Number(data.mocoto || 0),
      indice: Number(data.indiceMocoto || 0),
      margem: Number(data.margemMocoto || 0),
    },
    {
      key: "rabada" as const,
      nome: "Rabada",
      peso: Number(data.rabada || 0),
      indice: Number(data.indiceRabada || 0),
      margem: Number(data.margemRabada || 0),
    },
    {
      key: "outros" as const,
      nome: "Outros",
      peso: Number(data.outros || 0),
      indice: Number(data.indiceOutros || 0),
      margem: Number(data.margemOutros || 0),
    },
  ];

  const pesoInformado = produtosBase.reduce((total, produto) => total + produto.peso, 0);
  const diferenca = pesoRecebido - pesoInformado;
  const aproveitamento = safeDiv(pesoInformado, pesoRecebido) * 100;

  const pesoPonderadoTotal = produtosBase.reduce(
    (total, produto) => total + produto.peso * produto.indice,
    0
  );

  const produtos = produtosBase.map((produto) => {
    const pesoPonderado = produto.peso * produto.indice;
    const custoDistribuido =
      pesoPonderadoTotal > 0 ? (pesoPonderado / pesoPonderadoTotal) * custoTotal : 0;
    const custoKg = safeDiv(custoDistribuido, produto.peso);
    const precoSugerido = custoKg * (1 + produto.margem / 100);
    const receitaPrevista = precoSugerido * produto.peso;
    const lucroPrevisto = receitaPrevista - custoDistribuido;
    const margemReal = safeDiv(lucroPrevisto, receitaPrevista) * 100;

    return {
      ...produto,
      rendimento: safeDiv(produto.peso, pesoRecebido) * 100,
      kgPorCabeca: safeDiv(produto.peso, totalCabecas),
      custoDistribuido,
      custoKg,
      precoSugerido,
      receitaPrevista,
      lucroPrevisto,
      margemReal,
    };
  });

  const receitaPrevista = produtos.reduce((total, produto) => total + produto.receitaPrevista, 0);
  const lucroPrevisto = produtos.reduce((total, produto) => total + produto.lucroPrevisto, 0);
  const margemPrevista = safeDiv(lucroPrevisto, receitaPrevista) * 100;

  return {
    pesoRecebido,
    pesoInformado,
    diferenca,
    aproveitamento,
    totalCabecas,
    custoHerdado,
    custoKgBruto,
    custoProprio,
    custoTotal,
    receitaPrevista,
    lucroPrevisto,
    margemPrevista,
    produtos,
  };
}
