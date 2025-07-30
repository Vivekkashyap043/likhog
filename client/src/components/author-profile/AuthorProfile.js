import "./AuthorProfile.css";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from 'react-redux';
import { FaEdit, FaFileAlt, FaChartLine, FaUser, FaBell, FaBookmark } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { axiosWithToken } from '../../axiosWithToken';
import { API_ENDPOINTS } from '../../config/api';

function AuthorProfile() {
  let { currentUser } = useSelector(state => state.userAuthorLoginReducer)
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0
  });

  // Fetch real statistics
  const fetchStats = async () => {
    try {
      const res = await axiosWithToken.get(API_ENDPOINTS.AUTHOR.ARTICLES_BY_AUTHOR(currentUser.username));
      const articles = res.data.payload;
      
      const totalArticles = articles.length;
      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      const totalComments = articles.reduce((sum, article) => sum + (article.comments ? article.comments.length : 0), 0);
      const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
      
      setStats({
        totalArticles,
        totalViews,
        totalComments,
        totalLikes
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.username) {
      fetchStats();
    }
  }, [currentUser]);

  return (
    <div className="writer-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="writer-welcome">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome back, {currentUser.fullName || currentUser.username}</h1>
            <p className="welcome-subtitle">Ready to share your next story?</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.totalArticles}</h3>
            <p>Articles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>{stats.totalViews}</h3>
            <p>Views</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaBell />
          </div>
          <div className="stat-info">
            <h3>{stats.totalComments}</h3>
            <p>Comments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaBookmark />
          </div>
          <div className="stat-info">
            <h3>{stats.totalLikes}</h3>
            <p>Likes</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="writer-navigation">
        <NavLink
          className={({ isActive }) => `nav-card ${isActive ? 'active' : ''}`}
          to={`articles-by-author/${currentUser.username}`}
        >
          <div className="nav-icon">
            <FaFileAlt />
          </div>
          <div className="nav-content">
            <h3>My Articles</h3>
            <p>View and manage your published stories</p>
          </div>
        </NavLink>

        <NavLink
          className={({ isActive }) => `nav-card create-new ${isActive ? 'active' : ''}`}
          to="new-article"
        >
          <div className="nav-icon">
            <FaEdit />
          </div>
          <div className="nav-content">
            <h3>Write New Story</h3>
            <p>Start crafting your next masterpiece</p>
          </div>
        </NavLink>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthorProfile;
