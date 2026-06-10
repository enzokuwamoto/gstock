import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider, useInventory } from "./contexts/InventoryContext";
import { Toaster } from "react-hot-toast";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Movements from "./pages/Movements";
import Inspection from "./pages/Inspection";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Helper component to seed database if empty
function SeedDatabase({ children }) {
  const { inventory } = useInventory();
  
  useEffect(() => {
    // Seed initial data only if inventory is completely empty and finished loading
    if (inventory && inventory.length === 0) {
      const seedData = async () => {
        const initialItems = [
          { name: "Palete PBR", stock: 100, min: 100 },
          { name: "Palete PL2", stock: 50, min: 50 },
          { name: "Stretch Manual", stock: 150, min: 150 },
          { name: "Stretch Máquina", stock: 150, min: 150 },
          { name: "Lacre", stock: 1000, min: 1000 },
          { name: "Plástico para retrabalho", stock: 50, min: 50 },
          { name: "Madeirite", stock: 200, min: 200 },
          { name: "Palete Descartável", stock: 300, min: 300 },
        ];
        
        try {
          for (const item of initialItems) {
            const docRef = doc(collection(db, "inventory"));
            await setDoc(docRef, item);
          }
          console.log("Database seeded successfully.");
        } catch (e) {
          console.error("Error seeding DB:", e);
        }
      };
      // Timeout just to make sure we aren't jumping the gun on an empty snapshot
      const t = setTimeout(() => seedData(), 3000);
      return () => clearTimeout(t);
    }
  }, [inventory]);

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <SeedDatabase>
          <Router>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: '500'
                },
                success: {
                  style: { background: '#10b981' }
                },
                error: {
                  style: { background: '#ef4444' }
                }
              }} 
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<Layout />}>
                {/* Roles: "Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano" */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/movements" element={
                  <ProtectedRoute allowedRoles={["Colaborador JSL", "Supervisor JSL", "Admin Suzano"]}>
                    <Movements />
                  </ProtectedRoute>
                } />

                <Route path="/inspection" element={
                  <ProtectedRoute allowedRoles={["Supervisor JSL", "Admin Suzano"]}>
                    <Inspection />
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={["Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano"]}>
                    <Orders />
                  </ProtectedRoute>
                } />

                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={["Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano"]}>
                    <Reports />
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={["Admin Suzano"]}>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </SeedDatabase>
      </InventoryProvider>
    </AuthProvider>
  );
}
