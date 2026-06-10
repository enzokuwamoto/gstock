import { useInventory } from "../contexts/InventoryContext";
import { PackageOpen, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const { inventory } = useInventory();

  const getStatus = (stock, min) => {
    if (stock <= min) return 'critical';
    if (stock <= min * 1.2) return 'warning';
    return 'normal';
  };

  const statusConfig = {
    critical: {
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      label: 'Crítico',
      icon: TrendingDown
    },
    warning: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500',
      label: 'Atenção',
      icon: AlertTriangle
    },
    normal: {
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
      label: 'Normal',
      icon: CheckCircle2
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do estoque em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventory.map((item) => {
          const status = getStatus(item.stock, item.min);
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div 
              key={item.id} 
              className={cn(
                "p-5 rounded-3xl border transition-all hover:shadow-soft",
                config.color
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <PackageOpen size={20} className={config.iconColor} />
                </div>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-white", config.textColor)}>
                  {config.label}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{item.stock}</span>
                  <span className="text-sm text-gray-500 font-medium">/ min {item.min}</span>
                </div>
              </div>
              
              {/* Progress Bar indicator */}
              <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", `bg-${config.iconColor.split('-')[1]}-500`)}
                  style={{ width: `${Math.min((item.stock / (item.min * 2)) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
