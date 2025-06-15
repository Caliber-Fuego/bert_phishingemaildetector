import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Popup from "./components/Popup";
import Dashboard from "./components/dashboard";

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Popup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
