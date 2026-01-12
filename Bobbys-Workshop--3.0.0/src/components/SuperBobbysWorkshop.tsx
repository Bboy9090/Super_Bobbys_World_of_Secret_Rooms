/**
 * SuperBobbysWorkshop
 * 
 * The NEW modular node-based GUI wrapper for Bobby's Workshop
 * A fresh design that brings all features to life as connectable modules
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ModuleCanvas, NodeData } from './modules/ModuleCanvas';
import { ModulePalette, ModuleTemplate } from './modules/ModulePalette';
import { ModuleType, ModuleStatus } from './modules/ModuleNode';
import { Menu, X, Save, FolderOpen, Settings, Maximize2 } from 'lucide-react';

interface SuperBobbysWorkshopProps {
  onClose?: () => void;
}

export function SuperBobbysWorkshop({ onClose }: SuperBobbysWorkshopProps) {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [showPalette, setShowPalette] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nextNodeId, setNextNodeId] = useState(1);

  // Load default nodes on mount
  useEffect(() => {
    const defaultNodes: NodeData[] = [
      {
        id: 'node-1',
        type: 'device-manager',
        title: 'Device Manager',
        description: 'Manage all connected devices',
        status: 'idle',
        position: { x: 100, y: 100 },
        size: { width: 320, height: 400 },
        minimized: false,
        connections: [],
      },
      {
        id: 'node-2',
        type: 'flash-tool',
        title: 'Flash Tool',
        description: 'Multi-brand device flashing',
        status: 'idle',
        position: { x: 500, y: 100 },
        size: { width: 360, height: 500 },
        minimized: false,
        connections: ['node-1'],
      },
      {
        id: 'node-3',
        type: 'monitoring',
        title: 'System Monitor',
        description: 'Real-time device monitoring',
        status: 'idle',
        position: { x: 100, y: 600 },
        size: { width: 360, height: 450 },
        minimized: false,
        connections: [],
      },
    ];
    setNodes(defaultNodes);
    setNextNodeId(4);
  }, []);

  const handleNodeUpdate = useCallback((id: string, updates: Partial<NodeData>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  }, []);

  const handleNodeAdd = useCallback((template: ModuleTemplate, position: { x: number; y: number }) => {
    const newNode: NodeData = {
      id: `node-${nextNodeId}`,
      type: template.type,
      title: template.title,
      description: template.description,
      status: 'idle',
      position,
      size: template.defaultSize || { width: 280, height: 200 },
      minimized: false,
      connections: [],
      config: template.defaultConfig,
    };
    setNodes((prev) => [...prev, newNode]);
    setNextNodeId((prev) => prev + 1);
  }, [nextNodeId]);

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    // Remove connections to this node
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        connections: node.connections?.filter((connId) => connId !== id) || [],
      }))
    );
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const handleNodeConnect = useCallback((fromId: string, toId: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === fromId
          ? {
              ...node,
              connections: [...(node.connections || []), toId],
            }
          : node
      )
    );
  }, []);

  const handleModuleSelect = useCallback((template: ModuleTemplate) => {
    // Place new node at center of canvas
    const position = {
      x: window.innerWidth / 2 - (template.defaultSize?.width || 280) / 2,
      y: window.innerHeight / 2 - (template.defaultSize?.height || 200) / 2,
    };
    handleNodeAdd(template, position);
  }, [handleNodeAdd]);

  const handleSave = useCallback(() => {
    const workspace = {
      nodes,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    const dataStr = JSON.stringify(workspace, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bobbys-workshop-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workspace = JSON.parse(event.target?.result as string);
            if (workspace.nodes) {
              setNodes(workspace.nodes);
              const maxId = Math.max(
                ...workspace.nodes.map((n: NodeData) =>
                  parseInt(n.id.replace('node-', '')) || 0
                )
              );
              setNextNodeId(maxId + 1);
            }
          } catch (error) {
            console.error('Failed to load workspace:', error);
            alert('Failed to load workspace file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-950 text-white flex flex-col z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
            🔥 Super Bobby's World
          </h1>
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
            Treasure Trash Edition
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPalette(!showPalette)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            title="Toggle Module Palette"
          >
            <Menu className="w-4 h-4" />
            Modules
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            title="Save Workspace"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleLoad}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            title="Load Workspace"
          >
            <FolderOpen className="w-4 h-4" />
            Load
          </button>
          <button
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded-lg text-sm transition-colors flex items-center gap-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Module Palette */}
        <ModulePalette
          visible={showPalette}
          onModuleSelect={handleModuleSelect}
          onClose={() => setShowPalette(false)}
        />

        {/* Canvas */}
        <div className={`absolute inset-0 ${showPalette ? 'left-80' : 'left-0'} transition-all`}>
          <ModuleCanvas
            nodes={nodes}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onNodeConnect={handleNodeConnect}
            backgroundPattern={true}
            gridSize={20}
            minZoom={0.25}
            maxZoom={2}
            initialZoom={1}
          />
        </div>

        {/* Node Count Indicator */}
        <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-400 z-50">
          {nodes.length} module{nodes.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
