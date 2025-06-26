'use client'

import { useState } from 'react'

interface FeatureToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}

export function FeatureToggle({ enabled, onToggle, disabled = false }: FeatureToggleProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (disabled || isLoading) return
    
    setIsLoading(true)
    try {
      await onToggle(!enabled)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled 
          ? 'bg-primary' 
          : 'bg-gray-200'
      } ${
        disabled || isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
} 