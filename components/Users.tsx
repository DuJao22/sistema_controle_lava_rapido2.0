
import React, { useState } from 'react';
import { Plus, UserPlus, Shield, User as UserIcon, Trash2, Key, Search } from 'lucide-react';
import { User, UserRole, DatabaseState } from '../types';
import { dbService, UserWithPassword } from '../services/dbService';

interface UsersProps {
  state: DatabaseState;
  currentUser: User | null;
  onRefresh: () => void;
}

const Users: React.FC<UsersProps> = ({ state, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    const newUser: UserWithPassword = {
      id: crypto.randomUUID(),
      name,
      username,
      password,
      role,
      createdAt: Date.now()
    };

    dbService.addUser(newUser);
    setShowModal(false);
    resetForm();
    onRefresh();
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole(UserRole.STAFF);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      alert("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      dbService.deleteUser(id);
      onRefresh();
    }
  };

  const handleResetPassword = (id: string) => {
    const newPass = prompt("Digite a nova senha para este usuário:");
    if (newPass) {
      dbService.resetUserPassword(id, newPass);
      alert("Senha alterada com sucesso.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Usuários do Sistema</h2>
          <p className="text-sm text-slate-500">Gerencie acessos e permissões da equipe</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          CRIAR USUÁRIO
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usuário</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Username</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nível de Acesso</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cadastro</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-500">
                    @{user.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === UserRole.ADMIN 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role === UserRole.ADMIN ? <Shield size={12} /> : <UserIcon size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Resetar Senha"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Novo Colaborador</h3>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Configurar Acesso</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">&times;</button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Usuário (Login)</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    placeholder="joao123"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Inicial</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nível de Acesso</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.STAFF)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${role === UserRole.STAFF ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Staff (Operador)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.ADMIN)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all ${role === UserRole.ADMIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Admin (Dono)
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                CADASTRAR AGORA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
