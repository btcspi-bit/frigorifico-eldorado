import type { MiudosProdutoKey } from "../utils/miudosProducts";

export type MiudosPesos = Partial<Record<MiudosProdutoKey, number>>;

export interface MiudosData {
  data: string;
  numeroLote: string;

  quantidadeBois?: number;
  quantidadeVacas?: number;
  carcacaQuenteTotal?: number;

  pesoRecebido: number;
  pesos?: MiudosPesos;
  observacoes: string;

  [key: string]: string | number | MiudosPesos | undefined;
}

export type MiudosProdutoCalculado = {
  key: MiudosProdutoKey;
  nome: string;
  peso: number;
  rendimento: number;
  rendimentoCarcacaQuente: number;
  kgPorCabeca: number;
};
