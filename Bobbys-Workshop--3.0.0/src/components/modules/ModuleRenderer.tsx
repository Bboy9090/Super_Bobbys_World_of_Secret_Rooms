/**
 * ModuleRenderer
 * 
 * Renders the appropriate module content based on module type
 */

import React from 'react';
import { ModuleType } from './ModuleNode';
import { DeviceManagerModule } from './modules/DeviceManagerModule';
import { FlashToolModule } from './modules/FlashToolModule';
import { IOSOperationsModule } from './modules/IOSOperationsModule';
import { SecurityModule } from './modules/SecurityModule';
import { MonitoringModule } from './modules/MonitoringModule';
import { WorkflowModule } from './modules/WorkflowModule';
import { FirmwareModule } from './modules/FirmwareModule';
import { DiagnosticsModule } from './modules/DiagnosticsModule';
import { SecretRoomModule } from './modules/SecretRoomModule';
import { AppleAccessRecoveryModule } from './modules/AppleAccessRecoveryModule';
import { DeviceTrustModule } from './modules/DeviceTrustModule';

interface ModuleRendererProps {
  type: ModuleType;
  config?: Record<string, any>;
}

export function ModuleRenderer({ type, config }: ModuleRendererProps) {
  switch (type) {
    case 'device-manager':
      return <DeviceManagerModule />;
    
    case 'flash-tool':
      return <FlashToolModule />;
    
    case 'ios-ops':
      return <IOSOperationsModule />;
    
    case 'security':
      return <SecurityModule />;
    
    case 'monitoring':
      return <MonitoringModule />;
    
    case 'workflow':
      return <WorkflowModule />;
    
    case 'firmware':
      return <FirmwareModule />;
    
    case 'diagnostics':
      return <DiagnosticsModule />;
    
    case 'secret-room':
      return <SecretRoomModule />;
    
    case 'apple-access-recovery':
      return <AppleAccessRecoveryModule />;
    
    case 'device-trust':
      return <DeviceTrustModule />;
    
    case 'custom':
      return (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Custom Module
        </div>
      );
    
    default:
      return (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Unknown module type
        </div>
      );
  }
}
