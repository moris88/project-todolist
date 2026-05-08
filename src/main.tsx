import './index.css'
import 'moment/locale/it'

import moment from 'moment'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

moment.locale('it')

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
