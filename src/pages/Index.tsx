
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TractorRegistration } from "@/components/TractorRegistration";
import { TripAssignment } from "@/components/TripAssignment";
import { DriverDashboard } from "@/components/DriverDashboard";
import { AdminReports } from "@/components/AdminReports";
import { Tractor, Truck } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Tractor className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Water Tanker Management</h1>
          </div>
          <p className="text-lg text-gray-600">Village Union Fleet Management System</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assignment">Trip Assignment</TabsTrigger>
            <TabsTrigger value="drivers">Driver View</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tractors</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{drivers.length}</div>
                  <p className="text-xs text-muted-foreground">Registered vehicles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online Drivers</CardTitle>
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{drivers.filter(d => d.isOnline).length}</div>
                  <p className="text-xs text-muted-foreground">Available for trips</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Companies</CardTitle>
                  <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">Served today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Trips</CardTitle>
                  <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trips.filter(t => t.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
            </div>

            <TractorRegistration drivers={drivers} onAddDriver={addDriver} onToggleAvailability={toggleDriverAvailability} />
          </TabsContent>

          <TabsContent value="assignment">
            <TripAssignment onAssignTrips={assignTrips} companies={companies} />
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
