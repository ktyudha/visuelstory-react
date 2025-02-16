import Image from "@components/Image";

export default function About() {
  return (
    <>
      <section id="about" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-center z-50"
          name="about"
        />
        <div className="absolute h-[78vh] inset-0 bg-black opacity-30 z-10 pointer-events-none"></div>
      </section>
    </>
  );
}
