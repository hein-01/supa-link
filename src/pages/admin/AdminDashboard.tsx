import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import TwoFactorSetup from "@/components/admin/TwoFactorSetup";
import AdminMetrics from "@/components/admin/AdminMetrics";
import RecentActivity from "@/components/admin/RecentActivity";
import ListingManagement from "@/components/admin/ListingManagement";
import { 
  Shield, 
  Users, 
  Settings, 
  LogOut, 
  Crown, 
  BarChart3,
  FileText,
  Store,
  Home
} from "lucide-react";

export default function AdminDashboard() {
  const { adminProfile, loading, signOut, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'settings'>('overview');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getRoleIcon = () => {
    switch (adminProfile?.admin_role) {
      case 'super_admin':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'moderator':
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getRoleDisplayName = () => {
    switch (adminProfile?.admin_role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Unknown Role';
    }
  };

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'listings', label: 'Listings', icon: Store },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">WellFinds Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon()}
                <span className="text-sm font-medium">{getRoleDisplayName()}</span>
                <Badge variant={adminProfile?.two_factor_enabled ? "default" : "destructive"}>
                  {adminProfile?.two_factor_enabled ? "2FA On" : "2FA Off"}
                </Badge>
              </div>
              <Button variant="outline" onClick={signOut} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === item.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
              <AdminMetrics />
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <RecentActivity />
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Listing Management</h2>
            <ListingManagement />
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getRoleIcon()}
                    <span>Admin Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{getRoleDisplayName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs">{adminProfile?.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Two-Factor Authentication</p>
                    <p className={`font-medium ${adminProfile?.two_factor_enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {adminProfile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <TwoFactorSetup />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}