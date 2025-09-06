import { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Link,
  Users,
  FileCheck,
  UserCheck,
  Bot,
  Workflow,
  Zap,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  DollarSign,
  Languages,
} from "lucide-react";

export interface NavItem {
  labelKey: string;
  icon: LucideIcon;
  href: string;
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    labelKey: "dashboard",
    icon: BarChart3,
    href: "/",
  },
  {
    labelKey: "partnerHub",
    icon: Building2,
    href: "/partner-hub",
    children: [
      { labelKey: "exchanges", icon: Building2, href: "/partner-hub" },
      { labelKey: "links", icon: Link, href: "/partner-hub/links" },
      { labelKey: "uidRegistry", icon: Users, href: "/partner-hub/uids" },
      { labelKey: "approvals", icon: FileCheck, href: "/partner-hub/approvals" },
      { labelKey: "customers", icon: UserCheck, href: "/partner-hub/customers" },
    ],
  },
  {
    labelKey: "aiTeam",
    icon: Bot,
    href: "/ai-assistants",
    children: [
      { labelKey: "aiAssistants", icon: Bot, href: "/ai-assistants" },
      { labelKey: "taskCenter", icon: Workflow, href: "/ai-assistants/tasks" },
      { labelKey: "pipelines", icon: Zap, href: "/ai-assistants/pipelines" },
      { labelKey: "presets", icon: Sparkles, href: "/ai-assistants/presets" },
    ],
  },
  {
    labelKey: "myLink",
    icon: ExternalLink,
    href: "/lead-generator",
  },
  {
    labelKey: "marketplace",
    icon: ShoppingBag,
    href: "/marketplace",
  },
  {
    labelKey: "earnings",
    icon: DollarSign,
    href: "/earnings",
  },
  {
    labelKey: "translationManager",
    icon: Languages,
    href: "/translation-manager",
  },
];