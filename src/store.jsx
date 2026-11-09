import { createContext, useContext, useEffect, useReducer, useState, useCallback } from 'react'
import * as api from './api'

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

/* ---------- Toasts ---------- */
const ToastCtx = createContext()
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const notify = useCallback((msg, type = 'ok') => { setT({ msg, type }); setTimeout(() => setT(null), 2800) }, [])
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {t && <div role="status" className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-white shadow-lg ${t.type === 'err' ? 'bg-red-600' : 'bg-ink'}`}>{t.msg}</div>}
    </ToastCtx.Provider>
  )
}

/* ---------- Auth ---------- */
const AuthCtx = createContext()
export const useAuth = () => useContext(AuthCtx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('user', null))
  const login = async (username, password) => {
    const res = await api.login(username, password)
    const profile = await api.me(res.accessToken)
    const u = { id: profile.id, username: profile.username, name: profile.firstName, role: profile.role, token: res.accessToken }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }
  const logout = () => { localStorage.removeItem('user'); setUser(null) }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

/* ---------- Cart (useReducer) ---------- */
const CartCtx = createContext()
export const useCart = () => useContext(CartCtx)
function reducer(items, a) {
  switch (a.type) {
    case 'add': {
      const ex = items.find((i) => i.id === a.p.id)
      if (ex) return items.map((i) => (i.id === a.p.id ? { ...i, qty: i.qty + 1 } : i))
      return [...items, { id: a.p.id, title: a.p.title, price: a.p.price, thumbnail: a.p.thumbnail, qty: 1 }]
    }
    case 'qty': return items.map((i) => (i.id === a.id ? { ...i, qty: Math.max(1, a.qty) } : i))
    case 'remove': return items.filter((i) => i.id !== a.id)
    case 'clear': return []
    default: return items
  }
}
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, null, () => read('cart', []))
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items])
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)
  return <CartCtx.Provider value={{ items, dispatch, total, count }}>{children}</CartCtx.Provider>
}
