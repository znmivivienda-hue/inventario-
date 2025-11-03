import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { supabaseBrowser } from "@/lib/supabase/client"

import { LayoutDashboard, Boxes, PackagePlus, PackageMinus, LogOut, History, AlignJustify, X, Users } from "lucide-react";
import { Button } from "./ui/button";
import type { User } from "@supabase/supabase-js";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventory", icon: Boxes },
  { label: "Entrada", href: "/entry", icon: PackagePlus },
  { label: "Salida", href: "/exit", icon: PackageMinus },
  { label: "Historial", href: "/history", icon: History },
  { label: "Usuarios", href: "/users", icon: Users },
];

export const Logo = () => (
  <div className="flex items-center justify-center w-full">
    <img 
      src="/constructora.jpg" 
      alt="Logo Empresa" 
      className="h-12 max-w-[140px] object-contain"
    />
  </div>
);

export function LuminaSidebar({ 
  isOpen, 
  user, 
  onToggle,
  isDesktopView
}: { 
  isOpen: boolean; 
  user: User | null;
  onToggle: () => void;
  isDesktopView: boolean;
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [supabase] = useState(() => supabaseBrowser())

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
      navigate('/login', { replace: true })
    }
  }

  if (!user) return null;

  return (
    <aside className={cn(
      "sticky top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-800 shadow-md overflow-hidden transition-all duration-300",
      isOpen ? "w-30" : "w-16"
    )}>
      <div className={cn(
        "flex flex-col h-full p-3",
        !isDesktopView && !isOpen && "invisible"
      )}>
        <div className={cn(
          "mb-6 flex items-center border-b border-blue-800 pb-3",
          isOpen ? "justify-between" : "justify-center"
        )}>
          {isOpen && <Logo />}
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-md text-gray-300 hover:bg-blue-800 hover:text-white hover:scale-105 transition-all duration-300 ease-in-out",
              isOpen && "ml-auto"
            )}
            aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <AlignJustify className="w-5 h-5" />
            )}
          </button>
        </div>
        <nav className="flex flex-col space-y-1.5">
          {links.map((link) => {
            const IsActive = location.pathname === link.href
            return (
              <Link
                to={link.href}
                key={link.label}
                onClick={() => {
                  if (!isDesktopView && isOpen) {
                    onToggle();
                  }
                }}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-800 hover:scale-[1.01] group text-white",
                  isOpen ? "gap-2.5 px-3 py-2.5" : "justify-center px-2 py-2.5",
                  IsActive && "bg-blue-700 font-semibold shadow-inner"
                )}
              >
                <link.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  IsActive ? "text-white" : "text-gray-300 group-hover:text-white"
                )} />
                {isOpen && <span className="whitespace-nowrap">{link.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="flex-1" />
        <div className="pt-3 border-t border-blue-800">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all duration-300 ease-in-out hover:scale-[1.01]",
              isOpen ? "gap-2.5 justify-start px-3 py-2.5" : "justify-center px-2 py-2.5"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {isOpen && <span className="whitespace-nowrap">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}