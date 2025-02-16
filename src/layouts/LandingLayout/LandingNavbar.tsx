import { NavLink } from "react-router-dom";
export default function LandingNavbar() {
  return (
    <>
      <div className="absolute z-50 max-w-2xl mx-auto flex items-center justify-center left-1/2 -translate-x-1/2 flex text-center z-50 text-center min-h-[160px] ">
        <nav className={`text-white cursor-pointer`}>
          <ul className="flex gap-x-16">
            <li className="hover:opacity-90 transition duration-150 ease-in-out">
              <NavLink to="/">Home</NavLink>
            </li>
            <li className="hover:opacity-90 transition duration-150 ease-in-out">
              <NavLink to={"/portfolio"}> Portfolio</NavLink>
            </li>
            <li className="hover:opacity-90 transition duration-150 ease-in-out">
              <NavLink to={"/about"}>About</NavLink>
            </li>
            <li className="hover:opacity-90 transition duration-150 ease-in-out">
              <NavLink to={"/contact"}> Contact</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
