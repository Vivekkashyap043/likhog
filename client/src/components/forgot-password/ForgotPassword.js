import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import './ForgotPassword.css';
import { API_ENDPOINTS } from '../../config/api';

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post(API_ENDPOINTS.COMMON.FORGOT_PASSWORD, {
        email: data.email,
        userType: data.userType
      });
      
      if (response.data.message === 'Password reset email sent') {
        setIsEmailSent(true);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="forgot-password-container">
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="row w-100">
            <div className="col-lg-4 col-md-6 col-sm-8 mx-auto">
              <div className="forgot-password-card success-card">
                <div className="text-center">
                  <FaCheckCircle className="success-icon" />
                  <h2 className="success-title">Email Sent!</h2>
                  <p className="success-message">
                    We've sent a password reset link to your email address. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <Link to="/signin" className="btn btn-primary back-to-signin-btn">
                    <FaArrowLeft className="me-2" />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="row w-100">
          <div className="col-lg-4 col-md-6 col-sm-8 mx-auto">
            <div className="forgot-password-card">
              <div className="forgot-password-header">
                <h2 className="forgot-password-title">
                  <FaEnvelope className="me-2" />
                  Forgot Password?
                </h2>
                <p className="forgot-password-subtitle">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <div className="forgot-password-body">
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
                  {/* User Type Selection */}
                  <div className="user-type-selector mb-4">
                    <label className="form-label">Account Type:</label>
                    <div className="user-type-options">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="user-forgot"
                          value="user"
                          {...register("userType", { required: "Please select account type" })}
                        />
                        <label htmlFor="user-forgot" className="form-check-label">
                          Reader Account
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="author-forgot"
                          value="author"
                          {...register("userType", { required: "Please select account type" })}
                        />
                        <label htmlFor="author-forgot" className="form-check-label">
                          Author Account
                        </label>
                      </div>
                    </div>
                    {errors.userType && (
                      <div className="invalid-feedback d-block">
                        {errors.userType.message}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-group mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="Enter your email address"
                        {...register("email", {
                          required: "Email address is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address"
                          }
                        })}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary forgot-password-btn w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="me-2" />
                        Send Reset Link
                      </>
                    )}
                  </button>

                  {/* Back to Sign In */}
                  <div className="text-center">
                    <Link to="/signin" className="back-to-signin-link">
                      <FaArrowLeft className="me-2" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
