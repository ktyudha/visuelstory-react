import Image from "@components/Image";

export default function Portfolio() {
  return (
    <>
      <section id="portfolio" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-bottom z-50"
          name="portfolio"
        />
        <div className="absolute h-[78vh] inset-0 bg-black opacity-30 z-10 pointer-events-none"></div>
      </section>
    </>
  );
}
