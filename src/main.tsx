import './index.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { TodoInput, TodoList, Wrapper } from '@/components'

const root = document.getElementById('root')
if (!root) {
	throw new Error('Root element not found')
}
ReactDOM.createRoot(root).render(
	<StrictMode>
		<Wrapper>
			<TodoInput />
			<TodoList />
		</Wrapper>
	</StrictMode>,
)
