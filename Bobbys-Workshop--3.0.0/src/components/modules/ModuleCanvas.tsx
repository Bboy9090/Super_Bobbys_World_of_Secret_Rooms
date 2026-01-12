/**
 * ModuleCanvas
 * 
 * Canvas for the node-based modular GUI system
 * Handles node placement, connections, and workspace management
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleNode, ModuleNodeProps, ModuleType, ModuleStatus } from './ModuleNode';
import { ModuleRenderer } from './ModuleRenderer';
import { ZoomIn, ZoomOut, Maximize2, Grid, Plus, Trash2, Save, FolderOpen } from 'lucide-react';

export interface NodeData extends Omit<ModuleNodeProps, 'position' | 'onSelect' | 'onMove' | 'onResize' | 'onMinimize' | 'onMaximize' | 'onClose' | 'onConnect'> {
  position: { x: number; y: number };
  connections?: string[];
}

interface ModuleCanvasProps {
  nodes: NodeData[];
  onNodeUpdate?: (id: string, updates: Partial<NodeData>) => void;
  onNodeAdd?: (type: ModuleType, position: { x: number; y: number }) => void;
  onNodeDelete?: (id: string) => void;
  onNodeConnect?: (fromId: string, toId: string) => void;
  backgroundPattern?: boolean;
  gridSize?: number;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export function ModuleCanvas({
  nodes,
  onNodeUpdate,
  onNodeAdd,
  onNodeDelete,
  onNodeConnect,
  backgroundPattern = true,
  gridSize = 20,
  minZoom = 0.25,
  maxZoom = 2,
  initialZoom = 1,
}: ModuleCanvasProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(minZoom, Math.min(maxZoom, prev * delta)));
    }
  }, [minZoom, maxZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      e.preventDefault();
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const handleNodeMove = useCallback((id: string, position: { x: number; y: number }) => {
    onNodeUpdate?.(id, { position });
  }, [onNodeUpdate]);

  const handleNodeSelect = useCallback((id: string) => {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }, []);

  const handleNodeClose = useCallback((id: string) => {
    onNodeDelete?.(id);
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [onNodeDelete, selectedNodeId]);

  const handleNodeMinimize = useCallback((id: string) => {
    onNodeUpdate?.(id, { minimized: true });
  }, [onNodeUpdate]);

  const handleNodeMaximize = useCallback((id: string) => {
    onNodeUpdate?.(id, { minimized: false });
  }, [onNodeUpdate]);

  const handleNodeConnect = useCallback((id: string) => {
    if (connectionStart) {
      if (connectionStart !== id) {
        onNodeConnect?.(connectionStart, id);
      }
      setConnectionStart(null);
    } else {
      setConnectionStart(id);
    }
  }, [connectionStart, onNodeConnect]);

  const handleZoomIn = () => setZoom((prev) => Math.min(maxZoom, prev * 1.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(minZoom, prev / 1.2));
  const handleZoomReset = () => setZoom(initialZoom);
  const handleZoomFit = () => {
    // TODO: Calculate fit to view
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gray-950 canvas-background"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      {/* Background Grid */}
      {backgroundPattern && (
        <div
          className="absolute inset-0 canvas-background"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(100, 100, 100, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100, 100, 100, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />
      )}

      {/* Canvas Container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <AnimatePresence>
          {nodes.map((node) => (
            <ModuleNode
              key={node.id}
              {...node}
              selected={selectedNodeId === node.id}
              onSelect={handleNodeSelect}
              onMove={handleNodeMove}
              onMinimize={handleNodeMinimize}
              onMaximize={handleNodeMaximize}
              onClose={handleNodeClose}
              onConnect={handleNodeConnect}
            >
              <ModuleRenderer type={node.type} config={node.config} />
            </ModuleNode>
          ))}
        </AnimatePresence>

        {/* Connection Lines */}
        {nodes.map((node) =>
          node.connections?.map((targetId) => {
            const target = nodes.find((n) => n.id === targetId);
            if (!target) return null;
            return (
              <svg
                key={`${node.id}-${targetId}`}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <line
                  x1={node.position.x + (node.size?.width || 280) / 2}
                  y1={node.position.y + (node.size?.height || 200)}
                  x2={target.position.x + (target.size?.width || 280) / 2}
                  y2={target.position.y}
                  stroke="rgba(45, 212, 255, 0.5)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </svg>
            );
          })
        )}

        {/* Arrow marker definition */}
        <svg className="absolute" width="0" height="0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="rgba(45, 212, 255, 0.5)"
              />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 flex flex-col gap-1">
          <button
            onClick={handleZoomFit}
            className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Fit to View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-400 z-50">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
