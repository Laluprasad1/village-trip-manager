
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Calendar } from 'lucide-react';
import { TractorRegistration } from './TractorRegistration';
import { TodayAssignments } from './TodayAssignments';
import { DriverPortal } from './DriverPortal';

export const DriverDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Driver Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Your assignments and fleet overview
          </p>
        </div>

        <Tabs defaultValue="portal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portal" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Portal
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Today's Assignments
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fleet Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portal">
            <DriverPortal />
          </TabsContent>

          <TabsContent value="assignments">
            <TodayAssignments />
          </TabsContent>

          <TabsContent value="fleet">
            <TractorRegistration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
