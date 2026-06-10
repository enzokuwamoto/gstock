import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingCart, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function Orders() {
  const { inventory, orders, createOrder, updateOrderStatus } = useInventory();
  const { userProfile } = useAuth();
  
  const [materialId, setMaterialId] = useState('');
  const [qty, setQty] = useState('');
  const [supplier, setSupplier] = useState('');
  const [justification, setJustification] = useState('');
  const [activeModal, setActiveModal] = useState(null); // { type: 'REPROVE'|'FINALIZE', order: orderObj }

  const criticalItems = inventory.filter(item => Number(item.stock) <= Number(item.min));
  const isBuyer = userProfile?.role === "Comprador Suzano" || userProfile?.role === "Admin Suzano";

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!materialId || !qty || !supplier) return;
    
    await createOrder(materialId, qty, supplier);
    setMaterialId('');
    setQty('');
    setSupplier('');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleFinalize = async (order) => {
    const item = inventory.find(i => i.id === order.materialId);
    if (item && Number(item.stock) <= Number(item.min)) {
      toast.error(`Bloqueio de Governança: O estoque de ${item.name} ainda está crítico (${item.stock}). Cobre a entrada da NF pela operação física antes de finalizar este pedido.`);
      return;
    }
    await updateOrderStatus(order.id, "Finalizado");
    setActiveModal(null);
  };

  const handleReprove = async () => {
    if (!justification.trim()) {
      toast.error("Justificativa é obrigatória para reprovação.");
      return;
    }
    await updateOrderStatus(activeModal.order.id, "Reprovado", justification);
    setJustification('');
    setActiveModal(null);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Finalizado': return <CheckCircle className="text-green-500" size={18} />;
      case 'Reprovado': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">Requisição de compras e acompanhamento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação (Bloqueado se não tiver crítico) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-soft border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary-500" />
            Novo Pedido
          </h2>

          {criticalItems.length === 0 ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-green-800">Nenhum item está com estoque crítico no momento. A criação de pedidos está bloqueada.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 mb-4">
                <AlertTriangle className="text-yellow-600 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-yellow-800">Apenas itens em estado crítico estão disponíveis para compra.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material (Crítico)</label>
                <select 
                  required
                  value={materialId}
                  onChange={e => setMaterialId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  {criticalItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (Atual: {item.stock} / Mín: {item.min})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Solicitada</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor Sugerido</label>
                <input 
                  type="text" 
                  required
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl shadow-float transition-all hover:-translate-y-1"
              >
                Criar Pedido
              </button>
            </form>
          )}
        </div>

        {/* Lista de Pedidos */}
        <div className="lg:col-span-2 space-y-4">
          {orders.map(order => {
            const item = inventory.find(i => i.id === order.materialId);
            return (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {order.orderNumber}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold bg-gray-50 px-2 py-1 rounded-md">
                      {getStatusIcon(order.status)} {order.status}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item?.name || 'Item Desconhecido'}</h3>
                  <p className="text-sm text-gray-500">
                    Qtd: <strong className="text-gray-900">{order.qty}</strong> • Fornecedor: {order.supplier}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Data: {new Date(order.date).toLocaleString()}</p>
                  {order.justification && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg inline-block">Motivo: {order.justification}</p>
                  )}
                </div>

                {isBuyer && order.status !== "Finalizado" && order.status !== "Reprovado" && (
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {order.status === "Criado" && (
                      <button onClick={() => handleStatusUpdate(order.id, "Em andamento")} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                        Iniciar Cot.
                      </button>
                    )}
                    {order.status === "Em andamento" && (
                      <button onClick={() => handleStatusUpdate(order.id, "Aguardando entrega")} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors">
                        Aguard. Entrega
                      </button>
                    )}
                    {order.status === "Aguardando entrega" && (
                      <button onClick={() => handleFinalize(order)} className="px-4 py-2 bg-green-500 text-white shadow-float rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                        Finalizar
                      </button>
                    )}
                    <button onClick={() => setActiveModal({ type: 'REPROVE', order })} className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                      Reprovar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p>Nenhum pedido registrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Reprovação */}
      {activeModal?.type === 'REPROVE' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reprovar Pedido {activeModal.order.orderNumber}</h3>
            <p className="text-sm text-gray-500 mb-4">Por favor, insira o motivo da reprovação deste pedido.</p>
            <textarea 
              value={justification}
              onChange={e => setJustification(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none mb-4 min-h-[100px]"
              placeholder="Justificativa..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleReprove} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
