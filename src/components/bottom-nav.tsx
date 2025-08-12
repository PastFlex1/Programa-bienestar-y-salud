
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, BarChart3, User, BookHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    meditation: "Meditación",
    habits: "Hábitos",
    progress: "Progreso",
    profile: "Perfil",
    journal: "Diario",
  },
  en: {
    meditation: "Meditation",
    habits: "Habits",
    progress: "Progress",
    profile: "Profile",
    journal: "Journal",
  },
};

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];

  const navItems = [
    { href: "/dashboard", icon: Home, label: t.meditation },
    { href: "/dashboard/habits", icon: ListTodo, label: t.habits },
    { href: "/dashboard/journal", icon: BookHeart, label: t.journal },
    { href: "/dashboard/progress", icon: BarChart3, label: t.progress },
    { href: "/dashboard/profile", icon: User, label: t.profile },
  ];


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border/80 shadow-t-lg z-20">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
              <span className={cn("text-xs font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
