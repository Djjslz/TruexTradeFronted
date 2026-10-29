import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import Explorar from './pages/Explorar'
import ItemDetail from './pages/ItemDetail'
import Publicar from './pages/Publicar'
import Perfil from './pages/Perfil'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="explorar" element={<Explorar />} />
        <Route path="producto/:id" element={<ItemDetail />} />
        <Route
          path="publicar"
          element={
            <ProtectedRoute>
              <Publicar />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
      </Route>
    </Routes>
  )
}

export default App
