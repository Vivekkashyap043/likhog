import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmailVerification.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setVerificationStatus('error');
            setMessage('Invalid verification link');
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await axios.post(API_ENDPOINTS.COMMON.VERIFY_EMAIL, {
                token: token
            });
            
            setVerificationStatus('success');
            setMessage(response.data.message);
            
            // Redirect to signin after 3 seconds
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
            
        } catch (error) {
            setVerificationStatus('error');
            setMessage(error.response?.data?.message || 'Email verification failed');
        }
    };

    const handleReturnToSignin = () => {
        navigate('/signin');
    };

    return (
        <div className="email-verification-container">
            <div className="verification-card">
                <div className="verification-icon">
                    {verificationStatus === 'loading' && (
                        <FaSpinner className="spinner-icon" />
                    )}
                    {verificationStatus === 'success' && (
                        <FaCheckCircle className="success-icon" />
                    )}
                    {verificationStatus === 'error' && (
                        <FaTimesCircle className="error-icon" />
                    )}
                </div>
                
                <h1 className="verification-title">
                    {verificationStatus === 'loading' && 'Verifying Email...'}
                    {verificationStatus === 'success' && 'Email Verified!'}
                    {verificationStatus === 'error' && 'Verification Failed'}
                </h1>
                
                <p className="verification-message">
                    {message}
                </p>
                
                {verificationStatus === 'success' && (
                    <div className="success-content">
                        <p className="redirect-info">
                            <FaEnvelope className="envelope-icon" />
                            Your email has been successfully verified. You can now sign in to your account.
                        </p>
                        <p className="auto-redirect">
                            Redirecting to sign in page in 3 seconds...
                        </p>
                    </div>
                )}
                
                {verificationStatus === 'error' && (
                    <div className="error-content">
                        <p className="error-help">
                            The verification link may have expired or is invalid. 
                            Please try registering again or contact support.
                        </p>
                    </div>
                )}
                
                <button 
                    className="return-btn"
                    onClick={handleReturnToSignin}
                >
                    {verificationStatus === 'success' ? 'Sign In Now' : 'Return to Sign In'}
                </button>
            </div>
        </div>
    );
}

export default EmailVerification;
