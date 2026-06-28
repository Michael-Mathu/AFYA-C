import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Medical Records', href: '/records', icon: FileText },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 items-center gap-2">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">AFYA-C</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                            isActive
                              ? 'bg-green-50 text-green-600'
                              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-gray-50 w-full"
                >
                  <LogOut className="h-6 w-6 shrink-0" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-8 w-8 text-green-600" />
                  <span className="text-xl font-bold text-gray-900">AFYA-C</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 px-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1',
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg h-6 w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}