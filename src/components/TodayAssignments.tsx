
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Truck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTrips } from "@/hooks/useTrips";
import { useDrivers } from "@/hooks/useDrivers";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";

export const TodayAssignments = () => {
  const { trips, updateTripStatus, canManageTrips } = useTrips();
  const { drivers } = useDrivers();
  const { companies } = useCompanies();
  const { userRole, user } = useAuth();

  // Enable real-time updates
  useRealtime();

  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => t.trip_date === today);
  const todayCompanies = companies.filter(c => c.assignment_date === today);

  const getDriverById = (driverId: string) => drivers.find(d => d.id === driverId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 border-green-200';
      case 'declined':
        return 'bg-red-100 border-red-200';
      case 'pending':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const handleStatusUpdate = (tripId: string, status: string) => {
    updateTripStatus(tripId, status);
  };

  const getCurrentUserTrips = () => {
    if (userRole !== 'driver') return todayTrips;
    const currentDriver = drivers.find(d => d.user_id === user?.id);
    return todayTrips.filter(t => t.driver_id === currentDriver?.id);
  };

  const userTrips = getCurrentUserTrips();

  if (userTrips.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Today's Assignments - {new Date().toLocaleDateString()}
          </CardTitle>
          <CardDescription>
            {userRole === 'driver' ? 'No trips assigned to you today' : 'No companies assigned for today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 animate-pulse">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {userRole === 'driver' ? 'Check back later for assignments' : 'No assignments yet for today'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Today's Assignments - {new Date().toLocaleDateString()}
        </CardTitle>
        <CardDescription>
          {userRole === 'driver' 
            ? `You have ${userTrips.length} assignment${userTrips.length === 1 ? '' : 's'} today`
            : `${todayCompanies.length} companies with ${userTrips.length} vehicle assignments`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {userRole === 'admin' ? (
            // Admin view - group by companies
            todayCompanies.map((company, companyIndex) => {
              const companyTrips = userTrips.filter(t => t.company_name === company.name);
              
              return (
                <div 
                  key={companyIndex}
                  className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50 transition-all duration-300 hover:shadow-md animate-slide-in-right"
                  style={{ animationDelay: `${0.1 * companyIndex}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {company.trips_requested} trips requested • {company.vehicles_assigned} vehicles assigned
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {companyTrips.length} assignments
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {companyTrips.map((trip, tripIndex) => {
                      const driver = getDriverById(trip.driver_id);
                      
                      return (
                        <div 
                          key={trip.id}
                          className={`p-3 border rounded-lg transition-all duration-300 hover:scale-105 animate-fade-in ${getStatusColor(trip.status)}`}
                          style={{ animationDelay: `${0.1 * (companyIndex + tripIndex)}s` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="font-mono font-semibold">
                                #{driver?.serial_number.toString().padStart(3, '0')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(trip.status)}
                              <Badge 
                                variant={trip.status === 'accepted' ? 'default' : 
                                       trip.status === 'declined' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {trip.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{driver?.profile?.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Assigned: {new Date(trip.assigned_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Driver view - show their trips
            <div className="grid gap-4">
              {userTrips.map((trip, index) => {
                const driver = getDriverById(trip.driver_id);
                
                return (
                  <div 
                    key={trip.id}
                    className={`p-4 border rounded-lg transition-all duration-300 hover:scale-105 animate-fade-in ${getStatusColor(trip.status)}`}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{trip.company_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Serial #{driver?.serial_number.toString().padStart(3, '0')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(trip.status)}
                        <Badge 
                          variant={trip.status === 'accepted' ? 'default' : 
                                 trip.status === 'declined' ? 'destructive' : 'secondary'}
                        >
                          {trip.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {trip.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(trip.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(trip.id, 'declined')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Assigned: {new Date(trip.assigned_at).toLocaleTimeString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
