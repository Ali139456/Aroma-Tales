import { toast } from 'sonner'

export function toastSuccess(message, description) {
  if (description)
    toast.success(message, { description })
  else toast.success(message)
}

export function toastError(message, description) {
  if (description) toast.error(message, { description })
  else toast.error(message)
}

export function toastInfo(message, description) {
  if (description) toast.info(message, { description })
  else toast.info(message)
}

/**
 * Non-blocking confirmation (replaces window.confirm).
 * @returns {Promise<boolean>} true if the user confirms
 */
export function toastConfirm(message, description = '', options = {}) {
  const {
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    duration = 60000,
  } = options

  return new Promise((resolve) => {
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    const id = toast(message, {
      description: description || undefined,
      duration,
      closeButton: true,
      action: {
        label: confirmLabel,
        onClick: () => {
          toast.dismiss(id)
          finish(true)
        },
      },
      cancel: {
        label: cancelLabel,
        onClick: () => {
          toast.dismiss(id)
          finish(false)
        },
      },
      onDismiss: () => finish(false),
    })
  })
}
