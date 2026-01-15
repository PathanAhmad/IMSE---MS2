import { useState } from 'react'
import AdminSection from './components/AdminSection'
import Student1Section from './components/Student1Section'
import Student2Section from './components/Student2Section'

function App() {
  return (
    <div className="app">
      <h1>IMSE - MS2 Frontend</h1>
      <AdminSection />
      <Student1Section />
      <Student2Section />
    </div>
  )
}

export default App
