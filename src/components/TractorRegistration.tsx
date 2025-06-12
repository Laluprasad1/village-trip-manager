
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Truck } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDriverName.trim()) {
      onAddDriver(newDriverName.trim());
      setNewDriverName("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Register New Tractor-Tanker
          </CardTitle>
          <CardDescription>Add a new driver and vehicle to the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Driver Name"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newDriverName.trim()}>
              Register Driver
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Overview ({drivers.length}/100)
          </CardTitle>
          <CardDescription>Manage driver availability and view fleet status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="font-mono">
                    #{driver.serialNumber.toString().padStart(3, '0')}
                  </Badge>
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver.monthlyTrips}/{driver.monthlyTarget} trips this month
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Offline</span>
                    <Switch
                      checked={driver.isOnline}
                      onCheckedChange={() => onToggleAvailability(driver.id)}
                    />
                    <span className="text-sm">Online</span>
                  </div>
                  <Badge variant={driver.isOnline ? "default" : "secondary"}>
                    {driver.isOnline ? "Available" : "Offline"}
                  </Badge>
                  {driver.monthlyTrips < driver.monthlyTarget && (
                    <Badge variant="destructive">Below Target</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
