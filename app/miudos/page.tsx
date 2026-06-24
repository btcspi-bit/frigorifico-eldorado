"use client";

import { useEffect, useMemo, useState } from "react";

const ABATE_KEY = "frigorifico-eldorado-lotes";
const HIST_KEY = "frigorifico-eldorado-miudos-historico";

type ProdutoKey =
  | "figado"
  | "coracao"
  | "lingua"
  | "rins"
  | "bucho"
  | "mocoto"
  | "rabada"
  | "outros";

type CustosKey =
  | "embalagens"
  | "etiquetas"
  | "caixas"
  | "maoObra"
  | "outrosCustos";

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
  custoBlocoMiudos?: number;
};

type HistoricoItem = {
  data?: string;
  lote?: string;
  pesoMiudos: number;
  custoTotal: number;
  receitaPrevista: number;
  lucroPrevisto: number;
  aproveitamento: number;
};

const PRODUTOS: { key: ProdutoKey; nome: string; indicePadrao: number }[] = [
  { key: "figado", nome: "Fígado", indicePadrao: 1 },
  { key: "coracao", nome: "Coração", indicePadrao: 1.1 },
  { key: "lingua", nome: "Língua", indicePadrao: 2.5 },
  { key: "rins", nome: "Rins", indicePadrao: 0.8 },
  { key: "bucho", nome: "Bucho", indicePadrao: 0.7 },
  { key: "mocoto", nome: "Mocotó", indicePadrao: 0.9 },
  { key: "rabada", nome: "Rabada", indicePadrao: 2 },
  { key: "outros", nome: "Outros", indicePadrao: 1 },
];

const initialPesos: Record<ProdutoKey, number> = {
  figado: 0,
  coracao: 0,
  lingua: 0,
  rins: 0,
  bucho: 0,
  mocoto: 0,
  rabada: 0,
  outros: 0,
};

const initialIndices: Record<ProdutoKey, number> = {
  figado: 1,
  coracao: 1.1,
  lingua: 2.5,
  rins: 0.8,
  bucho: 0.7,
  mocoto: 0.9,
  rabada: 2,
  outros: 1,
};

const initialMargens: Record<ProdutoKey, number> = {
  figado: 20,
  coracao: 20,
  lingua: 20,
  rins: 20,
  bucho: 20,
  mocoto: 20,
  rabada: 20,
  outros: 20,
};

const initialCustos: Record<CustosKey, number> = {
  embalagens: 0,
  etiquetas: 0,
  caixas: 0,
  maoObra: 0,
  outrosCustos: 0,
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

function parseBrazilianNumber(text: string) {
  const clean = text.replace(/[^\d,.-]/g, "");
  if (!clean) return 0;

  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function diffClass(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-700";
  return "text-slate-800";
}

function indexText(value: number) {
  const diff = (Number(value || 0) - 1) * 100;
  if (diff > 0) return `+${brNumber(diff, 0)}% custo`;
  if (diff < 0) return `-${brNumber(Math.abs(diff), 0)}% custo`;
  return "neutro";
}

function NumericInput({
  label,
  value,
  onChange,
  decimals = 2,
  suffix,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  suffix?: string;
  compact?: boolean;
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

      <div
        className={
          compact
            ? "flex h-10 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50"
            : "flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50"
        }
      >
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

function MoneyInput({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  const [display, setDisplay] = useState(formatBrazilianNumber(value, 2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(formatBrazilianNumber(value, 2));
  }, [value, focused]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      )}

      <div
        className={
          compact
            ? "flex h-10 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50"
            : "flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50"
        }
      >
        <span className="flex shrink-0 items-center bg-slate-100 px-3 text-xs font-semibold text-slate-700">
          R$
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onFocus={() => {
            setFocused(true);
            setDisplay(editBrazilianNumber(value, 2));
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
            setDisplay(formatBrazilianNumber(parsed, 2));
          }}
          className="w-full min-w-0 bg-transparent px-4 text-right text-sm font-semibold text-slate-950 outline-none"
        />
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

export default function MiudosPage() {
  const [lote, setLote] = useState<LoteAbate | null>(null);
  const [pesos, setPesos] = useState<Record<ProdutoKey, number>>(initialPesos);
  const [indices, setIndices] = useState<Record<ProdutoKey, number>>(initialIndices);
  const [margens, setMargens] = useState<Record<ProdutoKey, number>>(initialMargens);
  const [custos, setCustos] = useState<Record<CustosKey, number>>(initialCustos);
  const [pesoRecebidoManual, setPesoRecebidoManual] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(ABATE_KEY);

    if (saved) {
      try {
        const lotes = JSON.parse(saved);

        if (Array.isArray(lotes) && lotes.length > 0) {
          const loteAtual = lotes[0];
          setLote(loteAtual);
          setPesoRecebidoManual(
            Number(loteAtual?.pesoMiudosRecebido || loteAtual?.miudos || 0)
          );
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
  const pesoRecebido = Number(pesoRecebidoManual || 0);
  const custoHerdado = Number(lote?.custoBlocoMiudos || 0);
  const custoKgBruto = pesoRecebido > 0 ? custoHerdado / pesoRecebido : 0;

  const pesoInformado = useMemo(() => {
    return PRODUTOS.reduce((total, produto) => {
      return total + Number(pesos[produto.key] || 0);
    }, 0);
  }, [pesos]);

  const diferenca = pesoRecebido - pesoInformado;
  const aproveitamento = pesoRecebido > 0 ? (pesoInformado / pesoRecebido) * 100 : 0;

  const statusPeso =
    pesoRecebido <= 0
      ? "PENDENTE"
      : Math.abs(diferenca) === 0
      ? "FECHADO"
      : Math.abs(diferenca) <= pesoRecebido * 0.02
        ? "ATENÇÃO"
        : "DIVERGENTE";

  const statusClass =
    pesoRecebido <= 0
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : Math.abs(diferenca) === 0
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : Math.abs(diferenca) <= pesoRecebido * 0.02
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : "border-red-300 bg-red-50 text-red-800";

  const custoProprio = useMemo(() => {
    return Object.values(custos).reduce((total, value) => total + Number(value || 0), 0);
  }, [custos]);

  const custoTotal = custoHerdado + custoProprio;

  const pesoPonderadoTotal = useMemo(() => {
    return PRODUTOS.reduce((total, produto) => {
      return total + Number(pesos[produto.key] || 0) * Number(indices[produto.key] || 0);
    }, 0);
  }, [pesos, indices]);

  const produtosCalculados = useMemo(() => {
    return PRODUTOS.map((produto) => {
      const peso = Number(pesos[produto.key] || 0);
      const indice = Number(indices[produto.key] || 0);
      const margem = Number(margens[produto.key] || 0);
      const pesoPonderado = peso * indice;

      const rendimentoCarcacaQuente = carcacaQuenteTotal > 0 ? (peso / carcacaQuenteTotal) * 100 : 0;
      const rendimento = pesoRecebido > 0 ? (peso / pesoRecebido) * 100 : 0;
      const kgPorCabeca = totalCabecas > 0 ? peso / totalCabecas : 0;

      const custoDistribuido =
        pesoPonderadoTotal > 0
          ? (pesoPonderado / pesoPonderadoTotal) * custoTotal
          : 0;

      const custoKg = peso > 0 ? custoDistribuido / peso : 0;
      const precoSugerido = custoKg * (1 + margem / 100);
      const receitaPrevista = precoSugerido * peso;
      const lucroPrevisto = receitaPrevista - custoDistribuido;
      const margemReal = receitaPrevista > 0 ? (lucroPrevisto / receitaPrevista) * 100 : 0;

      return {
        ...produto,
        peso,
        indice,
        margem,
        rendimentoCarcacaQuente,
        rendimento,
        kgPorCabeca,
        pesoPonderado,
        custoDistribuido,
        custoKg,
        precoSugerido,
        receitaPrevista,
        lucroPrevisto,
        margemReal,
      };
    });
  }, [pesos, indices, margens, pesoRecebido, carcacaQuenteTotal, totalCabecas, pesoPonderadoTotal, custoTotal]);

  const receitaPrevista = produtosCalculados.reduce(
    (total, item) => total + item.receitaPrevista,
    0
  );

  const lucroPrevisto = produtosCalculados.reduce(
    (total, item) => total + item.lucroPrevisto,
    0
  );

  const margemPrevista = receitaPrevista > 0 ? (lucroPrevisto / receitaPrevista) * 100 : 0;

  function updatePeso(key: ProdutoKey, value: number) {
    setPesos((prev) => ({ ...prev, [key]: value }));
  }

  function updateIndice(key: ProdutoKey, value: number) {
    setIndices((prev) => ({ ...prev, [key]: value }));
  }

  function updateMargem(key: ProdutoKey, value: number) {
    setMargens((prev) => ({ ...prev, [key]: value }));
  }

  function updateCusto(key: CustosKey, value: number) {
    setCustos((prev) => ({ ...prev, [key]: value }));
  }

  function salvarHistorico() {
    const item: HistoricoItem = {
      data: lote?.data || new Date().toISOString().slice(0, 10),
      lote: lote?.numeroLote || "Sem lote",
      pesoMiudos: pesoRecebido,
      custoTotal,
      receitaPrevista,
      lucroPrevisto,
      aproveitamento,
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
                Sistema de rendimento, custo e precificação dos miúdos
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-right">
              <div className="text-xs font-semibold uppercase text-emerald-100">
                Desenvolvido por
              </div>
              <div className="text-base font-semibold text-white">
                Thiago Meneses
              </div>
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
              <Card label="Custo total dos miúdos" value={brMoney(custoTotal)} />
              <Card label="Lucro previsto dos miúdos" value={brMoney(lucroPrevisto)} dark />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <Section title="Produção dos Miúdos">
                <div className="mb-4 max-w-sm">
                  <NumericInput
                    label="Peso recebido dos miúdos"
                    value={pesoRecebidoManual}
                    suffix="kg"
                    onChange={setPesoRecebidoManual}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {PRODUTOS.map((produto) => (
                    <NumericInput
                      key={produto.key}
                      label={produto.nome}
                      value={pesos[produto.key]}
                      suffix="kg"
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
                    <strong className={`text-right ${diffClass(diferenca)}`}>{brNumber(diferenca)} kg</strong>
                  </div>
                  <ResultLine label="Aproveitamento" value={brPercent(aproveitamento)} />
                  <div className={`rounded-xl border px-4 py-3 text-center text-lg font-bold ${statusClass}`}>
                    {statusPeso}
                  </div>
                </div>
              </Section>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Section title="Custos dos Miúdos">
                <div className="grid gap-3 md:grid-cols-2">
                  <MoneyInput label="Embalagens" value={custos.embalagens} onChange={(value) => updateCusto("embalagens", value)} />
                  <MoneyInput label="Etiquetas" value={custos.etiquetas} onChange={(value) => updateCusto("etiquetas", value)} />
                  <MoneyInput label="Caixas" value={custos.caixas} onChange={(value) => updateCusto("caixas", value)} />
                  <MoneyInput label="Mão de obra" value={custos.maoObra} onChange={(value) => updateCusto("maoObra", value)} />
                  <MoneyInput label="Outros" value={custos.outrosCustos} onChange={(value) => updateCusto("outrosCustos", value)} />
                </div>
              </Section>

              <Section title="Resumo de Custos">
                <div className="space-y-3">
                  <ResultLine label="Custo herdado do abate" value={brMoney(custoHerdado)} />
                  <ResultLine label="Custo/kg bruto" value={brMoney(custoKgBruto)} />
                  <ResultLine label="Custo direto do setor" value={brMoney(custoProprio)} />
                  <div className="rounded-xl bg-emerald-950 p-4 text-white">
                    <div className="text-xs font-semibold uppercase text-emerald-100">
                      Custo total dos miúdos
                    </div>
                    <div className="text-2xl font-semibold">{brMoney(custoTotal)}</div>
                  </div>
                </div>
              </Section>
            </div>

            <Section title="Rendimentos">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[940px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-emerald-950 text-white">
                      <th className="p-3 text-left">Produto</th>
                      <th className="p-3 text-right">Kg produzido</th>
                      <th className="p-3 text-right">% sobre carcaça quente</th>
                      <th className="p-3 text-right">% sobre peso total</th>
                      <th className="p-3 text-right">Kg/cabeça</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosCalculados.map((item) => (
                      <tr key={item.key} className="border-b border-slate-200 bg-white">
                        <td className="p-3 font-semibold text-emerald-950">{item.nome}</td>
                        <td className="p-3 text-right font-semibold">{brNumber(item.peso)} kg</td>
                        <td className="p-3 text-right font-semibold">{brPercent(item.rendimentoCarcacaQuente)}</td>
                        <td className="p-3 text-right font-semibold">{brPercent(item.rendimento)}</td>
                        <td className="p-3 text-right font-semibold">{brNumber(item.kgPorCabeca)} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Precificação Sugerida">
              <div className="mb-4 rounded-xl border border-emerald-950/20 bg-emerald-50 p-3 text-sm font-semibold text-emerald-950">
                O índice mantém o rateio ponderado do custo entre produtos de valores diferentes. A sugestão é estudo interno do PCP; a decisão comercial final fica fora do sistema.
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[1180px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-emerald-950 text-white">
                      <th className="p-3 text-left">Produto</th>
                      <th className="p-3 text-right">Kg</th>
                      <th className="p-3 text-center">Índice</th>
                      <th className="p-3 text-right">Custo distribuído</th>
                      <th className="p-3 text-right">Custo/kg</th>
                      <th className="p-3 text-center">Margem</th>
                      <th className="p-3 text-right">Preço sugerido/kg</th>
                      <th className="p-3 text-right">Receita prevista</th>
                      <th className="p-3 text-right">Lucro previsto</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosCalculados.map((item) => (
                      <tr key={item.key} className="border-b border-slate-200 bg-white align-top">
                        <td className="p-3 font-semibold text-emerald-950">{item.nome}</td>
                        <td className="p-3 text-right font-semibold">{brNumber(item.peso)} kg</td>
                        <td className="p-2 align-top">
                          <div className="mx-auto w-[94px]">
                            <NumericInput
                              label=""
                              compact
                              value={indices[item.key]}
                              onChange={(value) => updateIndice(item.key, value)}
                            />
                            <div className="mt-1 whitespace-nowrap text-center text-[10px] font-semibold text-slate-500">
                              {indexText(indices[item.key])}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold">{brMoney(item.custoDistribuido)}</td>
                        <td className="p-3 text-right font-semibold">{brMoney(item.custoKg)}</td>
                        <td className="p-2 align-top">
                          <div className="mx-auto w-[94px]">
                            <NumericInput
                              label=""
                              compact
                              suffix="%"
                              value={margens[item.key]}
                              onChange={(value) => updateMargem(item.key, value)}
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold text-emerald-800">{brMoney(item.precoSugerido)}</td>
                        <td className="p-3 text-right font-semibold">{brMoney(item.receitaPrevista)}</td>
                        <td className="p-3 text-right font-semibold">{brMoney(item.lucroPrevisto)}</td>
                      </tr>
                    ))}

                    <tr className="bg-emerald-950 text-white">
                      <td className="p-3 font-bold">TOTAL</td>
                      <td className="p-3 text-right font-semibold">{brNumber(pesoInformado)} kg</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-right font-semibold">{brMoney(custoTotal)}</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right font-semibold">{brMoney(receitaPrevista)}</td>
                      <td className="p-3 text-right font-semibold">{brMoney(lucroPrevisto)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Resultado">
              <div className="grid gap-4 md:grid-cols-3">
                <Card label="Receita prevista" value={brMoney(receitaPrevista)} />
                <Card label="Lucro bruto previsto" value={brMoney(lucroPrevisto)} />
                <Card label="Margem prevista" value={brPercent(margemPrevista)} dark />
              </div>
            </Section>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Section title="Observações">
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800"
                  placeholder="Observações do lote de miúdos, rendimento, custos diretos, processamento ou decisão comercial futura..."
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
                    <table className="w-full min-w-[650px] border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-2 text-left">Data</th>
                          <th className="p-2 text-left">Lote</th>
                          <th className="p-2 text-right">Peso</th>
                          <th className="p-2 text-right">Custo</th>
                          <th className="p-2 text-right">Receita</th>
                          <th className="p-2 text-right">Lucro</th>
                        </tr>
                      </thead>

                      <tbody>
                        {historico.map((item, index) => (
                          <tr key={`${item.lote}-${index}`} className="border-b border-slate-200">
                            <td className="p-2 font-bold">{item.data || "-"}</td>
                            <td className="p-2 font-bold">{item.lote || "-"}</td>
                            <td className="p-2 text-right font-bold">{brNumber(item.pesoMiudos)} kg</td>
                            <td className="p-2 text-right font-bold">{brMoney(item.custoTotal)}</td>
                            <td className="p-2 text-right font-bold">{brMoney(item.receitaPrevista)}</td>
                            <td className="p-2 text-right font-bold">{brMoney(item.lucroPrevisto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>

            <footer className="rounded-2xl bg-emerald-950 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-sm">
              FRIGORÍFICO ELDORADO — MÓDULO MIÚDOS — Desenvolvido por Thiago Meneses
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
