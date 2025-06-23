
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TractorRegistration } from "@/components/TractorRegistration";
import { TripAssignment } from "@/components/TripAssignment";
import { AdminReports } from "@/components/AdminReports";
import { TodayAssignments } from "@/components/TodayAssignments";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, Calendar, BarChart3 } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";
import { useCompanies } from "@/hooks/useCompanies";

export const AdminDashboard = () => {
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { trips, isLoading: tripsLoading } = useTrips();
  const { companies, isLoading: companiesLoading } = useCompanies();

  if (driversLoading || tripsLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const onlineCount = drivers.filter(d => d.is_online).length;
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(t => t.trip_date === today).length;
  const pendingTrips = trips.filter(t => t.status === 'pending').length;
  const belowTargetCount = drivers.filter(d => d.monthly_trips < d.monthly_target).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-scale-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
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
              <div className="text-2xl font-bold text-green-600">{onlineCount}/{drivers.length}</div>
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

        {/* Today's Assignments */}
        <div className="mb-8">
          <TodayAssignments />
        </div>

        <Tabs defaultValue="fleet" className="w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <TabsList className="grid w-full grid-cols-3 mb-6 transition-all duration-300">
            <TabsTrigger value="fleet" className="transition-all duration-200 hover:scale-105">Fleet Management</TabsTrigger>
            <TabsTrigger value="assignment" className="transition-all duration-200 hover:scale-105">Trip Assignment</TabsTrigger>
            <TabsTrigger value="reports" className="transition-all duration-200 hover:scale-105">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="animate-scale-in">
            <TractorRegistration />
          </TabsContent>

          <TabsContent value="assignment" className="animate-scale-in">
            <TripAssignment />
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
