import './index.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { TodoInput, TodoList, Wrapper } from '@/components'

const root = document.getElementById('root')
ReactDOM.createRoot(root!).render(
  <StrictMode>
    <Wrapper>
      <TodoInput />
      <TodoList />
    </Wrapper>
  </StrictMode>
)
