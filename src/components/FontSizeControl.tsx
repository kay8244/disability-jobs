'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'

const FONT_SIZE_KEY = 'font-size-preference'

const sizes = [
  { key: 'small', label: '가', fontSize: '14px', className: 'text-xs' },
  { key: 'medium', label: '가', fontSize: '16px', className: 'text-sm' },
  { key: 'large', label: '가', fontSize: '20px', className: 'text-lg' },
] as const

type FontSize = (typeof sizes)[number]['key']

export default function FontSizeControl() {
  const [currentSize, setCurrentSize] = useState<FontSize>('medium')

  useEffect(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null
    if (saved && sizes.some((s) => s.key === saved)) {
      setCurrentSize(saved)
      applyFontSize(saved)
    }
  }, [])

  function applyFontSize(size: FontSize) {
    const sizeConfig = sizes.find((s) => s.key === size)
    if (sizeConfig) {
      document.documentElement.style.fontSize = sizeConfig.fontSize
    }
  }

  function handleChange(size: FontSize) {
    setCurrentSize(size)
    applyFontSize(size)
    localStorage.setItem(FONT_SIZE_KEY, size)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="글자 크기 조절">
      {sizes.map((size) => (
        <button
          key={size.key}
          onClick={() => handleChange(size.key)}
          className={clsx(
            'flex items-center justify-center w-8 h-8 rounded border transition-colors min-h-0 min-w-0',
            currentSize === size.key
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
          )}
          aria-label={`글자 크기 ${size.key === 'small' ? '작게' : size.key === 'medium' ? '보통' : '크게'}`}
          aria-pressed={currentSize === size.key}
        >
          <span className={size.className}>{size.label}</span>
        </button>
      ))}
    </div>
  )
}
