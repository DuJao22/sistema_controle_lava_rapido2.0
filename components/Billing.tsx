
import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Calendar, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { Sale, VehicleSize, PaymentMethod, User } from '../types';
import { WASH_TYPES } from '../constants';
import { dbService } from '../services/dbService';

interface BillingProps {
  sales: Sale[];
  currentUser: User | null;
  onRefresh: () => void;
}

const Billing: React.FC<BillingProps> = ({ sales, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState(WASH_TYPES[0].name);
  const [size, setSize] = useState<VehicleSize>(VehicleSize.P);
  const [payment, setPayment] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [customPrice, setCustomPrice] = useState<string>('');

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const basePrice = WASH_TYPES.find(w => w.name === type)?.basePrice || 40;
    const sizeMultiplier = size === VehicleSize.G ? 1.5 : size === VehicleSize.M ? 1.2 : 1;
    const finalPrice = customPrice ? parseFloat(customPrice) : basePrice * sizeMultiplier;

    const newSale: Sale = {
      id: crypto.randomUUID(),
      type,
      vehicleSize: size,
      paymentMethod: payment,
      value: finalPrice,
      date: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name
    };

    dbService.addSale(newSale);
    setShowModal(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vendas</h2>
          <p className="text-sm text-slate-500">Controle de entradas de caixa</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          NOVO SERVIÇO
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por placa ou serviço..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filtros
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Calendar size={18} />
            Período
          </button>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Porte</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum serviço registrado hoje</td>
                </tr>
              ) : (
                sales.sort((a,b) => b.date - a.date).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{sale.type}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{sale.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        sale.vehicleSize === VehicleSize.G ? 'bg-indigo-100 text-indigo-700' :
                        sale.vehicleSize === VehicleSize.M ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        TAMANHO {sale.vehicleSize.charAt(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {sale.paymentMethod === PaymentMethod.PIX && <Smartphone size={16} className="text-emerald-500" />}
                        {sale.paymentMethod === PaymentMethod.CARD && <CreditCard size={16} className="text-blue-500" />}
                        {sale.paymentMethod === PaymentMethod.CASH && <Wallet size={16} className="text-slate-500" />}
                        {sale.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">R$ {sale.value.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Lançar Novo Serviço</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleAddSale} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Lavagem</label>
                <div className="grid grid-cols-2 gap-2">
                  {WASH_TYPES.map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setType(w.name)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                        type === w.name ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {w.icon}
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Porte</label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value as VehicleSize)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={VehicleSize.P}>Pequeno</option>
                    <option value={VehicleSize.M}>Médio</option>
                    <option value={VehicleSize.G}>Grande</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pagamento</label>
                  <select 
                    value={payment} 
                    onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={PaymentMethod.PIX}>PIX</option>
                    <option value={PaymentMethod.CASH}>Dinheiro</option>
                    <option value={PaymentMethod.CARD}>Cartão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor Personalizado (Opcional)</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                   <input 
                    type="number" 
                    placeholder="0,00" 
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">*Se vazio, usa o preço base do serviço e porte.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
              >
                FINALIZAR E SALVAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
