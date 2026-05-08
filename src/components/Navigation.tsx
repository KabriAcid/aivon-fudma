import { Link, useLocation } from "react-router-dom";
import { Phone, Network, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Simulation", path: "/call", icon: Phone },
  { name: "Architecture", path: "/architecture", icon: Network },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:shadow-[0_0_20px_var(--color-accent-glow)] transition-all">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-[2px] bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
              AIVON
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[2px] transition-colors flex items-center gap-2",
                  location.pathname === item.path ? "text-accent" : "text-text-secondary hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          <button className="md:hidden p-2 text-text-secondary">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
