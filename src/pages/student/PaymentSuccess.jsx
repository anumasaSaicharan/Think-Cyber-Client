import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { topicService } from '../../services/apiService';
import { AppContext } from '../../context/AppContext';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUserData } = useContext(AppContext);
  

useEffect(() => {
    const verify = async () => {
      //debugger;
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        //debugger;
        // Only send sessionId to backend
        const response = await topicService.verifyPayment({ sessionId });
        if (response && response.success) {
          setUserData(response.user);
          toast.success('Payment successful! You are now enrolled.');
          setTimeout(() => navigate(` /course/${response.topicId}?enrolled=1`), 2000);  
        } else {
          toast.error('Payment verification failed.');
          setUserData(response.user || null);
          setTimeout(() => navigate(' /payment-cancel'), 2000); // <-- Add this line
        }
      }
    };
    verify();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Processing your payment...</h1>
      <p>If successful, you will be enrolled in your course shortly.</p>
    </div>
  );
};
   
export default PaymentSuccess;