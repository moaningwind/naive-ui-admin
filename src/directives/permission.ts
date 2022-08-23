import type { ObjectDirective } from 'vue'
import { usePermission } from '@/hooks/auth/usePermission'
import { isUnDef } from '@/utils/is'

export const permission: ObjectDirective = {
  mounted(el: HTMLButtonElement, binding) {
    if (isUnDef(binding.value))
      return
    const { action, effect } = binding.value
    const { hasPermission } = usePermission()
    if (!hasPermission(action)) {
      if (effect === 'disabled') {
        el.disabled = true
        el.classList.add('n-button--disabled')
      }
      else {
        el.remove()
      }
    }
  },
}
