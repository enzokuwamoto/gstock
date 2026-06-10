import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, runTransaction } from "firebase/firestore";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const InventoryContext = createContext();

export function useInventory() {
  return useContext(InventoryContext);
}

export function InventoryProvider({ children }) {
  const { userProfile } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar Coleção Inventory
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInventory(data);
    });

    // Escutar Coleção Movements
    const unsubMovements = onSnapshot(collection(db, "movements"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenar por data mais recente
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMovements(data);
    });

    // Escutar Coleção Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(data);
      setLoading(false);
    });

    return () => {
      unsubInventory();
      unsubMovements();
      unsubOrders();
    };
  }, []);

  // Registrar Movimentação (Entrada/Saída)
  const registerMovement = async (type, materialId, qty, nf, obs) => {
    try {
      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, "inventory", materialId);
        const itemSnap = await transaction.get(itemRef);
        
        if (!itemSnap.exists()) {
          throw new Error("Item não encontrado!");
        }

        const currentStock = Number(itemSnap.data().stock);
        const quantity = Number(qty);

        let newStock = currentStock;

        if (type === 'SAIDA') {
          if (currentStock < quantity) {
            throw new Error("Estoque insuficiente para a saída solicitada.");
          }
          newStock -= quantity;
        } else if (type === 'ENTRADA') {
          newStock += quantity;
        }

        // Atualizar estoque
        transaction.update(itemRef, { stock: newStock });

        // Criar registro de movimentação
        const newMovementRef = doc(collection(db, "movements"));
        transaction.set(newMovementRef, {
          date: new Date().toISOString(),
          type,
          materialId,
          qty: quantity,
          user: {
            name: userProfile?.name || "Desconhecido",
            role: userProfile?.role || "Desconhecido"
          },
          nf: nf || "",
          obs: obs || ""
        });
      });
      toast.success(`${type} registrada com sucesso!`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      return false;
    }
  };

  // Ajuste de Vistoria de Turno
  const registerInspectionAdjust = async (materialId, systemStock, physicalStock, justification) => {
    try {
      const difference = physicalStock - systemStock;
      if (difference === 0) return true;

      const type = difference > 0 ? 'ENTRADA' : 'SAIDA';
      const qty = Math.abs(difference);

      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, "inventory", materialId);
        transaction.update(itemRef, { stock: physicalStock });

        const newMovementRef = doc(collection(db, "movements"));
        transaction.set(newMovementRef, {
          date: new Date().toISOString(),
          type,
          materialId,
          qty,
          user: {
            name: userProfile?.name || "Desconhecido",
            role: userProfile?.role || "Desconhecido"
          },
          nf: "AJUSTE-FECHAMENTO",
          obs: justification || "Ajuste de fechamento de turno"
        });
      });
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar ajuste de turno: " + error.message);
      return false;
    }
  };

  // Ajuste Manual do Admin
  const adminAdjustStock = async (materialId, physicalStock) => {
    try {
        const itemData = inventory.find(i => i.id === materialId);
        const systemStock = Number(itemData.stock);
        const difference = Number(physicalStock) - systemStock;
        
        if (difference === 0) return true;
  
        const type = difference > 0 ? 'ENTRADA' : 'SAIDA';
        const qty = Math.abs(difference);
  
        await runTransaction(db, async (transaction) => {
          const itemRef = doc(db, "inventory", materialId);
          transaction.update(itemRef, { stock: Number(physicalStock) });
  
          const newMovementRef = doc(collection(db, "movements"));
          transaction.set(newMovementRef, {
            date: new Date().toISOString(),
            type,
            materialId,
            qty,
            user: {
              name: userProfile?.name || "Admin",
              role: userProfile?.role || "Admin"
            },
            nf: "AJUSTE-ADM",
            obs: "Ajuste manual administrativo"
          });
        });
        toast.success("Estoque ajustado administrativamente.");
        return true;
      } catch (error) {
        console.error(error);
        toast.error("Erro no ajuste de admin: " + error.message);
        return false;
      }
  }

  // Criar Pedido
  const createOrder = async (materialId, qty, supplier) => {
    try {
      await addDoc(collection(db, "orders"), {
        materialId,
        qty: Number(qty),
        supplier,
        orderNumber: `PED-${Date.now().toString().slice(-6)}`,
        status: "Criado",
        justification: "",
        obs: "",
        date: new Date().toISOString()
      });
      toast.success("Pedido criado com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar pedido.");
      return false;
    }
  };

  // Atualizar Status do Pedido
  const updateOrderStatus = async (orderId, newStatus, justification) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        ...(justification && { justification })
      });
      toast.success("Status atualizado!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status.");
      return false;
    }
  };
  
  // Update Minimum Stock (Admin)
  const updateMinStock = async (materialId, newMin) => {
    try {
        const itemRef = doc(db, "inventory", materialId);
        await updateDoc(itemRef, { min: Number(newMin) });
        toast.success("Estoque mínimo atualizado!");
        return true;
    } catch(err) {
        toast.error("Erro ao atualizar estoque mínimo");
        return false;
    }
  }

  const value = {
    inventory,
    movements,
    orders,
    registerMovement,
    registerInspectionAdjust,
    adminAdjustStock,
    createOrder,
    updateOrderStatus,
    updateMinStock
  };

  return (
    <InventoryContext.Provider value={value}>
      {!loading && children}
    </InventoryContext.Provider>
  );
}
