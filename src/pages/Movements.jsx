import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { useAuth } from "../contexts/AuthContext";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { cn } from "../lib/utils";

export default function Movements() {
  const { inventory, movements, registerMovement } = useInventory();
  const { userProfile } = useAuth();
  const [type, setType] = useState('SAIDA');
  const [materialId, setMaterialId] = useState('');
  const [qty, setQty] = useState('');
  const [nf, setNf] = useState('');
  const [obs, setObs] = useState('');

  // Supervisor and Admin can do ENTRADA, others only SAIDA
  const canEntry = ["Supervisor JSL", "Admin Suzano"].includes(userProfile?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId || !qty) return;

    const success = await registerMovement(type, materialId, qty, nf, obs);
    if (success) {
      setMaterialId('');
      setQty('');
      setNf('');
      setObs('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Movimentações</h1>
        <p className="text-sm text-gray-500 mt-1">Registre entradas e saídas de materiais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Nova Movimentação</h2>
          
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
            <button 
              className={cn(
                "flex-1 py-2 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all",
                type === 'SAIDA' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setType('SAIDA')}
            >
              <ArrowDownLeft size={16} /> Saída
            </button>
            {canEntry && (
              <button 
                className={cn(
                  "flex-1 py-2 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all",
                  type === 'ENTRADA' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setType('ENTRADA')}
              >
                <ArrowUpRight size={16} /> Entrada
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select 
                required
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Selecione...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (Disp: {item.stock})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input 
                type="number" 
                min="1"
                required
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="0"
              />
            </div>

            {type === 'ENTRADA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota Fiscal</label>
                <input 
                  type="text" 
                  required
                  value={nf}
                  onChange={e => setNf(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Número da NF"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea 
                value={obs}
                onChange={e => setObs(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px]"
                placeholder="Opcional..."
              />
            </div>

            <button 
              type="submit" 
              className={cn(
                "w-full mt-4 font-semibold py-4 rounded-xl shadow-float transition-all hover:-translate-y-1 text-white",
                type === 'ENTRADA' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              Registrar {type === 'ENTRADA' ? 'Entrada' : 'Saída'}
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900">Histórico Recente</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {movements.map(mov => {
              const item = inventory.find(i => i.id === mov.materialId);
              const isEntry = mov.type === 'ENTRADA';
              return (
                <div key={mov.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isEntry ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {isEntry ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item?.name || 'Item Desconhecido'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(mov.date).toLocaleString()} • {mov.user.name}
                      </p>
                      {mov.nf && <p className="text-xs text-primary-600 font-medium mt-0.5">NF: {mov.nf}</p>}
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold text-lg",
                    isEntry ? "text-green-600" : "text-red-600"
                  )}>
                    {isEntry ? '+' : '-'}{mov.qty}
                  </div>
                </div>
              );
            })}
            
            {movements.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <History size={48} className="mb-4 opacity-50" />
                <p>Nenhuma movimentação registrada.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
