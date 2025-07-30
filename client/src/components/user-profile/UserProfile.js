import "./UserProfile.css";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { axiosWithToken } from '../../axiosWithToken';
import { FaUser, FaBookOpen, FaEye, FaHeart, FaComment, FaCalendar } from 'react-icons/fa';

function UserProfile() {
  const { currentUser } = useSelector(state => state.userAuthorLoginReducer);
  const [stats, setStats] = useState({
    totalArticlesRead: 0,
    totalComments: 0,
    totalLikes: 0,
    joinDate: ''
  });

  // Fetch user reading statistics
  const fetchUserStats = async () => {
    try {
      // You can create an endpoint to get user reading statistics
      // For now, using placeholder data structure
      const joinDate = currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently';
      
      setStats({
        totalArticlesRead: 0, // This would come from user reading history
        totalComments: 0, // This would come from user comments
        totalLikes: 0, // This would come from user likes
        joinDate: joinDate
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.username) {
      fetchUserStats();
    }
  }, [currentUser]);

  return (
    <div className="reader-dashboard">
      {/* Header Section */}
      <div className="reader-header">
        <div className="reader-welcome">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome back, {currentUser.fullName || currentUser.username}</h1>
            <p className="welcome-subtitle">Discover amazing stories from talented authors</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="reader-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBookOpen />
          </div>
          <div className="stat-info">
            <h3>{stats.totalArticlesRead}</h3>
            <p>Articles Read</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaComment />
          </div>
          <div className="stat-info">
            <h3>{stats.totalComments}</h3>
            <p>Comments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div className="stat-info">
            <h3>{stats.totalLikes}</h3>
            <p>Likes Given</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendar />
          </div>
          <div className="stat-info">
            <h3>{stats.joinDate}</h3>
            <p>Member Since</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="reader-navigation">
        <NavLink
          className={({ isActive }) => `nav-card reader-nav ${isActive ? 'active' : ''}`}
          to="articles"
        >
          <div className="nav-icon">
            <FaBookOpen />
          </div>
          <div className="nav-content">
            <h3>Browse Articles</h3>
            <p>Explore the latest stories and articles</p>
          </div>
        </NavLink>
      </div>

      {/* Content Area */}
      <div className="reader-content">
        <Outlet />
      </div>
    </div>
  );
} 

export default UserProfile;
