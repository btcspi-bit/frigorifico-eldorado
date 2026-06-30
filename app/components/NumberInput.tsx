import { useEffect, useState } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  integer?: boolean;
  suffix?: string;
};

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

export default function NumberInput({
  label,
  value,
  onChange,
  decimals = 2,
  integer = false,
  suffix,
}: Props) {
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

      <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-emerald-800">
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
          className="w-full min-w-0 bg-white px-3 py-2 text-right text-sm font-bold text-slate-950 outline-none focus:bg-emerald-50"
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
