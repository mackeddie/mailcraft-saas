import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { Menu, X, LogOut, Settings, BarChart3, Mail, Users, Zap, BookOpen } from "lucide-react";
import { useState } from "react";

interface MailCraftDashboardLayoutProps {
  children: React.ReactNode;
}

export function MailCraftDashboardLayout({ children }: MailCraftDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { label: "Campaigns", icon: Mail, path: "/campaigns" },
    { label: "Email Builder", icon: Mail, path: "/email-builder" },
    { label: "Subscribers", icon: Users, path: "/subscribers" },
    { label: "Segments", icon: Zap, path: "/segments" },
    { label: "Templates", icon: BookOpen, path: "/templates" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              ✉️
            </div>
            {sidebarOpen && <span className="font-bold text-lg">MailCraft</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-sidebar-accent rounded transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="font-medium truncate">{user?.name || "User"}</p>
              <p className="text-sidebar-foreground/60 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut size={18} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">MailCraft</h1>
          <div className="text-sm text-muted-foreground">
            Welcome back, {user?.name || "User"}!
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
