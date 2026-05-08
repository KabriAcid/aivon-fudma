import React, { useEffect, useState } from "react";
import { Activity, AlertCircle, Check } from "lucide-react";

interface BackendStatus {
  nodejs: {
    connected: boolean;
    latency: number | null;
    lastCheck: Date | null;
  };
  python: {
    connected: boolean;
    latency: number | null;
    lastCheck: Date | null;
  };
  activeBackend: "nodejs" | "python" | "offline";
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    nodejs: {
      connected: false,
      latency: null,
      lastCheck: null,
    },
    python: {
      connected: false,
      latency: null,
      lastCheck: null,
    },
    activeBackend: "offline",
  });

  useEffect(() => {
    const checkBackends = async () => {
      // Check Node.js backend
      const nodejsStart = performance.now();
      try {
        const nodeResponse = await fetch("/api/health", {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        const nodejsLatency = performance.now() - nodejsStart;

        setStatus((prev) => ({
          ...prev,
          nodejs: {
            connected: nodeResponse.ok,
            latency: nodeResponse.ok ? Math.round(nodejsLatency) : null,
            lastCheck: new Date(),
          },
        }));
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          nodejs: {
            connected: false,
            latency: null,
            lastCheck: new Date(),
          },
        }));
      }

      // Check Python backend
      const pythonStart = performance.now();
      try {
        const pythonResponse = await fetch("http://localhost:5000/health", {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        const pythonLatency = performance.now() - pythonStart;

        setStatus((prev) => ({
          ...prev,
          python: {
            connected: pythonResponse.ok,
            latency: pythonResponse.ok ? Math.round(pythonLatency) : null,
            lastCheck: new Date(),
          },
          activeBackend: pythonResponse.ok ? "python" : prev.nodejs.connected ? "nodejs" : "offline",
        }));
      } catch (err) {
        setStatus((prev) => ({
          ...prev,
          python: {
            connected: false,
            latency: null,
            lastCheck: new Date(),
          },
          activeBackend: prev.nodejs.connected ? "nodejs" : "offline",
        }));
      }
    };

    // Check immediately and then every 5 seconds
    checkBackends();
    const interval = setInterval(checkBackends, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Backend Status Indicator Component
 * Shows real-time connection status for debugging
 */
export function BackendStatusIndicator(): React.JSX.Element {
  const status = useBackendStatus();

  const getStatusColor = (connected: boolean) => {
    return connected ? "text-green-500" : "text-red-500";
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <Check className="w-4 h-4" />
    ) : (
      <AlertCircle className="w-4 h-4" />
    );
  };

  return (
    <div className="fixed bottom-4 right-4 bg-surface/90 border border-border rounded-lg p-4 w-80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          System Status
        </h3>
        <span
          className={`text-xs font-mono ${
            status.activeBackend === "offline"
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {status.activeBackend.toUpperCase()}
        </span>
      </div>

      {/* Node.js Backend Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.nodejs.connected)}
            <span className={getStatusColor(status.nodejs.connected)}>
              Node.js API
            </span>
          </div>
          {status.nodejs.latency && (
            <span className="text-text-secondary font-mono">
              {status.nodejs.latency}ms
            </span>
          )}
        </div>

        {/* Python Backend Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.python.connected)}
            <span className={getStatusColor(status.python.connected)}>
              Python Service
            </span>
          </div>
          {status.python.latency && (
            <span className="text-text-secondary font-mono">
              {status.python.latency}ms
            </span>
          )}
        </div>

        {/* Active Backend Info */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-text-secondary">
            {status.activeBackend === "nodejs" && "✅ Using Node.js backend"}
            {status.activeBackend === "python" && "✅ Using Python service"}
            {status.activeBackend === "offline" && "❌ No backend available"}
          </p>
        </div>

        {/* Last Check Time */}
        {status.nodejs.lastCheck && (
          <p className="text-[10px] text-text-secondary/50 font-mono">
            Last: {status.nodejs.lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
