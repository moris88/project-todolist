import { useSetAtom } from 'jotai'

import type { ToastType } from '@/atoms'
import { toastsAtom } from '@/atoms'
import { generateUniqueId } from '@/utils'

export function useToast() {
	const setToasts = useSetAtom(toastsAtom)
	return (message: string, type: ToastType = 'info') => {
		const id = generateUniqueId()
		setToasts((prev) => [...prev, { id, message, type }])
	}
}
