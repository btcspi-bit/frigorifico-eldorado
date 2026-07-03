"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NumberInput from "../components/NumberInput";
import { LoteData } from "../types/lote";
import { calculate } from "../utils/calculations";

const LOTES_KEY = "frigorifico-eldorado-lotes";
const MIUDOS_HIST_KEY = "frigorifico-eldorado-miudos-historico";
const PANORAMA_KEY = "frigorifico-eldorado-panorama-simples-v1";
const INTERNAL_REPORT_SIGNATURE = "ESTUDOS INTERNOS DE PLANEJAMENTO E CONTROLE DE PRODUÇÃO";

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

type CostBreakdownItem = {
  item: string;
  value: number;
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
    { nome: "Traseiro Boi", grupo: "Carnes", kg: Number(lote.traseiroBoi || 0) },
    { nome: "Traseiro Vaca", grupo: "Carnes", kg: Number(lote.traseiroVaca || 0) },
    { nome: "Traseiro Capote de Boi", grupo: "Carnes", kg: Number(lote.traseiroCapoteBoi || 0) },
    { nome: "Traseiro Capote de Vaca", grupo: "Carnes", kg: Number(lote.traseiroCapoteVaca || 0) },
    { nome: "Dianteiro Boi", grupo: "Carnes", kg: Number(lote.dianteiroBoi || 0) },
    { nome: "Dianteiro Vaca", grupo: "Carnes", kg: Number(lote.dianteiroVaca || 0) },
    { nome: "Ponta de Agulha Boi", grupo: "Carnes", kg: Number(lote.pontaBoi || 0) },
    { nome: "Ponta de Agulha Vaca", grupo: "Carnes", kg: Number(lote.pontaVaca || 0) },
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

function PrintKpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="print-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function PrintLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="print-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function PrecificacaoPage() {
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [historicoMiudos, setHistoricoMiudos] = useState<MiudosHistoricoItem[]>([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [config, setConfig] = useState<PanoramaConfig>(defaultConfig);
  const [printedAt, setPrintedAt] = useState("-");

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
    setPrintedAt(new Date().toLocaleString("pt-BR"));
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

  const kgCarcacaQuente = Number(calc?.carcacaQuenteTotal || 0);
  const kgCarcacaFria = Number(calc?.carcacaFriaTotal || 0);
  const arrobasCompra = Number(calc?.arrobasQuenteTotal || 0);
  const arrobasRetorno = Number(calc?.arrobasFriaTotal || 0);
  const arrobasProducao = kgTotal / 15;
  const lucroPrevisto = custoTotal * (margemSobreCusto / 100);
  const receitaPrevista = custoTotal + lucroPrevisto;
  const margemNaVenda = safeDiv(lucroPrevisto, receitaPrevista) * 100;
  const coberturaCusto = safeDiv(receitaPrevista, custoTotal) * 100;
  const custoPorArrobaCompra = safeDiv(custoTotal, arrobasCompra);
  const custoPorArrobaRetorno = safeDiv(custoTotal, arrobasRetorno);
  const receitaPorArrobaRetorno = safeDiv(receitaPrevista, arrobasRetorno);
  const lucroPorArrobaRetorno = safeDiv(lucroPrevisto, arrobasRetorno);
  const valorPorPontoArroba = custoPorArrobaRetorno / 100;
  const custoPorKgProducao = safeDiv(custoTotal, kgTotal);
  const retornoPorKgProducao = safeDiv(receitaPrevista, kgTotal);
  const custoPorKgCarcacaQuente = safeDiv(custoTotal, kgCarcacaQuente);
  const custoPorKgCarcacaFria = safeDiv(custoTotal, kgCarcacaFria);
  const retornoPorKgCarcacaFria = safeDiv(receitaPrevista, kgCarcacaFria);
  const progressWidth = `${clamp(coberturaCusto, 0, 150)}%`;
  const printProgressWidth = `${safeDiv(clamp(coberturaCusto, 0, 150), 150) * 100}%`;
  const miudosDetalhados = Boolean(miudosDoLote?.produtos?.some((produto) => Number(produto.peso || 0) > 0));
  const producaoIncompleta = kgCarnes <= 0 && kgMiudos > 0;

  const costBreakdown: CostBreakdownItem[] = [
    { item: "Gado considerado", value: Number(calc?.custoGadoConsiderado || 0) },
    { item: "Frete", value: Number(lote?.frete || 0) },
    { item: "Custo adicional total", value: Number(calc?.custoCabecasAdicional || 0) },
    { item: "Folha aplicada", value: Number(calc?.folhaAbateAplicada || 0) },
    { item: "Taxas", value: Number(lote?.taxas || 0) },
    { item: "Outros custos", value: Number(lote?.outrosCustos || 0) },
  ];

  function setMargem(value: number) {
    setConfig({ margemSobreCusto: clamp(value, 0, 80) });
  }

  function handlePrint() {
    setPrintedAt(new Date().toLocaleString("pt-BR"));
    window.setTimeout(() => window.print(), 0);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <article className="panorama-print-report">
        <header className="print-master-header">
          <div className="print-brand-block">
            <div className="print-brand-eyebrow">FRIGORÍFICO ELDORADO</div>
            <h1>Relatório Gerencial do Lote</h1>
            <p>Panorama operacional, compra na carcaça quente, retorno na carcaça fria e produção informada.</p>
          </div>

          <div className="print-document-meta">
            <div>
              <span>Lote</span>
              <strong>{lote?.numeroLote || "-"}</strong>
            </div>
            <div>
              <span>Data do lote</span>
              <strong>{formatDate(lote?.data)}</strong>
            </div>
            <div>
              <span>Emissão</span>
              <strong>{printedAt}</strong>
            </div>
          </div>
        </header>

        <section className="print-executive-kpis">
          <PrintKpi label="Custo total do lote" value={brMoney(custoTotal)} note="Base importada do abate" />
          <PrintKpi label="Custo/@ compra quente" value={brMoney(custoPorArrobaCompra)} note={`${brNumber(arrobasCompra)} @ quentes`} />
          <PrintKpi label="Retorno/@ carcaça fria" value={brMoney(receitaPorArrobaRetorno)} note={`${brNumber(arrobasRetorno)} @ frias`} />
          <PrintKpi label="Lucro previsto" value={brMoney(lucroPrevisto)} note={`${brMoney(lucroPorArrobaRetorno)} / @ fria`} />
        </section>

        <section className="print-executive-band">
          <div>
            <span className="print-section-label">Leitura direta</span>
            <p>
              Compra conferida pela <strong>carcaça quente</strong>. Retorno projetado pela <strong>carcaça fria</strong>. Com margem de <strong>{brPercent(margemSobreCusto)}</strong>, cada @ fria precisa retornar <strong>{brMoney(receitaPorArrobaRetorno)}</strong>.
            </p>
          </div>
          <div className="print-highlight-total">
            <span>Sobra projetada no lote</span>
            <strong>{brMoney(lucroPrevisto)}</strong>
          </div>
        </section>

        {producaoIncompleta && (
          <section className="print-method-note">
            <strong>Atenção:</strong> carnes não informadas no abate. A leitura por kg considera somente os miúdos/produtos lançados.
          </section>
        )}

        <section className="print-grid print-grid-2">
          <div className="print-panel print-panel-soft">
            <div className="print-panel-heading">
              <span>01</span>
              <h2>Margem e cobertura</h2>
            </div>

            <div className="print-margin-layout">
              <div className="print-margin-badge">
                <span>Margem aplicada</span>
                <strong>{brPercent(margemSobreCusto)}</strong>
                <small>Margem na venda: {brPercent(margemNaVenda)}</small>
              </div>
              <div className="print-margin-lines">
                <PrintLine label="Cada 1% de margem" value={`${brMoney(valorPorPontoArroba)} / @`} />
                <PrintLine label="Cobertura do custo" value={brPercent(coberturaCusto, 1)} />
                <PrintLine label="Ponto de equilíbrio" value="100,0%" />
              </div>
            </div>

            <div className="print-progress-wrapper">
              <div className="print-progress-labels">
                <span>0%</span>
                <span>Ponto de equilíbrio: 100%</span>
                <span>150%</span>
              </div>
              <div className="print-progress-track">
                <div className="print-progress-fill" style={{ width: printProgressWidth }} />
                <div className="print-progress-marker" />
              </div>
            </div>
          </div>

          <div className="print-panel">
            <div className="print-panel-heading">
              <span>02</span>
              <h2>Leitura por arroba</h2>
            </div>
            <div className="print-lines-block">
              <PrintLine label="@ compra — carcaça quente" value={`${brNumber(arrobasCompra)} @`} />
              <PrintLine label="Custo/@ compra quente" value={brMoney(custoPorArrobaCompra)} />
              <PrintLine label="@ retorno — carcaça fria" value={`${brNumber(arrobasRetorno)} @`} />
              <PrintLine label="Retorno projetado/@ fria" value={brMoney(receitaPorArrobaRetorno)} />
              <PrintLine label="Lucro projetado/@ fria" value={brMoney(lucroPorArrobaRetorno)} />
              <PrintLine label="Retorno/kg carcaça fria" value={`${brMoney(retornoPorKgCarcacaFria)} / kg`} />
            </div>
          </div>
        </section>

        <section className="print-grid print-grid-2">
          <div className="print-panel">
            <div className="print-panel-heading">
              <span>03</span>
              <h2>Base do lote e produção informada</h2>
            </div>
            <div className="print-lines-block">
              <PrintLine label="Cabeças" value={brNumber(totalCabecas, 0)} />
              <PrintLine label="Carcaça quente compra" value={`${brNumber(kgCarcacaQuente)} kg`} />
              <PrintLine label="Carcaça fria retorno" value={`${brNumber(kgCarcacaFria)} kg`} />
              <PrintLine label="Produção considerada" value={`${brNumber(kgTotal)} kg`} />
              <PrintLine label="Produção equivalente" value={`${brNumber(arrobasProducao)} @`} />
              <PrintLine label="Carnes" value={`${brNumber(kgCarnes)} kg`} />
              <PrintLine label="Miúdos" value={`${brNumber(kgMiudos)} kg`} />
              <PrintLine label="Custo/kg produção informada" value={brMoney(custoPorKgProducao)} />
              <PrintLine label="Custo/kg carcaça quente" value={brMoney(custoPorKgCarcacaQuente)} />
              <PrintLine label="Custo/kg carcaça fria" value={brMoney(custoPorKgCarcacaFria)} />
              <PrintLine label="Rendimento industrial" value={brPercent(Number(calc?.aproveitamentoIndustrial || 0))} />
            </div>
          </div>

          <div className="print-panel">
            <div className="print-panel-heading">
              <span>04</span>
              <h2>Custo importado</h2>
            </div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Valor</th>
                  <th className="text-right">Part.</th>
                </tr>
              </thead>
              <tbody>
                {costBreakdown.map((item, index) => (
                  <tr key={item.item} className={index % 2 === 0 ? "print-zebra-row" : undefined}>
                    <td>{item.item}</td>
                    <td className="text-right">{brMoney(item.value)}</td>
                    <td className="text-right">{brPercent(safeDiv(item.value, custoTotal) * 100)}</td>
                  </tr>
                ))}
                <tr className="print-total-row">
                  <td>Total importado</td>
                  <td className="text-right">{brMoney(custoTotal)}</td>
                  <td className="text-right">100,00%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-grid print-grid-2 print-grid-balance">
          <div className="print-panel">
            <div className="print-panel-heading">
              <span>05</span>
              <h2>Produção consolidada</h2>
            </div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th className="text-right">Kg</th>
                  <th className="text-right">Eq. @</th>
                  <th className="text-right">Part. física</th>
                </tr>
              </thead>
              <tbody>
                <tr className="print-zebra-row">
                  <td>Carnes</td>
                  <td className="text-right">{brNumber(kgCarnes)} kg</td>
                  <td className="text-right">{brNumber(kgCarnes / 15)} @</td>
                  <td className="text-right">{brPercent(safeDiv(kgCarnes, kgTotal) * 100)}</td>
                </tr>
                <tr>
                  <td>Miúdos {miudosDetalhados ? "detalhados" : "consolidados"}</td>
                  <td className="text-right">{brNumber(kgMiudos)} kg</td>
                  <td className="text-right">{brNumber(kgMiudos / 15)} @</td>
                  <td className="text-right">{brPercent(safeDiv(kgMiudos, kgTotal) * 100)}</td>
                </tr>
                <tr className="print-total-row">
                  <td>Total considerado</td>
                  <td className="text-right">{brNumber(kgTotal)} kg</td>
                  <td className="text-right">{brNumber(arrobasProducao)} @</td>
                  <td className="text-right">100,00%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print-panel">
            <div className="print-panel-heading">
              <span>06</span>
              <h2>Produtos para conferência</h2>
            </div>
            <table className="print-table print-products-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Grupo</th>
                  <th className="text-right">Kg</th>
                  <th className="text-right">Part. física</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto, index) => (
                  <tr key={`${produto.grupo}-${produto.nome}`} className={index % 2 === 0 ? "print-zebra-row" : undefined}>
                    <td>{produto.nome}</td>
                    <td>{produto.grupo}</td>
                    <td className="text-right">{brNumber(produto.kg)} kg</td>
                    <td className="text-right">{brPercent(safeDiv(produto.kg, kgTotal) * 100)}</td>
                  </tr>
                ))}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={4}>Nenhum produto importado para este lote.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-method-note">
          <strong>Critério de projeção:</strong> compra do gado por @ usa carcaça quente. Retorno projetado por @ usa carcaça fria, após quebra. Valores por kg de produção usam somente produtos lançados no abate/miúdos.
        </section>

        <footer className="print-report-footer">
          {INTERNAL_REPORT_SIGNATURE}
        </footer>
      </article>

      <div className="panorama-screen mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight md:text-3xl">FRIGORÍFICO ELDORADO</div>
              <div className="mt-1 text-base font-black text-emerald-300">PANORAMA SIMPLES DO LOTE</div>
              <p className="mt-1 text-sm font-semibold text-emerald-100">
                Compra na carcaça quente. Retorno e programação pela carcaça fria e produção informada.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-950">
                Abate
              </Link>
              <Link href="/miudos" className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white">
                Miúdos
              </Link>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white"
              >
                Imprimir
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
            <DetailLine label="@ compra quente" value={`${brNumber(arrobasCompra)} @`} />
            <DetailLine label="@ retorno fria" value={`${brNumber(arrobasRetorno)} @`} />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Custo total do lote" value={brMoney(custoTotal)} note="Base importada do abate" dark />
          <MetricCard label="Custo/@ compra quente" value={brMoney(custoPorArrobaCompra)} note={`Base: ${brNumber(arrobasCompra)} @`} />
          <MetricCard label="Retorno/@ carcaça fria" value={brMoney(receitaPorArrobaRetorno)} note={`Base: ${brNumber(arrobasRetorno)} @`} />
          <MetricCard label="Retorno / kg produção" value={`${brMoney(retornoPorKgProducao)}/kg`} note={`Base: ${brNumber(kgTotal)} kg informados`} />
        </section>

        {producaoIncompleta && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold leading-relaxed text-amber-900">
            Atenção: carnes não informadas no abate. A leitura por kg considera somente os miúdos/produtos lançados.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-black text-emerald-950">Margem para projeção interna</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    Informe a margem sobre o custo. O sistema projeta retorno por @ fria e por kg informado.
                  </p>
                </div>
                <div className="w-full max-w-[220px]">
                  <NumberInput
                    label="Margem sobre custo"
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

              <div className="mt-5 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-3">
                <div>
                  <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Custo/@ compra</span>
                  <strong className="text-emerald-950">{brMoney(custoPorArrobaCompra)}</strong>
                </div>
                <div>
                  <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Lucro/@ fria</span>
                  <strong className="text-emerald-950">{brMoney(lucroPorArrobaRetorno)}</strong>
                </div>
                <div>
                  <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Retorno/@ fria</span>
                  <strong className="text-emerald-950">{brMoney(receitaPorArrobaRetorno)}</strong>
                </div>
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
              <h3 className="text-sm font-black uppercase tracking-wide text-emerald-950">Leitura por arroba</h3>
              <div className="mt-3 space-y-1">
                <DetailLine label="@ compra — quente" value={`${brNumber(arrobasCompra)} @`} />
                <DetailLine label="Custo/@ compra" value={brMoney(custoPorArrobaCompra)} />
                <DetailLine label="@ retorno — fria" value={`${brNumber(arrobasRetorno)} @`} />
                <DetailLine label="Retorno/@ fria" value={brMoney(receitaPorArrobaRetorno)} />
                <DetailLine label="Lucro/@ fria" value={brMoney(lucroPorArrobaRetorno)} />
                <DetailLine label="Cada 1% de margem" value={`${brMoney(valorPorPontoArroba)} / @ fria`} />
                <DetailLine label="Margem na venda" value={brPercent(margemNaVenda)} />
                <DetailLine label="Retorno/kg carcaça fria" value={`${brMoney(retornoPorKgCarcacaFria)} / kg`} />
                <DetailLine label="Retorno/kg produção" value={`${brMoney(retornoPorKgProducao)} / kg`} />
              </div>
              <div className="mt-4 rounded-xl bg-white p-3 text-sm font-bold leading-relaxed text-slate-700">
                Compra é conferida na carcaça quente. Retorno e sobra são projetados na carcaça fria: <strong>{brMoney(receitaPorArrobaRetorno)}/@</strong>, totalizando <strong>{brMoney(lucroPrevisto)}</strong> de sobra.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-emerald-950">Base do lote e produção informada</h2>
            <div className="mt-3 grid gap-1">
              <DetailLine label="@ compra — carcaça quente" value={`${brNumber(arrobasCompra)} @`} />
              <DetailLine label="@ retorno — carcaça fria" value={`${brNumber(arrobasRetorno)} @`} />
              <DetailLine label="Base carcaça quente" value={`${brNumber(kgCarcacaQuente)} kg`} />
              <DetailLine label="Base carcaça fria" value={`${brNumber(kgCarcacaFria)} kg`} />
              <DetailLine label="Produção total considerada" value={`${brNumber(kgTotal)} kg`} />
              <DetailLine label="Produção equivalente" value={`${brNumber(arrobasProducao)} @`} />
              <DetailLine label="Carnes" value={`${brNumber(kgCarnes)} kg`} />
              <DetailLine label="Miúdos" value={`${brNumber(kgMiudos)} kg`} />
              <DetailLine label="Custo/@ compra quente" value={brMoney(custoPorArrobaCompra)} />
              <DetailLine label="Retorno/@ carcaça fria" value={brMoney(receitaPorArrobaRetorno)} />
              <DetailLine label="Lucro/@ carcaça fria" value={brMoney(lucroPorArrobaRetorno)} />
              <DetailLine label="Custo/kg produção informada" value={brMoney(custoPorKgProducao)} />
              <DetailLine label="Custo/kg carcaça quente" value={brMoney(custoPorKgCarcacaQuente)} />
              <DetailLine label="Custo/kg carcaça fria" value={brMoney(custoPorKgCarcacaFria)} />
              <DetailLine label="Rendimento industrial" value={brPercent(Number(calc?.aproveitamentoIndustrial || 0))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-emerald-950">Custo importado</h2>
            <div className="mt-3 grid gap-1">
              {costBreakdown.map((item) => (
                <DetailLine key={item.item} label={item.item} value={brMoney(item.value)} />
              ))}
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
