
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

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

interface AdminReportsProps {
  drivers: Driver[];
  trips: Trip[];
  companies: Company[];
}

export const AdminReports = ({ drivers, trips, companies }: AdminReportsProps) => {
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => t.date === today);
  const acceptedTrips = trips.filter(t => t.status === 'accepted' || t.status === 'completed');
  const belowTargetDrivers = drivers.filter(d => d.monthlyTrips < d.monthlyTarget);

  const exportDailyReport = () => {
    const reportData = {
      date: today,
      totalTrips: todayTrips.length,
      acceptedTrips: todayTrips.filter(t => t.status === 'accepted').length,
      companies: companies.filter(c => c.date === today),
      drivers: drivers.filter(d => todayTrips.some(t => t.driverId === d.id))
    };
    
    console.log('Daily Report:', reportData);
    // In a real app, this would generate and download a PDF or CSV
    alert('Daily report exported! Check console for data.');
  };

  const exportMonthlyReport = () => {
    const reportData = {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalDrivers: drivers.length,
      totalTrips: acceptedTrips.length,
      averageTripsPerDriver: (acceptedTrips.length / drivers.length).toFixed(1),
      belowTargetCount: belowTargetDrivers.length,
      driverPerformance: drivers.map(d => ({
        name: d.name,
        serialNumber: d.serialNumber,
        completedTrips: d.monthlyTrips,
        target: d.monthlyTarget,
        percentage: ((d.monthlyTrips / d.monthlyTarget) * 100).toFixed(1)
      }))
    };
    
    console.log('Monthly Report:', reportData);
    alert('Monthly report exported! Check console for data.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Summary</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTrips.length}</div>
            <p className="text-xs text-muted-foreground">Trips assigned today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayTrips.length > 0 ? Math.round((todayTrips.filter(t => t.status === 'accepted').length / todayTrips.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Today's acceptance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Below Target</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{belowTargetDrivers.length}</div>
            <p className="text-xs text-muted-foreground">Drivers need more trips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedTrips.length}</div>
            <p className="text-xs text-muted-foreground">Completed trips this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Generate daily and monthly performance reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportDailyReport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Daily Report
            </Button>
            <Button onClick={exportMonthlyReport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Monthly Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Performance Alert</CardTitle>
            <CardDescription>Drivers below monthly target requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {belowTargetDrivers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All drivers meeting targets!</p>
            ) : (
              <div className="space-y-2">
                {belowTargetDrivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">Serial #{driver.serialNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {driver.monthlyTrips}/{driver.monthlyTarget}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((driver.monthlyTrips / driver.monthlyTarget) * 100).toFixed(0)}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Presence List</CardTitle>
          <CardDescription>Driver availability and status for {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {drivers.map((driver) => {
              const driverTodayTrips = todayTrips.filter(t => t.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="font-mono">
                      #{driver.serialNumber.toString().padStart(3, '0')}
                    </Badge>
                    <span className="font-medium">{driver.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={driver.isOnline ? "default" : "secondary"}>
                      {driver.isOnline ? "Present" : "Absent"}
                    </Badge>
                    {driverTodayTrips.length > 0 && (
                      <Badge variant="outline">
                        {driverTodayTrips.length} trip{driverTodayTrips.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
