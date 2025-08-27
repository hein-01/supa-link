import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, Key, QrCode } from "lucide-react";

export default function TwoFactorSetup() {
  const { adminProfile, updateAdminProfile } = useAdminAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  useEffect(() => {
    if (step === 'setup' && !adminProfile?.two_factor_enabled) {
      generateSecret();
    }
  }, [step, adminProfile]);

  const generateSecret = async () => {
    try {
      setLoading(true);
      
      // Generate secret using speakeasy
      const speakeasy = await import('speakeasy');
      const secret = speakeasy.generateSecret({
        name: `WellFinds Admin (${adminProfile?.user_id})`,
        issuer: 'WellFinds',
        length: 32
      });

      setSecret(secret.base32);

      // Generate QR code
      const qrcode = await import('qrcode');
      const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      setQrCodeUrl(qrCodeDataUrl);
      
      setStep('verify');
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate 2FA secret",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Verify the token
      const speakeasy = await import('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: verificationCode,
        window: 2
      });

      if (!verified) {
        throw new Error("Invalid verification code");
      }

      // Save the secret and enable 2FA
      await updateAdminProfile({
        two_factor_enabled: true,
        two_factor_secret: secret
      });

      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled successfully!",
      });

      setStep('setup');
      setVerificationCode("");
      setQrCodeUrl("");
      setSecret("");
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      
      await updateAdminProfile({
        two_factor_enabled: false,
        two_factor_secret: null
      });

      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (adminProfile?.two_factor_enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Two-Factor Authentication Enabled</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your account is protected with two-factor authentication.
          </p>
          <Button 
            variant="destructive" 
            onClick={disable2FA}
            disabled={loading}
          >
            {loading ? "Disabling..." : "Disable 2FA"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>Setup Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Enhance your account security by enabling two-factor authentication.
            </p>
            <Button onClick={generateSecret} disabled={loading}>
              {loading ? "Generating..." : "Setup 2FA"}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app:
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="border rounded-lg" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mb-4">
                Or enter this secret manually: <code className="bg-muted px-2 py-1 rounded">{secret}</code>
              </p>
            </div>

            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={verifyAndEnable2FA}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}