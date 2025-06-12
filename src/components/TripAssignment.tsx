
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Truck } from "lucide-react";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Daily Trips
          </CardTitle>
          <CardDescription>Create trip assignments for companies based on fair rotation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Trips Required</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={totalTrips}
                  onChange={(e) => setTotalTrips(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vehicles Needed</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={vehiclesNeeded}
                  onChange={(e) => setVehiclesNeeded(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Assign Vehicles
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Assignments ({new Date().toLocaleDateString()})
          </CardTitle>
          <CardDescription>Company-wise vehicle allocation for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayCompanies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assignments yet for today</p>
          ) : (
            <div className="space-y-4">
              {todayCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center space-x-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {company.tripsRequested} trips
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <Badge variant="default">{company.vehiclesAssigned} vehicles assigned</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
