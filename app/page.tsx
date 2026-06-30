"use client";

import { useEffect, useMemo, useState } from "react";
import SummaryCards from "./components/SummaryCards";
import Section from "./components/Section";
import { calculate } from "./utils/calculations";
import { LoteData } from "./types/lote";

const STORAGE_KEY = "frigorifico-eldorado-lotes";

const initialState: LoteData = {
  data: "",
  numeroLote: "",

  quantidadeBois: 0,
  quantidadeVacas: 0,

  carcacaQuenteBoi: 0,
  carcacaQuenteVaca: 0,

  quebraPercentual: 2,
  carcacaFriaReal: 0,

  traseiroBoi: 0,
  traseiroCapoteBoi: 0,
  dianteiroBoi: 0,
  pontaBoi: 0,

  traseiroVaca: 0,
  traseiroCapoteVaca: 0,
  dianteiroVaca: 0,
  pontaVaca: 0,

  miudos: 0,

  valorGado: 0,
  precoArrobaBoi: 0,
  precoArrobaVaca: 0,
  frete: 0,
  custoPorCabecaAdicional: 0,
  folhaAbateMensal: 0,
  diasAbateMes: 0,
  taxas: 0,
  outrosCustos: 0,

  indiceTraseiro: 1.3,
  indiceTraseiroCapoteBoi: 1.3,
  indiceTraseiroCapoteVaca: 1.3,
  indiceDianteiro: 0.9,
  indicePonta: 0.8,
  indiceMiudos: 0.3,

  observacoes: "",
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
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
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
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-800 focus:bg-emerald-50"
      />
    </div>
  );
}

function NumericInput({
  label,
  value,
  onChange,
  decimals = 2,
  integer = false,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  integer?: boolean;
  suffix?: string;
}) {
  const fixedDecimals = integer ? 0 : decimals;
  const [display, setDisplay] = useState(formatBrazilianNumber(value, fixedDecimals));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(formatBrazilianNumber(value, fixedDecimals));
  }, [value, fixedDecimals, focused]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      )}

      <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50">
        <input
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          value={display}
          onFocus={() => {
            setFocused(true);
            setDisplay(editBrazilianNumber(value, fixedDecimals));
          }}
          onChange={(e) => {
            const text = integer ? e.target.value.replace(/\D/g, "") : e.target.value;
            setDisplay(text);
            const parsed = parseBrazilianNumber(text);
            onChange(integer ? Math.trunc(parsed) : parsed);
          }}
          onBlur={() => {
            const parsed = parseBrazilianNumber(display);
            const safe = integer ? Math.trunc(parsed) : parsed;
            onChange(safe);
            setFocused(false);
            setDisplay(formatBrazilianNumber(safe, fixedDecimals));
          }}
          className="w-full min-w-0 bg-transparent px-3 text-right text-sm font-bold text-slate-950 outline-none"
        />
        {suffix && (
          <span className="flex shrink-0 items-center bg-slate-100 px-3 text-xs font-bold text-slate-700">
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
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [display, setDisplay] = useState(formatBrazilianNumber(value, 2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(formatBrazilianNumber(value, 2));
  }, [value, focused]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
          {label}
        </label>
      )}

      <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800 focus-within:bg-emerald-50">
        <span className="flex shrink-0 items-center bg-slate-100 px-3 text-xs font-bold text-slate-700">
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
          onChange={(e) => {
            const text = e.target.value;
            setDisplay(text);
            onChange(parseBrazilianNumber(text));
          }}
          onBlur={() => {
            const parsed = parseBrazilianNumber(display);
            onChange(parsed);
            setFocused(false);
            setDisplay(formatBrazilianNumber(parsed, 2));
          }}
          className="w-full min-w-0 bg-transparent px-3 text-right text-sm font-bold text-slate-950 outline-none"
        />
      </div>
    </div>
  );
}

function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-emerald-950">{value}</div>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <strong className="text-right text-slate-950">{value}</strong>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<LoteData>(initialState);
  const [savedLots, setSavedLots] = useState<LoteData[]>([]);
  const [selectedLot, setSelectedLot] = useState("");

  const calc = useMemo(() => calculate(form), [form]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setSavedLots(parsed);
    } catch {
      setSavedLots([]);
    }
  }, []);

  function update<K extends keyof LoteData>(key: K, value: LoteData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveCurrentLot() {
    const lotName = form.numeroLote.trim() || `Lote ${new Date().toLocaleString("pt-BR")}`;

    const lotToSave = {
      ...form,
      numeroLote: lotName,
      miudos: form.miudos,
      pesoMiudosRecebido: form.miudos,
    };

    const next = [lotToSave, ...savedLots.filter((lot) => lot.numeroLote !== lotName)];
    setSavedLots(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setForm(lotToSave);
    setSelectedLot(lotName);
  }

  function openSelectedLot() {
    const lot = savedLots.find((item) => item.numeroLote === selectedLot);
    if (!lot) return;
    setForm({
      ...initialState,
      ...lot,
      miudos: Number(lot.miudos || 0),
    });
  }

  function deleteSelectedLot() {
    const next = savedLots.filter((item) => item.numeroLote !== selectedLot);
    setSavedLots(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSelectedLot("");
  }

  function processarMiudos() {
    saveCurrentLot();
    window.location.href = "/miudos";
  }

  const produtosForm = [
    { indiceKey: "indiceTraseiro" as const },
    { indiceKey: "indiceTraseiroCapoteBoi" as const },
    { indiceKey: "indiceTraseiroCapoteVaca" as const },
    { indiceKey: "indiceDianteiro" as const },
    { indiceKey: "indicePonta" as const },
    { indiceKey: "indiceMiudos" as const },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl space-y-5 print:max-w-none print:space-y-3">
        <header className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm print:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-950 md:text-3xl">
                FRIGORÍFICO ELDORADO
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Sistema de Rendimentos e Custos
              </p>
            </div>

            <a
              href="/relatorios"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-950/20 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-950 transition hover:border-emerald-950/40 hover:bg-emerald-100"
            >
              Relatórios
            </a>
          </div>
        </header>

        <SummaryCards
          cards={[
            { title: "Cabeças abatidas", value: String(calc.totalCabecas) },
            { title: "Carcaça total", value: `${brNumber(calc.carcacaQuenteTotal)} kg` },
            { title: "Peso médio", value: `${brNumber(calc.pesoMedioGeral)} kg` },
            { title: "Quebra estimada", value: brPercent(form.quebraPercentual) },
          ]}
        />

        <Section title="Dados do Lote">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Data" type="date" value={form.data} onChange={(v) => update("data", v)} />
            <Field label="Número do lote" value={form.numeroLote} onChange={(v) => update("numeroLote", v)} />
          </div>
        </Section>

        <Section title="Abate">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 font-black text-emerald-950">Bois</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <NumericInput label="Quantidade de bois" value={form.quantidadeBois} integer onChange={(v) => update("quantidadeBois", v)} />
                <NumericInput label="Carcaça quente bois (kg)" value={form.carcacaQuenteBoi} onChange={(v) => update("carcacaQuenteBoi", v)} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 font-black text-emerald-950">Vacas</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <NumericInput label="Quantidade de vacas" value={form.quantidadeVacas} integer onChange={(v) => update("quantidadeVacas", v)} />
                <NumericInput label="Carcaça quente vacas (kg)" value={form.carcacaQuenteVaca} onChange={(v) => update("carcacaQuenteVaca", v)} />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <SmallCard label="Total de cabeças" value={String(calc.totalCabecas)} />
            <SmallCard label="Total de carcaças" value={`${brNumber(calc.carcacaQuenteTotal)} kg`} />
            <SmallCard label="Média boi" value={`${brNumber(calc.pesoMedioBoi)} kg`} />
            <SmallCard label="Média vaca" value={`${brNumber(calc.pesoMedioVaca)} kg`} />
            <SmallCard label="Média geral" value={`${brNumber(calc.pesoMedioGeral)} kg`} />
          </div>
        </Section>

        <Section title="Quebra de Frio">
          <div className="grid gap-3 md:grid-cols-3">
            <SmallCard label="Carcaça quente total" value={`${brNumber(calc.carcacaQuenteTotal)} kg`} />
            <NumericInput label="Quebra estimada" value={form.quebraPercentual} suffix="%" onChange={(v) => update("quebraPercentual", v)} />
            <SmallCard label="Carcaça fria estimada" value={`${brNumber(calc.carcacaFriaTotal)} kg`} />
          </div>
        </Section>

        <Section title="Arrobas">
          <div className="grid gap-3 md:grid-cols-7">
            <SmallCard label="Arrobas bois" value={brNumber(calc.arrobasBoi)} />
            <SmallCard label="Arrobas vacas" value={brNumber(calc.arrobasVaca)} />
            <SmallCard label="Arrobas totais" value={brNumber(calc.arrobasTotal)} />
            <SmallCard label="Média @ boi" value={brNumber(calc.mediaArrobaBoi)} />
            <SmallCard label="Média @ vaca" value={brNumber(calc.mediaArrobaVaca)} />
            <SmallCard label="Média @ geral" value={brNumber(calc.mediaArrobaGeral)} />
            <SmallCard label="Custo/@" value={brMoney(calc.custoPorArroba)} />
          </div>
        </Section>

        <Section title="Produção">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-black text-emerald-950">Boi</h3>
              <NumericInput label="Traseiro boi (kg)" value={form.traseiroBoi} onChange={(v) => update("traseiroBoi", v)} />
              <NumericInput label="Traseiro capote de boi (kg)" value={form.traseiroCapoteBoi} onChange={(v) => update("traseiroCapoteBoi", v)} />
              <NumericInput label="Dianteiro boi (kg)" value={form.dianteiroBoi} onChange={(v) => update("dianteiroBoi", v)} />
              <NumericInput label="Ponta de Agulha boi (kg)" value={form.pontaBoi} onChange={(v) => update("pontaBoi", v)} />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-black text-emerald-950">Vaca</h3>
              <NumericInput label="Traseiro vaca (kg)" value={form.traseiroVaca} onChange={(v) => update("traseiroVaca", v)} />
              <NumericInput label="Traseiro capote de vaca (kg)" value={form.traseiroCapoteVaca} onChange={(v) => update("traseiroCapoteVaca", v)} />
              <NumericInput label="Dianteiro vaca (kg)" value={form.dianteiroVaca} onChange={(v) => update("dianteiroVaca", v)} />
              <NumericInput label="Ponta de Agulha vaca (kg)" value={form.pontaVaca} onChange={(v) => update("pontaVaca", v)} />
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-black text-emerald-950">Geral</h3>
              <NumericInput label="Miúdos (kg)" value={form.miudos} onChange={(v) => update("miudos", v)} />
              <ResultLine label="Traseiro total" value={`${brNumber(calc.producaoTraseiro)} kg`} />
              <ResultLine label="Capote de boi" value={`${brNumber(calc.producaoTraseiroCapoteBoi)} kg`} />
              <ResultLine label="Capote de vaca" value={`${brNumber(calc.producaoTraseiroCapoteVaca)} kg`} />
              <ResultLine label="Dianteiro total" value={`${brNumber(calc.producaoDianteiro)} kg`} />
              <ResultLine label="Ponta total" value={`${brNumber(calc.producaoPonta)} kg`} />
              <ResultLine label="Produção total" value={`${brNumber(calc.producaoTotal)} kg`} />
            </div>
          </div>
        </Section>

        <Section title="Rendimentos">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-slate-50 p-4">
              <h3 className="mb-2 font-black text-emerald-950">Boi</h3>
              <ResultLine label="Rend. traseiro" value={brPercent(calc.rendimentoTraseiroBoi)} />
              <ResultLine label="Rend. capote" value={brPercent(calc.rendimentoTraseiroCapoteBoi)} />
              <ResultLine label="Rend. dianteiro" value={brPercent(calc.rendimentoDianteiroBoi)} />
              <ResultLine label="Rend. ponta" value={brPercent(calc.rendimentoPontaBoi)} />
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <h3 className="mb-2 font-black text-emerald-950">Vaca</h3>
              <ResultLine label="Rend. traseiro" value={brPercent(calc.rendimentoTraseiroVaca)} />
              <ResultLine label="Rend. capote" value={brPercent(calc.rendimentoTraseiroCapoteVaca)} />
              <ResultLine label="Rend. dianteiro" value={brPercent(calc.rendimentoDianteiroVaca)} />
              <ResultLine label="Rend. ponta" value={brPercent(calc.rendimentoPontaVaca)} />
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <h3 className="mb-2 font-black text-emerald-950">Geral</h3>
              <ResultLine label="Rend. traseiro" value={brPercent(calc.rendimentoTraseiro)} />
              <ResultLine label="Rend. capote de boi" value={brPercent(calc.rendimentoTraseiroCapoteBoiGeral)} />
              <ResultLine label="Rend. capote de vaca" value={brPercent(calc.rendimentoTraseiroCapoteVacaGeral)} />
              <ResultLine label="Rend. dianteiro" value={brPercent(calc.rendimentoDianteiro)} />
              <ResultLine label="Rend. ponta" value={brPercent(calc.rendimentoPonta)} />
              <ResultLine label="Rend. miúdos" value={brPercent(calc.rendimentoMiudos)} />
              <ResultLine label="Aproveitamento" value={brPercent(calc.aproveitamentoIndustrial)} />
            </div>
          </div>
        </Section>

        <Section title="Médias por Cabeça">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-slate-50 p-4">
              <h3 className="mb-2 font-black text-emerald-950">Boi</h3>
              <ResultLine label="Carcaça média" value={`${brNumber(calc.pesoMedioBoi)} kg`} />
              <ResultLine label="Traseiro médio" value={`${brNumber(calc.traseiroMedioBoi)} kg`} />
              <ResultLine label="Capote médio" value={`${brNumber(calc.traseiroCapoteMedioBoi)} kg`} />
              <ResultLine label="Dianteiro médio" value={`${brNumber(calc.dianteiroMedioBoi)} kg`} />
              <ResultLine label="Ponta média" value={`${brNumber(calc.pontaMedioBoi)} kg`} />
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <h3 className="mb-2 font-black text-emerald-950">Vaca</h3>
              <ResultLine label="Carcaça média" value={`${brNumber(calc.pesoMedioVaca)} kg`} />
              <ResultLine label="Traseiro médio" value={`${brNumber(calc.traseiroMedioVaca)} kg`} />
              <ResultLine label="Capote médio" value={`${brNumber(calc.traseiroCapoteMedioVaca)} kg`} />
              <ResultLine label="Dianteiro médio" value={`${brNumber(calc.dianteiroMedioVaca)} kg`} />
              <ResultLine label="Ponta média" value={`${brNumber(calc.pontaMedioVaca)} kg`} />
            </div>
          </div>
        </Section>

        <Section title="Custos">
          <div className="grid gap-3 md:grid-cols-3">
            <MoneyInput label="Valor total do gado" value={form.valorGado} onChange={(v) => update("valorGado", v)} />
            <MoneyInput label="Preço @ boi" value={form.precoArrobaBoi} onChange={(v) => update("precoArrobaBoi", v)} />
            <MoneyInput label="Preço @ vaca" value={form.precoArrobaVaca} onChange={(v) => update("precoArrobaVaca", v)} />
            <MoneyInput label="Frete" value={form.frete} onChange={(v) => update("frete", v)} />
            <MoneyInput label="Taxas" value={form.taxas} onChange={(v) => update("taxas", v)} />
            <MoneyInput label="Outros custos" value={form.outrosCustos} onChange={(v) => update("outrosCustos", v)} />
            <MoneyInput label="Custo por cabeça" value={form.custoPorCabecaAdicional} onChange={(v) => update("custoPorCabecaAdicional", v)} />
            <MoneyInput label="Folha do abate mensal" value={form.folhaAbateMensal} onChange={(v) => update("folhaAbateMensal", v)} />
            <NumericInput label="Dias de abate no mês" value={form.diasAbateMes} integer onChange={(v) => update("diasAbateMes", v)} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <SmallCard label="Custo do gado" value={brMoney(calc.custoGadoConsiderado)} />
            <SmallCard label="Custo total do lote" value={brMoney(calc.custoTotal)} />
            <SmallCard label="Custo total / cabeça" value={brMoney(calc.custoPorCabeca)} />
            <SmallCard label="Folha / cabeça" value={brMoney(calc.folhaAbatePorCabeca)} />
            <SmallCard label="Custo por arroba" value={brMoney(calc.custoPorArroba)} />
            <SmallCard label="Custo por kg produzido" value={brMoney(calc.custoPorKg)} />
          </div>
        </Section>

        <Section title="Rateio de Custos">
          <div className="mb-4 rounded-xl border border-emerald-950/20 bg-emerald-50 p-3 text-sm font-semibold text-emerald-950">
            Este bloco distribui o custo do lote entre os cortes de carcaça. Valores comerciais ficam fora deste projeto.
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-950 text-white">
                  <th className="p-3 text-left">Produto</th>
                  <th className="p-3 text-right">Kg</th>
                  <th className="p-3 text-center">Índice</th>
                  <th className="p-3 text-right">Custo distribuído</th>
                  <th className="p-3 text-right">Custo/kg</th>
                </tr>
              </thead>

              <tbody>
                {calc.produtosCalculados.map((produto, index) => {
                  const formProduto = produtosForm[index];

                  return (
                    <tr key={produto.nome} className="border-b border-slate-200 bg-white">
                      <td className="p-3 font-black text-emerald-950">{produto.nome}</td>
                      <td className="p-3 text-right font-bold">{brNumber(produto.peso)} kg</td>
                      <td className="p-2">
                        <NumericInput
                          label=""
                          value={form[formProduto.indiceKey]}
                          onChange={(v) => update(formProduto.indiceKey, v)}
                        />
                      </td>
                      <td className="p-3 text-right font-bold">{brMoney(produto.custoDistribuido)}</td>
                      <td className="p-3 text-right font-bold">{brMoney(produto.custoKg)}</td>
                    </tr>
                  );
                })}

                <tr className="bg-emerald-950 text-white">
                  <td className="p-3 font-black">TOTAL</td>
                  <td className="p-3 text-right font-black">{brNumber(calc.producaoTotal)} kg</td>
                  <td className="p-3 text-center">-</td>
                  <td className="p-3 text-right font-black">{brMoney(calc.custoTotal)}</td>
                  <td className="p-3 text-right">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Observações">
          <textarea
            value={form.observacoes}
            onChange={(e) => update("observacoes", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold outline-none focus:border-emerald-800"
            placeholder="Anotações do lote, quebra usada, condição do gado, observações de produção ou custos..."
          />
        </Section>

        <Section title="Ações do Lote">
          <div className="grid gap-3 lg:grid-cols-[1fr_2fr_0.75fr_0.75fr_1fr]">
            <button
              onClick={saveCurrentLot}
              className="rounded-xl bg-emerald-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-900"
            >
              Salvar lote
            </button>

            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-800 focus:bg-emerald-50"
            >
              <option value="">Selecione um lote salvo</option>
              {savedLots.map((lot) => (
                <option key={lot.numeroLote} value={lot.numeroLote}>
                  {lot.numeroLote}
                </option>
              ))}
            </select>

            <button
              onClick={openSelectedLot}
              disabled={!selectedLot}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Abrir
            </button>

            <button
              onClick={deleteSelectedLot}
              disabled={!selectedLot}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Excluir
            </button>

            <button
              onClick={processarMiudos}
              className="rounded-xl border border-emerald-950 bg-white px-4 py-2 text-sm font-black text-emerald-950 transition hover:bg-emerald-50"
            >
              Processar miúdos
            </button>
          </div>
        </Section>
      </div>
    </main>
  );
}
