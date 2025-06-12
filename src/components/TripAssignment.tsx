
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Truck, Clock } from "lucide-react";

interface Company {
  name: string;
  tripsRequested: number;
  vehiclesAssigned: number;
  date: string;
}

interface TripAssignmentProps {
  onAssignTrips: (company: string, totalTrips: number, vehiclesNeeded: number) => void;
  companies: Company[];
}

export const TripAssignment = ({ onAssignTrips, companies }: TripAssignmentProps) => {
  const [companyName, setCompanyName] = useState("");
  const [totalTrips, setTotalTrips] = useState("");
  const [vehiclesNeeded, setVehiclesNeeded] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && totalTrips && vehiclesNeeded) {
      onAssignTrips(companyName.trim(), parseInt(totalTrips), parseInt(vehiclesNeeded));
      setCompanyName("");
      setTotalTrips("");
      setVehiclesNeeded("");
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCompanies = companies.filter(c => c.date === today);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Assignment Form */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Assignment
            </CardTitle>
            <CardDescription>Create trip assignments for companies</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Total Trips</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={totalTrips}
                  onChange={(e) => setTotalTrips(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Vehicles Needed</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={vehiclesNeeded}
                  onChange={(e) => setVehiclesNeeded(e.target.value)}
                  min="1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!companyName.trim() || !totalTrips || !vehiclesNeeded}>
                Assign Vehicles
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Today's Assignments */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString()} - {todayCompanies.length} companies assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assignments yet for today</p>
                <p className="text-sm text-muted-foreground">Use the form to create the first assignment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.tripsRequested} trips requested
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Assigned</p>
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{company.vehiclesAssigned}</span>
                        </div>
                      </div>
                      <Badge variant="default">{company.vehiclesAssigned} vehicles</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
