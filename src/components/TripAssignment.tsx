import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const commonCompanies = [
  "Pepsi Factory",
  "Coca Cola Plant",
  "Nestle Manufacturing",
  "Tata Steel",
  "Reliance Industries",
  "Bajaj Auto",
  "Hero MotoCorp",
  "Mahindra & Mahindra",
  "Godrej Industries",
  "ITC Limited",
  "Hindustan Unilever",
  "Asian Paints"
];

export const TripAssignment = ({ onAssignTrips, companies }: TripAssignmentProps) => {
  const [companyName, setCompanyName] = useState("");
  const [totalTrips, setTotalTrips] = useState("");
  const [vehiclesNeeded, setVehiclesNeeded] = useState("");
  const [useCustomCompany, setUseCustomCompany] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && totalTrips && vehiclesNeeded) {
      onAssignTrips(companyName.trim(), parseInt(totalTrips), parseInt(vehiclesNeeded));
      setCompanyName("");
      setTotalTrips("");
      setVehiclesNeeded("");
      setUseCustomCompany(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayCompanies = companies.filter(c => c.date === today);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Assignment Form */}
      <div className="lg:col-span-1">
        <Card className="transition-all duration-300 hover:shadow-lg animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
              New Assignment
            </CardTitle>
            <CardDescription>Create trip assignments for companies</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                {!useCustomCompany ? (
                  <div className="space-y-2">
                    <Select value={companyName} onValueChange={setCompanyName}>
                      <SelectTrigger className="transition-all duration-200 focus:scale-105">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonCompanies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUseCustomCompany(true)}
                      className="w-full text-xs"
                    >
                      Or enter custom company name
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseCustomCompany(false);
                        setCompanyName("");
                      }}
                      className="w-full text-xs"
                    >
                      Back to company list
                    </Button>
                  </div>
                )}
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="text-sm font-medium mb-2 block">Total Trips</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={totalTrips}
                  onChange={(e) => setTotalTrips(e.target.value)}
                  min="1"
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="text-sm font-medium mb-2 block">Vehicles Needed</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={vehiclesNeeded}
                  onChange={(e) => setVehiclesNeeded(e.target.value)}
                  min="1"
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full transition-all duration-200 hover:scale-105 animate-fade-in" 
                style={{ animationDelay: '0.4s' }}
                disabled={!companyName.trim() || !totalTrips || !vehiclesNeeded}
              >
                Assign Vehicles
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Today's Assignments */}
      <div className="lg:col-span-2">
        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              <div className="text-center py-12 animate-fade-in">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">No assignments yet for today</p>
                <p className="text-sm text-muted-foreground">Use the form to create the first assignment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCompanies.map((company, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-slide-in-right"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm transition-all duration-200 hover:scale-110">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold transition-colors duration-200 hover:text-blue-600">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.tripsRequested} trips requested
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Assigned</p>
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-green-600 transition-transform duration-200 hover:scale-110" />
                          <span className="font-semibold">{company.vehiclesAssigned}</span>
                        </div>
                      </div>
                      <Badge variant="default" className="transition-all duration-200 hover:scale-110">
                        {company.vehiclesAssigned} vehicles
                      </Badge>
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
