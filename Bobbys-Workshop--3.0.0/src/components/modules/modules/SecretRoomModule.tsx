/**
 * SecretRoomModule
 * 
 * Module content for secret room features
 * Connects to /api/v1/trapdoor/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface SecretRoom {
  name: string;
  description: string;
  endpoint: string;
  available: boolean;
  requiresAuth: boolean;
}

export function SecretRoomModule() {
  const [secretRooms, setSecretRooms] = useState<SecretRoom[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const passcode = localStorage.getItem('secret-room-passcode');
      const response = await fetch(getAPIUrl('/api/v1/trapdoor/status'), {
        headers: passcode ? { 'X-Secret-Room-Passcode': passcode } : {},
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setAuthenticated(data.data.authenticated || false);
          if (data.data.secretRooms) {
            const rooms: SecretRoom[] = Object.entries(data.data.secretRooms).map(([key, value]: [string, any]) => ({
              name: key.replace(/([A-Z])/g, ' $1').trim(),
              description: '',
              endpoint: `/api/v1/trapdoor/${key}`,
              available: value.available || false,
              requiresAuth: value.requiresAuth || false,
            }));
            setSecretRooms(rooms);
          }
        }
      } else {
        setError('Failed to check status');
      }
    } catch (error) {
      console.error('Failed to check secret room status:', error);
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {authenticated ? (
            <Unlock className="w-5 h-5 text-green-400" />
          ) : (
            <Lock className="w-5 h-5 text-red-400" />
          )}
          <h4 className="font-semibold text-white">Secret Rooms</h4>
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <Shield className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {!authenticated && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="text-xs text-red-400">
            Authentication required. Set secret room passcode to access.
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && secretRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Lock className="w-8 h-8 mx-auto mb-2 animate-pulse opacity-50" />
            <p>Checking secret rooms...</p>
          </div>
        ) : secretRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No secret rooms available</p>
          </div>
        ) : (
          secretRooms.map((room, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg transition-colors ${
                room.available && authenticated
                  ? 'bg-gray-800/50 border-cyan-700 hover:border-cyan-500'
                  : 'bg-gray-800/30 border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Lock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    room.available && authenticated ? 'text-cyan-400' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{room.name}</div>
                    {room.description && (
                      <div className="text-xs text-gray-400 mt-0.5">{room.description}</div>
                    )}
                  </div>
                </div>
                {room.available && authenticated ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        {authenticated ? 'Authenticated' : 'Not authenticated'} • {secretRooms.filter(r => r.available).length} rooms available
      </div>
    </div>
  );
}
