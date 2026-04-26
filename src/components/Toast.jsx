// トースト通知 — 3秒で自動消去 — spec-phase3.md §8
// useToast()フックと共に使用する
import { useEffect } from 'react'
import '../styles/Toast.css'

// toasts: [{ id, type, message }]  type: 'success'|'error'|'info'
// onRemove: (id) => void
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
      {toast.message}
    </div>
  )
}
