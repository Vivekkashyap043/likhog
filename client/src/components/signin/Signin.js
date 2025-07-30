import "./Signin.css";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { userAuthorLoginThunk } from "../../redux/slices/userAuthorSlice";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";

function Signin() {
  let {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  
  let { isPending, currentUser, loginUserStatus, errorOccurred, errMsg } =
    useSelector((state) => state.userAuthorLoginReducer);
  let dispatch = useDispatch();
  let navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("user");

  function onSignUpFormSubmit(userCred) {
    if (!userCred.userType) {
      userCred.userType = selectedUserType;
    }
    dispatch(userAuthorLoginThunk(userCred));
  }

  useEffect(() => {
    if (loginUserStatus) {
      if (currentUser.userType === "user") {
        navigate("/user-profile");
      }
      if (currentUser.userType === "author") {
        navigate("/author-profile");
      }
    }
  }, [loginUserStatus, currentUser, navigate]);

  return (
    <div className="signin-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="row w-100">
          <div className="col-lg-5 col-md-7 col-sm-9 mx-auto">
            <div className="signin-card">
              <div className="signin-header">
                <h2 className="signin-title">
                  <FaSignInAlt className="me-2" />
                  Welcome Back
                </h2>
                <p className="signin-subtitle">Sign in to your account</p>
              </div>
              
              <div className="signin-body">
                {/* Error Message */}
                {errorOccurred && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {typeof errMsg === 'string' ? errMsg : 'An error occurred during login'}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSignUpFormSubmit)} className="signin-form">
                  {/* User Type Selection */}
                  <div className="user-type-selector mb-4">
                    <label className="form-label">Sign in as:</label>
                    <div className="user-type-options">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="user"
                          value="user"
                          checked={selectedUserType === "user"}
                          {...register("userType", { required: "Please select user type" })}
                          onChange={(e) => setSelectedUserType(e.target.value)}
                        />
                        <label htmlFor="user" className="form-check-label">
                          <FaUser className="me-2" />
                          Reader
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="author"
                          value="author"
                          checked={selectedUserType === "author"}
                          {...register("userType", { required: "Please select user type" })}
                          onChange={(e) => setSelectedUserType(e.target.value)}
                        />
                        <label htmlFor="author" className="form-check-label">
                          <FaUser className="me-2" />
                          Author
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
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaUser />
                      </span>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="Enter your email address"
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

                  {/* Password Field */}
                  <div className="form-group mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters"
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

                  {/* Forgot Password Link */}
                  <div className="text-end mb-3">
                    <Link to="/forgot-password" className="forgot-password-link">
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary signin-btn w-100"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Sign Up Link */}
                  <div className="text-center mt-3">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" className="signup-link">
                      Sign up here
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

export default Signin;
