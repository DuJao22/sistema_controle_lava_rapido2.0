
import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Users, 
  LogOut,
  Car,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { SyncState, User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sync: SyncState;
  currentUser: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  sync, 
  currentUser,
  onLogout 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'billing', label: 'Vendas', icon: <Receipt size={20} />, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'expenses', label: 'Despesas', icon: <Wallet size={20} />, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} />, roles: [UserRole.ADMIN] },
    { id: 'users', label: 'Usuários', icon: <Users size={20} />, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Car size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Lava Rápido</h1>
            <p className="text-xs text-slate-400">Pro v2.0</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.filter(item => !currentUser || item.roles.includes(currentUser.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-indigo-400">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{currentUser?.role}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              SAIR DO SISTEMA
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
               <Car size={20} />
             </div>
             <h1 className="font-bold">Lava Rápido Pro</h1>
          </div>
          
          <div className="flex-1 md:flex items-center justify-end">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50">
                {sync.status === 'online' && <Wifi size={14} className="text-emerald-500" />}
                {sync.status === 'syncing' && <RefreshCw size={14} className="text-amber-500 animate-spin" />}
                {sync.status === 'offline' && <WifiOff size={14} className="text-red-500" />}
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                  {sync.status === 'syncing' ? 'Sincronizando...' : sync.status}
                </span>
              </div>
              
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Key</p>
                <p className="text-xs font-mono text-slate-600">{sync.cloudKey}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          {children}
        </div>
        
        {/* Mobile Nav */}
        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2">
           {menuItems.slice(0, 4).filter(item => !currentUser || item.roles.includes(currentUser.role)).map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                 activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
               }`}
             >
               {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
               <span className="text-[10px] font-bold mt-1">{item.label}</span>
             </button>
           ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
