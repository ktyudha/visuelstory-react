import { useState } from "react";

import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import Logo from "@/assets/logo/logo-mark.png";
export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="absolute z-50 md:max-w-2xl w-full mx-auto flex items-center justify-center left-1/2 -translate-x-1/2 flex text-center z-50 text-center min-h-[160px] ">
        <div className="w-full mx-auto flex items-center justify-between px-6 py-4">
          <NavLink to="/">
            <img src={Logo} alt="Visuelstory" className="w-16 md:hidden" />
          </NavLink>

          <button
            className="md:hidden text-white focus:outline-none text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Buka menu</span>☰
          </button>

          <nav
            className={`md:text-white text-black cursor-pointer font-thin tracking-widest absolute md:static md:top-16 top-0 left-0 w-full md:w-auto md:bg-transparent bg-white md:min-h-[160px] min-h-screen transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:flex md:items-center`}
          >
            <div className="mt-18 justify-end text-end px-6 md:hidden block">
              <button onClick={() => setIsOpen(!isOpen)} aria-label="Tutup menu" className="text-3xl leading-none">×</button>
            </div>

            <ul className="flex md:flex-row flex-col md:text-xl text-4xl my-auto md:items-center text-left md:gap-14 gap-8 md:py-0 md:px-0 pt-2 px-8">
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to="/" onClick={() => setIsOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/portfolio"} onClick={() => setIsOpen(false)}>
                  Portfolio
                </NavLink>
              </li>
              <li className="hidden md:block">
                <NavLink to="/" onClick={() => setIsOpen(false)}>
                  <img src={Logo} alt="Visuelstory" className="w-16" />
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/about"} onClick={() => setIsOpen(false)}>
                  About
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/contact"} onClick={() => setIsOpen(false)}>
                  Contact
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/booking"} onClick={() => setIsOpen(false)}>
                  Booking
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={Cookies.get("token-customer") ? "/account" : "/login"} onClick={() => setIsOpen(false)}>
                  {Cookies.get("token-customer") ? "Akun" : "Masuk"}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
