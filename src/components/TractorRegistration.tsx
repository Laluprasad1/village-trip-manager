
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                placeholder="Driver Name"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newDriverName.trim()}>
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
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
            />
          </CardContent>
        </Card>
      </div>

      {/* Fleet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fleet Status ({drivers.length}/100)
            </div>
            <div className="flex gap-2">
              <Badge variant="default">{onlineCount} Online</Badge>
              {belowTargetCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {belowTargetCount} Below Target
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="font-mono text-base px-3 py-1">
                    #{driver.serialNumber.toString().padStart(3, '0')}
                  </Badge>
                  <div>
                    <p className="font-medium text-lg">{driver.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {driver.monthlyTrips}/{driver.monthlyTarget} trips
                      </span>
                      {driver.monthlyTrips < driver.monthlyTarget && (
                        <Badge variant="destructive" className="text-xs">
                          {driver.monthlyTarget - driver.monthlyTrips} behind
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      {driver.isOnline ? "Online" : "Offline"}
                    </span>
                    <Switch
                      checked={driver.isOnline}
                      onCheckedChange={() => onToggleAvailability(driver.id)}
                    />
                  </div>
                  <div className={`w-3 h-3 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
