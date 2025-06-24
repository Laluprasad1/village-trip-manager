
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DriverPortal } from "@/components/DriverPortal";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { userRole, loading, authError, initialLoadComplete } = useAuth();

  // Handle initial loading state
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Initializing your session...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
          <p className="text-red-500">{authError}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your role...</p>
        </div>
      </div>
    );
  }

  return userRole === 'admin' ? <AdminDashboard /> : <DriverPortal />;
};

export default Index;
