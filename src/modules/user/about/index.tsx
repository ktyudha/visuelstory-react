import Image from "@components/Image";

export default function About() {
  return (
    <>
      <section id="about" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-center z-50 brightness-75"
          name="about"
        />

        <div className="max-w-4xl min-h-[22vh] flex items-center justify-center mx-auto">
          <h2 className="md:text-4xl text-2xl text-center">
            <span className="italic text-[#B9AA96]">Visuelstory </span>
            was born out of our love <br className="hidden md:block" /> for
            capturing beauty in authentic moments.
          </h2>
        </div>
      </section>
    </>
  );
}
