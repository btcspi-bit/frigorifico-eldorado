type Props = { cards:{title:string;value:string}[] };

export default function SummaryCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {cards.map(card => (
        <div key={card.title} className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">{card.title}</div>
          <div className="mt-2 text-xl font-black text-emerald-950">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
