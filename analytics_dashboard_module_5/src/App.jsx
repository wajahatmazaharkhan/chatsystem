import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"

const App = () => {
  localStorage.setItem('token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NTMxMTZhNi0wYTJlLTQwYWMtOGY3NS1iMDVlNzcyNzUwZWMiLCJ1c2VyX2lkIjoiNmEwNWMyN2Q5MzMwMDViMjViMTk2NTZlIiwiZW1haWwiOiJ0ZXN0QHQuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzc5MjU4NDgyLCJleHAiOjE3NzkyNjIwODJ9.5usS4ofzRGh-82YwxiH0SUNqdGki3zV5IselHKJTDlU")
  return (
    <div className="bg-gray-900 h-screen w-full">
      <Layout>
        <Dashboard />
      </Layout>
    </div>
  )
}

export default App