import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { Building2, Smartphone, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "./AuthModal";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const buttonTexts = [
    "Get Website + POS",
    "Free Business Listing"
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Find Shops */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 relative z-50">
              <Building2 className="h-6 w-6 text-primary border border-gray-300 rounded p-1" />
              <span className="text-xl font-bold text-foreground animate-pulse bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-[glow_2s_ease-in-out_infinite_alternate] drop-shadow-[0_0_10px_theme(colors.primary)]">wellfinds</span>
            </Link>
            
            {/* Find Shops next to logo */}
            <div className="hidden md:flex relative z-50">
              <Link
                to="/find-shops"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                🏪 Find Shops
              </Link>
            </div>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Smartphone className="h-4 w-4" />
              <span>Get App</span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center space-x-1">
                    <span>Dashboard</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" onClick={() => {/* Navigate to wishlists section */}} className="w-full">
                      Wishlists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/list-&-get-pos-website" className="w-full">
                      Get Website + POS
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign in / Register
              </Button>
            )}
            
            <div className="relative">
              <Link to="/list-&-get-pos-website" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium h-10 flex items-center overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-6 w-full"
                  modules={[Autoplay]}
                >
                  {buttonTexts.map((text, index) => (
                    <SwiperSlide key={index} className="h-6 flex items-center">
                      <span className="text-sm font-medium text-center w-full">
                        {text}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>
              <Badge className="absolute -top-2 -right-1 bg-yellow-400 text-black text-xs px-2 py-0">
                $10/month
              </Badge>
            </div>

            {/* Dashboard Sidebar Trigger - Only show on dashboard */}
            {location.pathname === '/dashboard' && (
              <Button 
                onClick={() => {
                  // Find and click the actual sidebar trigger in the dashboard
                  const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
                  if (sidebarTrigger) {
                    (sidebarTrigger as HTMLElement).click();
                  }
                }}
                size="sm"
                variant="ghost"
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile CTA Button - Always Visible */}
            <div className="relative">
              <Link to="/list-&-get-pos-website" className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg font-medium h-9 flex items-center overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-5 w-full"
                  modules={[Autoplay]}
                >
                  {buttonTexts.map((text, index) => (
                    <SwiperSlide key={index} className="h-5 flex items-center">
                      <span className="text-xs font-medium text-center w-full">
                        {text}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>
              <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1 py-0">
                $10
              </Badge>
            </div>
            
            {/* Dashboard Sidebar Trigger for Mobile - Only show on dashboard */}
            {location.pathname === '/dashboard' && (
              <Button 
                onClick={() => {
                  // Find and click the actual sidebar trigger in the dashboard
                  const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
                  if (sidebarTrigger) {
                    (sidebarTrigger as HTMLElement).click();
                  }
                }}
                size="sm"
                variant="ghost"
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </nav>
  );
};