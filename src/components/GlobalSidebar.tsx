import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Mail, 
  Heart, 
  Building2, 
  Plus, 
  Globe,
  Home,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Saved Listings", icon: Heart, path: "/dashboard?section=wishlists" },
  { title: "List Your Business", icon: Plus, path: "/list-business" },
  { title: "Get Website + POS", icon: Globe, path: "/list-&-get-pos-website" },
  { title: "My Listings", icon: Building2, path: "/dashboard?section=listings" },
  { title: "Profile Info", icon: User, path: "/dashboard?section=profile" },
  { title: "Email Settings", icon: Mail, path: "/dashboard?section=email" },
];

export function GlobalSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {!isCollapsed && <span>Sign Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}