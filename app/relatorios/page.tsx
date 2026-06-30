"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Section from "../components/Section";
import { LoteData } from "../types/lote";
import { calculate } from "../utils/calculations";

const STORAGE_KEY = "frigorifico-eldorado-lotes";

type Row = {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
};

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

function brPercent(value: number) {
  return `${brNumber(value)}%`;
}

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

function formatDate(date: string) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="report-metric rounded-xl border border-emerald-950/15 bg-emerald-50 p-4">
      <div className="text-[11px] font-black uppercase tracking-wide text-emerald-900">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black text-emerald-950">{value}</div>
      {note && <div className="mt-1 text-[11px] font-bold text-slate-600">{note}</div>}
    </div>
  );
}

function ReportTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={row.highlight ? "bg-emerald-950 text-white" : "border-b border-slate-100 bg-white"}
            >
              <td className="p-2.5 font-bold">{row.label}</td>
              <td className="p-2.5 text-right font-black">{row.value}</td>
              {row.note && (
                <td className="hidden p-2.5 text-right text-xs font-semibold md:table-cell">
                  {row.note}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="report-section rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 border-b border-emerald-950/20 pb-2 text-sm font-black uppercase tracking-wide text-emerald-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function RelatoriosPage() {
  const [lotes, setLotes] = useState<LoteData[]>([]);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setLotes(parsed);
    } catch {
      setLotes([]);
    }
  }, []);

  const lotesFiltrados = useMemo(() => {
    return lotes
      .filter((lote) => {
        if (!lote.data) return !dataInicial && !dataFinal;
        if (dataInicial && lote.data < dataInicial) return false;
        if (dataFinal && lote.data > dataFinal) return false;
        return true;
      })
      .sort((a, b) => {
        const dataA = a.data || "";
        const dataB = b.data || "";

        if (dataA !== dataB) return dataB.localeCompare(dataA);
        return String(a.numeroLote || "").localeCompare(String(b.numeroLote || ""));
      });
  }, [dataFinal, dataInicial, lotes]);

  const resumo = useMemo(() => {
    const base = {
      totalBois: 0,
      totalVacas: 0,
      totalCabecas: 0,
      carcacaQuenteTotal: 0,
      carcacaFriaTotal: 0,
      arrobasTotal: 0,
      producaoTotal: 0,
      miudosTotal: 0,
      custoGado: 0,
      frete: 0,
      custoCabecas: 0,
      folhaAplicada: 0,
      taxas: 0,
      outrosCustos: 0,
      custoTotal: 0,
    };

    lotesFiltrados.forEach((lote) => {
      const calc = calculate(lote);

      base.totalBois += Number(lote.quantidadeBois || 0);
      base.totalVacas += Number(lote.quantidadeVacas || 0);
      base.totalCabecas += calc.totalCabecas;
      base.carcacaQuenteTotal += calc.carcacaQuenteTotal;
      base.carcacaFriaTotal += calc.carcacaFriaTotal;
      base.arrobasTotal += calc.arrobasTotal;
      base.producaoTotal += calc.producaoTotal;
      base.miudosTotal += calc.producaoMiudos;
      base.custoGado += calc.custoGadoConsiderado;
      base.frete += Number(lote.frete || 0);
      base.custoCabecas += calc.custoCabecasAdicional;
      base.folhaAplicada += calc.folhaAbateAplicada;
      base.taxas += Number(lote.taxas || 0);
      base.outrosCustos += Number(lote.outrosCustos || 0);
      base.custoTotal += calc.custoTotal;
    });

    const custoOperacional =
      base.frete + base.custoCabecas + base.folhaAplicada + base.taxas + base.outrosCustos;
    const taxasOutros = base.taxas + base.outrosCustos;

    return {
      ...base,
      custoOperacional,
      taxasOutros,
      quebraMedia: safeDiv(base.carcacaQuenteTotal - base.carcacaFriaTotal, base.carcacaQuenteTotal) * 100,
      pesoMedioGeral: safeDiv(base.carcacaQuenteTotal, base.totalCabecas),
      mediaArrobaGeral: safeDiv(base.arrobasTotal, base.totalCabecas),
      aproveitamentoIndustrial: safeDiv(base.producaoTotal, base.carcacaFriaTotal) * 100,
      rendimentoMiudos: safeDiv(base.miudosTotal, base.carcacaFriaTotal) * 100,
      miudosPorCabeca: safeDiv(base.miudosTotal, base.totalCabecas),
      custoPorCabeca: safeDiv(base.custoTotal, base.totalCabecas),
      custoPorKgProduzido: safeDiv(base.custoTotal, base.producaoTotal),
      custoPorKgCarcacaQuente: safeDiv(base.custoTotal, base.carcacaQuenteTotal),
      custoPorKgCarcacaFria: safeDiv(base.custoTotal, base.carcacaFriaTotal),
      custoPorArroba: safeDiv(base.custoTotal, base.arrobasTotal),
      custoGadoPorCabeca: safeDiv(base.custoGado, base.totalCabecas),
      custoOperacionalPorCabeca: safeDiv(custoOperacional, base.totalCabecas),
      custoOperacionalPorKg: safeDiv(custoOperacional, base.producaoTotal),
      fretePorCabeca: safeDiv(base.frete, base.totalCabecas),
      folhaPorCabeca: safeDiv(base.folhaAplicada, base.totalCabecas),
      custoAdicionalPorCabeca: safeDiv(base.custoCabecas, base.totalCabecas),
      taxasOutrosPorCabeca: safeDiv(taxasOutros, base.totalCabecas),
    };
  }, [lotesFiltrados]);

  const periodoSelecionado = dataInicial || dataFinal;
  const periodoTexto = periodoSelecionado
    ? `${dataInicial ? formatDate(dataInicial) : "Início"} até ${
        dataFinal ? formatDate(dataFinal) : "Hoje"
      }`
    : "Todos os lotes";
  const dataEmissao = new Date().toLocaleDateString("pt-BR");

  const operacionalRows: Row[] = [
    { label: "Lotes no período", value: String(lotesFiltrados.length) },
    { label: "Cabeças abatidas", value: String(resumo.totalCabecas) },
    { label: "Bois", value: String(resumo.totalBois) },
    { label: "Vacas", value: String(resumo.totalVacas) },
    { label: "Carcaça quente total", value: `${brNumber(resumo.carcacaQuenteTotal)} kg` },
    { label: "Carcaça fria estimada", value: `${brNumber(resumo.carcacaFriaTotal)} kg` },
    { label: "Quebra média aplicada", value: brPercent(resumo.quebraMedia) },
    { label: "Arrobas totais", value: brNumber(resumo.arrobasTotal) },
    { label: "Produção total aproveitada", value: `${brNumber(resumo.producaoTotal)} kg` },
    { label: "Miúdos informados", value: `${brNumber(resumo.miudosTotal)} kg` },
    { label: "Miúdos por cabeça", value: `${brNumber(resumo.miudosPorCabeca)} kg` },
    { label: "Rendimento dos miúdos", value: brPercent(resumo.rendimentoMiudos) },
  ];

  const custoRows: Row[] = [
    {
      label: "Custo do gado considerado",
      value: brMoney(resumo.custoGado),
      note: brPercent(safeDiv(resumo.custoGado, resumo.custoTotal) * 100),
    },
    {
      label: "Frete",
      value: brMoney(resumo.frete),
      note: brPercent(safeDiv(resumo.frete, resumo.custoTotal) * 100),
    },
    {
      label: "Custo por cabeça aplicado",
      value: brMoney(resumo.custoCabecas),
      note: "campo informado no abate",
    },
    {
      label: "Folha aplicada ao lote",
      value: brMoney(resumo.folhaAplicada),
      note: brPercent(safeDiv(resumo.folhaAplicada, resumo.custoTotal) * 100),
    },
    {
      label: "Taxas",
      value: brMoney(resumo.taxas),
      note: brPercent(safeDiv(resumo.taxas, resumo.custoTotal) * 100),
    },
    {
      label: "Outros custos",
      value: brMoney(resumo.outrosCustos),
      note: brPercent(safeDiv(resumo.outrosCustos, resumo.custoTotal) * 100),
    },
    { label: "Custo total final", value: brMoney(resumo.custoTotal), note: "100,00%", highlight: true },
  ];

  const indicadoresRows: Row[] = [
    { label: "Custo final por cabeça", value: brMoney(resumo.custoPorCabeca), highlight: true },
    { label: "Custo final por kg produzido", value: brMoney(resumo.custoPorKgProduzido), highlight: true },
    { label: "Custo final por arroba", value: brMoney(resumo.custoPorArroba), highlight: true },
    { label: "Custo por kg de carcaça fria", value: brMoney(resumo.custoPorKgCarcacaFria) },
    { label: "Custo por kg de carcaça quente", value: brMoney(resumo.custoPorKgCarcacaQuente) },
    { label: "Gado por cabeça", value: brMoney(resumo.custoGadoPorCabeca) },
    { label: "Operacional sem gado por cabeça", value: brMoney(resumo.custoOperacionalPorCabeca) },
    { label: "Operacional sem gado por kg produzido", value: brMoney(resumo.custoOperacionalPorKg) },
    { label: "Frete por cabeça", value: brMoney(resumo.fretePorCabeca) },
    { label: "Folha por cabeça", value: brMoney(resumo.folhaPorCabeca) },
    { label: "Taxas + outros por cabeça", value: brMoney(resumo.taxasOutrosPorCabeca) },
    { label: "Custo aplicado por cabeça", value: brMoney(resumo.custoAdicionalPorCabeca) },
  ];

  return (
    <main className="report-page min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="report-wrapper mx-auto max-w-5xl space-y-4 print:max-w-none print:space-y-0">
        <div className="report-screen-only print:hidden">
          <Section title="Relatórios">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(event) => setDataInicial(event.target.value)}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800 focus:bg-emerald-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Data final
                </label>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(event) => setDataFinal(event.target.value)}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800 focus:bg-emerald-50"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setDataInicial("");
                  setDataFinal("");
                }}
                className="self-end rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700"
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="self-end rounded-xl bg-emerald-950 px-4 py-3 text-sm font-black text-white"
              >
                Imprimir A4
              </button>

              <a
                href="/"
                className="self-end rounded-xl border border-emerald-950 px-4 py-3 text-center text-sm font-black text-emerald-950"
              >
                Voltar
              </a>
            </div>
          </Section>
        </div>

        <article className="report-sheet rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="report-header border-b-4 border-emerald-950 pb-4">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
              FRIGORÍFICO ELDORADO
            </div>
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-emerald-950 md:text-3xl">
                  RAIO-X OPERACIONAL DO LOTE
                </h1>
                <p className="text-sm font-semibold text-slate-600">
                  Custos finais, médias e base operacional do abate
                </p>
              </div>
              <div className="report-meta text-xs font-bold uppercase tracking-wide text-slate-600 md:text-right">
                <div>Período: {periodoTexto}</div>
                <div>Emissão: {dataEmissao}</div>
              </div>
            </div>
          </header>

          <div className="mt-5 space-y-4">
            <div className="report-kpis grid gap-3 md:grid-cols-4">
              <MetricCard label="Custo total final" value={brMoney(resumo.custoTotal)} />
              <MetricCard label="Custo / cabeça" value={brMoney(resumo.custoPorCabeca)} />
              <MetricCard label="Custo / kg produzido" value={brMoney(resumo.custoPorKgProduzido)} />
              <MetricCard label="Custo / @" value={brMoney(resumo.custoPorArroba)} />
            </div>

            <div className="report-two-col grid gap-4 lg:grid-cols-2">
              <ReportSection title="Base operacional">
                <ReportTable rows={operacionalRows} />
              </ReportSection>

              <ReportSection title="Composição do custo">
                <ReportTable rows={custoRows} />
              </ReportSection>
            </div>

            <ReportSection title="Indicadores finais de custo">
              <div className="report-two-col grid gap-4 md:grid-cols-2">
                <ReportTable rows={indicadoresRows.slice(0, 6)} />
                <ReportTable rows={indicadoresRows.slice(6)} />
              </div>
            </ReportSection>

            <ReportSection title="Leitura operacional">
              <div className="space-y-2 text-sm font-semibold leading-relaxed text-slate-700">
                <p>
                  O lote consolidado carregou {brMoney(resumo.custoPorCabeca)} por cabeça,
                  {` ${brMoney(resumo.custoPorKgProduzido)} por kg produzido`} e
                  {` ${brMoney(resumo.custoPorArroba)} por arroba`}.
                </p>
                <p>
                  O campo de custo por cabeça aplicado é tratado como custo consolidado informado no
                  abate. A aba de miúdos não adiciona custo separado; ela serve apenas para leitura de
                  rendimento e fechamento de pesos.
                </p>
                <p>
                  Sem considerar o gado, a operação adicionou {brMoney(resumo.custoOperacional)}
                  {` ao lote, equivalentes a ${brMoney(resumo.custoOperacionalPorCabeca)} por cabeça`}.
                </p>
                <p>
                  Este relatório não contempla lucro, preço de venda ou análise comercial; ele consolida
                  apenas custo final e desempenho operacional do lote.
                </p>
              </div>
            </ReportSection>
          </div>

          <footer className="report-footer mt-5 border-t border-slate-200 pt-3 text-center text-[11px] font-semibold text-slate-500">
            FRIGORÍFICO ELDORADO - Relatório gerado pelo sistema
          </footer>
        </article>
      </div>
    </main>
  );
}
