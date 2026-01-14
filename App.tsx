
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { DatabaseState, SyncState, User, UserRole } from './types';
import { dbService } from './services/dbService';
import { CLOUD_POLLING_INTERVAL } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Users from './components/Users';
import Login from './components/Login';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [state, setState] = useState<DatabaseState>(dbService.getLocalState());
  const [isReady, setIsReady] = useState(false);
  const [sync, setSync] = useState<SyncState>({
    lastSync: Date.now(),
    status: 'online',
    cloudKey: 'DEMO-PRO-2024'
  });

  const refreshState = useCallback(() => {
    try {
      setState(dbService.getLocalState());
    } catch (err) {
      console.error("Erro ao atualizar estado local:", err);
    }
  }, []);

  // Check persistent session com tratamento de erro robusto
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('lavarapido_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (err) {
      console.error("Erro ao recuperar sessão:", err);
      localStorage.removeItem('lavarapido_current_user'); // Limpa se estiver corrompido
    } finally {
      setIsReady(true);
    }
  }, []);

  // Background Polling Logic
  useEffect(() => {
    if (!currentUser || !isReady) return;
    
    const poll = async () => {
      try {
        setSync(prev => ({ ...prev, status: 'syncing' }));
        
        const local = dbService.getLocalState();
        const cloud = await dbService.fetchCloudState(sync.cloudKey);
        
        if (cloud) {
          const syncedState = dbService.sync(sync.cloudKey, local, cloud);
          dbService.saveLocalState(syncedState);
          setState(syncedState);
        } else {
          await dbService.pushToCloud(sync.cloudKey, local);
        }
        
        setSync(prev => ({ ...prev, status: 'online', lastSync: Date.now() }));
      } catch (err) {
        console.error("Erro na sincronização:", err);
        setSync(prev => ({ ...prev, status: 'offline' }));
      }
    };

    const interval = setInterval(poll, CLOUD_POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [sync.cloudKey, currentUser, isReady]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('lavarapido_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente sair do sistema?")) {
      setCurrentUser(null);
      localStorage.removeItem('lavarapido_current_user');
      setActiveTab('dashboard');
    }
  };

  if (!isReady) return null;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      sync={sync} 
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard state={state} />}
      {activeTab === 'billing' && <Billing sales={state.sales} currentUser={currentUser} onRefresh={refreshState} />}
      {activeTab === 'users' && <Users state={state} currentUser={currentUser} onRefresh={refreshState} />}
      
      {(activeTab === 'expenses' || activeTab === 'reports') && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
             <RefreshCw size={48} className="opacity-20 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-600 mb-2">Módulo em Construção</h2>
          <p className="text-sm max-w-xs text-center">
            Esta funcionalidade está sendo portada para a arquitetura v2.0 global.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default App;
