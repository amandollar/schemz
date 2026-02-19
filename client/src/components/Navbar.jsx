import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, ChevronDown, Home, FileText, Settings, Bell, MessageCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'organizer') return '/organizer/dashboard';
    return '/user/dashboard';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, mobile = false }) => {
    const active = isActive(to);
    const baseClasses = mobile
      ? "block px-4 py-3 text-sm font-medium transition-colors"
      : "px-4 py-2 text-sm font-medium rounded-md transition-all";
    
    const activeClasses = active
      ? mobile
        ? "bg-accent-50 text-accent-700 border-l-4 border-accent-600"
        : "bg-accent-50 text-accent-700"
      : mobile
        ? "text-gov-700 hover:bg-gov-50 border-l-4 border-transparent"
        : "text-gov-700 hover:bg-gov-50 hover:text-gov-900";

    return (
      <Link
        to={to}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gov-200 sticky top-0 z-50 shadow-sm">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? getDashboardLink() : '/'} className="flex items-center space-x-3 group">
              <div className="relative">
                <Logo size={40} className="text-accent-600 group-hover:text-accent-700 transition-colors" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gov-900 tracking-tight">Schemz</h1>
                <p className="text-xs text-gov-600 -mt-0.5">Scheme Management Portal</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to={getDashboardLink()}>
                <div className="flex items-center space-x-1.5">
                  <Home size={16} />
                  <span>Dashboard</span>
                </div>
              </NavLink>

              {user?.role === 'user' && (
                <>
                  <NavLink to="/user/matched-schemes">My Matches</NavLink>
                  <NavLink to="/user/all-schemes">Browse Schemes</NavLink>
                  <NavLink to="/user/profile">
                    <div className="flex items-center space-x-1.5">
                      <Settings size={16} />
                      <span>Profile</span>
                    </div>
                  </NavLink>
                </>
              )}

              {user?.role === 'organizer' && (
                <>
                  <NavLink to="/organizer/my-schemes">My Schemes</NavLink>
                  <NavLink to="/organizer/support-queries">
                    <div className="flex items-center space-x-1.5">
                      <MessageCircle size={16} />
                      <span>Support</span>
                    </div>
                  </NavLink>
                  <Link
                    to="/organizer/create-scheme"
                    className="ml-2 btn-primary flex items-center space-x-1.5"
                  >
                    <FileText size={16} />
                    <span>Create Scheme</span>
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin/pending-schemes">Pending Schemes</NavLink>
                  <NavLink to="/admin/pending-applications">Applications</NavLink>
                  <NavLink to="/admin/all-schemes">All Schemes</NavLink>
                  <NavLink to="/admin/support-queries">
                    <div className="flex items-center space-x-1.5">
                      <MessageCircle size={16} />
                      <span>Support</span>
                    </div>
                  </NavLink>
                </>
              )}
            </div>
          )}

          {/* User Menu (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center ml-4">
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gov-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center overflow-hidden border-2 border-accent-200">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-accent-600" size={20} />
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-gov-900">{user?.name}</p>
                    <p className="text-xs text-gov-600 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gov-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gov-200 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gov-100">
                      <p className="text-sm font-semibold text-gov-900">{user?.name}</p>
                      <p className="text-xs text-gov-600">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded capitalize">
                        {user?.role}
                      </span>
                    </div>
                    
                    {user?.role === 'user' && (
                      <Link
                        to="/user/profile"
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gov-700 hover:bg-gov-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Profile Settings</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gov-700 hover:bg-gov-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gov-200 shadow-lg">
          <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-3 bg-gov-50 border-b border-gov-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center overflow-hidden border-2 border-accent-200">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-accent-600" size={24} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gov-900">{user?.name}</p>
                  <p className="text-xs text-gov-600 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-2">
              <NavLink to={getDashboardLink()} mobile>Dashboard</NavLink>

              {user?.role === 'user' && (
                <>
                  <NavLink to="/user/matched-schemes" mobile>My Matches</NavLink>
                  <NavLink to="/user/all-schemes" mobile>Browse Schemes</NavLink>
                  <NavLink to="/user/profile" mobile>Profile</NavLink>
                </>
              )}

              {user?.role === 'organizer' && (
                <>
                  <NavLink to="/organizer/my-schemes" mobile>My Schemes</NavLink>
                  <NavLink to="/organizer/support-queries" mobile>Support</NavLink>
                  <NavLink to="/organizer/create-scheme" mobile>Create Scheme</NavLink>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin/pending-schemes" mobile>Pending Schemes</NavLink>
                  <NavLink to="/admin/pending-applications" mobile>Applications</NavLink>
                  <NavLink to="/admin/all-schemes" mobile>All Schemes</NavLink>
                  <NavLink to="/admin/support-queries" mobile>Support</NavLink>
                </>
              )}
            </div>

            {/* Logout */}
            <div className="pt-2 mt-2 border-t border-gov-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
