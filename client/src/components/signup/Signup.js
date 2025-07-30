import "./Signup.css";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUserPlus, FaCheckCircle } from "react-icons/fa";
import { API_ENDPOINTS } from "../../config/api";

function Signup() {
  let {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  
  let [errorMessage, setErrorMessage] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  let [signupSuccess, setSignupSuccess] = useState(false);
  let [selectedUserType, setSelectedUserType] = useState("user");
  let [showPassword, setShowPassword] = useState(false);
  let [showConfirmPassword, setShowConfirmPassword] = useState(false);
  let navigate = useNavigate();

  const password = watch('password');

  async function onSignUpFormSubmit(userObj) {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      if (!userObj.userType) {
        userObj.userType = selectedUserType;
      }
      
      let res;
      if (userObj.userType === "user") {
        res = await axios.post(API_ENDPOINTS.USER.REGISTER, userObj);
      } else {
        res = await axios.post(API_ENDPOINTS.AUTHOR.REGISTER, userObj);
      }
      
      if (res.status === 201) {
        setSignupSuccess(true);
      } else {
        setErrorMessage(res.data.message);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="signup-container">
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
          <div className="row w-100">
            <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
              <div className="signup-card success-card">
                <div className="text-center">
                  <FaCheckCircle className="success-icon" />
                  <h2 className="success-title">Registration Successful!</h2>
                  <p className="success-message">
                    Your account has been created successfully! 
                  </p>
                  <div className="verification-info">
                    <div className="verification-note mb-3">
                      <FaEnvelope className="envelope-icon me-2" />
                      <span>A verification email has been sent to your email address</span>
                    </div>
                    <div className="verification-steps">
                      <p><strong>Next Steps:</strong></p>
                      <ol className="text-start">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>Return here to sign in with your credentials</li>
                      </ol>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="btn btn-primary continue-signin-btn"
                  >
                    Continue to Sign In
                  </button>
                  <div className="text-center mt-3">
                    <Link to="/" className="home-link">
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="row w-100">
          <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
            <div className="signup-card">
              <div className="signup-header">
                <h2 className="signup-title">
                  <FaUserPlus className="me-2" />
                  Join Our Community
                </h2>
                <p className="signup-subtitle">Create your account to get started</p>
              </div>
              
              <div className="signup-body">
                {/* Error Message */}
                {errorMessage && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSignUpFormSubmit)} className="signup-form">
                  {/* User Type Selection */}
                  <div className="user-type-selector mb-4">
                    <label className="form-label">Join as:</label>
                    <div className="user-type-options">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="user-signup"
                          value="user"
                          checked={selectedUserType === "user"}
                          {...register("userType", { required: "Please select account type" })}
                          onChange={(e) => setSelectedUserType(e.target.value)}
                        />
                        <label htmlFor="user-signup" className="form-check-label">
                          <FaUser className="me-2" />
                          Reader
                          <small className="d-block text-muted">Discover and read amazing content</small>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="author-signup"
                          value="author"
                          checked={selectedUserType === "author"}
                          {...register("userType", { required: "Please select account type" })}
                          onChange={(e) => setSelectedUserType(e.target.value)}
                        />
                        <label htmlFor="author-signup" className="form-check-label">
                          <FaUser className="me-2" />
                          Author
                          <small className="d-block text-muted">Write and share your stories</small>
                        </label>
                      </div>
                    </div>
                    {errors.userType && (
                      <div className="invalid-feedback d-block">
                        {errors.userType.message}
                      </div>
                    )}
                  </div>

                  {/* Full Name Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                        id="fullName"
                        placeholder="Enter your full name"
                        {...register("fullName", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Full name must be at least 2 characters"
                          },
                          maxLength: {
                            value: 50,
                            message: "Full name must be less than 50 characters"
                          }
                        })}
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">
                          {errors.fullName.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    {/* Email Field */}
                    <div className="col-12 mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          placeholder="Enter your email"
                          {...register("email", {
                            required: "Email is required",
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
                  </div>

                  {/* Password Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        placeholder="Create a strong password"
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
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        placeholder="Confirm your password"
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
                    className="btn btn-primary signup-btn w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" />
                        Create Account
                      </>
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center mt-3">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/signin" className="signin-link">
                      Sign in here
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

export default Signup;
