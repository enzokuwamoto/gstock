import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Package2, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(email, password, name);
    }
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft overflow-hidden p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-float mb-4 transform -rotate-6">
            <Package2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GStock</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Insumos Logísticos</p>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-xl mb-8">
          <button 
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              isLogin ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button 
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              !isLogin ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setIsLogin(false)}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="exemplo@suzano.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl shadow-float flex justify-center items-center gap-2 transition-all hover:-translate-y-1"
          >
            {isLogin ? 'Entrar no sistema' : 'Criar conta'}
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
