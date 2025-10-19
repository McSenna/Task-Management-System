import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import LoginModal from "../../auth/LoginModal";
import { Menu, X, User, ChevronDown } from "lucide-react";

const Layout = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LoginModal 
        show={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-gray-50 shadow-md h-16" 
            : "bg-gray-50/95 h-20"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-purple-600 hidden sm:block">Logo</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "text-purple-600 font-semibold transition-colors border-b-2 border-purple-600 pb-1" 
                  : "text-gray-700 font-medium hover:text-purple-600 transition-colors hover:border-b-2 hover:border-purple-400 pb-1"
              }
              end
            >
              Home
            </NavLink>
            
            <NavLink 
              to="/features" 
              className={({ isActive }) => 
                isActive 
                  ? "text-purple-600 font-semibold transition-colors border-b-2 border-purple-600 pb-1" 
                  : "text-gray-700 font-medium hover:text-purple-600 transition-colors hover:border-b-2 hover:border-purple-400 pb-1"
              }
            >
              Features
            </NavLink>
            
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                isActive 
                  ? "text-purple-600 font-semibold transition-colors border-b-2 border-purple-600 pb-1" 
                  : "text-gray-700 font-medium hover:text-purple-600 transition-colors hover:border-b-2 hover:border-purple-400 pb-1"
              }
            >
              About
            </NavLink>

            <div className="relative">
              <button 
                className="flex items-center text-gray-700 font-medium hover:text-purple-600 transition-colors gap-1"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
              >
                Resources
                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link 
                    to="/docs" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Documentation
                  </Link>
                  <Link 
                    to="/blog" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link 
                    to="/support" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Support
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-gray-700 font-medium hover:text-purple-600 px-4 py-2 transition-colors hidden md:block"
              aria-label="Open login modal"
            >
              Log in
            </button>

            <button
              onClick={() => setShowLoginModal(true)}
              className="p-2 text-gray-700 hover:text-purple-600 md:hidden"
              aria-label="User account"
            >
              <User size={24} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-purple-600 md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive 
                    ? "block py-3 text-purple-600 font-semibold border-l-4 border-purple-600 pl-3" 
                    : "block py-3 text-gray-700 font-medium hover:text-purple-600 pl-3"
                }
                onClick={() => setMobileMenuOpen(false)}
                end
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/features" 
                className={({ isActive }) => 
                  isActive 
                    ? "block py-3 text-purple-600 font-semibold border-l-4 border-purple-600 pl-3" 
                    : "block py-3 text-gray-700 font-medium hover:text-purple-600 pl-3"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </NavLink>
              
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  isActive 
                    ? "block py-3 text-purple-600 font-semibold border-l-4 border-purple-600 pl-3" 
                    : "block py-3 text-gray-700 font-medium hover:text-purple-600 pl-3"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </NavLink>

              <div className="py-3 pl-3">
                <div className="font-medium text-gray-700">Resources</div>
                <div className="mt-2 space-y-1 pl-3">
                  <Link 
                    to="/docs" 
                    className="block py-2 text-gray-600 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Documentation
                  </Link>
                  <Link 
                    to="/blog" 
                    className="block py-2 text-gray-600 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link 
                    to="/support" 
                    className="block py-2 text-gray-600 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className={`flex-grow ${scrolled ? "pt-16" : "pt-20"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;