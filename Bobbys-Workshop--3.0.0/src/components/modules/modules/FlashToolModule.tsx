/**
 * FlashToolModule
 * 
 * Module content for multi-brand device flashing
 * Connects to /api/v1/flash/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { Flashlight, RefreshCw, Play, Pause, Square, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface FlashDevice {
  serial: string;
  brand: string;
  model: string;
  mode: string;
  capabilities: string[];
}

interface FlashJob {
  jobId: string;
  deviceSerial: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  partition?: string;
}

export function FlashToolModule() {
  const [devices, setDevices] = useState<FlashDevice[]>([]);
  const [activeJobs, setActiveJobs] = useState<FlashJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl('/api/v1/flash/devices'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data?.devices) {
          setDevices(data.data.devices);
        } else {
          setDevices([]);
        }
      } else {
        setDevices([]);
        setError('Failed to load flash devices');
      }
    } catch (error) {
      console.error('Device scan error:', error);
      setDevices([]);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveJobs = async () => {
    try {
      const response = await fetch(getAPIUrl('/api/v1/flash/operations/active'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data?.jobs) {
          setActiveJobs(data.data.jobs);
        }
      }
    } catch (error) {
      console.error('Failed to load active jobs:', error);
    }
  };

  const pauseJob = async (jobId: string) => {
    try {
      const response = await fetch(getAPIUrl(`/api/v1/flash/pause/${jobId}`), { method: 'POST' });
      if (response.ok) {
        loadActiveJobs();
      }
    } catch (error) {
      console.error('Failed to pause job:', error);
    }
  };

  const resumeJob = async (jobId: string) => {
    try {
      const response = await fetch(getAPIUrl(`/api/v1/flash/resume/${jobId}`), { method: 'POST' });
      if (response.ok) {
        loadActiveJobs();
      }
    } catch (error) {
      console.error('Failed to resume job:', error);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const response = await fetch(getAPIUrl(`/api/v1/flash/cancel/${jobId}`), { method: 'POST' });
      if (response.ok) {
        loadActiveJobs();
      }
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  useEffect(() => {
    scanDevices();
    loadActiveJobs();
    const interval = setInterval(() => {
      scanDevices();
      loadActiveJobs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">Flash Operations</h4>
        <button
          onClick={scanDevices}
          disabled={loading}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="Refresh devices"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        <div className="text-xs text-gray-500 mb-2">Available Devices</div>
        {devices.length === 0 && !loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <p>No devices available for flashing</p>
          </div>
        ) : (
          devices.map((device) => (
            <button
              key={device.serial}
              onClick={() => setSelectedDevice(device.serial)}
              className={`w-full p-2 bg-gray-800/50 border rounded-lg text-left transition-colors ${
                selectedDevice === device.serial
                  ? 'border-cyan-500 bg-cyan-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{device.brand} {device.model}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{device.serial} - {device.mode}</div>
                </div>
                <Flashlight className="w-4 h-4 text-cyan-400" />
              </div>
            </button>
          ))
        )}
      </div>

      {activeJobs.length > 0 && (
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="text-xs text-gray-500 mb-2">Active Flash Jobs</div>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div
                key={job.jobId}
                className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {job.status === 'running' ? (
                      <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                    ) : job.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : job.status === 'error' ? (
                      <XCircle className="w-3 h-3 text-red-400" />
                    ) : null}
                    <span className="text-xs font-medium text-white">{job.deviceSerial}</span>
                    {job.partition && (
                      <span className="text-xs text-gray-400">- {job.partition}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {job.status === 'running' ? (
                      <button
                        onClick={() => pauseJob(job.jobId)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Pause"
                      >
                        <Pause className="w-3 h-3 text-gray-400" />
                      </button>
                    ) : job.status === 'paused' ? (
                      <button
                        onClick={() => resumeJob(job.jobId)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Resume"
                      >
                        <Play className="w-3 h-3 text-gray-400" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => cancelJob(job.jobId)}
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Cancel"
                    >
                      <Square className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
                {job.status === 'running' && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{job.progress}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
