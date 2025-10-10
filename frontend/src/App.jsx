import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Services from "./pages/Services/Services";
import Portfolio from "./pages/Portfolio/Portfolio";
import Contact from "./pages/Contact/Contact";
import NotFound from "./pages/NotFound/NotFound";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import WorkDetail from "./pages/WorkDetail/WorkDetail";
import WorkForm from "./pages/WorkForm/WorkForm";
import ServiceForm from "./pages/ServiceForm/ServiceForm";
import Dashboard from "./pages/Dashboard/Dashboard";
import EditProfile from "./pages/EditProfile/EditProfile";
import AdminPage from "./pages/Admin/AdminPage"; // Import AdminPage
import EditUser from "./pages/Admin/EditUser"; // Import EditUser

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className='app-content__wrapper'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/services' element={<Services />} />
            <Route path='/portfolio' element={<Portfolio />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/portfolio/add' element={<WorkForm />} />
            <Route path='/portfolio/edit/:work_id' element={<WorkForm />} />
            <Route path='/portfolio/:work_id' element={<WorkDetail />} />
            <Route path='/services/add' element={<ServiceForm />} />
            <Route
              path='/services/edit/:service_id'
              element={<ServiceForm />}
            />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/edit-profile' element={<EditProfile />} />
            <Route path='/admin' element={<AdminPage />} /> {/* New Admin Page Route */}
            <Route path='/admin/edit-user/:userId' element={<EditUser />} /> {/* New Edit User Route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
