import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Building2, Smartphone, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">wellfinds</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                🏠 Home
              </Link>
              <Link
                to="/find-shops"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                🏪 Find Shops
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
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
              <Button asChild variant="outline" size="sm">
                <Link to="/auth/signin">Sign in / Register</Link>
              </Button>
            )}
            
            <div className="relative">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium">
                <Link to="/list-&-get-pos-website">
                  Get Online Shop Website + POS
                </Link>
              </Button>
              <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-2 py-0">
                New
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};