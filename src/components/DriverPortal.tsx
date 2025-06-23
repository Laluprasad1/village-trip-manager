
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Clock, CheckCircle, XCircle, MapPin, Target } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";

export const DriverPortal = () => {
  const { user } = useAuth();
  const { drivers } = useDrivers();
  const { trips, updateTripStatus } = useTrips();

  // Find current driver
  const currentDriver = drivers.find(d => d.user_id === user?.id);
  
  // Get today's trips for current driver
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => 
    t.driver_id === currentDriver?.id && t.trip_date === today
  );

  const handleAcceptTrip = (tripId: string) => {
    updateTripStatus(tripId, 'accepted');
  };

  const handleDeclineTrip = (tripId: string) => {
    updateTripStatus(tripId, 'declined');
  };

  if (!currentDriver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Driver profile not found. Please contact admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Driver Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {currentDriver.profile?.full_name || 'Driver'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Assignment */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Today's Assignment
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayTrips.length > 0 ? (
                <div className="space-y-4">
                  {todayTrips.map((trip) => (
                    <div key={trip.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{trip.company_name}</h3>
                        <Badge variant="outline" className="font-mono">
                          Serial #{currentDriver.serial_number.toString().padStart(3, '0')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-semibold">
                          Serial #{currentDriver.serial_number.toString().padStart(3, '0')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Assigned at: {new Date(trip.assigned_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {trip.status === 'pending' && (
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleAcceptTrip(trip.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Trip
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeclineTrip(trip.id)}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {trip.status === 'accepted' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}

                      {trip.status === 'declined' && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Declined
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assignment for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Progress
              </CardTitle>
              <CardDescription>
                Track your monthly trip completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Trips Completed</span>
                    <span className="text-sm text-gray-500">
                      {currentDriver.monthly_trips} / {currentDriver.monthly_target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((currentDriver.monthly_trips / currentDriver.monthly_target) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((currentDriver.monthly_trips / currentDriver.monthly_target) * 100)}% complete
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {currentDriver.monthly_trips}
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.max(0, currentDriver.monthly_target - currentDriver.monthly_trips)}
                    </div>
                    <div className="text-sm text-orange-600">Remaining</div>
                  </div>
                </div>

                {currentDriver.monthly_trips >= currentDriver.monthly_target && (
                  <div className="text-center p-4 bg-green-100 rounded-lg border border-green-300">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">
                      🎉 Monthly target achieved!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
