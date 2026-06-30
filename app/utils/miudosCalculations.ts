import { MiudosData } from "../types/miudos";
import { MIUDOS_PRODUTOS, type MiudosProdutoKey } from "./miudosProducts";

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

function getProdutoPeso(data: MiudosData, key: MiudosProdutoKey) {
  return Number(data.pesos?.[key] ?? data[key] ?? 0);
}

export function calculateMiudos(data: MiudosData) {
  const pesoRecebido = Number(data.pesoRecebido || 0);
  const totalCabecas = Number(data.quantidadeBois || 0) + Number(data.quantidadeVacas || 0);
  const carcacaQuenteTotal = Number(data.carcacaQuenteTotal || 0);

  const produtosBase = MIUDOS_PRODUTOS.map((produto) => ({
    key: produto.key,
    nome: produto.nome,
    peso: getProdutoPeso(data, produto.key),
  }));

  const pesoInformado = produtosBase.reduce((total, produto) => total + produto.peso, 0);
  const diferenca = pesoRecebido - pesoInformado;
  const aproveitamento = safeDiv(pesoInformado, pesoRecebido) * 100;

  const produtos = produtosBase.map((produto) => ({
    ...produto,
    rendimento: safeDiv(produto.peso, pesoRecebido) * 100,
    rendimentoCarcacaQuente: safeDiv(produto.peso, carcacaQuenteTotal) * 100,
    kgPorCabeca: safeDiv(produto.peso, totalCabecas),
  }));

  return {
    pesoRecebido,
    pesoInformado,
    diferenca,
    aproveitamento,
    totalCabecas,
    produtos,
  };
}
