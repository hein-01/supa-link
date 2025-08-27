import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session?.user) {
          // Check if user is an admin
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('Error checking admin profile:', adminError);
            toast({
              title: "Error",
              description: "Database error during authentication.",
              variant: "destructive",
            });
            navigate('/admin/login');
            return;
          }

          if (adminProfile) {
            toast({
              title: "Success",
              description: "Welcome to the admin panel!",
            });
            navigate('/admin/dashboard');
          } else {
            // Try to auto-provision admin for authorized emails
            try {
              const { data: provisionResult } = await supabase.rpc('provision_admin_user', {
                user_email: data.session.user.email
              });

              if ((provisionResult as any)?.success) {
                toast({
                  title: "Success",
                  description: "Admin access granted! Welcome to the admin panel!",
                });
                navigate('/admin/dashboard');
              } else {
                await supabase.auth.signOut();
                toast({
                  title: "Access Denied", 
                  description: (provisionResult as any)?.error || "Admin privileges required.",
                  variant: "destructive",
                });
                navigate('/admin/login');
              }
            } catch (provisionError: any) {
              await supabase.auth.signOut();
              toast({
                title: "Access Denied",
                description: "Admin privileges required.",
                variant: "destructive",
              });
              navigate('/admin/login');
            }
          }
        } else {
          navigate('/admin/login');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/admin/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}