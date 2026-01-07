'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SendIcon,
  CheckIcon,
  ChevronDownIcon,
} from 'lucide-react'

type Status = 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected'

type StatusDropdownProps = {
  currentStatus: Status
  onChange: (newStatus: Status) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_OPTIONS = [
  {
    value: 'draft' as Status,
    label: 'Draft',
    icon: ClockIcon,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    hoverBg: 'hover:bg-gray-200',
    dotColor: 'bg-gray-400',
  },
  {
    value: 'pending_approval' as Status,
    label: 'Pending Approval',
    icon: SendIcon,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    hoverBg: 'hover:bg-yellow-200',
    dotColor: 'bg-yellow-400',
  },
  {
    value: 'approved' as Status,
    label: 'Approved',
    icon: CheckCircleIcon,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    hoverBg: 'hover:bg-green-200',
    dotColor: 'bg-green-400',
  },
  {
    value: 'published' as Status,
    label: 'Published',
    icon: CheckIcon,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    hoverBg: 'hover:bg-blue-200',
    dotColor: 'bg-blue-400',
  },
  {
    value: 'rejected' as Status,
    label: 'Rejected',
    icon: XCircleIcon,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    hoverBg: 'hover:bg-red-200',
    dotColor: 'bg-red-400',
  },
]

export function StatusDropdown({
  currentStatus,
  onChange,
  disabled = false,
  size = 'md',
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === currentStatus)
  const CurrentIcon = currentOption?.icon || ClockIcon

  // Size configurations
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-xs',
      icon: 'h-3 w-3',
      chevron: 'h-3 w-3',
      menu: 'mt-1',
      menuItem: 'px-3 py-2 text-xs',
      menuIcon: 'h-3 w-3',
      dot: 'h-2 w-2',
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'h-4 w-4',
      chevron: 'h-4 w-4',
      menu: 'mt-2',
      menuItem: 'px-4 py-2.5 text-sm',
      menuIcon: 'h-4 w-4',
      dot: 'h-2.5 w-2.5',
    },
    lg: {
      button: 'px-5 py-3 text-base',
      icon: 'h-5 w-5',
      chevron: 'h-5 w-5',
      menu: 'mt-2',
      menuItem: 'px-5 py-3 text-base',
      menuIcon: 'h-5 w-5',
      dot: 'h-3 w-3',
    },
  }

  const classes = sizeClasses[size]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleStatusChange = (newStatus: Status) => {
    onChange(newStatus)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Current Status Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center justify-between gap-2 rounded-lg font-medium
          transition-all duration-150
          ${currentOption?.bgColor} ${currentOption?.textColor}
          ${!disabled && currentOption?.hoverBg}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${classes.button}
          min-w-[160px]
        `}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className={classes.icon} />
          <span>{currentOption?.label}</span>
        </div>
        <ChevronDownIcon
          className={`${classes.chevron} transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full min-w-[200px] rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5
            ${classes.menu}
          `}
        >
          <div className="py-1" role="menu">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = option.value === currentStatus

              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    w-full flex items-center justify-between gap-3
                    transition-colors duration-150
                    ${classes.menuItem}
                    ${
                      isSelected
                        ? `${option.bgColor} ${option.textColor}`
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={classes.menuIcon} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isSelected && (
                    <div className={`rounded-full ${option.dotColor} ${classes.dot}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
