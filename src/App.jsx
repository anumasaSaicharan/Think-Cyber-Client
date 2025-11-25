// import React, { useContext } from 'react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import Footer from './components/student/Footer'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails' 
import TopicsList from './pages/TopicsList'
import { ToastContainer } from 'react-toastify'
 import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'
 import About from './pages/student/About';
import Contact from './pages/student/Contact';
import FAQ from './pages/student/FAQPage';
import WishlistPage from './pages/student/WishlistPage';
import PrivacyPolicy from './pages/student/PrivacyPolicy';
import TermsAndConditions from './pages/student/TermsAndConditions';
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
      <div className="text-default min-h-screen bg-white flex flex-col">
        <ToastContainer />
        {/* Render Student Navbar only if not on educator routes */}
        {!isEducatorRoute && <Navbar />} 
        
        {/* Main content area that grows to fill available space */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/topics" element={<TopicsList />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/loading/:path" element={<Loading />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Routes>
        </main>

        {/* Footer stays at bottom */}
        {!isEducatorRoute && <Footer />}
      </div>
    </AppContextProvider>
  )
}

export default App