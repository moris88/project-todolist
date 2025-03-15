// mi fai il test della funzione main di react?
import '@testing-library/jest-dom'

import { render } from '@testing-library/react'
import { StrictMode } from 'react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { TodoInput, TodoList, Wrapper } from '../src/components'

test('renders the main app with TodoInput and TodoList', () => {
  render(
    <StrictMode>
      <BrowserRouter>
        <Wrapper>
          <TodoInput />
          <TodoList />
        </Wrapper>
      </BrowserRouter>
    </StrictMode>
  )

  // Controlla la presenza dei div con gli ID specificati
  expect(document.getElementById('todo-input')).toBeInTheDocument()
  expect(document.getElementById('todo-list')).toBeInTheDocument()
})
