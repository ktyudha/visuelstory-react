import Image from "@components/Image";
import { NavLink } from "react-router-dom";
import Metadata from "@components/Metadata";

export default function Contact() {
  return (
    <>
      <Metadata title="Contact" />
      <section id="contact" className="relative">
        <Image
          className="h-[78vh] w-full object-cover object-center z-50 brightness-75"
          name="contact"
        />

        <div className="max-w-2xl min-h-[22vh] flex flex-col items-left justify-center mx-auto px-8">
          <h2 className="md:text-4xl text-2xl text-start">
            Hi, we've finally met.
          </h2>
        </div>

        <div className="max-w-2xl px-8 mx-auto">
          <p className=" text-sm text-justify mb-8">
            We're so happy to have you here. If you're interested in our works,
            that means you have a great taste in seeing pictures through
            photography just like us. Please fill in the form and you'll be
            directed to our pricelist. Or, if you have other inquiry, you could
            hit us through WhatsApp from the link below.
            <br /> <br />
            Have a nice day! Hope to see you in your happiest moment.
          </p>

          <NavLink
            to="/investment"
            className="bg-[#B9AA96] hover:bg-[#928763] uppercase py-3 px-9 rounded-lg tracking-wider text-white cursor-pointer md:text-sm text-xs"
          >
            Pricelist
          </NavLink>
        </div>
      </section>
    </>
  );
}
