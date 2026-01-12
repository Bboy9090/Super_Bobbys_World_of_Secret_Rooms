/**
 * ModuleNode
 * 
 * Core node component for the modular node-based GUI system
 * Each node represents a module/feature that can be connected and configured
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Smartphone, 
  Laptop, 
  Settings, 
  Lock, 
  Unlock,
  Flashlight,
  Database,
  Workflow,
  Headphones,
  EyeOff,
  Archive,
  Wrench,
  Shield,
  Monitor,
  FileCode,
  BarChart3,
  HardDrive,
  Network,
  Terminal,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  GripVertical,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Play,
  Pause,
  Square
} from 'lucide-react';

export type ModuleType = 
  | 'device-manager'
  | 'flash-tool'
  | 'ios-ops'
  | 'security'
  | 'monitoring'
  | 'workflow'
  | 'firmware'
  | 'diagnostics'
  | 'secret-room'
  | 'apple-access-recovery'
  | 'device-trust'
  | 'custom';

export type ModuleStatus = 'idle' | 'active' | 'running' | 'success' | 'error' | 'warning';

export interface ModuleNodeProps {
  id: string;
  type: ModuleType;
  title: string;
  description?: string;
  status?: ModuleStatus;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  onResize?: (id: string, size: { width: number; height: number }) => void;
  onMinimize?: (id: string) => void;
  onMaximize?: (id: string) => void;
  onClose?: (id: string) => void;
  onConnect?: (id: string) => void;
  children?: React.ReactNode;
  config?: Record<string, any>;
  connections?: string[]; // IDs of connected nodes
}

const MODULE_ICONS: Record<ModuleType, React.ComponentType<any>> = {
  'device-manager': Smartphone,
  'flash-tool': Flashlight,
  'ios-ops': Laptop,
  'security': Shield,
  'monitoring': Monitor,
  'workflow': Workflow,
  'firmware': HardDrive,
  'diagnostics': Terminal,
  'secret-room': Lock,
  'custom': Settings,
};

const STATUS_COLORS: Record<ModuleStatus, string> = {
  'idle': 'border-gray-600 bg-gray-800/50',
  'active': 'border-blue-500 bg-blue-900/20',
  'running': 'border-cyan-500 bg-cyan-900/20',
  'success': 'border-green-500 bg-green-900/20',
  'error': 'border-red-500 bg-red-900/20',
  'warning': 'border-yellow-500 bg-yellow-900/20',
};

function Circle({ className }: { className?: string }) {
  return <div className={`w-2 h-2 rounded-full ${className || 'bg-gray-500'}`} />;
}

const STATUS_ICONS: Record<ModuleStatus, React.ComponentType<any>> = {
  'idle': Circle,
  'active': CheckCircle2,
  'running': Loader2,
  'success': CheckCircle2,
  'error': XCircle,
  'warning': AlertTriangle,
};

export function ModuleNode({
  id,
  type,
  title,
  description,
  status = 'idle',
  position,
  size = { width: 280, height: 200 },
  minimized = false,
  selected = false,
  onSelect,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  onClose,
  onConnect,
  children,
  config,
  connections = [],
}: ModuleNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const Icon = MODULE_ICONS[type] || Settings;
  const StatusIcon = STATUS_ICONS[status];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.node-handle')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      onSelect?.(id);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      onMove?.(id, newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`absolute ${STATUS_COLORS[status]} ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : ''
      } rounded-lg border-2 shadow-xl backdrop-blur-sm`}
      style={{
        width: minimized ? 280 : size.width,
        height: minimized ? 60 : size.height,
        zIndex: selected ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="node-handle flex items-center justify-between px-3 py-2 cursor-move border-b border-gray-700/50 bg-gray-900/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0 text-cyan-400" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            {!minimized && description && (
              <p className="text-xs text-gray-400 truncate">{description}</p>
            )}
          </div>
          <StatusIcon 
            className={`w-4 h-4 flex-shrink-0 ${
              status === 'running' ? 'animate-spin text-cyan-400' :
              status === 'success' ? 'text-green-400' :
              status === 'error' ? 'text-red-400' :
              status === 'warning' ? 'text-yellow-400' :
              'text-gray-400'
            }`}
          />
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {onConnect && (
            <button
              onClick={() => onConnect(id)}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors"
              title="Connect to other nodes"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
          {minimized ? (
            onMaximize && (
              <button
                onClick={() => onMaximize(id)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Expand"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )
          ) : (
            onMinimize && (
              <button
                onClick={() => onMinimize(id)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            )
          )}
          {onClose && (
            <button
              onClick={() => onClose(id)}
              className="p-1 hover:bg-red-700 rounded text-gray-400 hover:text-red-400 transition-colors"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div className="p-3 h-[calc(100%-52px)] overflow-auto">
          {children || (
            <div className="text-sm text-gray-400 text-center py-8">
              Module content
            </div>
          )}
        </div>
      )}

      {/* Connection Points */}
      {!minimized && connections.length > 0 && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {connections.map((connId) => (
            <div
              key={connId}
              className="w-2 h-2 rounded-full bg-cyan-400 border-2 border-gray-900"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
