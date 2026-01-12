/**
 * WorkflowModule
 * 
 * Module content for automated workflows
 * Connects to /api/v1/trapdoor/workflows/* endpoints
 */

import React, { useState, useEffect } from 'react';
import { Workflow, Play, FileText, Loader2 } from 'lucide-react';
import { getAPIUrl } from '@/lib/apiConfig';

interface WorkflowTemplate {
  id: string;
  name: string;
  platform: string;
  category: string;
  description?: string;
}

export function WorkflowModule() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const passcode = localStorage.getItem('secret-room-passcode');
      const response = await fetch(getAPIUrl('/api/v1/trapdoor/workflows/templates'), {
        headers: passcode ? { 'X-Secret-Room-Passcode': passcode } : {},
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data?.templates) {
          setTemplates(data.data.templates);
        } else {
          setTemplates([]);
        }
      } else {
        setTemplates([]);
        setError('Failed to load templates');
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
      setError('Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    setExecuting(workflowId);
    try {
      const passcode = localStorage.getItem('secret-room-passcode');
      const response = await fetch(getAPIUrl('/api/v1/trapdoor/workflows/execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(passcode ? { 'X-Secret-Room-Passcode': passcode } : {}),
        },
        body: JSON.stringify({
          workflowId,
          devices: [],
          parameters: {},
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Workflow execution started:', data);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    } finally {
      setExecuting(null);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">Workflow Templates</h4>
        <button
          onClick={loadTemplates}
          disabled={loading}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="Refresh templates"
        >
          <FileText className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
            <p>Loading workflows...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No workflow templates available</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Workflow className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-gray-400 mt-0.5">{template.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                        {template.platform}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => executeWorkflow(template.id)}
                  disabled={executing === template.id}
                  className="p-2 hover:bg-gray-700 rounded text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                  title="Execute workflow"
                >
                  {executing === template.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        {templates.length} template{templates.length !== 1 ? 's' : ''} available
      </div>
    </div>
  );
}
