
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Truck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Driver {
  id: string;
  serialNumber: number;
  name: string;
  isAvailable: boolean;
  monthlyTrips: number;
  monthlyTarget: number;
  isOnline: boolean;
}

interface Trip {
  id: string;
  driverId: string;
  company: string;
  date: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  assignedAt: string;
}

interface Company {
  name: string;
  tripsRequested: number;
  vehiclesAssigned: number;
  date: string;
}

interface TodayAssignmentsProps {
  drivers: Driver[];
  trips: Trip[];
  companies: Company[];
}

export const TodayAssignments = ({ drivers, trips, companies }: TodayAssignmentsProps) => {
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => t.date === today);
  const todayCompanies = companies.filter(c => c.date === today);

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

  if (todayCompanies.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Today's Assignments - {new Date().toLocaleDateString()}
          </CardTitle>
          <CardDescription>No companies assigned for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 animate-pulse">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No assignments yet for today</p>
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
          {todayCompanies.length} companies with {todayTrips.length} vehicle assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {todayCompanies.map((company, companyIndex) => {
            const companyTrips = todayTrips.filter(t => t.company === company.name);
            
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
                        {company.tripsRequested} trips requested • {company.vehiclesAssigned} vehicles assigned
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {companyTrips.length} assignments
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {companyTrips.map((trip, tripIndex) => {
                    const driver = getDriverById(trip.driverId);
                    
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
                              #{driver?.serialNumber.toString().padStart(3, '0')}
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
                          <p className="font-medium text-sm">{driver?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(trip.assignedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
