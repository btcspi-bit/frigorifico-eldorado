"use client";

import { useEffect, useMemo, useState } from "react";
import NumberInput from "../components/NumberInput";
import { LoteData } from "../types/lote";
import { calculate } from "../utils/calculations";

const LOTES_KEY = "frigorifico-eldorado-lotes";
const MIUDOS_HIST_KEY = "frigorifico-eldorado-miudos-historico";
const PANORAMA_KEY = "frigorifico-eldorado-panorama-simples-v1";

type MiudosHistoricoProduto = {
  key?: string;
  nome?: string;
  peso?: number;
};

type MiudosHistoricoItem = {
  lote?: string;
  numeroLote?: string;
  produtos?: MiudosHistoricoProduto[];
};

type ProdutoResumo = {
  nome: string;
  grupo: "Carnes" | "Miúdos";
  kg: number;
};

type PanoramaConfig = {
  margemSobreCusto: number;
};

const defaultConfig: PanoramaConfig = {
  margemSobreCusto: 15,
};

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number(value || 0), min), max);
}

function brMoney(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function brNumber(value: number, decimals = 2) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function brPercent(value: number, decimals = 2) {
  return `${brNumber(value, decimals)}%`;
}

function formatDate(date: string | undefined) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function loadConfig(): PanoramaConfig {
  if (typeof window === "undefined") return defaultConfig;

  const saved = localStorage.getItem(PANORAMA_KEY);
  if (!saved) return defaultConfig;

  try {
    const parsed = JSON.parse(saved) as Partial<PanoramaConfig>;
    return {
      margemSobreCusto: clamp(parsed.margemSobreCusto ?? defaultConfig.margemSobreCusto, 0, 80),
    };
  } catch {
    return defaultConfig;
  }
}

function findMiudosHistorico(
  historico: MiudosHistoricoItem[],
  lote: LoteData | null
): MiudosHistoricoItem | null {
  if (!lote) return null;

  const numeroLote = String(lote.numeroLote || "").trim();
  if (!numeroLote) return null;

  return (
    historico.find((item) => {
      const itemLote = String(item.lote || item.numeroLote || "").trim();
      return itemLote === numeroLote;
    }) || null
  );
}

function buildProdutos(lote: LoteData | null, miudosDoLote: MiudosHistoricoItem | null) {
  if (!lote) return [];

  const produtos: ProdutoResumo[] = [
    {
      nome: "Traseiro",
      grupo: "Carnes",
      kg: Number(lote.traseiroBoi || 0) + Number(lote.traseiroVaca || 0),
    },
    {
      nome: "Traseiro Capote de Boi",
      grupo: "Carnes",
      kg: Number(lote.traseiroCapoteBoi || 0),
    },
    {
      nome: "Traseiro Capote de Vaca",
      grupo: "Carnes",
      kg: Number(lote.traseiroCapoteVaca || 0),
    },
    {
      nome: "Dianteiro",
      grupo: "Carnes",
      kg: Number(lote.dianteiroBoi || 0) + Number(lote.dianteiroVaca || 0),
    },
    {
      nome: "Ponta de Agulha",
      grupo: "Carnes",
      kg: Number(lote.pontaBoi || 0) + Number(lote.pontaVaca || 0),
    },
  ];

  const miudosDetalhados = miudosDoLote?.produtos
    ?.map((produto) => ({
      nome: produto.nome || String(produto.key || "Miúdo"),
      grupo: "Miúdos" as const,
      kg: Number(produto.peso || 0),
    }))
    .filter((produto) => produto.kg > 0);

  if (miudosDetalhados?.length) {
    produtos.push(...miudosDetalhados);
  } else {
    const kgMiudos = Number(lote.miudos || lote.pesoMiudosRecebido || 0);
    if (kgMiudos > 0) {
      produtos.push({
        nome: "Miúdos",
        grupo: "Miúdos",
        kg: kgMiudos,
      });
    }
  }

  return produtos.filter((produto) => produto.kg > 0);
}

function MetricCard({
  label,
  value,
  note,
  dark = false,
}: {
  label: string;
  value: string;
  note?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "rounded-xl bg-emerald-950 p-4 text-white shadow-sm"
          : "rounded-xl border border-emerald-950/15 bg-emerald-50 p-4 text-emerald-950 shadow-sm"
      }
    >
      <div className={dark ? "text-[11px] font-black uppercase tracking-wide text-emerald-100" : "text-[11px] font-black uppercase tracking-wide text-slate-600"}>
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
      {note && <div className={dark ? "mt-2 text-xs font-bold text-emerald-100" : "mt-2 text-xs font-bold text-slate-600"}>{note}</div>}
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm">
      <span className="font-bold text-slate-600">{label}</span>
      <strong className="text-right text-slate-950">{value}</strong>
    </div>
  );
}

export default function PrecificacaoPage() {
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [historicoMiudos, setHistoricoMiudos] = useState<MiudosHistoricoItem[]>([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [config, setConfig] = useState<PanoramaConfig>(defaultConfig);

  useEffect(() => {
    const savedLots = localStorage.getItem(LOTES_KEY);
    if (savedLots) {
      try {
        const parsed = JSON.parse(savedLots);
        if (Array.isArray(parsed)) {
          setLotes(parsed);
          setSelectedLot(parsed[0]?.numeroLote || "");
        }
      } catch {
        setLotes([]);
      }
    }

    const savedMiudos = localStorage.getItem(MIUDOS_HIST_KEY);
    if (savedMiudos) {
      try {
        const parsed = JSON.parse(savedMiudos);
        if (Array.isArray(parsed)) setHistoricoMiudos(parsed);
      } catch {
        setHistoricoMiudos([]);
      }
    }

    setConfig(loadConfig());
  }, []);

  useEffect(() => {
    localStorage.setItem(PANORAMA_KEY, JSON.stringify(config));
  }, [config]);

  const lote = useMemo(() => {
    return lotes.find((item) => item.numeroLote === selectedLot) || lotes[0] || null;
  }, [lotes, selectedLot]);

  const miudosDoLote = useMemo(() => {
    return findMiudosHistorico(historicoMiudos, lote);
  }, [historicoMiudos, lote]);

  const produtos = useMemo(() => buildProdutos(lote, miudosDoLote), [lote, miudosDoLote]);
  const calc = useMemo(() => (lote ? calculate(lote) : null), [lote]);

  const margemSobreCusto = clamp(config.margemSobreCusto, 0, 80);
  const custoTotal = Number(calc?.custoTotal || 0);
  const totalCabecas = Number(calc?.totalCabecas || 0);
  const kgTotal = produtos.reduce((total, produto) => total + produto.kg, 0);
  const kgCarnes = produtos
    .filter((produto) => produto.grupo === "Carnes")
    .reduce((total, produto) => total + produto.kg, 0);
  const kgMiudos = produtos
    .filter((produto) => produto.grupo === "Miúdos")
    .reduce((total, produto) => total + produto.kg, 0);

  const lucroPrevisto = custoTotal * (margemSobreCusto / 100);
  const receitaPrevista = custoTotal + lucroPrevisto;
  const margemNaVenda = safeDiv(lucroPrevisto, receitaPrevista) * 100;
  const coberturaCusto = safeDiv(receitaPrevista, custoTotal) * 100;
  const custoPorKg = safeDiv(custoTotal, kgTotal);
  const precoMedioNecessario = safeDiv(receitaPrevista, kgTotal);
  const lucroPorCabeca = safeDiv(lucroPrevisto, totalCabecas);
  const custoPorCabeca = safeDiv(custoTotal, totalCabecas);
  const receitaPorCabeca = safeDiv(receitaPrevista, totalCabecas);
  const progressWidth = `${clamp(coberturaCusto, 0, 150)}%`;
  const miudosDetalhados = Boolean(miudosDoLote?.produtos?.some((produto) => Number(produto.peso || 0) > 0));

  function setMargem(value: number) {
    setConfig({ margemSobreCusto: clamp(value, 0, 80) });
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm print:hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight md:text-3xl">FRIGORÍFICO ELDORADO</div>
              <div className="mt-1 text-base font-black text-emerald-300">PANORAMA SIMPLES DO LOTE</div>
              <p className="mt-1 text-sm font-semibold text-emerald-100">
                Custo do abate importado. Ajuste a margem e veja quanto o lote pode retornar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="/" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-950">
                Abate
              </a>
              <a href="/miudos" className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white">
                Miúdos
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white"
              >
                Imprimir
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:border-0 print:shadow-none">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase tracking-wide text-slate-600">Lote</label>
              <select
                value={selectedLot}
                onChange={(event) => setSelectedLot(event.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-emerald-900 focus:bg-emerald-50"
              >
                {lotes.length === 0 && <option value="">Nenhum lote salvo</option>}
                {lotes.map((item, index) => (
                  <option key={`${item.numeroLote}-${index}`} value={item.numeroLote}>
                    {item.numeroLote || "Lote sem número"}
                  </option>
                ))}
              </select>
            </div>

            <DetailLine label="Data" value={formatDate(lote?.data)} />
            <DetailLine label="Cabeças" value={brNumber(totalCabecas, 0)} />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Custo total do lote" value={brMoney(custoTotal)} dark />
          <MetricCard label="Receita projetada" value={brMoney(receitaPrevista)} note={`Com ${brPercent(margemSobreCusto)} sobre custo`} />
          <MetricCard label="Lucro previsto" value={brMoney(lucroPrevisto)} note={`Por cabeça: ${brMoney(lucroPorCabeca)}`} />
          <MetricCard label="Preço médio necessário" value={`${brMoney(precoMedioNecessario)}/kg`} note={`Custo médio: ${brMoney(custoPorKg)}/kg`} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-black text-emerald-950">Margem de lucro</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Informe uma margem sobre o custo do lote. O app projeta receita, lucro e preço médio necessário.
                  </p>
                </div>
                <div className="w-full max-w-[220px]">
                  <NumberInput
                    label="Margem"
                    value={margemSobreCusto}
                    onChange={setMargem}
                    suffix="%"
                  />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={margemSobreCusto}
                onChange={(event) => setMargem(Number(event.target.value))}
                className="mt-5 w-full accent-emerald-950"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25, 30].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMargem(value)}
                    className={
                      value === margemSobreCusto
                        ? "rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-black text-white"
                        : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700"
                    }
                  >
                    {value}%
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-600">
                  <span>Cobertura do custo</span>
                  <span>{brPercent(coberturaCusto, 1)}</span>
                </div>
                <div className="relative h-6 overflow-hidden rounded-full bg-slate-200">
                  <div className="absolute left-0 top-0 h-full rounded-full bg-emerald-950" style={{ width: progressWidth }} />
                  <div className="absolute left-[66.666%] top-0 h-full w-0.5 bg-white/80" title="Ponto de equilíbrio" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-500">
                  <span>0%</span>
                  <span>Ponto de equilíbrio: 100%</span>
                  <span>150%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-950/10 bg-emerald-50 p-4">
              <h3 className="text-sm font-black uppercase tracking-wide text-emerald-950">Leitura direta</h3>
              <div className="mt-3 space-y-1">
                <DetailLine label="Custo por cabeça" value={brMoney(custoPorCabeca)} />
                <DetailLine label="Receita por cabeça" value={brMoney(receitaPorCabeca)} />
                <DetailLine label="Lucro por cabeça" value={brMoney(lucroPorCabeca)} />
                <DetailLine label="Margem na venda" value={brPercent(margemNaVenda)} />
              </div>
              <div className="mt-4 rounded-xl bg-white p-3 text-sm font-bold leading-relaxed text-slate-700">
                Com esta margem, o lote precisa retornar <strong>{brMoney(receitaPrevista)}</strong>. A sobra projetada sobre o custo é <strong>{brMoney(lucroPrevisto)}</strong>.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-emerald-950">Base importada do abate</h2>
            <div className="mt-3 grid gap-1">
              <DetailLine label="Produção total considerada" value={`${brNumber(kgTotal)} kg`} />
              <DetailLine label="Carnes" value={`${brNumber(kgCarnes)} kg`} />
              <DetailLine label="Miúdos" value={`${brNumber(kgMiudos)} kg`} />
              <DetailLine label="Custo por arroba" value={brMoney(Number(calc?.custoPorArroba || 0))} />
              <DetailLine label="Custo por kg produzido" value={brMoney(custoPorKg)} />
              <DetailLine label="Rendimento industrial" value={brPercent(Number(calc?.aproveitamentoIndustrial || 0))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-emerald-950">Custo importado</h2>
            <div className="mt-3 grid gap-1">
              <DetailLine label="Gado considerado" value={brMoney(Number(calc?.custoGadoConsiderado || 0))} />
              <DetailLine label="Frete" value={brMoney(Number(lote?.frete || 0))} />
              <DetailLine label="Custo adicional/cabeça" value={brMoney(Number(calc?.custoCabecasAdicional || 0))} />
              <DetailLine label="Folha aplicada" value={brMoney(Number(calc?.folhaAbateAplicada || 0))} />
              <DetailLine label="Taxas + outros" value={brMoney(Number(lote?.taxas || 0) + Number(lote?.outrosCustos || 0))} />
            </div>
          </div>
        </section>

        <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-lg font-black text-emerald-950">
            Ver produtos importados {miudosDetalhados ? "com miúdos detalhados" : ""}
          </summary>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-950 text-white">
                  <th className="p-3 text-left">Produto</th>
                  <th className="p-3 text-left">Grupo</th>
                  <th className="p-3 text-right">Kg</th>
                  <th className="p-3 text-right">Participação</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={`${produto.grupo}-${produto.nome}`} className="border-b border-slate-200">
                    <td className="p-3 font-black text-emerald-950">{produto.nome}</td>
                    <td className="p-3 font-bold text-slate-600">{produto.grupo}</td>
                    <td className="p-3 text-right font-bold">{brNumber(produto.kg)} kg</td>
                    <td className="p-3 text-right font-bold">{brPercent(safeDiv(produto.kg, kgTotal) * 100)}</td>
                  </tr>
                ))}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center font-bold text-slate-500">
                      Nenhum produto importado. Cadastre um lote no abate primeiro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </main>
  );
}
