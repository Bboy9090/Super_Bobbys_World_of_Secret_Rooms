/**
 * Apple Access Recovery Module
 * 
 * Module for Apple device recovery assistance (read-only diagnostics and official recovery handoff)
 */

import React, { useState, useEffect } from 'react';
import { Apple, Lock, Unlock, FileText, Download, ExternalLink, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface ActivationState {
  activationLock: 'likely_enabled' | 'likely_not_enabled' | 'unknown';
  findMy: 'on' | 'off' | 'unknown';
  supervision: 'supervised' | 'unsupervised' | 'unknown';
  mdm: 'enrolled' | 'not_enrolled' | 'unknown';
}

export function AppleAccessRecoveryModule() {
  const [activationState, setActivationState] = useState<ActivationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl('/api/v1/trapdoor/status'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setActivationState({
            activationLock: data.data.activationLock ? 'likely_enabled' : 'likely_not_enabled',
            findMy: data.data.findMy ? 'on' : 'off',
            supervision: data.data.supervision ? 'supervised' : 'unsupervised',
            mdm: data.data.mdm ? 'enrolled' : 'not_enrolled',
          });
        }
      } else {
        setError('Failed to assess activation status');
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Apple className="w-4 h-4 text-cyan-400" />
            Apple Access Recovery
          </h4>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mb-2">
          Read-only diagnostics and official recovery guidance. No bypass actions.
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && !activationState ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
          <p>Assessing activation status...</p>
        </div>
      ) : activationState ? (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Activation Lock</span>
              {activationState.activationLock === 'likely_enabled' ? (
                <Lock className="w-4 h-4 text-red-400" />
              ) : activationState.activationLock === 'likely_not_enabled' ? (
                <Unlock className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div className="text-xs text-gray-300 capitalize">
              {activationState.activationLock.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Find My</div>
            <div className="text-xs text-gray-300 capitalize">
              {activationState.findMy === 'on' ? 'Enabled' : activationState.findMy === 'off' ? 'Disabled' : 'Unknown'}
            </div>
          </div>

          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Supervision</div>
            <div className="text-xs text-gray-300 capitalize">
              {activationState.supervision === 'supervised' ? 'Supervised' : activationState.supervision === 'unsupervised' ? 'Not Supervised' : 'Unknown'}
            </div>
          </div>

          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">MDM Enrollment</div>
            <div className="text-xs text-gray-300 capitalize">
              {activationState.mdm === 'enrolled' ? 'Enrolled' : activationState.mdm === 'not_enrolled' ? 'Not Enrolled' : 'Unknown'}
            </div>
          </div>

          <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-700 rounded-lg">
            <div className="text-xs text-cyan-400 mb-2 font-medium">Official Recovery Options</div>
            <div className="space-y-2">
              <a
                href="https://iforgot.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Apple Account Recovery
              </a>
              <a
                href="https://support.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Apple Support
              </a>
              <a
                href="https://support.apple.com/activation-lock"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Activation Lock Support
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Apple className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No iOS device detected</p>
        </div>
      )}
    </div>
  );
}
