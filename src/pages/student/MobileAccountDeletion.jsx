import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicUserService } from '../../services/apiService';
import { toast } from 'react-toastify';
import { FaUserTimes, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const MobileAccountDeletion = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await publicUserService.getUserById(userId);
            setUser(response.data || response); // Handle various response structures
        } catch (err) {
            console.error("Failed to fetch user:", err);
            // Fallback for demo/testing if backend isn't ready yet or returns 404
            // Remove this fallback in production when API is fully ready
            if (err.response && err.response.status === 404) {
                setError("User not found.");
            } else {
                setError("Failed to load user information. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);
            await publicUserService.deleteUserById(userId);
            setDeleted(true);
            toast.success("Account deleted successfully");
        } catch (err) {
            console.error("Failed to delete account:", err);
            toast.error("Failed to delete account. Please try again.");
            setShowConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading user information...</p>
                </div>
            </div>
        );
    }

    if (deleted) {
        // Notify parent/webview if applicable
        try {
            const payload = { event: 'account_deleted', success: true, userId };
            // Try common channels used by webviews and iframes
            if (window?.parent) {
                window.parent.postMessage(payload, '*');
            }
            // Some environments (e.g., React Native WebView) expose a different bridge
            if (window?.ReactNativeWebView?.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
        } catch (e) {
            // Silently ignore messaging errors to avoid disrupting UI
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all">
                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Deleted</h2>
                    <p className="text-gray-600 mb-6">
                        Your account has been successfully deleted. We are sorry to see you go.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center text-red-500">
                    <FaExclamationTriangle className="text-5xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 p-6 text-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUserTimes className="text-3xl text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Delete Account</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        This action is permanent and cannot be undone.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Account to be deleted
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {user?.name && (
                                <p className="font-bold text-gray-900 text-lg mb-1">{user.name}</p>
                            )}
                            <p className="text-gray-600 font-mono text-sm break-all">{user?.email || 'User ID: ' + userId}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {!showConfirm ? (
                            <>
                                <div className="flex items-start bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <FaExclamationTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                        Deleting your account will remove all your data, including course progress, certificates, and purchase history.
                                    </p>
                                </div>

                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Delete Account
                                </button>
                            </>
                        ) : (
                            <div className="bg-red-50 rounded-xl p-6 border border-red-100 animate-fadeIn">
                                <h3 className="font-bold text-red-800 mb-2 text-center">Are you sure?</h3>
                                <p className="text-sm text-red-600 mb-4 text-center">
                                    This action cannot be undone. You will lose access to all your courses immediately.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={deleting}
                                        className="w-full py-3 px-6 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center"
                                    >
                                        {deleting ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Yes, Delete My Account'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelDelete}
                                        disabled={deleting}
                                        className="w-full py-3 px-6 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-center text-xs text-gray-400 mt-4">
                            By proceeding, you agree to our Terms of Service regarding account deletion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileAccountDeletion;
