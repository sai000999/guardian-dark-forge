import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Ticket,
  List,
  TrendingUp,
  Coins,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bot Status", url: "/status", icon: Activity },
  { title: "Blacklist", url: "/blacklist", icon: ShieldAlert },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Mod Logs", url: "/logs", icon: List },
  { title: "Levels", url: "/levels", icon: TrendingUp },
  { title: "Economy", url: "/economy", icon: Coins },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-2xl font-bold">A</span>
        </div>
        {state !== "collapsed" && (
          <div>
            <h2 className="text-xl font-bold text-foreground">Auron</h2>
            <p className="text-xs text-muted-foreground">Bot Dashboard</p>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary/20 text-primary font-medium"
                            : "hover:bg-muted/50 text-muted-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t border-border">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
