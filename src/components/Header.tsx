
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Truck, UserCog } from 'lucide-react';

export const Header = () => {
  const { user, userRole, signOut } = useAuth();

  if (!user) return null;

  // Extract mobile number from user metadata
  const mobileNumber = user.user_metadata?.mobile_number;
  const fullName = user.user_metadata?.full_name;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Water Tanker Management
              </h1>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              {userRole === 'admin' ? (
                <UserCog className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              {userRole === 'admin' ? 'Union Head' : 'Driver'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{fullName}</p>
              <p className="text-gray-500">{mobileNumber}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
