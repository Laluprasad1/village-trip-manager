
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, CheckCircle, XCircle, Clock, Target } from "lucide-react";

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

interface DriverDashboardProps {
  drivers: Driver[];
  trips: Trip[];
  selectedDriverId: string | null;
  onSelectDriver: (driverId: string) => void;
  onTripResponse: (tripId: string, response: 'accepted' | 'declined') => void;
}

export const DriverDashboard = ({ 
  drivers, 
  trips, 
  selectedDriverId, 
  onSelectDriver, 
  onTripResponse 
}: DriverDashboardProps) => {
  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const driverTrips = trips.filter(t => t.driverId === selectedDriverId);
  const pendingTrips = driverTrips.filter(t => t.status === 'pending');
  const completedTrips = driverTrips.filter(t => t.status === 'accepted' || t.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Driver
          </CardTitle>
          <CardDescription>Choose a driver to view their dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDriverId || ""} onValueChange={onSelectDriver}>
            <SelectTrigger>
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  #{driver.serialNumber.toString().padStart(3, '0')} - {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDriver && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver: {selectedDriver.name}
                </div>
                <Badge variant="outline" className="font-mono text-lg">
                  #{selectedDriver.serialNumber.toString().padStart(3, '0')}
                </Badge>
              </CardTitle>
              <CardDescription>Your personal dashboard and trip assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{selectedDriver.monthlyTrips}</p>
                    <p className="text-sm text-muted-foreground">Trips This Month</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{pendingTrips.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Assignments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{selectedDriver.monthlyTarget - selectedDriver.monthlyTrips}</p>
                    <p className="text-sm text-muted-foreground">Trips to Target</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {pendingTrips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Trip Assignments
                </CardTitle>
                <CardDescription>Please accept or decline these trip assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTrips.map((trip) => (
                    <div key={trip.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{trip.company}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(trip.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(trip.assignedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onTripResponse(trip.id, 'declined')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => onTripResponse(trip.id, 'accepted')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Trip History</CardTitle>
              <CardDescription>Your recent trip assignments and status</CardDescription>
            </CardHeader>
            <CardContent>
              {driverTrips.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trips assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {driverTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{trip.company}</p>
                        <p className="text-sm text-muted-foreground">{new Date(trip.date).toLocaleDateString()}</p>
                      </div>
                      <Badge 
                        variant={
                          trip.status === 'accepted' ? 'default' :
                          trip.status === 'declined' ? 'destructive' :
                          trip.status === 'completed' ? 'default' : 'secondary'
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
