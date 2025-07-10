import { useState } from "react";
import { Users, Settings, Home, FileText, Shield, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Novo Usuário", url: "/users/new", icon: Plus },
  { title: "Logs", url: "/logs", icon: FileText },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath === path;
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`;
    }
    return `${baseClasses} hover:bg-muted/80`;
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Link externo para documentação da API */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getNavClasses("")}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2">API Docs</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div className={`px-4 py-3 ${collapsed ? "px-2" : ""}`}>
              <div className={`flex items-center gap-3 p-2 rounded-lg bg-muted/50 ${collapsed ? "justify-center" : ""}`}>
                <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-full">
                  <Shield className="w-4 h-4 text-accent-foreground" />
                </div>
                {!collapsed && (
                  <div className="flex-1">
                    <p className="text-sm font-medium">vsftpd</p>
                    <p className="text-xs text-muted-foreground">v3.0.5</p>
                  </div>
                )}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}