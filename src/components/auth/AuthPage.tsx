
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Truck, UserCog, Eye, EyeOff, Phone, Lock } from 'lucide-react';

export const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    mobile: '',
    pin: '',
  });

  const [signupForm, setSignupForm] = useState({
    mobile: '',
    pin: '',
    full_name: '',
    role: 'driver' as 'driver' | 'admin',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginForm.mobile, loginForm.pin);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(signupForm.mobile, signupForm.pin, {
      full_name: signupForm.full_name,
      role: signupForm.role,
    });

    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Registration Successful!',
        description: 'You can now login with your mobile number and PIN.',
      });
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      loginTab?.click();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            Water Tanker Management
          </CardTitle>
          <CardDescription>
            Login with your mobile number and PIN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-mobile">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="pl-10"
                      value={loginForm.mobile}
                      onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pin">PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-pin"
                      type={showPin ? 'text' : 'password'}
                      placeholder="Enter your PIN"
                      className="pl-10 pr-10"
                      value={loginForm.pin}
                      onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Account Type</Label>
                  <Select
                    value={signupForm.role}
                    onValueChange={(value: 'driver' | 'admin') => 
                      setSignupForm({ ...signupForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Driver
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Union Head / Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupForm.full_name}
                    onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-mobile">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="pl-10"
                      value={signupForm.mobile}
                      onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Create PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-pin"
                      type={showPin ? 'text' : 'password'}
                      placeholder="Create a 4-6 digit PIN"
                      className="pl-10 pr-10"
                      value={signupForm.pin}
                      onChange={(e) => setSignupForm({ ...signupForm, pin: e.target.value })}
                      required
                      minLength={4}
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Create a secure 4-6 digit PIN for login
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
