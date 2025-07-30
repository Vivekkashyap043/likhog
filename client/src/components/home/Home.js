import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { FaEdit, FaUsers, FaBook, FaArrowRight, FaStar, FaQuoteLeft, FaHeart, FaComments } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

function Home() {
  const [stats, setStats] = useState({
    readers: 0,
    writers: 0,
    articles: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COMMON.STATS);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values if API fails
      setStats({
        readers: 100,
        writers: 50,
        articles: 200
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num + '+';
  };
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-overlay"></div>
        </div>
        <div className="container-fluid px-1">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">
                  Share Your <span className="highlight">Stories</span>
                  <br />
                  Connect with <span className="highlight">Readers</span>
                </h1>
                <p className="hero-description">
                  Welcome to our vibrant blogging community where writers share their passion, 
                  readers discover amazing content, and ideas come to life. Join thousands of 
                  creators and start your blogging journey today.
                </p>
                <div className="hero-buttons">
                  <Link to="/register" className="btn btn-primary hero-btn">
                    <FaEdit className="me-2" />
                    Start Writing
                  </Link>
                  <Link to="/signin" className="btn btn-outline-light hero-btn-outline">
                    Sign In
                    <FaArrowRight className="ms-2" />
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <FaUsers className="stat-icon" />
                    <span className="stat-number">
                      {isLoading ? '...' : formatNumber(stats.readers)}
                    </span>
                    <span className="stat-label">Readers</span>
                  </div>
                  <div className="stat-item">
                    <FaEdit className="stat-icon" />
                    <span className="stat-number">
                      {isLoading ? '...' : formatNumber(stats.writers)}
                    </span>
                    <span className="stat-label">Writers</span>
                  </div>
                  <div className="stat-item">
                    <FaBook className="stat-icon" />
                    <span className="stat-number">
                      {isLoading ? '...' : formatNumber(stats.articles)}
                    </span>
                    <span className="stat-label">Articles</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                <div className="floating-card card-1">
                  <FaEdit className="card-icon" />
                  <h4>Create</h4>
                  <p>Write amazing articles</p>
                </div>
                <div className="floating-card card-2">
                  <FaHeart className="card-icon" />
                  <h4>Engage</h4>
                  <p>Like and comment on posts</p>
                </div>
                <div className="floating-card card-3">
                  <FaUsers className="card-icon" />
                  <h4>Connect</h4>
                  <p>Build your audience</p>
                </div>
                <div className="floating-card card-4">
                  <FaBook className="card-icon" />
                  <h4>Discover</h4>
                  <p>Read great content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container-fluid px-1">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Why Choose Our Platform?</h2>
              <p className="section-subtitle">
                Everything you need to create, share, and grow your blog
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaEdit />
                </div>
                <h4>Easy Writing</h4>
                <p>
                  Intuitive editor with rich text formatting, media embedding, 
                  and real-time preview makes writing a pleasure.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <h4>Community Driven</h4>
                <p>
                  Connect with like-minded writers and readers. Share ideas, 
                  get feedback, and grow together.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <h4>Rich Content</h4>
                <p>
                  Discover articles across various topics. From tech to lifestyle, 
                  find content that inspires you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container-fluid px-1">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title text-white">What Our Users Say</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p>
                  "This platform has transformed how I share my thoughts. 
                  The community is amazing and very supportive!"
                </p>
                <div className="testimonial-author">
                  <strong>Sarah Johnson</strong>
                  <span>Tech Blogger</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p>
                  "I love how easy it is to write and publish articles. 
                  The interface is clean and user-friendly."
                </p>
                <div className="testimonial-author">
                  <strong>Mike Chen</strong>
                  <span>Lifestyle Writer</span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="testimonial-card">
                <FaQuoteLeft className="quote-icon" />
                <p>
                  "As a reader, I discover amazing content daily. 
                  The variety and quality of articles is outstanding."
                </p>
                <div className="testimonial-author">
                  <strong>Emma Davis</strong>
                  <span>Avid Reader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container-fluid px-1">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="cta-title">Ready to Start Your Blogging Journey?</h2>
              <p className="cta-description">
                Join our community of writers and readers today. It's free and takes less than a minute.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary cta-btn">
                  <FaEdit className="me-2" />
                  Join as Author
                </Link>
                <Link to="/register" className="btn btn-outline-primary cta-btn-outline">
                  <FaBook className="me-2" />
                  Join as Reader
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
