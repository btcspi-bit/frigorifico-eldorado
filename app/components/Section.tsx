type Props = { title:string; children:React.ReactNode };

export default function Section({ title, children }: Props) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 border-b pb-2 text-lg font-bold text-emerald-950">{title}</h2>
      {children}
    </section>
  );
}
