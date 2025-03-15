import './index.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { TodoInput, TodoList, Wrapper } from '@/components'

const root = document.getElementById('root')
ReactDOM.createRoot(root!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Wrapper>
              <TodoInput />
              <TodoList />
            </Wrapper>
          }
          path="/"
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
