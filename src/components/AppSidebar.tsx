import { useState } from "react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Building2,
  Bot,
  Link,
  Users,
  FileCheck,
  UserCheck,
  Sparkles,
  Workflow,
  Zap,
  ExternalLink,
  ShoppingBag,
  DollarSign,
  Coins,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Partner Hub",
    items: [
      { title: "Exchanges", url: "/partner-hub", icon: Building2 },
      { title: "Links", url: "/partner-hub/links", icon: Link },
      { title: "UID Registry", url: "/partner-hub/uids", icon: Users },
      { title: "Approvals", url: "/partner-hub/approvals", icon: FileCheck },
      { title: "Customers", url: "/partner-hub/customers", icon: UserCheck },
    ],
  },
  {
    title: "AI Partner Team",
    items: [
      { title: "AI Assistants", url: "/ai-assistants", icon: Bot },
      { title: "Task Center", url: "/ai-assistants/tasks", icon: Workflow },
      { title: "Pipelines", url: "/ai-assistants/pipelines", icon: Zap },
      { title: "Presets", url: "/ai-assistants/presets", icon: Sparkles },
    ],
  },
  {
    title: "MyLink",
    url: "/lead-generator",
    icon: ExternalLink,
  },
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Earnings",
    url: "/earnings",
    icon: DollarSign,
  },
];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: any[]) => items.some((item) => isActive(item.url));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent/20 text-accent font-medium border-r-2 border-accent" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary-foreground font-bold" />
            </div>
            {open && (
              <div>
                <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  CoinToss
                </h2>
                <p className="text-xs text-muted-foreground">AI Partner Hub</p>
              </div>
            )}
          </div>
        </div>

        {navigationItems.map((item) => (
          <SidebarGroup key={item.title}>
            {item.items ? (
              <>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={subItem.url} className={getNavCls}>
                            <subItem.icon className="h-4 w-4" />
                            {open && <span>{subItem.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}