
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import "./App.css";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkDetail from "./pages/WorkDetail";


function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || "/";
    fetch(`${url}/api`)
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home message={message} />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portfolio/:work_id" element={<WorkDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
