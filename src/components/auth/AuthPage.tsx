
import { useState, useEffect } from 'react';
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
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/');
    }
  }, [user, navigate]);

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
    
    if (!loginForm.mobile || !loginForm.pin) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both mobile number and PIN.',
        variant: 'destructive',
      });
      return;
    }

    // Validate mobile number format (basic validation)
    if (loginForm.mobile.length < 10) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid mobile number.',
        variant: 'destructive',
      });
      return;
    }

    // Validate PIN format
    if (loginForm.pin.length < 4) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be at least 4 digits.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting login with mobile:', loginForm.mobile);

    const { error } = await signIn(loginForm.mobile, loginForm.pin);

    if (error) {
      console.log('Login error:', error.message);
      toast({
        title: 'Login Failed',
        description: error.message || 'Unable to log in. Please check your credentials.',
        variant: 'destructive',
      });
    } else {
      console.log('Login successful, navigating to dashboard');
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
    
    if (!signupForm.mobile || !signupForm.pin || !signupForm.full_name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate mobile number format
    if (signupForm.mobile.length < 10) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid mobile number (at least 10 digits).',
        variant: 'destructive',
      });
      return;
    }

    // Validate PIN format
    if (signupForm.pin.length < 4 || signupForm.pin.length > 6) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be between 4-6 digits.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting signup with mobile:', signupForm.mobile, 'role:', signupForm.role);

    const { error } = await signUp(signupForm.mobile, signupForm.pin, {
      full_name: signupForm.full_name,
      role: signupForm.role,
    });

    if (error) {
      console.log('Signup error:', error.message);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to create account. Please try again.',
        variant: 'destructive',
      });
    } else {
      console.log('Signup successful');
      toast({
        title: 'Account Created Successfully!',
        description: 'You can now log in with your credentials.',
      });
      // Switch to login tab and clear signup form
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      loginTab?.click();
      setSignupForm({
        mobile: '',
        pin: '',
        full_name: '',
        role: 'driver',
      });
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
                      onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value.replace(/\D/g, '') })}
                      required
                      maxLength={15}
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
                      onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '') })}
                      required
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
                      onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value.replace(/\D/g, '') })}
                      required
                      maxLength={15}
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
                      onChange={(e) => setSignupForm({ ...signupForm, pin: e.target.value.replace(/\D/g, '') })}
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
