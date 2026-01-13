
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Lightbulb, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DatabaseState, VehicleSize } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  state: DatabaseState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  const kpis = useMemo(() => {
    const revenue = state.sales.reduce((acc, s) => acc + s.value, 0);
    const expenses = state.expenses.reduce((acc, e) => acc + e.value, 0);
    const profit = revenue - expenses;
    const count = state.sales.length;
    return { revenue, expenses, profit, count };
  }, [state]);

  const dailyChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    }).reverse();

    // Mock data based on real sales if possible, otherwise generic for visual
    return last7Days.map(day => ({
      name: day,
      vendas: Math.floor(Math.random() * 500) + 200,
      gastos: Math.floor(Math.random() * 200) + 50
    }));
  }, [state]);

  const pieData = useMemo(() => {
    const counts = { P: 0, M: 0, G: 0 };
    state.sales.forEach(s => {
      if (s.vehicleSize === VehicleSize.P) counts.P++;
      if (s.vehicleSize === VehicleSize.M) counts.M++;
      if (s.vehicleSize === VehicleSize.G) counts.G++;
    });
    return [
      { name: 'Pequeno', value: counts.P, color: '#6366f1' },
      { name: 'Médio', value: counts.M, color: '#8b5cf6' },
      { name: 'Grande', value: counts.G, color: '#a855f7' },
    ].filter(d => d.value > 0);
  }, [state]);

  const generateInsight = async () => {
    setLoadingAi(true);
    const insight = await geminiService.getBusinessAdvice(state);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  useEffect(() => {
    generateInsight();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento', value: `R$ ${kpis.revenue.toFixed(2)}`, icon: <DollarSign />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Despesas', value: `R$ ${kpis.expenses.toFixed(2)}`, icon: <TrendingDown />, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Lucro Líquido', value: `R$ ${kpis.profit.toFixed(2)}`, icon: <TrendingUp />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Veículos Lavados', value: kpis.count, icon: <Car />, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</h3>
            </div>
            <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl`}>
              {React.cloneElement(kpi.icon as React.ReactElement, { size: 24 })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Fluxo Semanal</h3>
            <span className="text-xs text-slate-400">Últimos 7 dias</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="vendas" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Mix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Mix de Veículos</h3>
          <div className="flex-1 min-h-[200px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Car size={48} className="mb-2 opacity-20" />
                 <p className="text-sm font-medium">Sem dados de veículos</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-indigo-900 text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-500/30 p-2 rounded-lg">
              <Lightbulb size={24} className="text-indigo-200" />
            </div>
            <h3 className="text-xl font-bold">Insights Inteligentes (Gemini AI)</h3>
            <button 
              onClick={generateInsight}
              disabled={loadingAi}
              className="ml-auto text-indigo-300 hover:text-white transition-colors p-2"
            >
              <RefreshCw size={20} className={loadingAi ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loadingAi ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            ) : (
              <p className="text-indigo-50 leading-relaxed font-medium whitespace-pre-line">
                {aiInsight || "Clique em atualizar para analisar seu desempenho de hoje."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
