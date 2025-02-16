import { useState } from "react";

import { NavLink } from "react-router-dom";
import Logo from "@/assets/logo/logo-dha.svg";
export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="absolute z-50 md:max-w-2xl w-full mx-auto flex items-center justify-center left-1/2 -translate-x-1/2 flex text-center z-50 text-center min-h-[160px] ">
        <div className="w-full mx-auto flex items-center justify-between px-6 py-4">
          <NavLink to="/">
            <img src={Logo} alt="logo-dhagrafis" className="w-20 md:hidden" />
          </NavLink>

          <button
            className="md:hidden text-white focus:outline-none text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            menu ☰
          </button>

          <nav
            className={`md:text-white text-black cursor-pointer font-thin tracking-widest absolute md:static md:top-16 top-0 left-0 w-full md:w-auto md:bg-transparent bg-white md:min-h-[160px] min-h-screen transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:flex md:items-center`}
          >
            <div className="mt-18 justify-end text-end px-6 md:hidden block">
              <button onClick={() => setIsOpen(!isOpen)}>✖️</button>
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
                <a href="/" onClick={() => setIsOpen(false)}>
                  <img src={Logo} alt="logo-dhagrafis" className="w-20" />
                </a>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/about"} onClick={() => setIsOpen(false)}>
                  About
                </NavLink>
              </li>
              <li className="hover:opacity-90 transition duration-150 ease-in-out">
                <NavLink to={"/contact"} onClick={() => setIsOpen(false)}>
                  {" "}
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
