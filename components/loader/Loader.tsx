import { Loader2 } from 'lucide-react'
import React from 'react'

const Loader = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto flex justify-center items-center">
      <Loader2 className="animate-spin" size={30}/>
    </div>
  )
}

export default Loader
