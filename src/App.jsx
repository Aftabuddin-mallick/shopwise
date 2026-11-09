import { Routes, Route } from 'react-router-dom'
import { Navbar, ProtectedRoute } from './components'
import { Shop, ProductDetail, Cart, Checkout, Orders, Login, Admin, NotFound } from './pages'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
