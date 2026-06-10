import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { ClipboardCheck, Check, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function Inspection() {
  const { inventory, registerInspectionAdjust } = useInventory();
  const [counts, setCounts] = useState({});
  const [justifications, setJustifications] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCountChange = (id, value) => {
    setCounts(prev => ({ ...prev, [id]: value }));
  };

  const handleJustificationChange = (id, value) => {
    setJustifications(prev => ({ ...prev, [id]: value }));
  };

  const handleFinishTurn = async () => {
    setLoading(true);
    let hasError = false;

    for (const item of inventory) {
      const physical = counts[item.id];
      if (physical !== undefined && physical !== "") {
        const physicalNum = Number(physical);
        if (physicalNum !== Number(item.stock)) {
          if (!justifications[item.id] || justifications[item.id].trim() === "") {
            hasError = true;
            break;
          }
        }
      }
    }

    if (hasError) {
      alert("Por favor, preencha as justificativas para todos os itens com divergência.");
      setLoading(false);
      return;
    }

    for (const item of inventory) {
      const physical = counts[item.id];
      if (physical !== undefined && physical !== "") {
        await registerInspectionAdjust(item.id, Number(item.stock), Number(physical), justifications[item.id]);
      }
    }

    setCounts({});
    setJustifications({});
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vistoria de Turno</h1>
          <p className="text-sm text-gray-500 mt-1">Conferência física vs Sistema</p>
        </div>
        <button 
          onClick={handleFinishTurn}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl shadow-float flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Processando...' : (
            <>
              <Check size={18} />
              Encerrar Turno
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Material</th>
                <th className="p-4 font-medium text-center">Sistema</th>
                <th className="p-4 font-medium text-center">Físico</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium">Justificativa (Se divergente)</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const physical = counts[item.id];
                const hasValue = physical !== undefined && physical !== "";
                const isDiff = hasValue && Number(physical) !== Number(item.stock);

                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold">
                        {item.stock}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <input 
                        type="number" 
                        min="0"
                        value={physical || ''}
                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                        className="w-20 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                        placeholder="-"
                      />
                    </td>
                    <td className="p-4 text-center">
                      {!hasValue ? (
                         <span className="text-gray-400">-</span>
                      ) : isDiff ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm bg-red-50 px-2 py-1 rounded-full">
                          <AlertCircle size={14} /> Divergente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded-full">
                          <Check size={14} /> OK
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isDiff ? (
                        <input 
                          type="text" 
                          required
                          value={justifications[item.id] || ''}
                          onChange={(e) => handleJustificationChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-900 placeholder-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                          placeholder="Motivo da divergência..."
                        />
                      ) : (
                        <span className="text-gray-300 text-sm italic">Não necessária</span>
                      )}
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
