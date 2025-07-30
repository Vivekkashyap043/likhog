import {useState,useEffect} from 'react';
import { axiosWithToken } from '../../axiosWithToken';
import {useNavigate,Outlet} from 'react-router-dom'
import {useSelector} from 'react-redux'
import { FaEye, FaHeart, FaRegHeart, FaComment, FaCalendar, FaUser, FaSearch, FaFilter } from 'react-icons/fa';
import './Articles.css';
import { API_ENDPOINTS } from '../../config/api';

function Articles() {

  const [articlesList, setArticlesList] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState(new Set());
  
  let navigate=useNavigate()
  let { currentUser } = useSelector(
    (state) => state.userAuthorLoginReducer
  );

  const getArticlesOfCurrentAuthor=async()=>{
    try {
      setLoading(true);
      let res=await axiosWithToken.get(API_ENDPOINTS.USER.ARTICLES)
      console.log(res)
      setArticlesList(res.data.payload)
      setFilteredArticles(res.data.payload)
      
      // Initialize liked articles for current user
      if (currentUser && currentUser.userType === "user") {
        const userLikedArticles = new Set();
        res.data.payload.forEach(article => {
          if (article.likedUsers && article.likedUsers.includes(currentUser.username)) {
            userLikedArticles.add(article.articleId);
          }
        });
        setLikedArticles(userLikedArticles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle like/unlike
  const handleLikeToggle = async (articleId, event) => {
    event.stopPropagation(); // Prevent triggering article read
    try {
      console.log('Toggling like for article:', articleId);
      const res = await axiosWithToken.post(API_ENDPOINTS.USER.LIKE_ARTICLE(articleId));
      console.log('Like toggle response:', res.data);
      
      // Update the liked articles set
      const newLikedArticles = new Set(likedArticles);
      if (res.data.liked) {
        newLikedArticles.add(articleId);
      } else {
        newLikedArticles.delete(articleId);
      }
      setLikedArticles(newLikedArticles);
      
      // Update the articles list with new like count immediately
      const updatedArticlesList = articlesList.map(article => {
        if (article.articleId === articleId) {
          return { 
            ...article, 
            likes: res.data.likesCount,
            likedUsers: res.data.liked 
              ? [...(article.likedUsers || []).filter(user => user !== currentUser.username), currentUser.username]
              : (article.likedUsers || []).filter(user => user !== currentUser.username)
          };
        }
        return article;
      });
      
      setArticlesList(updatedArticlesList);
      
      // Apply current filters to the updated list
      const filtered = updatedArticlesList.filter(article => {
        const matchesSearch = searchTerm === "" || 
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.authorFullName && article.authorFullName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = selectedCategory === "all" || 
          article.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
      
      setFilteredArticles(filtered);
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Filter articles based on search and category
  useEffect(() => {
    let filtered = articlesList;
    
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.authorFullName && article.authorFullName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articlesList]);

  const readArticleByArticleId=(articleObj)=>{
    navigate(`../article/${articleObj.articleId}`,{state:articleObj})
  }

  // Get unique categories from articles
  const predefinedCategories = [
    "programming", "AI&ML", "database", "maths", "physics", "chemistry", 
    "environment", "business", "law", "music", "sports", "religion", 
    "social", "health", "education", "technology", "science", "lifestyle", 
    "travel", "food", "art", "history", "politics", "economics", "psychology", "other"
  ];
  
  const articleCategories = [...new Set(articlesList.map(article => article.category))];
  const categories = [...new Set([...predefinedCategories, ...articleCategories])].sort();

  useEffect(()=>{
    getArticlesOfCurrentAuthor()
  },[])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing articles...</p>
      </div>
    );
  }

  return (
    <div className="articles-container">
      {/* Hero Header Section */}
      <div className="articles-header">
        <h1>Discover Amazing Stories</h1>
        <p>Explore thousands of articles from talented writers around the world</p>
        
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles, authors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="articles-stats">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} available to read
        </div>
      </div>

      {/* Articles Grid */}
      <div className="articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="no-articles">
            <FaSearch size={48} />
            <h3>No articles found</h3>
            <p>Try adjusting your search or filter criteria to discover more content</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div key={article.articleId} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              maxWidth: '400px',
              margin: '0 auto 1.5rem auto',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
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
                  <span>{new Date(article.dateOfCreation).toLocaleDateString('en-US', { 
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
                onClick={()=>readArticleByArticleId(article)}
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
          ))
        )}
      </div>
    </div>
  );
}

export default Articles;