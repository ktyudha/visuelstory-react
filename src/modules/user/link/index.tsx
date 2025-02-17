import { useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

import Image from "@components/Image";
import Logo from "@/assets/logo/logo-circle.svg";

export default function Link() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  const dummyLink = [
    {
      url: "whatsapp://send?phone=6285848250548&text=Halo Visuelstory, Saya ingin booking.",
      label: "WhatsApp [Yudha]",
    },
    {
      url: "https://dev-dhagrafis.web.app/contact",
      label: "Pricelist",
    },
    {
      url: "https://dev-dhagrafis.web.app/",
      label: "Website",
    },
    {
      url: "https://m.instagram.com/visuelstory/",
      label: "Instagram",
    },
    {
      url: "https://www.tiktok.com/@yudhxnolife/",
      label: "Tiktok",
    },
  ];
  return (
    <>
      <section id="links" className="relative flex flex-col items-center pb-14">
        <Image
          className="md:h-[44vh] h-[18vh] w-full object-cover object-center z-10 brightness-75"
          name="links"
        />

        <div className="text-center flex flex-col items-center mb-8">
          <img
            src={Logo}
            alt="logo-visuel-storyteller"
            className="border-3 rounded-full border-white w-40 h-40 mx-auto z-50 -mt-20 mb-6 cursor-pointer"
            onClick={() => navigate("/")}
          />

          <h3 className="text-2xl text-gray-600 tracking-wide mb-2.5">
            Visuelstory
          </h3>
          <p className="text-md text-gray-500">Photography & Videography</p>
        </div>

        <ul className="md:w-xl w-full px-6 text-center text-white flex flex-col gap-4">
          {dummyLink.map((_link, idx) => (
            <li
              key={idx}
              className="bg-[#B9AA96] uppercase py-3 rounded-lg tracking-wider"
            >
              <NavLink to={_link.url} target="_blank">
                {_link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
