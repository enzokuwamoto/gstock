import { useState, useMemo } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";

export default function Reports() {
  const { movements, inventory } = useInventory();
  const [filterMaterial, setFilterMaterial] = useState("ALL");

  const filteredMovements = useMemo(() => {
    if (filterMaterial === "ALL") return movements;
    return movements.filter(m => m.materialId === filterMaterial);
  }, [movements, filterMaterial]);

  const summary = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    filteredMovements.forEach(m => {
      if (m.type === 'ENTRADA') entradas += m.qty;
      if (m.type === 'SAIDA') saidas += m.qty;
    });
    return { entradas, saidas };
  }, [filteredMovements]);

  // Aggregate data by month/year for the chart
  const chartData = useMemo(() => {
    const dataMap = {};
    filteredMovements.forEach(m => {
      const date = new Date(m.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!dataMap[monthYear]) {
        dataMap[monthYear] = { name: monthYear, entradas: 0, saidas: 0 };
      }
      
      if (m.type === 'ENTRADA') dataMap[monthYear].entradas += m.qty;
      if (m.type === 'SAIDA') dataMap[monthYear].saidas += m.qty;
    });

    // Return as array and reverse to chronological order (since movements are newest first)
    return Object.values(dataMap).reverse();
  }, [filteredMovements]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Relatórios e Indicadores</h1>
          <p className="text-sm text-gray-500 mt-1">Análise de consumo e reposição</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Filter size={18} className="text-primary-500" />
          <select 
            value={filterMaterial}
            onChange={e => setFilterMaterial(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          >
            <option value="ALL">Todos os Materiais</option>
            {inventory.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Entradas (Período)</p>
            <p className="text-3xl font-bold text-gray-900">{summary.entradas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Saídas (Período)</p>
            <p className="text-3xl font-bold text-gray-900">{summary.saidas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Análise de Período (Entradas vs Saídas)</h2>
        <div className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum dado para o período/filtro selecionado.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
