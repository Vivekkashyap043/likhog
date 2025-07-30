import axios from "axios";
import { axiosWithToken } from '../../axiosWithToken'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./ArticlesByAuthor.css";
import { useNavigate, Outlet } from "react-router-dom";
import { FaEdit, FaEye, FaCalendar, FaComment, FaHeart, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { API_ENDPOINTS } from '../../config/api';

function ArticlesByAuthor() {
  const [articlesList, setArticlesList] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  let navigate = useNavigate();
  let { currentUser } = useSelector(
    (state) => state.userAuthorLoginReducer
  );

  const getArticlesOfCurrentAuthor = async () => {
    let res = await axiosWithToken.get(API_ENDPOINTS.AUTHOR.ARTICLES_BY_AUTHOR(currentUser.username))
    console.log(res)
    setArticlesList(res.data.payload)
    setFilteredArticles(res.data.payload)
  }

  const readArticleByArticleId = (articleObj) => {
    navigate(`../article/${articleObj.articleId}`, { state: articleObj })
  }

  // Filter articles based on search and category
  useEffect(() => {
    let filtered = articlesList.filter(article => article.status !== false); // Only show published articles
    
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articlesList]);

  useEffect(() => {
    getArticlesOfCurrentAuthor()
  }, [])

  const categories = [
    { value: "all", label: "All Articles" },
    { value: "programming", label: "Programming" },
    { value: "AI&ML", label: "AI & ML" },
    { value: "database", label: "Database" },
    { value: "maths", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "environment", label: "Environment" },
    { value: "business", label: "Business" },
    { value: "law", label: "Law" },
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "religion", label: "Religion" },
    { value: "social", label: "Social Issues" },
    { value: "health", label: "Health & Medicine" },
    { value: "education", label: "Education" },
    { value: "technology", label: "Technology" },
    { value: "science", label: "Science" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food & Cooking" },
    { value: "art", label: "Art & Design" },
    { value: "history", label: "History" },
    { value: "politics", label: "Politics" },
    { value: "economics", label: "Economics" },
    { value: "psychology", label: "Psychology" },
    { value: "finance", label: "Finance" },
    { value: "marketing", label: "Marketing" },
    { value: "self-improvement", label: "Self Improvement" },
    { value: "gaming", label: "Gaming" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="articles-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <FaEdit />
            My Stories
          </h1>
          <p className="dashboard-subtitle">
            Manage and track your published articles
          </p>
        </div>
        <button 
          className="create-new-btn"
          onClick={() => navigate('../new-article')}
        >
          <FaPlus />
          Write New Story
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search your articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FaFilter />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FaEdit />
          </div>
          <h3>No articles found</h3>
          <p>
            {articlesList.filter(article => article.status !== false).length === 0 
              ? "Start your writing journey by creating your first article!"
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {articlesList.filter(article => article.status !== false).length === 0 && (
            <button 
              className="empty-cta-btn"
              onClick={() => navigate('../new-article')}
            >
              <FaPlus />
              Write Your First Story
            </button>
          )}
        </div>
      ) : (
        <div className="articles-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {filteredArticles.map((article) => (
            <div key={article.articleId} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
            >
              {/* Category Badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  SOCIAL
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1.3',
                marginBottom: '0.75rem',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                {article.title}
              </h3>

              {/* Description */}
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                {article.content.replace(/<[^>]*>/g, '').length > 120 
                  ? article.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                  : article.content.replace(/<[^>]*>/g, '')
                }
              </p>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaCalendar style={{ color: '#6b7280' }} />
                  <span>{new Date(article.dateOfModification || article.dateOfCreation).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaEye style={{ color: '#6b7280' }} />
                  <span>{article.views || 0} views</span>
                </div>
              </div>

              {/* Like and Comment Counts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaHeart style={{ color: '#6b7280' }} />
                  <span>{article.likes || 0} likes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaComment style={{ color: '#6b7280' }} />
                  <span>{article.comments?.length || 0} comments</span>
                </div>
              </div>

              {/* Read Article Button */}
              <button 
                onClick={() => readArticleByArticleId(article)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#3b82f6';
                }}
              >
                <FaEye />
                Read Full Article
              </button>
            </div>
          ))}
        </div>
      )}
      
      <Outlet />
    </div>
  );
}

export default ArticlesByAuthor;
