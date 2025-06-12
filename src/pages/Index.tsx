import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TractorRegistration } from "@/components/TractorRegistration";
import { TripAssignment } from "@/components/TripAssignment";
import { DriverDashboard } from "@/components/DriverDashboard";
import { AdminReports } from "@/components/AdminReports";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const Index = () => {
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: "1", serialNumber: 1, name: "Ram Kumar", isAvailable: true, monthlyTrips: 12, monthlyTarget: 20, isOnline: true },
    { id: "2", serialNumber: 2, name: "Shyam Singh", isAvailable: true, monthlyTrips: 18, monthlyTarget: 20, isOnline: true },
    { id: "3", serialNumber: 3, name: "Gita Devi", isAvailable: false, monthlyTrips: 15, monthlyTarget: 20, isOnline: false },
    { id: "4", serialNumber: 4, name: "Mohan Lal", isAvailable: true, monthlyTrips: 8, monthlyTarget: 20, isOnline: true },
    { id: "5", serialNumber: 5, name: "Sita Kumari", isAvailable: true, monthlyTrips: 22, monthlyTarget: 20, isOnline: true },
  ]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const { toast } = useToast();

  const addDriver = (name: string) => {
    const newSerial = Math.max(...drivers.map(d => d.serialNumber)) + 1;
    const newDriver: Driver = {
      id: Date.now().toString(),
      serialNumber: newSerial,
      name,
      isAvailable: true,
      monthlyTrips: 0,
      monthlyTarget: 20,
      isOnline: true
    };
    setDrivers([...drivers, newDriver]);
    toast({
      title: "Driver Added",
      description: `${name} has been registered with serial #${newSerial}`,
    });
  };

  const toggleDriverAvailability = (driverId: string) => {
    setDrivers(drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, isOnline: !driver.isOnline }
        : driver
    ));
  };

  const assignTrips = (companyName: string, totalTrips: number, vehiclesNeeded: number) => {
    const today = new Date().toISOString().split('T')[0];
    const availableDrivers = drivers
      .filter(d => d.isOnline)
      .sort((a, b) => a.serialNumber - b.serialNumber);

    if (availableDrivers.length < vehiclesNeeded) {
      toast({
        title: "Insufficient Drivers",
        description: `Only ${availableDrivers.length} drivers available, need ${vehiclesNeeded}`,
        variant: "destructive"
      });
      return;
    }

    const selectedDrivers = availableDrivers.slice(0, vehiclesNeeded);
    const newTrips: Trip[] = selectedDrivers.map(driver => ({
      id: Date.now() + Math.random().toString(),
      driverId: driver.id,
      company: companyName,
      date: today,
      status: 'pending' as const,
      assignedAt: new Date().toISOString()
    }));

    setTrips([...trips, ...newTrips]);
    setCompanies([...companies, {
      name: companyName,
      tripsRequested: totalTrips,
      vehiclesAssigned: vehiclesNeeded,
      date: today
    }]);

    toast({
      title: "Trips Assigned",
      description: `Assigned ${vehiclesNeeded} vehicles to ${companyName}`,
    });
  };

  const handleTripResponse = (tripId: string, response: 'accepted' | 'declined') => {
    setTrips(trips.map(trip => 
      trip.id === tripId 
        ? { ...trip, status: response }
        : trip
    ));

    if (response === 'accepted') {
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setDrivers(drivers.map(driver => 
          driver.id === trip.driverId 
            ? { ...driver, monthlyTrips: driver.monthlyTrips + 1 }
            : driver
        ));
      }
    }

    const trip = trips.find(t => t.id === tripId);
    toast({
      title: `Trip ${response}`,
      description: trip ? `Trip to ${trip.company} has been ${response}` : '',
    });
  };

  const onlineCount = drivers.filter(d => d.isOnline).length;
  const todayTrips = trips.filter(t => t.date === new Date().toISOString().split('T')[0]).length;
  const pendingTrips = trips.filter(t => t.status === 'pending').length;
  const belowTargetCount = drivers.filter(d => d.monthlyTrips < d.monthlyTarget).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-scale-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Village Water Tanker Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Managing daily trip assignments for tractor-tanker drivers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Drivers</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
              <p className="text-xs text-muted-foreground">Available for assignment</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayTrips}</div>
              <p className="text-xs text-muted-foreground">Assigned today</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTrips}</div>
              <p className="text-xs text-muted-foreground">Awaiting driver response</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Below Target</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{belowTargetCount}</div>
              <p className="text-xs text-muted-foreground">Need more trips</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fleet" className="w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <TabsList className="grid w-full grid-cols-4 mb-6 transition-all duration-300">
            <TabsTrigger value="fleet" className="transition-all duration-200 hover:scale-105">Fleet Management</TabsTrigger>
            <TabsTrigger value="assignment" className="transition-all duration-200 hover:scale-105">Trip Assignment</TabsTrigger>
            <TabsTrigger value="driver" className="transition-all duration-200 hover:scale-105">Driver Dashboard</TabsTrigger>
            <TabsTrigger value="reports" className="transition-all duration-200 hover:scale-105">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="animate-scale-in">
            <TractorRegistration 
              drivers={drivers}
              onAddDriver={addDriver}
              onToggleAvailability={toggleDriverAvailability}
            />
          </TabsContent>

          <TabsContent value="assignment" className="animate-scale-in">
            <TripAssignment 
              onAssignTrips={assignTrips}
              companies={companies}
            />
          </TabsContent>

          <TabsContent value="driver" className="animate-scale-in">
            <DriverDashboard 
              drivers={drivers}
              trips={trips}
              selectedDriverId={selectedDriverId}
              onSelectDriver={setSelectedDriverId}
              onTripResponse={handleTripResponse}
            />
          </TabsContent>

          <TabsContent value="reports" className="animate-scale-in">
            <AdminReports 
              drivers={drivers}
              trips={trips}
              companies={companies}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
