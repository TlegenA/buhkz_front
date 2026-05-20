import { BrowserRouter, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { CalendarDays, Calculator, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import Calendar from "@/pages/Calendar";
import CalculatorPage from "@/pages/Calculator";
import Rates from "@/pages/Rates";

const NAV_ITEMS = [
  { to: "/calendar",    label: "Календарь",    icon: CalendarDays },
  { to: "/calculator",  label: "Калькулятор",  icon: Calculator   },
  { to: "/rates",       label: "Ставки",       icon: BookOpen     },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Шапка */}
        <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>BuhKZ</span>
              <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
                — сервис для бухгалтеров Казахстана
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
          </div>
        </header>

        {/* Контент */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/rates" element={<Rates />} />
          </Routes>
        </main>

        {/* Футер */}
        <footer className="border-t mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
            Данные актуальны на 2025 год. Источник: kgd.gov.kz
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
