import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Idle from './screens/Idle.jsx'
import Language from './screens/Language.jsx'
import Login from './screens/Login.jsx'
import Home from './screens/Home.jsx'
import SystemSelection from './screens/SystemSelection.jsx'
import Assistant from './screens/Assistant.jsx'
import TypeSymptoms from './screens/TypeSymptoms.jsx'
import ScanDocs from './screens/ScanDocs.jsx'
import Review from './screens/Review.jsx'
import Done from './screens/Done.jsx'
import History from './screens/History.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Idle />} />
        <Route path="/language" element={<Language />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/system" element={<SystemSelection />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/type" element={<TypeSymptoms />} />
        <Route path="/scan" element={<ScanDocs />} />
        <Route path="/review" element={<Review />} />
        <Route path="/done" element={<Done />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
