import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export default function Nav({ links = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink
              to="/"
              className="text-xl font-bold text-amber-600 hover:text-amber-700"
            >
              Loverary
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  px-3 py-2 rounded-md text-sm font-medium
                  ${
                    isActive
                      ? "text-amber-600 border-b-2 border-amber-500"
                      : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                  }
                `}
              >
                {label}
              </NavLink>
            ))}
          </div>
          {/* Cart and Authentication Links */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <NavLink
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-amber-600 rounded-full hover:bg-amber-50"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="w-6 h-6" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="hidden md:block text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-md"
                >
                  {user?.name || 'Profile'}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="hidden md:block text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-md"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="hidden md:block text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md shadow-sm"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-amber-50 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={`mobile-${to}`}
                to={to}
                className={({ isActive }) => `
                  block px-3 py-2 rounded-md text-base font-medium
                  ${
                    isActive
                      ? "bg-amber-50 text-amber-600"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  }
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user?.name || 'Profile'}
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
