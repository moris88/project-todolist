import { HeroUIProvider } from '@heroui/react'
import React from 'react'

interface WrapperProps {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
  return (
    <HeroUIProvider>
      <div className="container">{children}</div>
    </HeroUIProvider>
  )
}

export default Wrapper
