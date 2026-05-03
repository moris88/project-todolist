import React from 'react'

interface WrapperProps {
  children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
  return <div className="container">{children}</div>
}

export default Wrapper
