
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Truck, Search, AlertTriangle, Trash2, Edit, UserPlus } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";
import { toast } from "sonner";

export const TractorRegistration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    monthly_target: 20,
    is_available: true
  });
  
  const { drivers, isLoading, toggleAvailability, deleteDriver, updateDriver, canDelete } = useDrivers();
  const { userRole } = useAuth();
  
  // Enable real-time updates
  useRealtime();

  const filteredDrivers = drivers.filter(driver =>
    driver.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.serial_number.toString().includes(searchTerm)
  );

  const onlineCount = drivers.filter(d => d.is_online).length;
  const belowTargetCount = drivers.filter(d => d.monthly_trips < d.monthly_target).length;

  const handleDeleteDriver = (driverId: string, driverName: string) => {
    if (window.confirm(`Are you sure you want to remove ${driverName}? This action cannot be undone.`)) {
      deleteDriver(driverId);
    }
  };

  const handleEditDriver = (driver: any) => {
    setEditingDriver(driver);
    setEditForm({
      monthly_target: driver.monthly_target || 20,
      is_available: driver.is_available || true
    });
  };

  const handleSaveEdit = () => {
    if (editingDriver) {
      updateDriver(editingDriver.id, editForm);
      setEditingDriver(null);
      toast.success('Driver updated successfully');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
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

      {/* Fleet Overview */}
      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fleet Status ({drivers.length} drivers)
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
          <CardDescription>
            {userRole === 'driver' ? 'View fleet status and assignments' : 'Manage your fleet and assignments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No drivers registered yet. Drivers will appear here when they register.</p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredDrivers.map((driver, index) => (
                <div 
                  key={driver.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="font-mono text-base px-3 py-1 transition-all duration-200 hover:scale-110">
                      #{driver.serial_number.toString().padStart(3, '0')}
                    </Badge>
                    
                    <div>
                      <p className="font-medium text-lg transition-colors duration-200 hover:text-blue-600">
                        {driver.profile?.full_name || 'Unknown Driver'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {driver.monthly_trips}/{driver.monthly_target} trips
                        </span>
                        {driver.monthly_trips < driver.monthly_target && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            {driver.monthly_target - driver.monthly_trips} behind
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {driver.profile?.mobile_number}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {userRole === 'admin' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDriver(driver)}
                              className="transition-all duration-200 hover:scale-105"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Driver Details</DialogTitle>
                              <DialogDescription>
                                Update details for {driver.profile?.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="target" className="text-right">
                                  Monthly Target
                                </Label>
                                <Input
                                  id="target"
                                  type="number"
                                  value={editForm.monthly_target}
                                  onChange={(e) => setEditForm({...editForm, monthly_target: parseInt(e.target.value) || 20})}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="available" className="text-right">
                                  Available
                                </Label>
                                <Switch
                                  id="available"
                                  checked={editForm.is_available}
                                  onCheckedChange={(checked) => setEditForm({...editForm, is_available: checked})}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleSaveEdit}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDriver(driver.id, driver.profile?.full_name || 'Unknown Driver')}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium transition-colors duration-200">
                        {driver.is_online ? "Online" : "Offline"}
                      </span>
                      <Switch
                        checked={driver.is_online}
                        onCheckedChange={() => toggleAvailability(driver.id)}
                        className="transition-all duration-200 hover:scale-110"
                        disabled={userRole === 'driver'}
                      />
                    </div>
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${driver.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
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
