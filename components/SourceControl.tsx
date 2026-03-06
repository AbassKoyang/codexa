import { Check, Plus, RefreshCw } from 'lucide-react'
import React from 'react'

const SourceControl = () => {
  return (
    <div className="w-[250px] h-full bg-tokyo-panel flex flex-col border-r border-tokyo-border text-tokyo-fg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[35px] border-b border-tokyo-border/50">
          <span className="text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase">Source Control</span>
          <div className="flex items-center space-x-2 text-tokyo-muted">
            <Check className="w-3.5 h-3.5 cursor-pointer hover:text-tokyo-fg transition-colors" />
            <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-tokyo-fg transition-colors" />
            <Plus className="w-3.5 h-3.5 cursor-pointer hover:text-tokyo-fg transition-colors" />
          </div>
        </div>
        
        {/* Commit Input Box Placeholder */}
        <div className="p-3">
          <textarea 
            placeholder="Message (Ctrl+Enter to commit on 'main')"
            className="w-full h-20 bg-tokyo-bg border border-tokyo-border rounded p-2 text-sm text-tokyo-fg resize-none focus:outline-none focus:border-tokyo-blue transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

export default SourceControl
