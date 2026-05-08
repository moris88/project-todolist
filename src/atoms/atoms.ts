import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { Comment, Todo } from '@/types'
import { type Dict, dicts, type Language } from '@/utils/constants'

export const todoListAtom = atom<Todo[]>([])
export const commentsAtom = atom<Comment[]>([])
export const languageAtom = atomWithStorage<Language>('language', 'it')
export const darkModeAtom = atomWithStorage<boolean>('darkMode', false)
export const tagsAtom = atomWithStorage<string[]>('tags', [])
export const dictAtom = atom<Dict>((get) => dicts[get(languageAtom)])
