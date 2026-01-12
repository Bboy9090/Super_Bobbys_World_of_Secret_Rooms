/**
 * FirmwareModule
 * 
 * Module content for firmware library management
 * Connects to /api/v1/firmware/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { HardDrive, Search, Download, RefreshCw, Database } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface FirmwareBrand {
  name: string;
  models: string[];
  count: number;
}

interface FirmwareStats {
  totalFirmware: number;
  totalSize: number;
  brands: number;
}

export function FirmwareModule() {
  const [brands, setBrands] = useState<FirmwareBrand[]>([]);
  const [stats, setStats] = useState<FirmwareStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAPIUrl('/api/v1/firmware/library/brands'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data?.brands) {
          setBrands(data.data.brands);
        } else {
          setBrands([]);
        }
      } else {
        setBrands([]);
        setError('Failed to load brands');
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
      setBrands([]);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(getAPIUrl('/api/v1/firmware/library/stats'));
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadBrands();
    loadStats();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white">Firmware Library</h4>
          <button
            onClick={() => {
              loadBrands();
              loadStats();
            }}
            disabled={loading}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands..."
            className="w-full pl-10 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <div className="mb-3 p-2 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">{stats.totalFirmware} firmware</span>
            </div>
            <div className="text-gray-400">{stats.brands} brands</div>
            <div className="text-gray-400">
              {Math.round(stats.totalSize / 1024 / 1024 / 1024)} GB total
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && brands.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
            <p>Loading firmware library...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{searchQuery ? 'No brands found' : 'No firmware brands available'}</p>
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <div
              key={brand.name}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <HardDrive className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{brand.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {brand.count} firmware {brand.count !== 1 ? 'files' : 'file'}
                      {brand.models.length > 0 && ` • ${brand.models.length} models`}
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
