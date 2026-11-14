import { eyebrow } from "../../../shared/ui";

export default function IntroSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-36">
      <p className={eyebrow}>Visuelstory</p>
      <p className="mt-8 text-2xl font-light leading-relaxed md:text-4xl md:leading-[1.5]">
        Kami mengabadikan momen yang jujur: apa adanya, tanpa dibuat-buat.
      </p>
      <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.3em] text-neutral-400">
        {["Wedding", "Couple Session", "Event", "Videografi"].map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}
