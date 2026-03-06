import React from 'react'

const Search = () => {
  return (
    <div className="w-[250px] h-full bg-tokyo-panel flex flex-col border-r border-tokyo-border text-tokyo-fg">
      <div className="flex items-center px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase">
        Search
      </div>
      <div className="flex-1 p-4 flex flex-col space-y-4">
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full bg-tokyo-bg border border-tokyo-border rounded px-2 py-1 text-sm text-tokyo-fg focus:outline-none focus:border-tokyo-blue transition-colors"
        />
        <input 
          type="text" 
          placeholder="Replace" 
          className="w-full bg-tokyo-bg border border-tokyo-border rounded px-2 py-1 text-sm text-tokyo-fg focus:outline-none focus:border-tokyo-blue transition-colors"
        />
      </div>
    </div>
  )
}

export default Search
