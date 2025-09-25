// import React, { useContext } from 'react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails' 
import { ToastContainer } from 'react-toastify'
 import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'
 import About from './pages/student/About';
import Contact from './pages/student/Contact';
import FAQ from './pages/student/FAQPage';
import WishlistPage from './pages/student/WishlistPage';
import { AppContextProvider } from './context/AppContext';
 import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css';
import PaymentSuccess from './pages/student/PaymentSuccess';
import PaymentCancel from './pages/student/PaymentCancel';
import Enrollments from './components/student/enrollments'
 const App = () => {

  const isEducatorRoute = useMatch('/educator/*');

  return (
    <AppContextProvider>
      <div className="text-default min-h-screen bg-white">
        <ToastContainer />
        {/* Render Student Navbar only if not on educator routes */}
        {!isEducatorRoute && <Navbar />}
        <div id="google_translate_element" /> 
          <Routes>
            <Route path="/ThinkCyber/web/" element={<Home />} />
            <Route path="/course/:id" element={<CourseDetails />} />
             <Route path="/loading/:path" element={<Loading />} />
            <Route path="/ThinkCyber/web/about" element={<About />} />
            <Route path="/ThinkCyber/web/contact" element={<Contact />} />
            <Route path="/ThinkCyber/web/faq" element={<FAQ />} />
            <Route path="/ThinkCyber/web/wishlist" element={<WishlistPage />} />
            <Route path="/ThinkCyber/web/payment-success" element={<PaymentSuccess />} />
            <Route path="/ThinkCyber/web/payment-cancel" element={<PaymentCancel />} />
            <Route path="/ThinkCyber/web/enrollments" element={<Enrollments />} />

          </Routes>
      </div>
    </AppContextProvider>
  )
}

export default App