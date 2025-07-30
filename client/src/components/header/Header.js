import React, { useState } from "react";
import "./Header.css";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetState } from "../../redux/slices/userAuthorSlice";
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaEdit, FaBook, FaHome, FaSignInAlt } from "react-icons/fa";

function Header() {
  let { loginUserStatus, currentUser } = useSelector(
    (state) => state.userAuthorLoginReducer
  );
  let dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function signout() {
    localStorage.removeItem('token');
    dispatch(resetState());
    setIsMenuOpen(false);
    navigate('/'); // Navigate to home page after signout
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          <div className="logo-icon">
            <FaEdit />
          </div>
          <span className="logo-text">LikhoG</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {loginUserStatus === false ? (
            <>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              
              {currentUser.userType === "user" && (
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/user-profile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Articles
                  </NavLink>
                </li>
              )}
              
              {currentUser.userType === "author" && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/author-profile"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Articles
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/author-profile/new-article"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Write
                    </NavLink>
                  </li>
                </>
              )}
              
              <li className="nav-item user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    <FaUser />
                  </div>
                  <div className="user-details">
                    <span className="username">{currentUser.fullName}</span>
                    <span className="user-type">{currentUser.userType}</span>
                  </div>
                </div>
                <button className="logout-btn" onClick={signout}>
                  <FaSignOutAlt className="logout-icon" />
                  Sign Out
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
}

export default Header;

