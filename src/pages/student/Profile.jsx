import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/apiService';

const Profile = () => {
    const { userData, setUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteReason, setDeleteReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Handle token from URL (for mobile app webview support)
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('authToken', token);
            // Force reload to let AppContext pick up the token
            window.location.href = '/profile';
        }
    }, []);

    // If no user data, show loading or redirect
    // We wait a bit if there's a token logic running
    if (!userData) {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

        // Basic redirect if not logged in
        // setTimeout(() => navigate('/'), 100);
        // Commented out navigate to avoid flickering during context load
        // instead show a message
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        try {
            setIsDeleting(true);
            await authService.deleteAccount(userData.email, { reason: deleteReason, otherReason });

            // Clear local storage and state
            localStorage.removeItem('authToken');
            localStorage.removeItem('wishlist');
            sessionStorage.clear();
            setUserData(null);

            toast.success('Your account has been successfully deleted');
            navigate('/');
            window.location.reload(); // Force reload to clear any remaining state
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">My Profile</h1>
                        <p className="text-blue-100 mt-1">Manage your account settings</p>
                    </div>

                    {/* User Details */}
                    <div className="p-6 space-y-6">
                        <div className="border-b pb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="mt-1 text-lg text-gray-900 font-medium">
                                        {userData.name || userData.firstname || 'N/A'} {userData.lastname || ''}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                    <p className="mt-1 text-lg text-gray-900 font-medium">{userData.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                                    <p className="mt-1 text-lg text-gray-900 font-medium">{userData.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Account Status</label>
                                    <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div>
                            <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                                <p className="mt-1 text-sm text-red-600">
                                    Once you delete your account, there is no going back. Please be certain.
                                    All your enrollments, progress, and personal data will be permanently removed.
                                </p>
                                <div className="mt-4">
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                                        <div className="mt-2 text-start">
                                            <p className="text-sm text-gray-500 mb-4">
                                                Are you sure you want to delete your account? This action cannot be undone.
                                                All your data will be permanently removed.
                                            </p>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Reason for leaving <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md border"
                                                    value={deleteReason}
                                                    onChange={(e) => setDeleteReason(e.target.value)}
                                                >
                                                    <option value="">Select a reason</option>
                                                    <option value="No longer using the app">No longer using the app</option>
                                                    <option value="Found a better alternative">Found a better alternative</option>
                                                    <option value="Too expensive">Too expensive</option>
                                                    <option value="Privacy concerns">Privacy concerns</option>
                                                    <option value="Not satisfied with content">Not satisfied with content</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            {deleteReason === 'Other' && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Please specify
                                                    </label>
                                                    <textarea
                                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                        rows="2"
                                                        placeholder="Tell us more..."
                                                        value={otherReason}
                                                        onChange={(e) => setOtherReason(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type <span className="font-bold">DELETE</span> to confirm <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                    placeholder="DELETE"
                                                    value={deleteConfirmText}
                                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                <button
                                    type="button"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${deleteConfirmText !== 'DELETE' || isDeleting || !deleteReason ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || isDeleting || !deleteReason}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Profile;
