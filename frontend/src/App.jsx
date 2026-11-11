import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import { setSeo, PAGE_META, PRIVATE_TITLES } from "./utils/seo";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Dynamically import page components
const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const Services = lazy(() => import("./pages/Services/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio/Portfolio"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Login = lazy(() => import("./pages/Login/Login"));
const Signup = lazy(() => import("./pages/Signup/Signup"));
const WorkDetail = lazy(() => import("./pages/WorkDetail/WorkDetail"));
const WorkForm = lazy(() => import("./pages/WorkForm/WorkForm"));
const ServiceForm = lazy(() => import("./pages/ServiceForm/ServiceForm"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const EditProfile = lazy(() => import("./pages/EditProfile/EditProfile"));
const AdminPage = lazy(() => import("./pages/Admin/AdminPage"));
const EditUser = lazy(() => import("./pages/Admin/EditUser"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail/VerifyEmail"));

// Sets <title>, description, canonical and robots on client-side navigation.
// First loads are handled by the server (backend/app/seo.py).
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    if (PAGE_META[path]) {
      setSeo({ ...PAGE_META[path], path });
    } else if (/^\/portfolio\/\d+$/.test(path)) {
      // WorkDetail sets the real title/description once the work has loaded
      setSeo({ title: "Project", path });
    } else if (PRIVATE_TITLES[path] || /^\/(portfolio|services)\/edit\/|^\/admin\//.test(path)) {
      setSeo({ title: PRIVATE_TITLES[path] || "Manage", path, noindex: true });
    } else {
      setSeo({ title: "Page not found", path, noindex: true });
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className='route-fallback' role='status' aria-live='polite'>
      <div className='route-fallback__spinner' aria-hidden='true' />
      <span className='visually-hidden'>Loading…</span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteEffects />
        <a className='skip-link' href='#main'>
          Skip to content
        </a>
        <Navbar />
        <div className='app-content__wrapper'>
          <main id='main' className='app-main' tabIndex={-1}>
          <Suspense fallback={<RouteFallback />}>
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
              <Route path='/admin' element={<AdminPage />} />
              <Route path='/admin/edit-user/:userId' element={<EditUser />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/verify-email' element={<VerifyEmail />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
