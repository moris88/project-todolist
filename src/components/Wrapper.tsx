import { useAtomValue } from 'jotai'
import React from 'react'

import { darkModeAtom } from '@/atoms'
import Header from '@/components/Header'

interface WrapperProps {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
  const darkMode = useAtomValue(darkModeAtom)

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-white dark:bg-[#1b1a19] dark:text-white">
      <Header />
      <div className="container">{children}</div>
    </div>
  )
}

export default Wrapper
