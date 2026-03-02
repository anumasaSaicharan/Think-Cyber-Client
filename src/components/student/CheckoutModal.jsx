import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { topicService } from '../../services/apiService';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';

const CheckoutModal = ({ isOpen, onClose, itemData, onProceed, currency = '₹' }) => {
    const { userData } = useContext(AppContext);
    const [couponCode, setCouponCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');
    const [finalTotal, setFinalTotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        if (isOpen && itemData) {
            setFinalTotal(itemData.price);
            setDiscountAmount(0);
            setAppliedCoupon(null);
            setCouponCode('');
            setError('');
        }
    }, [isOpen, itemData]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            // User API Spec: Validate Coupon only strictly requires code and userId (backend fetches email/context)
            // But wait, CheckoutModal doesn't have userId in props? 
            // Actually, CheckoutModal is a presentation component. It usually relies on service. 
            // However, the service call needs userId. 
            // Let's check where userId comes from. CheckoutModal doesn't seem to use AppContext for user.
            // Ah, looking at the code, CheckoutModal seems to interpret `topicService.validateCoupon` signature.
            // But wait, the previous code passed `itemData.price`. It did NOT pass `userId`.
            // The previous signature in apiService was `validateCoupon(code, amount, userId)`. 
            // But looking at CheckoutModal line 34: `topicService.validateCoupon(couponCode, itemData.price)`.
            // It was passing `amount` as 2nd arg, and `undefined` as 3rd arg!
            // The service needs `userId`. CheckoutModal needs to get `userId`.

            // FIX: I will modify CheckoutModal to accept `userId` or get it from context.
            // And then call `topicService.validateCoupon(couponCode, userId)`.

            const result = await topicService.validateCoupon(couponCode, userData?.id);

            if (result.success) {
                const coupon = result.data;
                let calculatedDiscount = 0;
                const price = Number(itemData.price) || 0; // Ensure number

                if (coupon.discount_type === 'fixed') {
                    calculatedDiscount = Number(coupon.discount_value);
                } else if (coupon.discount_type === 'percentage') {
                    calculatedDiscount = (price * Number(coupon.discount_value)) / 100;
                }

                // Cap and Round
                calculatedDiscount = Math.min(calculatedDiscount, price);
                // Fix to 2 decimals to match currency standards (prevent 3999 * 0.1 = 399.9000004)
                calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

                setAppliedCoupon(coupon);
                setDiscountAmount(calculatedDiscount);

                // Final Total Calculation
                const newTotal = Math.max(0, price - calculatedDiscount);
                // Ensure precise decimal for total
                setFinalTotal(Math.round(newTotal * 100) / 100);

                toast.success(coupon.message || 'Coupon applied successfully!');
            } else {
                // Backend returned 200 but success: false
                // Check for 'message' (standard) or 'error' property
                const failureMsg = result.message || result.error || 'Failed to apply coupon';
                setError(failureMsg);
                setAppliedCoupon(null);
                setDiscountAmount(0);
                setFinalTotal(itemData.price);
            }
        } catch (err) {
            console.error(err);
            // Dynamic Error Handling: Check for backend specific error message
            // Priority:
            // 1. err.response.data.message (standard JSON response)
            // 2. err.response.data.error (some backends use 'error' field)
            // 3. err.message (network error)
            // 4. Default fallback
            const backendError = err?.response?.data;
            const errorMessage = backendError?.message || backendError?.error || 'Failed to apply coupon';
            setError(errorMessage);

            setAppliedCoupon(null);
            setDiscountAmount(0);
            setFinalTotal(itemData.price);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setDiscountAmount(0);
        setFinalTotal(itemData.price);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex justify-between items-center relative">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide font-outfit">Secure Checkout</h2>
                        <p className="text-blue-100 text-[10px] font-light mt-0.5">Complete your purchase</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Area - Removed Overflow Auto for "fit exactly" feel if content is small enough */}
                <div className="p-5 flex-1">

                    {/* Item Details Card */}
                    <div className="flex gap-3 mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden shadow-sm border border-gray-200">
                            <img
                                src={itemData.thumbnail || assets.BasicSecurityImage || "https://placehold.co/100"}
                                alt="Course"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://placehold.co/100?text=Course"; }}
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                                {itemData.type === 'BUNDLE' ? 'Premium Bundle' : 'Course'}
                            </span>
                            <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 font-outfit">
                                {itemData.title}
                            </h3>
                            <div className="mt-0.5 font-extrabold text-gray-900 text-base font-roboto">
                                {currency}{itemData.price.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-[10px] text-gray-400 font-medium tracking-wide">COUPONS & OFFERS</span>
                        </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-4">
                        {!appliedCoupon ? (
                            <div>
                                <div className="relative flex shadow-sm rounded-lg overflow-hidden border border-gray-200 group focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter Coupon Code"
                                        className="block w-full pl-3 pr-2 py-2.5 border-none bg-white text-gray-900 placeholder-gray-400 focus:ring-0 text-sm font-medium"
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isValidating || !couponCode}
                                        className="bg-gray-900 hover:bg-black text-white px-4 py-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wide"
                                    >
                                        {isValidating ? (
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : 'APPLY'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50/50 border border-green-200 rounded-lg p-2.5 flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-bold font-mono text-xs tracking-wide">{appliedCoupon.code}</p>
                                        <p className="text-green-600 text-[10px] font-medium">
                                            - {currency}{discountAmount.toLocaleString()} saved
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                                    title="Remove Coupon"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-red-500 animate-shake">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] font-medium">{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Subtotal</span>
                            <span>{currency}{itemData.price.toLocaleString()}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600 text-xs font-medium">
                                <span>Discount</span>
                                <span>-{currency}{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 my-1.5 pt-1.5 flex justify-between items-end">
                            <span className="text-gray-800 font-bold text-sm">Total Pay</span>
                            <span className={`text-lg font-extrabold tracking-tight font-roboto ${finalTotal === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {finalTotal === 0 ? 'FREE' : `${currency}${finalTotal.toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-gray-100 z-20">
                    <button
                        onClick={() => onProceed(finalTotal, appliedCoupon)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        <span>{finalTotal === 0 ? 'Enroll Now' : 'Proceed via Razorpay'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <div className="text-center mt-2 flex items-center justify-center gap-1 opacity-60">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <span className="text-[10px] font-semibold text-gray-400 tracking-wider">SECURE PAYMENT ENTITY</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
