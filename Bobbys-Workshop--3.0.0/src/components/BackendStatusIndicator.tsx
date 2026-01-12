/**
 * BackendStatusIndicator
 * 
 * Displays status of both Node.js and Python backends
 * Shows warnings if backends are not available
 */

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { checkPythonBackendHealth, checkNodeBackendHealth } from '@/lib/apiConfig';

interface BackendStatus {
  node: boolean | null;
  python: boolean | null;
}

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendStatus>({ node: null, python: null });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBackends = async () => {
      setChecking(true);
      const [nodeHealthy, pythonHealthy] = await Promise.all([
        checkNodeBackendHealth(),
        checkPythonBackendHealth(),
      ]);
      setStatus({ node: nodeHealthy, python: pythonHealthy });
      setChecking(false);
    };

    checkBackends();
    const interval = setInterval(checkBackends, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (checking) {
    return (
      <Badge variant="outline" className="border-gray-400 text-gray-600">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Checking...
      </Badge>
    );
  }

  const allHealthy = status.node && status.python;
  const nodeOnly = status.node && !status.python;
  const pythonOnly = !status.node && status.python;
  const allDown = !status.node && !status.python;

  if (allHealthy) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Backends OK
      </Badge>
    );
  }

  if (nodeOnly) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600" title="Python backend (port 8000) not available. Secret Rooms features may not work. Start with: .\start-backend.ps1">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Node.js Only
      </Badge>
    );
  }

  if (pythonOnly) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600" title="Node.js backend (port 3001) not available. Some features may not work. Start with: npm run server:dev">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Python Only
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" title="Both backends are down. Start backends: .\start-all-backends.ps1 (or .\start-backend.ps1 + npm run server:dev)">
      <XCircle className="w-3 h-3 mr-1" />
      Backends Down
    </Badge>
  );
}
