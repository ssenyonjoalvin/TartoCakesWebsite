type Props = {
  title: string;
  description: string;
};

export default function AdminComingSoon({ title, description }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-tarto-ink">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-tarto-ink/70">{description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-tarto-ink/20 bg-white p-8 text-sm text-tarto-ink/60">
        This section will be built next.
      </div>
    </div>
  );
}
