import React from 'react'
import { Search as SearchIcon } from 'lucide-react'

const Extensions = () => {
  return (
    <div className="w-[250px] h-full bg-tokyo-panel flex flex-col border-r border-tokyo-border text-tokyo-fg">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase">
          Extensions
        </div>
        
        {/* Search */}
        <div className="px-3 pb-2 border-b border-tokyo-border/50">
          <div className="relative flex items-center w-full">
            <SearchIcon className="absolute left-2 w-3.5 h-3.5 text-tokyo-muted" />
            <input 
              type="text" 
              placeholder="Search Extensions in Marketplace" 
              className="w-full bg-tokyo-bg border border-tokyo-border rounded pl-7 pr-2 py-1 text-sm text-tokyo-fg focus:outline-none focus:border-tokyo-blue transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Extensions
