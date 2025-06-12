
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Truck, Search, AlertTriangle } from "lucide-react";

interface Driver {
  id: string;
  serialNumber: number;
  name: string;
  isAvailable: boolean;
  monthlyTrips: number;
  monthlyTarget: number;
  isOnline: boolean;
}

interface TractorRegistrationProps {
  drivers: Driver[];
  onAddDriver: (name: string) => void;
  onToggleAvailability: (driverId: string) => void;
}

export const TractorRegistration = ({ drivers, onAddDriver, onToggleAvailability }: TractorRegistrationProps) => {
  const [newDriverName, setNewDriverName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDriverName.trim()) {
      onAddDriver(newDriverName.trim());
      setNewDriverName("");
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.serialNumber.toString().includes(searchTerm)
  );

  const onlineCount = drivers.filter(d => d.isOnline).length;
  const belowTargetCount = drivers.filter(d => d.monthlyTrips < d.monthlyTarget).length;

  return (
    <div className="space-y-6">
      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-lg animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
              Add New Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                placeholder="Driver Name"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="flex-1 transition-all duration-200 focus:scale-105"
              />
              <Button 
                type="submit" 
                disabled={!newDriverName.trim()}
                className="transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="transition-all duration-200 focus:scale-105"
            />
          </CardContent>
        </Card>
      </div>

      {/* Fleet Overview */}
      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fleet Status ({drivers.length}/100)
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="animate-pulse">{onlineCount} Online</Badge>
              {belowTargetCount > 0 && (
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  {belowTargetCount} Below Target
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredDrivers.map((driver, index) => (
              <div 
                key={driver.id} 
                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="font-mono text-base px-3 py-1 transition-all duration-200 hover:scale-110">
                    #{driver.serialNumber.toString().padStart(3, '0')}
                  </Badge>
                  <div>
                    <p className="font-medium text-lg transition-colors duration-200 hover:text-blue-600">{driver.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {driver.monthlyTrips}/{driver.monthlyTarget} trips
                      </span>
                      {driver.monthlyTrips < driver.monthlyTarget && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          {driver.monthlyTarget - driver.monthlyTrips} behind
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium transition-colors duration-200">
                      {driver.isOnline ? "Online" : "Offline"}
                    </span>
                    <Switch
                      checked={driver.isOnline}
                      onCheckedChange={() => onToggleAvailability(driver.id)}
                      className="transition-all duration-200 hover:scale-110"
                    />
                  </div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${driver.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
