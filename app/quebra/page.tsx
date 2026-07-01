"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NumberInput from "../components/NumberInput";
import { LoteData } from "../types/lote";

const ABATE_KEY = "frigorifico-eldorado-lotes";
const HIST_KEY = "frigorifico-eldorado-quebra-simples-historico";

type QuebraForm = {
  data: string;
  numeroLote: string;
  pesoVivoBois: number;
  pesoVivoVacas: number;
  carcacaQuenteBoi: number;
  carcacaQuenteVaca: number;
  carcacaFriaBoi: number;
  carcacaFriaVaca: number;
  pecasProduzidas: number;
  miudos: number;
  observacoes: string;
};

type HistoricoItem = QuebraForm & {
  id: string;
  criadoEm: string;
};

type LoteComPesoVivo = LoteData & {
  pesoVivoBois?: number;
  pesoVivoVacas?: number;
  pesoGadoEmPeBoi?: number;
  pesoGadoEmPeVaca?: number;
};

const initialState: QuebraForm = {
  data: "",
  numeroLote: "",
  pesoVivoBois: 0,
  pesoVivoVacas: 0,
  carcacaQuenteBoi: 0,
  carcacaQuenteVaca: 0,
  carcacaFriaBoi: 0,
  carcacaFriaVaca: 0,
  pecasProduzidas: 0,
  miudos: 0,
  observacoes: "",
};

function safeDiv(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
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

function formatDate(date: string) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function Field({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800 focus:bg-emerald-50"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-950">
        {title}
      </h2>
      {children}
    </section>
  );
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
          ? "report-metric rounded-xl bg-emerald-950 p-4 text-white"
          : "report-metric rounded-xl border border-emerald-950/15 bg-emerald-50 p-4"
      }
    >
      <div
        className={
          dark
            ? "text-[11px] font-black uppercase tracking-wide text-emerald-100"
            : "text-[11px] font-black uppercase tracking-wide text-emerald-900"
        }
      >
        {label}
      </div>
      <div
        className={
          dark
            ? "mt-1 text-2xl font-black text-white"
            : "mt-1 text-2xl font-black text-emerald-950"
        }
      >
        {value}
      </div>
      {note && (
        <div
          className={
            dark
              ? "mt-1 text-[11px] font-bold text-emerald-100"
              : "mt-1 text-[11px] font-bold text-slate-600"
          }
        >
          {note}
        </div>
      )}
    </div>
  );
}

function ResultLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
      <span className={strong ? "font-black text-emerald-950" : "text-slate-600"}>
        {label}
      </span>
      <strong className="text-right text-slate-950">{value}</strong>
    </div>
  );
}

function calculateQuebra(data: QuebraForm) {
  const pesoVivoBois = Number(data.pesoVivoBois || 0);
  const pesoVivoVacas = Number(data.pesoVivoVacas || 0);
  const pesoVivoTotal = pesoVivoBois + pesoVivoVacas;

  const carcacaQuenteTotal =
    Number(data.carcacaQuenteBoi || 0) + Number(data.carcacaQuenteVaca || 0);
  const carcacaFriaTotal =
    Number(data.carcacaFriaBoi || 0) + Number(data.carcacaFriaVaca || 0);
  const pecasProduzidas = Number(data.pecasProduzidas || 0);
  const miudos = Number(data.miudos || 0);

  const quenteSobreVivo = safeDiv(carcacaQuenteTotal, pesoVivoTotal) * 100;
  const frioSobreVivo = safeDiv(carcacaFriaTotal, pesoVivoTotal) * 100;
  const pecasSobreVivo = safeDiv(pecasProduzidas, pesoVivoTotal) * 100;
  const miudosSobreVivo = safeDiv(miudos, pesoVivoTotal) * 100;

  const quebraQuenteKg =
    pesoVivoTotal > 0 && carcacaQuenteTotal > 0 ? pesoVivoTotal - carcacaQuenteTotal : 0;
  const quebraFrioKg =
    pesoVivoTotal > 0 && carcacaFriaTotal > 0 ? pesoVivoTotal - carcacaFriaTotal : 0;
  const quebraPecasKg =
    pesoVivoTotal > 0 && pecasProduzidas > 0 ? pesoVivoTotal - pecasProduzidas : 0;
  const quebraQuentePercent =
    pesoVivoTotal > 0 && carcacaQuenteTotal > 0 ? 100 - quenteSobreVivo : 0;
  const quebraFrioPercent =
    pesoVivoTotal > 0 && carcacaFriaTotal > 0 ? 100 - frioSobreVivo : 0;
  const quebraPecasPercent =
    pesoVivoTotal > 0 && pecasProduzidas > 0 ? 100 - pecasSobreVivo : 0;

  const status =
    pesoVivoTotal <= 0
      ? "INFORMAR PESO VIVO"
      : carcacaQuenteTotal <= 0 || carcacaFriaTotal <= 0
        ? "AGUARDANDO ABATE"
        : carcacaFriaTotal > carcacaQuenteTotal
          ? "REVISAR FRIO"
        : pecasProduzidas <= 0
          ? "AGUARDANDO PEÇAS"
          : pecasProduzidas > pesoVivoTotal || pecasProduzidas > carcacaFriaTotal
            ? "REVISAR PEÇAS"
            : "FECHADO PARA LEITURA";

  return {
    pesoVivoTotal,
    carcacaQuenteTotal,
    carcacaFriaTotal,
    pecasProduzidas,
    miudos,
    quenteSobreVivo,
    frioSobreVivo,
    pecasSobreVivo,
    miudosSobreVivo,
    quebraQuenteKg,
    quebraFrioKg,
    quebraPecasKg,
    quebraQuentePercent,
    quebraFrioPercent,
    quebraPecasPercent,
    status,
  };
}

function sumPecasDoAbate(lote: LoteData) {
  return (
    Number(lote.traseiroBoi || 0) +
    Number(lote.traseiroCapoteBoi || 0) +
    Number(lote.dianteiroBoi || 0) +
    Number(lote.pontaBoi || 0) +
    Number(lote.traseiroVaca || 0) +
    Number(lote.traseiroCapoteVaca || 0) +
    Number(lote.dianteiroVaca || 0) +
    Number(lote.pontaVaca || 0)
  );
}

export default function QuebraPage() {
  const [form, setForm] = useState<QuebraForm>(initialState);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const calc = useMemo(() => calculateQuebra(form), [form]);
  const dataEmissao = new Date().toLocaleDateString("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem(HIST_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setHistorico(parsed);
    } catch {
      setHistorico([]);
    }
  }, []);

  function update<K extends keyof QuebraForm>(key: K, value: QuebraForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateNumber(key: keyof Omit<QuebraForm, "data" | "numeroLote" | "observacoes">, value: number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function carregarUltimoLote() {
    const saved = localStorage.getItem(ABATE_KEY);
    if (!saved) return;

    try {
      const lotes = JSON.parse(saved) as LoteComPesoVivo[];
      if (!Array.isArray(lotes) || lotes.length === 0) return;

      const lote = lotes[0];
      const carcacaQuenteBoi = Number(lote.carcacaQuenteBoi || 0);
      const carcacaQuenteVaca = Number(lote.carcacaQuenteVaca || 0);
      const quebraPercentual = Number(lote.quebraPercentual || 0);
      const carcacaFriaReal = Number(lote.carcacaFriaReal || 0);
      const quenteTotal = carcacaQuenteBoi + carcacaQuenteVaca;
      const friaBoiEstimado = carcacaQuenteBoi * (1 - quebraPercentual / 100);
      const friaVacaEstimado = carcacaQuenteVaca * (1 - quebraPercentual / 100);
      const friaBoiReal = quenteTotal > 0 ? carcacaFriaReal * safeDiv(carcacaQuenteBoi, quenteTotal) : 0;
      const friaVacaReal = quenteTotal > 0 ? carcacaFriaReal * safeDiv(carcacaQuenteVaca, quenteTotal) : 0;

      setForm((prev) => ({
        ...prev,
        data: lote.data || prev.data,
        numeroLote: lote.numeroLote || prev.numeroLote,
        pesoVivoBois: Number(lote.pesoVivoBois || lote.pesoGadoEmPeBoi || prev.pesoVivoBois || 0),
        pesoVivoVacas: Number(lote.pesoVivoVacas || lote.pesoGadoEmPeVaca || prev.pesoVivoVacas || 0),
        carcacaQuenteBoi,
        carcacaQuenteVaca,
        carcacaFriaBoi: carcacaFriaReal > 0 ? friaBoiReal : friaBoiEstimado,
        carcacaFriaVaca: carcacaFriaReal > 0 ? friaVacaReal : friaVacaEstimado,
        pecasProduzidas: sumPecasDoAbate(lote),
        miudos: Number(lote.miudos || 0),
        observacoes: lote.observacoes || prev.observacoes,
      }));
    } catch {
      return;
    }
  }

  function salvarRelatorio() {
    const item: HistoricoItem = {
      ...form,
      id: `${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };

    const next = [item, ...historico];
    setHistorico(next);
    localStorage.setItem(HIST_KEY, JSON.stringify(next));
  }

  function abrirHistorico(item: HistoricoItem) {
    setForm({
      data: item.data,
      numeroLote: item.numeroLote,
      pesoVivoBois: item.pesoVivoBois,
      pesoVivoVacas: item.pesoVivoVacas,
      carcacaQuenteBoi: item.carcacaQuenteBoi,
      carcacaQuenteVaca: item.carcacaQuenteVaca,
      carcacaFriaBoi: item.carcacaFriaBoi,
      carcacaFriaVaca: item.carcacaFriaVaca,
      pecasProduzidas: item.pecasProduzidas,
      miudos: item.miudos,
      observacoes: item.observacoes,
    });
  }

  return (
    <main className="report-page min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="report-wrapper mx-auto max-w-6xl space-y-5 print:max-w-none print:space-y-0">
        <header className="report-screen-only overflow-hidden rounded-2xl border border-emerald-950/20 bg-emerald-950 text-white shadow-sm print:hidden">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight md:text-4xl">
                FRIGORÍFICO ELDORADO
              </div>
              <div className="mt-1 text-lg font-black text-emerald-300">
                QUEBRAS GERENCIAIS
              </div>
              <p className="mt-1 text-sm font-semibold text-emerald-100">
                Leituras simples sobre peso vivo: quente, frio, peças e miúdos
              </p>
            </div>

            <div className="flex flex-wrap justify-start gap-2 md:justify-end">
              <a
                href="/"
                className="rounded-xl border border-white/30 bg-white px-4 py-2 text-sm font-black text-emerald-950 transition hover:bg-emerald-50"
              >
                Voltar ao abate
              </a>
              <a
                href="/relatorios"
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/20"
              >
                Relatórios
              </a>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5 print:hidden">
            <Section title="Dados para a Leitura">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Data" type="date" value={form.data} onChange={(value) => update("data", value)} />
                <Field label="Número do lote" value={form.numeroLote} onChange={(value) => update("numeroLote", value)} />
                <NumberInput label="Peso vivo bois (kg)" value={form.pesoVivoBois} onChange={(value) => updateNumber("pesoVivoBois", value)} />
                <NumberInput label="Peso vivo vacas (kg)" value={form.pesoVivoVacas} onChange={(value) => updateNumber("pesoVivoVacas", value)} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <NumberInput label="Carcaça quente bois (kg)" value={form.carcacaQuenteBoi} onChange={(value) => updateNumber("carcacaQuenteBoi", value)} />
                <NumberInput label="Carcaça quente vacas (kg)" value={form.carcacaQuenteVaca} onChange={(value) => updateNumber("carcacaQuenteVaca", value)} />
                <NumberInput label="Carcaça fria bois (kg)" value={form.carcacaFriaBoi} onChange={(value) => updateNumber("carcacaFriaBoi", value)} />
                <NumberInput label="Carcaça fria vacas (kg)" value={form.carcacaFriaVaca} onChange={(value) => updateNumber("carcacaFriaVaca", value)} />
                <NumberInput label="Peças produzidas (kg)" value={form.pecasProduzidas} onChange={(value) => updateNumber("pecasProduzidas", value)} />
                <NumberInput label="Miúdos (kg)" value={form.miudos} onChange={(value) => updateNumber("miudos", value)} />
              </div>

              <div className="mt-4 rounded-xl border border-emerald-950/15 bg-emerald-50 p-3 text-xs font-bold leading-relaxed text-emerald-950">
                Ao carregar o lote, o sistema puxa carcaças, peças produzidas e miúdos do abate.
                O peso vivo permanece manual enquanto esse campo não existir no cadastro do abate.
              </div>
            </Section>

            <Section title="Ações">
              <textarea
                value={form.observacoes}
                onChange={(event) => update("observacoes", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800"
                placeholder="Observações rápidas para o relatório..."
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={carregarUltimoLote}
                  className="rounded-xl border border-emerald-950 bg-white px-4 py-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-50"
                >
                  Carregar último lote
                </button>
                <button
                  type="button"
                  onClick={salvarRelatorio}
                  className="rounded-xl bg-emerald-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-900"
                >
                  Salvar leitura
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-slate-500"
                >
                  Imprimir A4
                </button>
                <button
                  type="button"
                  onClick={() => setForm(initialState)}
                  className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700 transition hover:border-red-400"
                >
                  Limpar
                </button>
              </div>
            </Section>

            {historico.length > 0 && (
              <Section title="Histórico">
                <div className="max-h-[240px] overflow-auto rounded-xl border">
                  <table className="w-full min-w-[620px] border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Lote</th>
                        <th className="p-2 text-right">Quente/vivo</th>
                        <th className="p-2 text-right">Frio/vivo</th>
                        <th className="p-2 text-right">Peças/vivo</th>
                        <th className="p-2 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((item) => {
                        const itemCalc = calculateQuebra(item);

                        return (
                          <tr key={item.id} className="border-b border-slate-200 bg-white">
                            <td className="p-2 font-bold">{formatDate(item.data)}</td>
                            <td className="p-2 font-bold">{item.numeroLote || "-"}</td>
                            <td className="p-2 text-right font-bold">{brPercent(itemCalc.quenteSobreVivo)}</td>
                            <td className="p-2 text-right font-bold">{brPercent(itemCalc.frioSobreVivo)}</td>
                            <td className="p-2 text-right font-bold">{brPercent(itemCalc.pecasSobreVivo)}</td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => abrirHistorico(item)}
                                className="rounded-lg border border-slate-300 px-2 py-1 font-black text-slate-700"
                              >
                                Abrir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>

          <article className="quebra-report report-sheet rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <header className="report-header border-b-4 border-emerald-950 pb-4">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">
                FRIGORÍFICO ELDORADO
              </div>
              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-emerald-950 md:text-3xl">
                    RELATÓRIO DE QUEBRAS GERENCIAIS
                  </h1>
                  <p className="text-sm font-semibold text-slate-600">
                    Percentuais principais sobre o peso vivo
                  </p>
                </div>
                <div className="report-meta text-xs font-bold uppercase tracking-wide text-slate-600 md:text-right">
                  <div>Lote: {form.numeroLote || "-"}</div>
                  <div>Data: {formatDate(form.data)}</div>
                  <div>Emissão: {dataEmissao}</div>
                </div>
              </div>
            </header>

            <div className="mt-5 space-y-4">
              <div className="quebra-kpis report-kpis grid grid-cols-2 gap-3 2xl:grid-cols-4 print:grid-cols-4">
                <MetricCard
                  label="Quente / vivo"
                  value={brPercent(calc.quenteSobreVivo)}
                  note={`${brNumber(calc.carcacaQuenteTotal)} kg`}
                  dark
                />
                <MetricCard
                  label="Frio / vivo"
                  value={brPercent(calc.frioSobreVivo)}
                  note={`${brNumber(calc.carcacaFriaTotal)} kg`}
                />
                <MetricCard
                  label="Peças / vivo"
                  value={brPercent(calc.pecasSobreVivo)}
                  note={`${brNumber(calc.pecasProduzidas)} kg`}
                />
                <MetricCard
                  label="Miúdos / vivo"
                  value={brPercent(calc.miudosSobreVivo)}
                  note={`${brNumber(calc.miudos)} kg`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Section title="Base Usada">
                  <ResultLine label="Peso vivo total" value={`${brNumber(calc.pesoVivoTotal)} kg`} strong />
                  <ResultLine label="Carcaça quente total" value={`${brNumber(calc.carcacaQuenteTotal)} kg`} />
                  <ResultLine label="Carcaça fria total" value={`${brNumber(calc.carcacaFriaTotal)} kg`} />
                  <ResultLine label="Peças produzidas" value={`${brNumber(calc.pecasProduzidas)} kg`} />
                  <ResultLine label="Miúdos" value={`${brNumber(calc.miudos)} kg`} />
                </Section>

                <Section title="Quebras Diretas">
                  <ResultLine label="Quebra até carcaça quente" value={brPercent(calc.quebraQuentePercent)} strong />
                  <ResultLine label="Kg até carcaça quente" value={`${brNumber(calc.quebraQuenteKg)} kg`} />
                  <ResultLine label="Quebra até frio" value={brPercent(calc.quebraFrioPercent)} strong />
                  <ResultLine label="Kg até frio" value={`${brNumber(calc.quebraFrioKg)} kg`} />
                  <ResultLine label="Quebra até peças" value={brPercent(calc.quebraPecasPercent)} strong />
                  <ResultLine label="Kg até peças" value={`${brNumber(calc.quebraPecasKg)} kg`} />
                </Section>
              </div>

              <Section title="Leitura Gerencial">
                <div className="space-y-2 text-sm font-semibold leading-relaxed text-slate-700">
                  <div className="rounded-xl border border-emerald-950/20 bg-emerald-50 px-4 py-3 text-center text-base font-black text-emerald-950">
                    {calc.status}
                  </div>
                  <p>
                    A leitura principal do lote é: carcaça quente em {brPercent(calc.quenteSobreVivo)},
                    carcaça fria em {brPercent(calc.frioSobreVivo)} e peças produzidas em
                    {` ${brPercent(calc.pecasSobreVivo)}`} sobre o peso vivo informado.
                  </p>
                  <p>
                    Os miúdos representam {brPercent(calc.miudosSobreVivo)} sobre o peso vivo.
                    Este relatório é apenas gerencial e resume os percentuais essenciais da quebra.
                  </p>
                  {form.observacoes && <p>Observações: {form.observacoes}</p>}
                </div>
              </Section>
            </div>

            <footer className="report-footer mt-5 border-t border-slate-200 pt-3 text-center text-[11px] font-semibold text-slate-500">
              FRIGORÍFICO ELDORADO - Relatório gerado pelo sistema
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
