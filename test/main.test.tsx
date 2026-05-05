import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { StrictMode } from 'react'

import { TodoInput, TodoList, Wrapper } from '../src/components'

test('renders the main app with TodoInput and TodoList', () => {
  render(
    <StrictMode>
      <Wrapper>
        <TodoInput />
        <TodoList />
      </Wrapper>
    </StrictMode>
  )

  expect(screen.getByRole('button', { name: /aggiungi/i })).toBeInTheDocument()
  expect(document.getElementById('todo-list')).toBeInTheDocument()
})
