"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MIUDOS_PRODUTOS, type MiudosProdutoKey } from "../utils/miudosProducts";

const ABATE_KEY = "frigorifico-eldorado-lotes";
const HIST_KEY = "frigorifico-eldorado-miudos-historico";

type ProdutoKey = MiudosProdutoKey;

type LoteAbate = {
  data?: string;
  numeroLote?: string;
  quantidadeBois?: number;
  quantidadeVacas?: number;
  carcacaQuenteBoi?: number;
  carcacaQuenteVaca?: number;
  carcacaQuenteTotal?: number;
  miudos?: number;
  pesoMiudosRecebido?: number;
};

type ProdutoHistorico = {
  key: ProdutoKey;
  nome: string;
  peso: number;
  rendimento: number;
  rendimentoCarcacaQuente: number;
  kgPorCabeca: number;
};

type HistoricoItem = {
  data?: string;
  lote?: string;
  pesoMiudos: number;
  pesoRecebido?: number;
  pesoProduzido?: number;
  diferenca?: number;
  totalCabecas?: number;
  aproveitamento: number;
  observacoes?: string;
  produtos?: ProdutoHistorico[];
};

const PRODUTOS = MIUDOS_PRODUTOS;

const initialPesos = PRODUTOS.reduce((acc, produto) => {
  acc[produto.key] = 0;
  return acc;
}, {} as Record<ProdutoKey, number>);

function brNumber(value: number, decimals = 2) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function brPercent(value: number) {
  return `${brNumber(value)}%`;
}

function parseBrazilianNumber(text: string) {
  const clean = text.replace(/[^\d,.-]/g, "");
  if (!clean) return 0;

  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean.includes(".")
      ? normalizeDotOnlyNumber(clean)
      : clean;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDotOnlyNumber(value: string) {
  const sign = value.startsWith("-") ? "-" : "";
  const unsigned = sign ? value.slice(1) : value;
  const parts = unsigned.split(".");
  const lastPart = parts[parts.length - 1];

  if (parts.length > 2 || lastPart.length === 3) {
    return `${sign}${parts.join("")}`;
  }

  return value;
}

function formatBrazilianNumber(value: number, decimals = 2) {
  if (!Number(value || 0)) return "";

  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function editBrazilianNumber(value: number, decimals = 2) {
  if (!Number(value || 0)) return "";

  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function diffClass(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-700";
  return "text-slate-800";
}

function NumericInput({
  label,
  value,
  onChange,
  decimals = 2,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(formatBrazilianNumber(value, decimals));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(formatBrazilianNumber(value, decimals));
  }, [value, decimals, focused]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      )}

      <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50">
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onFocus={() => {
            setFocused(true);
            setDisplay(editBrazilianNumber(value, decimals));
          }}
          onChange={(event) => {
            const text = event.target.value;
            setDisplay(text);
            onChange(parseBrazilianNumber(text));
          }}
          onBlur={() => {
            const parsed = parseBrazilianNumber(display);
            onChange(parsed);
            setFocused(false);
            setDisplay(formatBrazilianNumber(parsed, decimals));
          }}
          className="w-full min-w-0 bg-transparent px-4 text-right text-sm font-semibold text-slate-950 outline-none"
        />
        {suffix && (
          <span className="flex shrink-0 items-center bg-slate-100 px-3 text-xs font-semibold text-slate-700">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "rounded-2xl bg-emerald-950 p-4 text-white shadow-sm"
          : "rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm"
      }
    >
      <div
        className={
          dark
            ? "text-xs font-semibold uppercase tracking-wide text-emerald-100"
            : "text-xs font-semibold uppercase tracking-wide text-slate-600"
        }
      >
        {label}
      </div>

      <div
        className={
          dark
            ? "mt-2 text-xl font-semibold text-white"
            : "mt-2 text-xl font-semibold text-emerald-950"
        }
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm">
      <div className="bg-emerald-950 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
          {title}
        </h2>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <strong className="text-right font-semibold text-slate-950">{value}</strong>
    </div>
  );
}

function getHistoricoRecebido(item: HistoricoItem) {
  return Number(item.pesoRecebido ?? item.pesoMiudos ?? 0);
}

function getHistoricoProduzido(item: HistoricoItem) {
  return Number(item.pesoProduzido ?? item.pesoMiudos ?? 0);
}

export default function MiudosPage() {
  const [lote, setLote] = useState<LoteAbate | null>(null);
  const [pesos, setPesos] = useState<Record<ProdutoKey, number>>(initialPesos);
  const [observacoes, setObservacoes] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(ABATE_KEY);

    if (saved) {
      try {
        const lotes = JSON.parse(saved);

        if (Array.isArray(lotes) && lotes.length > 0) {
          setLote(lotes[0]);
        }
      } catch {
        setLote(null);
      }
    }

    const hist = localStorage.getItem(HIST_KEY);

    if (hist) {
      try {
        const parsed = JSON.parse(hist);
        if (Array.isArray(parsed)) setHistorico(parsed);
      } catch {
        setHistorico([]);
      }
    }
  }, []);

  const totalCabecas = Number(lote?.quantidadeBois || 0) + Number(lote?.quantidadeVacas || 0);
  const carcacaQuenteTotal =
    Number(lote?.carcacaQuenteTotal || 0) ||
    Number(lote?.carcacaQuenteBoi || 0) + Number(lote?.carcacaQuenteVaca || 0);
  const pesoRecebido = Number(lote?.pesoMiudosRecebido || lote?.miudos || 0);

  const pesoInformado = useMemo(() => {
    return PRODUTOS.reduce((total, produto) => {
      return total + Number(pesos[produto.key] || 0);
    }, 0);
  }, [pesos]);

  const diferenca = pesoRecebido - pesoInformado;
  const aproveitamento = pesoRecebido > 0 ? (pesoInformado / pesoRecebido) * 100 : 0;
  const kgPorCabecaTotal = totalCabecas > 0 ? pesoInformado / totalCabecas : 0;
  const rendimentoCarcacaTotal =
    carcacaQuenteTotal > 0 ? (pesoInformado / carcacaQuenteTotal) * 100 : 0;

  const statusPeso =
    Math.abs(diferenca) === 0
      ? "FECHADO"
      : Math.abs(diferenca) <= pesoRecebido * 0.02
        ? "ATENÇÃO"
        : "DIVERGENTE";

  const statusClass =
    Math.abs(diferenca) === 0
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : Math.abs(diferenca) <= pesoRecebido * 0.02
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : "border-red-300 bg-red-50 text-red-800";

  const produtosCalculados = useMemo(() => {
    return PRODUTOS.map((produto) => {
      const peso = Number(pesos[produto.key] || 0);

      return {
        ...produto,
        peso,
        rendimentoCarcacaQuente: carcacaQuenteTotal > 0 ? (peso / carcacaQuenteTotal) * 100 : 0,
        rendimento: pesoRecebido > 0 ? (peso / pesoRecebido) * 100 : 0,
        kgPorCabeca: totalCabecas > 0 ? peso / totalCabecas : 0,
      };
    });
  }, [pesos, pesoRecebido, carcacaQuenteTotal, totalCabecas]);

  function updatePeso(key: ProdutoKey, value: number) {
    setPesos((prev) => ({ ...prev, [key]: value }));
  }

  function salvarHistorico() {
    const item: HistoricoItem = {
      data: lote?.data || new Date().toISOString().slice(0, 10),
      lote: lote?.numeroLote || "Sem lote",
      pesoMiudos: pesoRecebido,
      pesoRecebido,
      pesoProduzido: pesoInformado,
      diferenca,
      totalCabecas,
      aproveitamento,
      observacoes,
      produtos: produtosCalculados.map((produto) => ({
        key: produto.key,
        nome: produto.nome,
        peso: produto.peso,
        rendimento: produto.rendimento,
        rendimentoCarcacaQuente: produto.rendimentoCarcacaQuente,
        kgPorCabeca: produto.kgPorCabeca,
      })),
    };

    const next = [item, ...historico];
    setHistorico(next);
    localStorage.setItem(HIST_KEY, JSON.stringify(next));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="overflow-hidden rounded-2xl border border-emerald-950/20 bg-emerald-950 text-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                FRIGORÍFICO ELDORADO
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-300">
                MÓDULO MIÚDOS
              </div>
              <p className="mt-1 text-sm font-semibold text-emerald-100">
                Controle de rendimento e fechamento de pesos dos miúdos
              </p>
            </div>

            <div className="flex flex-wrap justify-start gap-2 print:hidden md:justify-end">
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

              <a
                href="/quebra"
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/20"
              >
                Calculadora de Quebra
              </a>
            </div>
          </div>
        </header>

        {!lote && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <strong>Nenhum lote salvo encontrado.</strong> Volte ao módulo de
            abate, salve um lote e abra novamente o módulo de miúdos.
          </div>
        )}

        {lote && (
          <>
            <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
              <Card label="Lote" value={lote.numeroLote || "Sem número"} />
              <Card label="Cabeças" value={String(totalCabecas || 0)} />
              <Card label="Carcaça quente" value={`${brNumber(carcacaQuenteTotal)} kg`} />
              <Card label="Peso recebido" value={`${brNumber(pesoRecebido)} kg`} />
              <Card label="Peso produzido" value={`${brNumber(pesoInformado)} kg`} />
              <Card label="Diferença" value={`${brNumber(diferenca)} kg`} />
              <Card label="Aproveitamento" value={brPercent(aproveitamento)} dark />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <Section title="Produção dos Miúdos">
                <div className="grid gap-3 md:grid-cols-4">
                  {PRODUTOS.map((produto) => (
                    <NumericInput
                      key={produto.key}
                      label={`${produto.nome} (kg)`}
                      value={pesos[produto.key]}
                      onChange={(value) => updatePeso(produto.key, value)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Fechamento dos Pesos">
                <div className="space-y-3">
                  <ResultLine label="Recebido" value={`${brNumber(pesoRecebido)} kg`} />
                  <ResultLine label="Produzido" value={`${brNumber(pesoInformado)} kg`} />
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
                    <span className="text-slate-600">Diferença</span>
                    <strong className={`text-right ${diffClass(diferenca)}`}>
                      {brNumber(diferenca)} kg
                    </strong>
                  </div>
                  <ResultLine label="Aproveitamento" value={brPercent(aproveitamento)} />
                  <ResultLine label="Kg produzido / cabeça" value={`${brNumber(kgPorCabecaTotal)} kg`} />
                  <ResultLine label="% sobre carcaça quente" value={brPercent(rendimentoCarcacaTotal)} />
                  <div className={`rounded-xl border px-4 py-3 text-center text-lg font-bold ${statusClass}`}>
                    {statusPeso}
                  </div>
                </div>
              </Section>
            </div>

            <Section title="Rendimentos">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[880px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-emerald-950 text-white">
                      <th className="p-3 text-left">Produto</th>
                      <th className="p-3 text-right">Kg produzido</th>
                      <th className="p-3 text-right">% sobre peso recebido</th>
                      <th className="p-3 text-right">% sobre carcaça quente</th>
                      <th className="p-3 text-right">Kg/cabeça</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosCalculados.map((item) => (
                      <tr key={item.key} className="border-b border-slate-200 bg-white">
                        <td className="p-3 font-semibold text-emerald-950">{item.nome}</td>
                        <td className="p-3 text-right font-semibold">{brNumber(item.peso)} kg</td>
                        <td className="p-3 text-right font-semibold">{brPercent(item.rendimento)}</td>
                        <td className="p-3 text-right font-semibold">{brPercent(item.rendimentoCarcacaQuente)}</td>
                        <td className="p-3 text-right font-semibold">{brNumber(item.kgPorCabeca)} kg</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-950 text-white">
                      <td className="p-3 font-bold">TOTAL</td>
                      <td className="p-3 text-right font-semibold">{brNumber(pesoInformado)} kg</td>
                      <td className="p-3 text-right font-semibold">{brPercent(aproveitamento)}</td>
                      <td className="p-3 text-right font-semibold">{brPercent(rendimentoCarcacaTotal)}</td>
                      <td className="p-3 text-right font-semibold">{brNumber(kgPorCabecaTotal)} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Section title="Observações">
                <textarea
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800"
                  placeholder="Observações do lote de miúdos, rendimento, diferença de peso ou processamento..."
                />
              </Section>

              <Section title="Histórico">
                <button
                  onClick={salvarHistorico}
                  className="w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-900"
                >
                  Salvar fechamento dos miúdos
                </button>

                {historico.length > 0 && (
                  <div className="mt-4 max-h-[240px] overflow-auto">
                    <table className="w-full min-w-[680px] border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2 text-left">Data</th>
                          <th className="p-2 text-left">Lote</th>
                          <th className="p-2 text-right">Recebido</th>
                          <th className="p-2 text-right">Produzido</th>
                          <th className="p-2 text-right">Diferença</th>
                          <th className="p-2 text-right">Aproveitamento</th>
                        </tr>
                      </thead>

                      <tbody>
                        {historico.map((item, index) => {
                          const recebido = getHistoricoRecebido(item);
                          const produzido = getHistoricoProduzido(item);
                          const diferencaHistorico = Number(item.diferenca ?? recebido - produzido);

                          return (
                            <tr key={`${item.lote}-${index}`} className="border-b border-slate-200">
                              <td className="p-2 font-bold">{item.data || "-"}</td>
                              <td className="p-2 font-bold">{item.lote || "-"}</td>
                              <td className="p-2 text-right font-bold">{brNumber(recebido)} kg</td>
                              <td className="p-2 text-right font-bold">{brNumber(produzido)} kg</td>
                              <td className="p-2 text-right font-bold">{brNumber(diferencaHistorico)} kg</td>
                              <td className="p-2 text-right font-bold">{brPercent(item.aproveitamento)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>

            <footer className="rounded-2xl bg-emerald-950 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-sm">
              FRIGORÍFICO ELDORADO - MÓDULO MIÚDOS
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
