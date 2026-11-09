const BASE = 'https://dummyjson.com'
async function req(path, opts = {}) {
  let res
  try {
    res = await fetch(BASE + path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers } })
  } catch { throw new Error('Network error. Check your connection and try again.') }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}
export const login = (username, password) =>
  req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password, expiresInMins: 60 }) })
export const me = (token) => req('/auth/me', { headers: { Authorization: 'Bearer ' + token } })
export const getProducts = ({ limit = 12, skip = 0, q = '', category = '', sortBy = '', order = 'asc' }) => {
  const p = new URLSearchParams({ limit, skip })
  if (sortBy) { p.set('sortBy', sortBy); p.set('order', order) }
  if (q) { p.set('q', q); return req('/products/search?' + p) }
  if (category) return req(`/products/category/${category}?` + p)
  return req('/products?' + p)
}
export const getProduct = (id) => req('/products/' + id)
export const getCategories = () => req('/products/category-list')
export const addProduct = (body) => req('/products/add', { method: 'POST', body: JSON.stringify(body) })
export const deleteProduct = (id) => req('/products/' + id, { method: 'DELETE' })
