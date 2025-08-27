import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessDetail from "./pages/BusinessDetail";
import BusinessDirectory from "./pages/BusinessDirectory";
import FindShops from "./pages/FindShops";
import ListBusiness from "./pages/ListBusiness";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCallback from "./pages/admin/AdminCallback";
import ListAndGetPOS from "./pages/ListAndGetPOS";
import UserDashboard from "./pages/UserDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/businesses" element={<BusinessDirectory />} />
          <Route path="/find-shops" element={<FindShops />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/list-business" element={<ListBusiness />} />
          <Route path="/auth/signin" element={<Auth />} />
          <Route path="/auth/signup" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/callback" element={<AdminCallback />} />
          <Route path="/list-&-get-pos-website" element={<ListAndGetPOS />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
