/**
 * Device Trust State Module
 * 
 * Module for device trust state profiling and authorization status
 */

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertCircle, RefreshCw, Lock, Unlock } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface TrustState {
  platform: 'ios' | 'android' | 'unknown';
  lockType: string;
  lockStatus: string;
  adbAuthorized: boolean;
  fastbootUnlocked: boolean;
  iosPaired: boolean;
  bootloaderStatus?: string;
}

export function DeviceTrustModule() {
  const [trustState, setTrustState] = useState<TrustState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessTrust = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check Android devices
      const adbResponse = await fetch(getAPIUrl('/api/v1/adb/devices'));
      const fastbootResponse = await fetch(getAPIUrl('/api/v1/fastboot/devices'));
      
      // Check iOS devices
      const iosResponse = await fetch(getAPIUrl('/api/v1/ios/scan'));

      if (adbResponse.ok) {
        const adbData = await adbResponse.json();
        if (adbData.ok && adbData.data?.devices?.length > 0) {
          const device = adbData.data.devices[0];
          setTrustState({
            platform: 'android',
            lockType: 'frp',
            lockStatus: 'unknown',
            adbAuthorized: device.state === 'device',
            fastbootUnlocked: false,
            iosPaired: false,
            bootloaderStatus: 'unknown',
          });
        }
      }

      if (iosResponse.ok) {
        const iosData = await iosResponse.json();
        if (iosData.ok && iosData.data?.devices?.length > 0) {
          setTrustState({
            platform: 'ios',
            lockType: 'icloud',
            lockStatus: 'unknown',
            adbAuthorized: false,
            fastbootUnlocked: false,
            iosPaired: true,
          });
        }
      }
    } catch (error) {
      console.error('Trust assessment error:', error);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    assessTrust();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Device Trust State
          </h4>
          <button
            onClick={assessTrust}
            disabled={loading}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && !trustState ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
          <p>Assessing trust state...</p>
        </div>
      ) : trustState ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Platform</div>
            <div className="text-xs text-white capitalize">{trustState.platform}</div>
          </div>

          {trustState.platform === 'android' && (
            <>
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">ADB Authorized</span>
                  {trustState.adbAuthorized ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="text-xs text-gray-300">
                  {trustState.adbAuthorized ? 'Device is authorized' : 'Device is not authorized'}
                </div>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Bootloader</span>
                  {trustState.bootloaderStatus === 'unlocked' ? (
                    <Unlock className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="text-xs text-gray-300 capitalize">
                  {trustState.bootloaderStatus || 'Unknown'}
                </div>
              </div>
            </>
          )}

          {trustState.platform === 'ios' && (
            <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Device Paired</span>
                {trustState.iosPaired ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-xs text-gray-300">
                {trustState.iosPaired ? 'Device is paired/trusted' : 'Device is not paired'}
              </div>
            </div>
          )}

          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Lock Type</div>
            <div className="text-xs text-gray-300 capitalize">{trustState.lockType || 'None'}</div>
          </div>

          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Lock Status</div>
            <div className="text-xs text-gray-300 capitalize">{trustState.lockStatus || 'Unknown'}</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No device detected</p>
        </div>
      )}
    </div>
  );
}
