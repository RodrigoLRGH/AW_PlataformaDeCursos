import { AuthProvider } from "./app/providers/AuthContext"
import AppRouter from "./app/routes/AppRouter"

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  )
}

export default App