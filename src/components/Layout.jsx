import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  ClipboardCheck, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut,
  UserCircle
} from "lucide-react";
import { cn } from "../lib/utils";

export function Layout() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano"] },
    { to: "/movements", icon: ArrowRightLeft, label: "Movimentações", roles: ["Colaborador JSL", "Supervisor JSL", "Admin Suzano"] },
    { to: "/inspection", icon: ClipboardCheck, label: "Vistoria", roles: ["Supervisor JSL", "Admin Suzano"] },
    { to: "/orders", icon: ShoppingCart, label: "Pedidos", roles: ["Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano"] },
    { to: "/reports", icon: BarChart3, label: "Relatórios", roles: ["Colaborador JSL", "Supervisor JSL", "Comprador Suzano", "Admin Suzano"] },
    { to: "/settings", icon: Settings, label: "Configurações", roles: ["Admin Suzano"] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(userProfile?.role));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 md:pl-64 flex flex-col font-sans">
      
      {/* Topbar for Mobile */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white shadow-sm rounded-b-3xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Bem-vindo,</p>
            <p className="text-sm font-bold text-gray-900">{userProfile?.name || "Usuário"}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-float">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">GStock</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-primary-500 text-white shadow-float" 
                  : "text-gray-500 hover:bg-primary-50 hover:text-primary-600"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-primary-50 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 mb-3 shadow-sm">
              <UserCircle size={28} />
            </div>
            <p className="text-sm font-bold text-gray-900">{userProfile?.name}</p>
            <p className="text-xs text-primary-600 font-medium mt-1">{userProfile?.role}</p>
            <button 
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white text-gray-700 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-full px-6 py-4 flex items-center gap-6 z-50 border border-white/50">
        {allowedNavItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 relative",
              isActive 
                ? "text-white bg-primary-500 shadow-float transform -translate-y-2 scale-110" 
                : "text-gray-400 hover:text-primary-500"
            )}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </NavLink>
        ))}
        {/* If more than 4 items, show a menu or settings icon */}
        {allowedNavItems.length > 4 && (
           <NavLink
           to="/more-menu" // Mock link or handle dynamically
           className={({ isActive }) => cn(
             "flex flex-col items-center justify-center gap-1 p-2 rounded-full transition-all duration-300 relative",
             isActive 
               ? "text-white bg-primary-500 shadow-float transform -translate-y-2 scale-110" 
               : "text-gray-400 hover:text-primary-500"
           )}
         >
           <Settings size={22} />
         </NavLink>
        )}
      </nav>
    </div>
  );
}
