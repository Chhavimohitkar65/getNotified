import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  Settings,
  LogIn,
  MessageSquare,
  Activity,
  Send,
  User,
  Mail
} from 'lucide-react';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarLink: FC<SidebarLinkProps> = ({ icon, label, href, isActive }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={href}
          className={isActive ? "text-sidebar-accent-foreground bg-sidebar-accent" : ""}
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Send Notification",
    icon: Send,
    href: "/send",
  },
  {
    label: "Templates",
    icon: FileText,
    href: "/templates",
  },
  {
    label: "Notification Logs",
    icon: Bell,
    href: "/logs",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  }
];

const Sidebar = () => {
  return (
    <SidebarContainer>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href}
                      className={({ isActive }) => 
                        isActive ? "text-sidebar-accent-foreground bg-sidebar-accent" : ""
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarLink
                icon={<MessageSquare size={20} />}
                label="Recommendations"
                href="/recommendations"
                isActive={false}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLink
              icon={<Settings size={20} />}
              label="Settings"
              href="/settings"
              isActive={false}
            />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://example.com/docs" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-5 w-5" />
                    <span>Documentation</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://example.com/api" target="_blank" rel="noopener noreferrer">
                    <Activity className="h-5 w-5" />
                    <span>API Reference</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="https://example.com/support" target="_blank" rel="noopener noreferrer">
                    <LogIn className="h-5 w-5" />
                    <span>Support</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;