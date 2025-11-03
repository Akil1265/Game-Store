import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  LogOut,
  Settings,
  Package,
  ShoppingBag
} from 'lucide-react';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">GameStore</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search games..."
                className="input pl-11 w-full relative z-0"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/games?q=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/games" className="text-gray-700 hover:text-primary-600 font-medium">
              Browse Games
            </Link>
            
            {/* Cart - Only show for non-admin users */}
            {(!user || user.role !== 'ADMIN') && (
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <User className="h-6 w-6" />
                  <span className="font-medium">{user?.name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {user?.role === 'ADMIN' ? (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/games"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Manage Games
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Manage Orders
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Manage Users
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                      </>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile search */}
            <div className="px-2 pb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search games..."
                  className="input pl-11 w-full relative z-0"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/games?q=${encodeURIComponent(e.target.value.trim())}`);
                      setIsMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/games"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Games
              </Link>
              {(!user || user.role !== 'ADMIN') && (
                <Link
                  to="/cart"
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart ({itemCount})
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' ? (
                    <>
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/games"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Games
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Orders
                      </Link>
                      <Link
                        to="/admin/users"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Manage Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    to="/login"
                    className="block btn btn-outline w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block btn btn-primary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;