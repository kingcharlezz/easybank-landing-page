import { useState } from 'react';
import Link from 'next/link'; // import the Link component

const navItems = ['Home', 'FAQ', 'Pricing'];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed z-50 top-0 w-full bg-white">
        <nav className="container flex justify-between items-center z-20">
          <div className="my-5 lg:my-6">
            <img src="images/notescribe.png" alt="notescribe logo" />
          </div>

          <div className="hidden lg:flex text-lg font-bold text-neutral-black ">
            {navItems.map((navItem, index) => (
              <a key={index} className="mx-3 py-5 hover:gradient-border-bottom" href="#">
                {navItem}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex">
            <Link href="../login">
              <button style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', fontSize: '1.25rem', fontWeight: 'normal', color: '#fff', backgroundColor: '#0077ff', cursor: 'pointer', marginRight: '1rem' }}>
                Login
              </button>
            </Link>
            <Link href="../signup">
              <button style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', fontSize: '1.25rem', fontWeight: 'normal', color: '#fff', backgroundColor: '#444', cursor: 'pointer' }}>
                Signup
              </button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden focus:outline-none"
          >
            <img
              className={`${isOpen && 'hidden'}`}
              src="/icons/icon-hamburger.svg"
              alt=""
            />
            <img
              className={isOpen ? 'block' : 'hidden'}
              src="/icons/icon-close.svg"
              alt=""
            />
          </button>
        </nav>
      </div>

      {/* Modal */}
      <div
        className={`fixed inset-0 z-30 bg-gray-800 
      bg-opacity-50 ${isOpen ? 'block' : 'hidden'}`}
      >
        <div className="bg-white text-primary-black flex flex-col text-center mx-5 my-20 py-4 rounded">
          {navItems.map((navItem, index) => (
            <a key={index} className="py-2" href="#">
              {navItem}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
