import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Comment, Todo } from '@/types'
import { Dict, dicts, Language } from '@/utils/constants'

export const todoListAtom = atom<Todo[]>([])
export const commentsAtom = atom<Comment[]>([])
export const languageAtom = atomWithStorage<Language>('language', 'it')
export const darkModeAtom = atomWithStorage<boolean>('darkMode', false)
export const dictAtom = atom<Dict>((get) => dicts[get(languageAtom)])
