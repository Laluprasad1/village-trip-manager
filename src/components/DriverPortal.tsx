
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Truck, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDrivers } from '@/hooks/useDrivers';
import { useTrips } from '@/hooks/useTrips';

export const DriverPortal = () => {
  const { user } = useAuth();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { trips, updateTripStatus, isLoading: tripsLoading } = useTrips();

  if (driversLoading || tripsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Find current driver
  const currentDriver = drivers.find(d => d.user_id === user?.id);
  
  if (!currentDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Driver profile not found. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get today's trips for this driver
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => 
    t.driver_id === currentDriver.id && 
    t.trip_date === today
  );

  // Get monthly progress
  const monthlyProgress = (currentDriver.monthly_trips / currentDriver.monthly_target) * 100;

  const handleTripResponse = (tripId: string, status: 'accepted' | 'declined') => {
    updateTripStatus(tripId, status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-scale-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Driver Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {currentDriver.profile?.full_name || 'Driver'}!
          </p>
        </div>

        {/* Driver Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serial Number</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">#{currentDriver.serial_number}</div>
              <p className="text-xs text-muted-foreground">Your position in queue</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Trips</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currentDriver.monthly_trips}/{currentDriver.monthly_target}
              </div>
              <Progress value={monthlyProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(monthlyProgress)}% complete
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant={currentDriver.is_online ? "default" : "secondary"}>
                {currentDriver.is_online ? "Online" : "Offline"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className={`font-medium ${currentDriver.is_available ? 'text-green-600' : 'text-red-600'}`}>
                  {currentDriver.is_available ? 'Available' : 'Unavailable'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  for trip assignments
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Assignments */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Today's Assignments ({today})</CardTitle>
            <CardDescription>
              Your trip assignments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayTrips.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No trips assigned for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayTrips.map((trip) => (
                  <Card key={trip.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{trip.company_name}</h3>
                            <Badge className={getStatusColor(trip.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(trip.status)}
                                {trip.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assigned at: {new Date(trip.assigned_at || trip.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {trip.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleTripResponse(trip.id, 'accepted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleTripResponse(trip.id, 'declined')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
