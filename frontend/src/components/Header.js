import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthData } from '../auth/AuthWrapper';
import Avatar from '../assets/avatar.jpg';

const Header = ({ scrollToSection, refs }) => {

  const [isVisible, setIsVisible] = useState(false);
  const { user } = AuthData();
  const { logout } = AuthData();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className='z-50'>
      <div
        className={`w-full border-b ${
          isVisible ? 'fixed top-0 left-0 bg-white shadow-md opacity-100' : 'fixed top-0 left-0 bg-white shadow-md opacity-0 pointer-events-none'
        } transition-opacity duration-300`}
      >
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <nav className="relative flex items-center justify-between h-16 lg:h-20">
          <div className="hidden lg:flex lg:items-center lg:space-x-10">
              <a onClick={() => scrollToSection(refs.top)} className="cursor-pointer font-medium text-black">
                Home
              </a>
              <a onClick={() => scrollToSection(refs.howItWorks)} className="cursor-pointer font-medium text-black">
                How it works
              </a>
              <a onClick={() => scrollToSection(refs.about)} className="cursor-pointer font-medium text-black">
                About
              </a>
              
            </div>

                <div class="lg:absolute lg:-translate-x-1/2 lg:inset-y-5 lg:left-1/2">
                    <div class="flex-shrink-0">
                        <h1 className="text-4xl pb-4 font-bold text-gray-800 tracking-widest lg:text-2xl">apartament valuation</h1>
                    </div>
                </div>
            

            <div className="flex lg:items-center pr-32">

              {user.isAuthenticated ? (
                <>

                  <Link to="/account"><img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full mr-8 border" />
                    <p className="text-black">{user.username}</p>
                  </Link>
                  <button onClick={logout} class="relative h-12 w-24 rounded-full overflow-hidden border border-black text-black shadow-2xl transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-sm before:bg-black before:duration-300 before:ease-out hover:text-white hover:shadow-indigo-600 hover:before:h-40 hover:before:w-40 hover:before:opacity-80">
                    <span class="relative z-10">Log out</span>
                  </button>
                </>
              ) : (
                <button class="relative h-12 w-24 rounded-full overflow-hidden border border-black text-black shadow-2xl transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-sm before:bg-black before:duration-300 before:ease-out hover:text-white hover:shadow-indigo-600 hover:before:h-40 hover:before:w-40 hover:before:opacity-80">
                  <Link to="/login"><span class="relative z-10">Sign in</span></Link>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
