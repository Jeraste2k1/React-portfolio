import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/solid";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-white shadow-md fixed w-full z-50 ">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold">React Photography</Link>
        {/* Hamburger Menu Button */}
        <button
          className="block md:hidden text-3xl focus:outline-none"
          onClick={toggleMenu}
        >
          ☰
        </button>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-gray-500">
            Accueil
          </Link>
          <Link to="/about" className="hover:text-gray-500">
            A Propos
          </Link>
          <Link to="/portfolio" className="hover:text-gray-500">
            Portfolio
          </Link>
          <Link to="/contact" className="hover:text-gray-500">
            Contact
          </Link>
          <Link to="/Login" className="hover:text-gray-500">
          <UserIcon className="w-6 h-6 text-black" />
          </Link>
        </nav>
      </div>
      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="bg-white shadow-md md:hidden">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <li>
              <Link
                to="/"
                className="hover:text-gray-500"
                onClick={toggleMenu}
              >
                Accueil
              </Link>
            </li>
            <Link to="/about" className="hover:text-gray-500">
            A Propos
          </Link>
          <Link to="/portfolio" className="hover:text-gray-500" onClick={toggleMenu}>
            Portfolio
          </Link>
          <Link to="/contact" className="hover:text-gray-500" onClick={toggleMenu}>
            Contact
          </Link>
          <Link to="/Login" className="hover:text-gray-500">
          <UserIcon className="w-6 h-6 text-black" />
          </Link>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
