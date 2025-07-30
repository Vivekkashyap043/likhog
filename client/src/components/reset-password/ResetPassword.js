import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import './ResetPassword.css';
import { API_ENDPOINTS } from '../../config/api';

function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  const password = watch('password');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrorMessage('Invalid or missing reset token');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post(API_ENDPOINTS.COMMON.RESET_PASSWORD, {
        token: token,
        newPassword: data.password
      });
      
      if (response.data.message === 'Password reset successfully') {
        setIsPasswordReset(true);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="reset-password-container">
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="row w-100">
            <div className="col-lg-4 col-md-6 col-sm-8 mx-auto">
              <div className="reset-password-card success-card">
                <div className="text-center">
                  <FaCheckCircle className="success-icon" />
                  <h2 className="success-title">Password Reset!</h2>
                  <p className="success-message">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </p>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="btn btn-primary back-to-signin-btn"
                  >
                    Continue to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="row w-100">
            <div className="col-lg-4 col-md-6 col-sm-8 mx-auto">
              <div className="reset-password-card error-card">
                <div className="text-center">
                  <h2 className="error-title">Invalid Reset Link</h2>
                  <p className="error-message">
                    This password reset link is invalid or has expired. Please request a new password reset.
                  </p>
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request New Reset Link
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
    <div className="reset-password-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="row w-100">
          <div className="col-lg-4 col-md-6 col-sm-8 mx-auto">
            <div className="reset-password-card">
              <div className="reset-password-header">
                <h2 className="reset-password-title">
                  <FaLock className="me-2" />
                  Reset Your Password
                </h2>
                <p className="reset-password-subtitle">
                  Enter your new password below
                </p>
              </div>
              
              <div className="reset-password-body">
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
                  {/* New Password Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        placeholder="Enter your new password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters long"
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                          }
                        })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="form-group mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        placeholder="Confirm your new password"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: value => value === password || "Passwords do not match"
                        })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="password-strength mb-3">
                      <small className="text-muted">Password strength:</small>
                      <div className="progress">
                        <div 
                          className={`progress-bar ${
                            password.length >= 8 && 
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
                              ? 'bg-success' 
                              : password.length >= 6 
                                ? 'bg-warning' 
                                : 'bg-danger'
                          }`}
                          style={{
                            width: `${
                              password.length >= 8 && 
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
                                ? '100%' 
                                : password.length >= 6 
                                  ? '60%' 
                                  : '30%'
                            }`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary reset-password-btn w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2" />
                        Reset Password
                      </>
                    )}
                  </button>

                  {/* Back to Sign In */}
                  <div className="text-center">
                    <Link to="/signin" className="back-to-signin-link">
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

export default ResetPassword;
