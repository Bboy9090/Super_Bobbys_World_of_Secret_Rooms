/**
 * SecurityModule
 * 
 * Module content for security analysis and management
 * Connects to /api/v1/frp/*, /api/v1/mdm/*, /api/v1/security/* endpoints
 */

import React, { useState } from 'react';
import { Shield, Search, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface SecurityStatus {
  frp?: { locked: boolean; status: string };
  mdm?: { detected: boolean; profiles: string[] };
  root?: { detected: boolean; status: string };
  bootloader?: { unlocked: boolean; status: string };
}

export function SecurityModule() {
  const [deviceSerial, setDeviceSerial] = useState('');
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSecurity = async () => {
    if (!deviceSerial.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const status: SecurityStatus = {};

      try {
        const frpResponse = await fetch(getAPIUrl(`/api/v1/frp/detect?serial=${encodeURIComponent(deviceSerial)}`));
        if (frpResponse.ok) {
          const frpData = await frpResponse.json();
          if (frpData.ok && frpData.data) {
            status.frp = frpData.data;
          }
        }
      } catch (error) {
        console.error('FRP check error:', error);
      }

      try {
        const mdmResponse = await fetch(getAPIUrl(`/api/v1/mdm/detect?serial=${encodeURIComponent(deviceSerial)}`));
        if (mdmResponse.ok) {
          const mdmData = await mdmResponse.json();
          if (mdmData.ok && mdmData.data) {
            status.mdm = mdmData.data;
          }
        }
      } catch (error) {
        console.error('MDM check error:', error);
      }

      try {
        const rootResponse = await fetch(getAPIUrl(`/api/v1/security/root-detection/${encodeURIComponent(deviceSerial)}`));
        if (rootResponse.ok) {
          const rootData = await rootResponse.json();
          if (rootData.ok && rootData.data) {
            status.root = rootData.data;
          }
        }
      } catch (error) {
        console.error('Root check error:', error);
      }

      try {
        const bootResponse = await fetch(getAPIUrl(`/api/v1/security/bootloader-status/${encodeURIComponent(deviceSerial)}`));
        if (bootResponse.ok) {
          const bootData = await bootResponse.json();
          if (bootData.ok && bootData.data) {
            status.bootloader = bootData.data;
          }
        }
      } catch (error) {
        console.error('Bootloader check error:', error);
      }

      setSecurityStatus(status);
    } catch (error) {
      console.error('Security check error:', error);
      setError('Failed to check security status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h4 className="font-semibold text-white mb-2">Security Analysis</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
            placeholder="Device serial..."
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyPress={(e) => e.key === 'Enter' && checkSecurity()}
          />
          <button
            onClick={checkSecurity}
            disabled={loading || !deviceSerial.trim()}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Check
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {securityStatus ? (
          <>
            {securityStatus.frp && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">FRP Status</span>
                  </div>
                  {securityStatus.frp.locked ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {securityStatus.frp.status}
                </div>
              </div>
            )}

            {securityStatus.mdm && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">MDM Status</span>
                  </div>
                  {securityStatus.mdm.detected ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {securityStatus.mdm.detected
                    ? `Detected: ${securityStatus.mdm.profiles?.join(', ') || 'Unknown'}`
                    : 'No MDM profiles detected'}
                </div>
              </div>
            )}

            {securityStatus.root && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Root Status</span>
                  </div>
                  {securityStatus.root.detected ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {securityStatus.root.status}
                </div>
              </div>
            )}

            {securityStatus.bootloader && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-white text-sm">Bootloader Status</span>
                  </div>
                  {securityStatus.bootloader.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {securityStatus.bootloader.status}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter device serial to check security status</p>
          </div>
        )}
      </div>
    </div>
  );
}
