import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import {
  HiChevronDown,
  HiChevronUp,
  HiFunnel,
  HiMagnifyingGlass,
  HiXMark,
} from 'react-icons/hi2'

import { commentsAtom, dictAtom, tagsAtom, todoListAtom } from '@/atoms'
import { Comments, TaskDetailModal } from '@/components'
import { Switch, Tooltip } from '@/components/UI'
import { useNotificationRequest } from '@/hooks'
import { Status } from '@/types'
import {
  applyFilters,
  FilterState,
  getCommentsStorage,
  getTodosStorage,
  orderTodos,
  tagColor,
  updateTodoStorage,
} from '@/utils'

import DangerZone from './DangerZone'
import TodoItem from './TodoItem'

function FilterPill({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function TodoList() {
  const [todos, setTodos] = useAtom(todoListAtom)
  const [comments, setComments] = useAtom(commentsAtom)
  const dict = useAtomValue(dictAtom)
  const globalTags = useAtomValue(tagsAtom)

  const [filterStatus, setFilterStatus] = React.useState<Status | ''>('')
  const [filterCompletion, setFilterCompletion] = React.useState<
    'all' | 'completed' | 'uncompleted'
  >('all')
  const [filterOverdue, setFilterOverdue] = React.useState<
    'all' | 'overdue' | 'not_overdue'
  >('all')
  const [filterTags, setFilterTags] = React.useState<string[]>([])
  const [filterSearch, setFilterSearch] = React.useState('')
  const [filterDueDateFrom, setFilterDueDateFrom] = React.useState('')
  const [filterDueDateTo, setFilterDueDateTo] = React.useState('')

  const [showFilters, setShowFilters] = React.useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : false
  )
  const [showDescriptions, setShowDescriptions] = React.useState(false)
  const [showSubtasks, setShowSubtasks] = React.useState(false)
  const [showOnlyTitle, setShowOnlyTitle] = React.useState(false)
  const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(
    null
  )
  const [detailTodoId, setDetailTodoId] = React.useState<string | null>(null)
  const { notifyUser } = useNotificationRequest()

  React.useEffect(() => {
    setComments(getCommentsStorage())
  }, [setComments])

  React.useEffect(() => {
    const newTodos = todos.map((todo) => {
      if (!todo.dueDate) return todo
      const dueDate = new Date(todo.dueDate)
      if (!todo.completed && dueDate < new Date() && !todo.notify) {
        notifyUser('Task Scaduto', `Il task "${todo.title}" è scaduto.`)
        return { ...todo, notify: true }
      }
      return todo
    })
    const isDifferent = JSON.stringify(newTodos) !== JSON.stringify(todos)
    if (isDifferent) {
      setTodos(updateTodoStorage(newTodos))
    }
  }, [notifyUser, setTodos, todos])

  React.useEffect(() => {
    setTodos(getTodosStorage())
  }, [setTodos])

  const activeFiltersCount = [
    filterStatus !== '',
    filterCompletion !== 'all',
    filterOverdue !== 'all',
    filterTags.length > 0,
    filterSearch !== '',
    filterDueDateFrom !== '' || filterDueDateTo !== '',
  ].filter(Boolean).length

  const resetFilters = () => {
    setFilterStatus('')
    setFilterCompletion('all')
    setFilterOverdue('all')
    setFilterTags([])
    setFilterSearch('')
    setFilterDueDateFrom('')
    setFilterDueDateTo('')
  }

  const toggleTagFilter = (tag: string) => {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filters: FilterState = {
    status: filterStatus,
    completion: filterCompletion,
    overdue: filterOverdue,
    tags: filterTags,
    search: filterSearch,
    dueDateFrom: filterDueDateFrom,
    dueDateTo: filterDueDateTo,
  }

  const filteredTodos = todos.filter((todo) =>
    applyFilters(todo, filters, comments)
  )

  const allStatuses: { value: Status; label: string }[] = [
    { value: 'todo', label: dict.todolist.listitem.status.items.todo },
    { value: 'progress', label: dict.todolist.listitem.status.items.progress },
    { value: 'review', label: dict.todolist.listitem.status.items.review },
    { value: 'testing', label: dict.todolist.listitem.status.items.testing },
    { value: 'blocked', label: dict.todolist.listitem.status.items.blocked },
    { value: 'paused', label: dict.todolist.listitem.status.items.paused },
    { value: 'done', label: dict.todolist.listitem.status.items.done },
    { value: 'archived', label: dict.todolist.listitem.status.items.archived },
  ]

  return (
    <div className="mt-4 min-h-[calc(100vh-250px)] space-y-4" id="todo-list">
      {todos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Filter header / toggle */}
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            type="button"
            onClick={() => setShowFilters((v) => !v)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <HiFunnel className="h-4 w-4" />
              {dict.todolist.listitem.filter.filters_title}
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-normal text-white">
                  {activeFiltersCount}{' '}
                  {dict.todolist.listitem.filter.active_filters}
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetFilters()
                  }}
                >
                  {dict.todolist.listitem.filter.reset}
                </button>
              )}
              {showFilters ? (
                <HiChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <HiChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </button>

          {/* Filter panel body */}
          {showFilters && (
            <div className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    placeholder={
                      dict.todolist.listitem.filter.search_placeholder
                    }
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                  />
                  {filterSearch && (
                    <Tooltip
                      content={dict.todolist.listitem.filter.reset}
                      placement="top"
                    >
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        type="button"
                        onClick={() => setFilterSearch('')}
                      >
                        <HiXMark className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                </div>

                {/* Status */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {dict.todolist.listitem.filter.by_status}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterPill
                      isActive={filterStatus === ''}
                      label={dict.todolist.listitem.filter.all}
                      onClick={() => setFilterStatus('')}
                    />
                    {allStatuses.map((s) => (
                      <FilterPill
                        key={s.value}
                        isActive={filterStatus === s.value}
                        label={s.label}
                        onClick={() =>
                          setFilterStatus(
                            filterStatus === s.value ? '' : s.value
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Completion + Overdue - side by side on md+ */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {dict.todolist.listitem.filter.by_completion}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          {
                            value: 'all',
                            label: dict.todolist.listitem.filter.all,
                          },
                          {
                            value: 'completed',
                            label: dict.todolist.listitem.filter.completed,
                          },
                          {
                            value: 'uncompleted',
                            label: dict.todolist.listitem.filter.uncompleted,
                          },
                        ] as const
                      ).map((opt) => (
                        <FilterPill
                          key={opt.value}
                          isActive={filterCompletion === opt.value}
                          label={opt.label}
                          onClick={() => setFilterCompletion(opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {dict.todolist.listitem.filter.by_overdue}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          {
                            value: 'all',
                            label: dict.todolist.listitem.filter.all,
                          },
                          {
                            value: 'overdue',
                            label: dict.todolist.listitem.filter.overdue,
                          },
                          {
                            value: 'not_overdue',
                            label: dict.todolist.listitem.filter.not_overdue,
                          },
                        ] as const
                      ).map((opt) => (
                        <FilterPill
                          key={opt.value}
                          isActive={filterOverdue === opt.value}
                          label={opt.label}
                          onClick={() => setFilterOverdue(opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {globalTags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {dict.todolist.listitem.filter.by_tag}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {globalTags.map((tag) => (
                        <Tooltip
                          key={tag}
                          content={`${dict.todolist.listitem.filter.by_tag}: ${tag}`}
                          placement="top"
                        >
                          <button
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${tagColor(tag)} ${
                              filterTags.includes(tag)
                                ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            type="button"
                            onClick={() => toggleTagFilter(tag)}
                          >
                            {tag}
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Due date range */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {dict.todolist.listitem.filter.by_due_date}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dict.todolist.listitem.filter.due_date_from}
                      </span>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        type="date"
                        value={filterDueDateFrom}
                        onChange={(e) => setFilterDueDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dict.todolist.listitem.filter.due_date_to}
                      </span>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        type="date"
                        value={filterDueDateTo}
                        onChange={(e) => setFilterDueDateTo(e.target.value)}
                      />
                    </div>
                    {(filterDueDateFrom || filterDueDateTo) && (
                      <Tooltip
                        content={dict.todolist.listitem.filter.reset}
                        placement="top"
                      >
                        <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          type="button"
                          onClick={() => {
                            setFilterDueDateFrom('')
                            setFilterDueDateTo('')
                          }}
                        >
                          <HiXMark className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Divider + View switches */}
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex flex-wrap gap-4">
                    <Switch
                      checked={showDescriptions}
                      size="sm"
                      onChange={(e) => setShowDescriptions(e.target.checked)}
                    >
                      {dict.todolist.listitem.show_descriptions}
                    </Switch>
                    <Switch
                      checked={showSubtasks}
                      size="sm"
                      onChange={(e) => setShowSubtasks(e.target.checked)}
                    >
                      {dict.todolist.listitem.show_subtasks}
                    </Switch>
                    <Switch
                      checked={showOnlyTitle}
                      size="sm"
                      onChange={(e) => setShowOnlyTitle(e.target.checked)}
                    >
                      {dict.todolist.listitem.show_only_title}
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {filteredTodos.length === 0 ? (
        <p className="select-none text-center">
          {dict.todolist.listitem.no_task}
        </p>
      ) : (
        filteredTodos.sort(orderTodos).map((todo) => (
          <div
            key={todo.id}
            className={`rounded-lg ${
              todo.priority !== 'urgent'
                ? 'bg-gray-200 dark:bg-slate-600 dark:text-white'
                : 'bg-red-100 text-black dark:bg-red-900/40 dark:text-red-100'
            } p-2 md:p-5`}
          >
            <TodoItem
              isCommentOpen={selectedTodoId === todo.id}
              showDescriptions={showDescriptions}
              showOnlyTitle={showOnlyTitle}
              showSubtasks={showSubtasks}
              todo={todo}
              onCommentPress={() =>
                setSelectedTodoId((prev) => (prev === todo.id ? null : todo.id))
              }
              onDetailPress={() => setDetailTodoId(todo.id)}
            />
            {selectedTodoId === todo.id && <Comments todoId={todo.id} />}
          </div>
        ))
      )}

      <TaskDetailModal
        isOpen={detailTodoId !== null}
        todoId={detailTodoId}
        onClose={() => setDetailTodoId(null)}
      />

      <DangerZone
        comments={comments}
        setComments={setComments}
        setTodos={setTodos}
        todos={todos}
      />
    </div>
  )
}

export default TodoList
