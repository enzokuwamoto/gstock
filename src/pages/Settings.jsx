import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Settings2, ShieldAlert, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { inventory, updateMinStock, adminAdjustStock } = useInventory();
  
  // Local state for editing values
  const [minStocks, setMinStocks] = useState({});
  const [currentStocks, setCurrentStocks] = useState({});

  const handleMinStockChange = (id, value) => {
    setMinStocks(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrentStockChange = (id, value) => {
    setCurrentStocks(prev => ({ ...prev, [id]: value }));
  };

  const saveMinStock = async (id) => {
    if (minStocks[id] !== undefined) {
      await updateMinStock(id, minStocks[id]);
      // Remove from local state to reflect the prop value
      setMinStocks(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const saveCurrentStock = async (id) => {
    if (currentStocks[id] !== undefined) {
      const confirmAction = window.confirm("ATENÇÃO: Você está prestes a alterar o estoque atual manualmente. Esta ação gerará um registro de auditoria (AJUSTE-ADM). Deseja continuar?");
      if (confirmAction) {
        await adminAdjustStock(id, currentStocks[id]);
        setCurrentStocks(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings2 className="text-primary-500" /> Configurações e Governança
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gestão de Parâmetros e Auditoria Administrativa</p>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
          <ShieldAlert className="text-red-600 mt-0.5 shrink-0" size={20} />
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            Área restrita de governança. As alterações de "Estoque Atual" feitas nesta tela ignoram validações de saída e geram movimentações forçadas de AJUSTE-ADM para garantir a integridade dos relatórios.
          </p>
        </div>
        
        <div className="overflow-x-auto p-4 md:p-6">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium rounded-tl-xl">Material</th>
                <th className="p-4 font-medium text-center">Estoque Mínimo</th>
                <th className="p-4 font-medium text-center rounded-tr-xl">Estoque Atual (Forçado)</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isMinDirty = minStocks[item.id] !== undefined && minStocks[item.id] !== String(item.min);
                const isCurrentDirty = currentStocks[item.id] !== undefined && currentStocks[item.id] !== String(item.stock);

                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                    
                    {/* Minimum Stock Cell */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          value={minStocks[item.id] ?? item.min}
                          onChange={(e) => handleMinStockChange(item.id, e.target.value)}
                          className="w-24 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        {isMinDirty && (
                          <button 
                            onClick={() => saveMinStock(item.id)}
                            className="p-2 bg-primary-100 text-primary-700 hover:bg-primary-600 hover:text-white rounded-lg transition-colors"
                            title="Salvar Mínimo"
                          >
                            <Save size={16} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Current Stock Cell */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          value={currentStocks[item.id] ?? item.stock}
                          onChange={(e) => handleCurrentStockChange(item.id, e.target.value)}
                          className="w-24 text-center px-3 py-2 bg-white border border-red-200 focus:border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-red-900 font-bold"
                        />
                        {isCurrentDirty && (
                          <button 
                            onClick={() => saveCurrentStock(item.id)}
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm"
                            title="Forçar Ajuste"
                          >
                            <Save size={16} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
