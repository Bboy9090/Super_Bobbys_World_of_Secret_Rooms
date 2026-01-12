/**
 * ModulePalette
 * 
 * Palette of available modules that can be added to the canvas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Flashlight,
  Laptop,
  Shield,
  Monitor,
  Workflow,
  HardDrive,
  Terminal,
  Lock,
  Settings,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Apple,
} from 'lucide-react';
import { ModuleType } from './ModuleNode';

export interface ModuleTemplate {
  type: ModuleType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  defaultSize?: { width: number; height: number };
  defaultConfig?: Record<string, any>;
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  // Device Management
  {
    type: 'device-manager',
    title: 'Device Manager',
    description: 'Detect, manage, and monitor devices',
    icon: Smartphone,
    category: 'Devices',
    defaultSize: { width: 320, height: 400 },
  },
  {
    type: 'ios-ops',
    title: 'iOS Operations',
    description: 'iOS device management and operations',
    icon: Laptop,
    category: 'Devices',
    defaultSize: { width: 320, height: 400 },
  },
  
  // Flashing & Firmware
  {
    type: 'flash-tool',
    title: 'Flash Tool',
    description: 'Multi-brand device flashing',
    icon: Flashlight,
    category: 'Flashing',
    defaultSize: { width: 360, height: 500 },
  },
  {
    type: 'firmware',
    title: 'Firmware Library',
    description: 'Browse and manage firmware files',
    icon: HardDrive,
    category: 'Flashing',
    defaultSize: { width: 400, height: 500 },
  },
  
  // Security & Monitoring
  {
    type: 'security',
    title: 'Security Center',
    description: 'Security analysis and management',
    icon: Shield,
    category: 'Security',
    defaultSize: { width: 320, height: 400 },
  },
  {
    type: 'monitoring',
    title: 'System Monitor',
    description: 'Real-time device monitoring',
    icon: Monitor,
    category: 'Monitoring',
    defaultSize: { width: 360, height: 450 },
  },
  
  // Workflows & Automation
  {
    type: 'workflow',
    title: 'Workflow Engine',
    description: 'Automated workflows and scripts',
    icon: Workflow,
    category: 'Automation',
    defaultSize: { width: 400, height: 500 },
  },
  
  // Diagnostics
  {
    type: 'diagnostics',
    title: 'Diagnostics',
    description: 'Device diagnostics and testing',
    icon: Terminal,
    category: 'Tools',
    defaultSize: { width: 320, height: 400 },
  },
  
  // Secret Rooms
  {
    type: 'secret-room',
    title: 'Secret Room',
    description: 'Access secret room features',
    icon: Lock,
    category: 'Secret Rooms',
    defaultSize: { width: 360, height: 500 },
  },
  
  // Recovery & Trust
  {
    type: 'apple-access-recovery',
    title: 'Apple Access Recovery',
    description: 'Apple device recovery assistance',
    icon: Apple,
    category: 'Recovery',
    defaultSize: { width: 320, height: 450 },
  },
  {
    type: 'device-trust',
    title: 'Device Trust State',
    description: 'Device trust and authorization profiling',
    icon: Shield,
    category: 'Security',
    defaultSize: { width: 320, height: 400 },
  },
];

interface ModulePaletteProps {
  onModuleSelect?: (template: ModuleTemplate) => void;
  visible?: boolean;
  onClose?: () => void;
}

export function ModulePalette({ onModuleSelect, visible = true, onClose }: ModulePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Devices', 'Flashing', 'Security'])
  );

  const categories = Array.from(new Set(MODULE_TEMPLATES.map((m) => m.category)));
  
  const filteredTemplates = MODULE_TEMPLATES.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTemplates = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter((t) => t.category === category);
    return acc;
  }, {} as Record<string, ModuleTemplate[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleModuleClick = (template: ModuleTemplate) => {
    onModuleSelect?.(template);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">Module Palette</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => {
          const templates = groupedTemplates[category];
          if (templates.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="border-b border-gray-800">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-semibold text-gray-300">{category}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.type}
                          onClick={() => handleModuleClick(template)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors text-left group"
                        >
                          <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-900/30 transition-colors flex-shrink-0">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                              {template.title}
                            </div>
                            <div className="text-sm text-gray-400 mt-0.5">
                              {template.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        {MODULE_TEMPLATES.length} modules available
      </div>
    </motion.div>
  );
}
