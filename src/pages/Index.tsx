import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TractorRegistration } from "@/components/TractorRegistration";
import { TripAssignment } from "@/components/TripAssignment";
import { DriverDashboard } from "@/components/DriverDashboard";
import { AdminReports } from "@/components/AdminReports";
import { Truck, Users, Calendar, TrendingUp, AlertCircle } from "lucide-react";

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
    { id: "1", serialNumber: 1, name: "Rajesh Kumar", isAvailable: true, monthlyTrips: 12, monthlyTarget: 15, isOnline: true },
    { id: "2", serialNumber: 2, name: "Suresh Patel", isAvailable: true, monthlyTrips: 8, monthlyTarget: 15, isOnline: false },
    { id: "3", serialNumber: 3, name: "Ramesh Singh", isAvailable: true, monthlyTrips: 18, monthlyTarget: 15, isOnline: true },
    { id: "4", serialNumber: 4, name: "Mahesh Sharma", isAvailable: false, monthlyTrips: 5, monthlyTarget: 15, isOnline: true },
    { id: "5", serialNumber: 5, name: "Dinesh Yadav", isAvailable: true, monthlyTrips: 14, monthlyTarget: 15, isOnline: true },
  ]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentSerialIndex, setCurrentSerialIndex] = useState(0);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>("1");

  const addDriver = (name: string) => {
    const newSerial = Math.max(...drivers.map(d => d.serialNumber), 0) + 1;
    const newDriver: Driver = {
      id: Date.now().toString(),
      serialNumber: newSerial,
      name,
      isAvailable: true,
      monthlyTrips: 0,
      monthlyTarget: 15,
      isOnline: false
    };
    setDrivers([...drivers, newDriver]);
  };

  const assignTrips = (company: string, totalTrips: number, vehiclesNeeded: number) => {
    const newCompany: Company = {
      name: company,
      tripsRequested: totalTrips,
      vehiclesAssigned: 0,
      date: new Date().toISOString().split('T')[0]
    };

    const availableDrivers = drivers.filter(d => d.isAvailable && d.isOnline);
    const sortedDrivers = [...availableDrivers].sort((a, b) => a.serialNumber - b.serialNumber);
    
    let assignedCount = 0;
    let driverIndex = currentSerialIndex;
    const newTrips: Trip[] = [];

    while (assignedCount < vehiclesNeeded && assignedCount < sortedDrivers.length) {
      const driver = sortedDrivers[driverIndex % sortedDrivers.length];
      
      const newTrip: Trip = {
        id: Date.now().toString() + assignedCount,
        driverId: driver.id,
        company,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        assignedAt: new Date().toISOString()
      };

      newTrips.push(newTrip);
      assignedCount++;
      driverIndex++;
    }

    newCompany.vehiclesAssigned = assignedCount;
    setCompanies([...companies, newCompany]);
    setTrips([...trips, ...newTrips]);
    setCurrentSerialIndex(driverIndex % sortedDrivers.length);
  };

  const handleTripResponse = (tripId: string, response: 'accepted' | 'declined') => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: response } : trip
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
  };

  const toggleDriverAvailability = (driverId: string) => {
    setDrivers(drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, isOnline: !driver.isOnline }
        : driver
    ));
  };

  const onlineDrivers = drivers.filter(d => d.isOnline).length;
  const pendingTrips = trips.filter(t => t.status === 'pending').length;
  const belowTargetDrivers = drivers.filter(d => d.monthlyTrips < d.monthlyTarget).length;
  const todayCompanies = companies.filter(c => c.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Water Tanker Management</h1>
                <p className="text-sm text-gray-600">Village Union Fleet System</p>
              </div>
            </div>
            <div className="flex gap-2">
              {pendingTrips > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {pendingTrips} Pending
                </Badge>
              )}
              {belowTargetDrivers > 0 && (
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {belowTargetDrivers} Below Target
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Tractors</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{onlineDrivers}</p>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayCompanies}</p>
                  <p className="text-xs text-muted-foreground">Companies Today</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTrips}</p>
                  <p className="text-xs text-muted-foreground">Pending Trips</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="assignment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignment">Trip Assignment</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
            <TabsTrigger value="drivers">Driver View</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="assignment">
            <TripAssignment onAssignTrips={assignTrips} companies={companies} />
          </TabsContent>

          <TabsContent value="fleet">
            <TractorRegistration drivers={drivers} onAddDriver={addDriver} onToggleAvailability={toggleDriverAvailability} />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverDashboard 
              drivers={drivers}
              trips={trips}
              selectedDriverId={selectedDriverId}
              onSelectDriver={setSelectedDriverId}
              onTripResponse={handleTripResponse}
            />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports drivers={drivers} trips={trips} companies={companies} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
