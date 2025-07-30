import "./Article.css";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosWithToken } from "../../axiosWithToken";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FcClock } from "react-icons/fc";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FcCalendar } from "react-icons/fc";
import { FcComments } from "react-icons/fc";
import { FcPortraitMode } from "react-icons/fc";
import { BiCommentAdd } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { MdRestore } from "react-icons/md";
import { FaHeart, FaRegHeart, FaEye, FaArrowLeft, FaSync } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

// Custom hook for responsive design
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width <= 768,
    isSmallMobile: windowSize.width <= 480,
    width: windowSize.width
  };
};

function Article() {
  const { state } = useLocation();
  const { isMobile, isSmallMobile } = useResponsive();
  let { currentUser } = useSelector(
    (state) => state.userAuthorLoginReducer
  );

  let { register, handleSubmit } = useForm();
  let [articleEditStatus, setArticleEditStatus] = useState(false);
  let [currentArticle, setCurrentArticle] = useState(state);
  let [comment, setComment] = useState("");
  let navigate = useNavigate();
  let [isLiked, setIsLiked] = useState(false);
  let [likesCount, setLikesCount] = useState(state.likes || 0);
  let [enrichedComments, setEnrichedComments] = useState([]);
  let [authorInfo, setAuthorInfo] = useState(null);
  let [commentsPollingInterval, setCommentsPollingInterval] = useState(null);
  let [isRefreshingComments, setIsRefreshingComments] = useState(false);
  // Removed showFullContent state - always show full content

  // Fetch author details
  const fetchAuthorDetails = async (username) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user-api/user-details/${username}`);
      setAuthorInfo(response.data);
    } catch (error) {
      console.error('Error fetching author details:', error);
      // Fallback: use username
      setAuthorInfo({
        fullName: username?.split('@')[0] || 'Anonymous',
        userType: 'author'
      });
    }
  };

  // Fetch updated article data including comments for real-time sync
  const fetchUpdatedArticle = async (showLoader = false) => {
    try {
      if (showLoader) setIsRefreshingComments(true);
      
      const response = await axios.get(`${API_BASE_URL}/user-api/article/${state.articleId}`);
      if (response.data.message === "Article found") {
        const updatedArticle = response.data.article;
        
        // Only update if comments have changed
        if (JSON.stringify(updatedArticle.comments) !== JSON.stringify(currentArticle.comments)) {
          setCurrentArticle(prev => ({
            ...prev,
            comments: updatedArticle.comments,
            likes: updatedArticle.likes || prev.likes,
            views: updatedArticle.views || prev.views
          }));
          
          // Re-enrich comments with the updated data
          enrichCommentsWithFullNames(updatedArticle.comments);
        }
      }
    } catch (error) {
      console.error('Error fetching updated article:', error);
    } finally {
      if (showLoader) setIsRefreshingComments(false);
    }
  };

  // Enrich comments with full names
  const enrichCommentsWithFullNames = async (comments) => {
    if (!comments || comments.length === 0) {
      setEnrichedComments([]);
      return;
    }

    console.log('Raw comments data:', comments); // Debug log

    const enriched = await Promise.all(
      comments.map(async (commentItem, index) => {
        try {
          console.log(`Processing comment item ${index}:`, commentItem); // Debug log
          
          // Initialize with safe defaults
          let commentText = '';
          let username = '';
          let dateOfComment = null;
          
          // Handle different comment structures safely
          if (commentItem && typeof commentItem === 'object') {
            // Check if it's a nested structure { comment: { ... } }
            if (commentItem.comment && typeof commentItem.comment === 'object') {
              commentText = commentItem.comment.comment || '';
              username = commentItem.comment.username || commentItem.username || '';
              dateOfComment = commentItem.comment.dateOfComment || commentItem.comment.date || commentItem.comment.createdAt;
            } 
            // Check if it's a direct structure { comment: "text", username: "user" }
            else if (commentItem.comment && typeof commentItem.comment === 'string') {
              commentText = commentItem.comment;
              username = commentItem.username || '';
              dateOfComment = commentItem.dateOfComment || commentItem.date || commentItem.createdAt;
            }
            // Direct comment object structure
            else {
              commentText = commentItem.comment || commentItem.text || '';
              username = commentItem.username || '';
              dateOfComment = commentItem.dateOfComment || commentItem.date || commentItem.createdAt;
            }
          }
          
          console.log(`Extracted - Text: "${commentText}", Username: "${username}"`); // Debug log
          
          // Create normalized comment object
          const normalizedComment = {
            comment: commentText,
            username: username,
            dateOfComment: dateOfComment
          };
          
          // If the comment already has a full name (newer comments), use it
          if (username && !username.includes('@')) {
            return { 
              comment: normalizedComment, 
              fullName: username 
            };
          }
          
          // For older comments with email usernames, fetch full name
          if (username && username.includes('@')) {
            try {
              const response = await axios.get(`${API_BASE_URL}/user-api/user-details/${username}`);
              return { 
                comment: normalizedComment, 
                fullName: response.data.fullName || username.split('@')[0]
              };
            } catch (error) {
              console.error('Error fetching user details:', error);
              return {
                comment: normalizedComment,
                fullName: username.split('@')[0] || 'Anonymous User'
              };
            }
          } else {
            // No username found, use fallback
            return {
              comment: normalizedComment,
              fullName: 'Anonymous User'
            };
          }
        } catch (error) {
          console.error(`Error processing comment at index ${index}:`, error);
          // Ultimate fallback
          return { 
            comment: {
              comment: 'Error loading comment',
              username: 'Unknown',
              dateOfComment: null
            }, 
            fullName: 'Unknown User' 
          };
        }
      })
    );
    
    console.log('Enriched comments:', enriched); // Debug log
    setEnrichedComments(enriched);
  };

  // Check if current user has liked this article and enrich comments
  useEffect(() => {
    if (currentUser && currentUser.userType === "user" && state.likedUsers) {
      setIsLiked(state.likedUsers.includes(currentUser.username));
    }
    
    // Fetch author details
    if (currentArticle.username) {
      fetchAuthorDetails(currentArticle.username);
    }
    
    // Enrich comments when component loads
    enrichCommentsWithFullNames(currentArticle.comments);
    
    // Increment view count when article is loaded
    if (currentUser && currentUser.userType === "user") {
      incrementViewCount();
    }

    // Set up polling for real-time comment updates every 30 seconds
    const interval = setInterval(() => {
      fetchUpdatedArticle();
    }, 30000); // Poll every 30 seconds

    setCommentsPollingInterval(interval);

    // Cleanup interval on component unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentUser, state.likedUsers]);

  // Re-enrich comments when currentArticle.comments changes
  useEffect(() => {
    enrichCommentsWithFullNames(currentArticle.comments);
  }, [currentArticle.comments]);

  // Increment view count when article is read (only once per user per article)
  const incrementViewCount = async () => {
    try {
      await axiosWithToken.post(`${API_BASE_URL}/user-api/view/${state.articleId}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    try {
      console.log('Toggling like for article:', state.articleId);
      const res = await axiosWithToken.post(`${API_BASE_URL}/user-api/like/${state.articleId}`);
      console.log('Like toggle response:', res.data);
      
      // Update local state
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      
      // Update the current article state
      setCurrentArticle(prev => ({
        ...prev,
        likes: res.data.likesCount,
        likedUsers: res.data.liked 
          ? [...(prev.likedUsers || []).filter(user => user !== currentUser.username), currentUser.username]
          : (prev.likedUsers || []).filter(user => user !== currentUser.username)
      }));
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const deleteArticle = async() => {
    let res = await axiosWithToken.delete(
      `${API_BASE_URL}/author-api/article/${currentArticle.articleId}`
    );
    if (res.data.message === "article deleted") {
      setCurrentArticle({ ...currentArticle, status: false });
    }
  };

  const restoreArticle = async () => {
    let res = await axiosWithToken.put(
      `${API_BASE_URL}/author-api/article/${currentArticle.articleId}`
    );
    if (res.data.message === "article restored") {
      setCurrentArticle({ ...currentArticle, status: true });
    }
  };

  const writeComment = async (commentObj) => {
    // Use full name from currentUser for new comments
    const firstName = currentUser.firstName || '';
    const lastName = currentUser.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    commentObj.comment = comment;
    commentObj.username = fullName || currentUser.username; // Use full name if available, otherwise username
    commentObj.dateOfComment = new Date().toISOString(); // Add current date

    let res = await axiosWithToken.post(
      `${API_BASE_URL}/user-api/comment/${currentArticle.articleId}`,
      commentObj
    );
    if (res.data.message === "Comment posted") {
      setComment("");
      
      // Create the new comment object with proper structure
      const newComment = {
        comment: commentObj.comment,
        username: commentObj.username,
        dateOfComment: commentObj.dateOfComment,
        ...res.data.comment // Include any additional fields from server
      };
      
      const updatedArticle = {
        ...currentArticle,
        comments: [...currentArticle.comments, newComment]
      };
      setCurrentArticle(updatedArticle);
      
      // Re-enrich comments to include the new comment
      enrichCommentsWithFullNames(updatedArticle.comments);
    }
  };

  const enableEditState = () => {
    setArticleEditStatus(true);
  };

  const saveModifiedArticle = async (editedArticle) => {
    editedArticle.dateOfModification = new Date();
    editedArticle.articleId = currentArticle.articleId;
    editedArticle.username = currentArticle.username;

    let res = await axiosWithToken.put(
      `${API_BASE_URL}/author-api/article`,
      editedArticle
    );

    if (res.data.message === "Article modified") {
      setCurrentArticle({ ...res.data.article });
      setArticleEditStatus(false);
    }
  };

  function ISOtoUTC(iso) {
    if (!iso) return 'Unknown date';
    
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid date';
    }
  }

  return (
    <div style={{
      background: isMobile ? '#ffffff' : '#f8fafc',
      minHeight: '100vh',
      padding: isMobile ? '0' : '2rem 1rem'
    }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Simple Navigation */}
      <nav style={{
        maxWidth: isMobile ? '100%' : '800px',
        margin: '0 auto 2rem auto',
        padding: isMobile ? '1rem 0.5rem' : '0',
        background: isMobile ? '#ffffff' : 'transparent'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            fontSize: isSmallMobile ? '0.8rem' : '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3b82f6';
          }}
        >
          <FaArrowLeft />
          Back to Articles
        </button>
      </nav>

      {/* Main Content Container */}
      <div style={{
        maxWidth: isMobile ? '100%' : '800px',
        margin: '0 auto',
        padding: '0'
      }}>
        {articleEditStatus === false ? (
          /* Simple Article Layout */
          <div>
            {/* Main Article Container - Title, Content, and Like button in one box */}
            <div style={{
              background: isMobile ? 'transparent' : 'white',
              borderRadius: isMobile ? '0' : '12px',
              padding: isMobile ? '1rem 0.5rem' : '2rem',
              boxShadow: isMobile ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: isMobile ? 'none' : '1px solid #e5e7eb',
              marginBottom: '1.5rem'
            }}>
              {/* Category Badge */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  SOCIAL
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: isSmallMobile ? '1.25rem' : isMobile ? '1.5rem' : '2.5rem',
                fontWeight: '800',
                color: '#1f2937',
                lineHeight: '1.2',
                marginBottom: '1rem',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                {currentArticle.title}
              </h1>

              {/* Author Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: isMobile ? '40px' : '48px',
                  height: isMobile ? '40px' : '48px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: '600'
                }}>
                  {(authorInfo ? authorInfo.fullName : (currentArticle.username?.split('@')[0] || 'A')).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{
                    margin: '0',
                    color: '#1f2937',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    {authorInfo ? authorInfo.fullName : (currentArticle.username?.split('@')[0] || 'Anonymous Author')}
                  </h4>
                  <p style={{
                    margin: '0',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    {authorInfo ? `${authorInfo.userType?.charAt(0).toUpperCase() + authorInfo.userType?.slice(1)} • ` : ''}
                    Published on {ISOtoUTC(currentArticle.dateOfCreation)}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                paddingTop: '1rem',
                paddingBottom: '2rem',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaEye style={{ color: '#6b7280' }} />
                  <span>{currentArticle.views || 0} views</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaHeart style={{ color: '#6b7280' }} />
                  <span>{likesCount} likes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FcComments />
                  <span>{currentArticle.comments?.length || 0} comments</span>
                </div>
              </div>

              {/* Article Content */}
              <div style={{
                lineHeight: isMobile ? '1.6' : '1.8',
                fontSize: isSmallMobile ? '0.95rem' : isMobile ? '1rem' : '1.125rem',
                color: '#374151',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                marginBottom: '2rem'
              }}>
                {(currentArticle.content || '').split('\n').map((paragraph, index) => (
                  <p key={index} style={{
                    marginBottom: isMobile ? '1rem' : '1.5rem',
                    fontSize: isSmallMobile ? '0.95rem' : isMobile ? '1rem' : '1.125rem',
                    lineHeight: isMobile ? '1.6' : '1.8',
                    color: '#374151'
                  }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Like Button */}
              {currentUser && currentUser.userType === "user" && (
                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '2rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={handleLikeToggle}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: isLiked ? '#dc2626' : 'white',
                      color: isLiked ? 'white' : '#dc2626',
                      border: `2px solid #dc2626`,
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLiked) {
                        e.target.style.background = '#dc2626';
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLiked) {
                        e.target.style.background = 'white';
                        e.target.style.color = '#dc2626';
                      }
                    }}
                  >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{isLiked ? 'Liked' : 'Like Article'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Author Actions */}
            {currentUser?.username === currentArticle.username && (
              <div style={{
                background: isMobile ? 'transparent' : 'white',
                borderRadius: isMobile ? '0' : '12px',
                padding: isMobile ? '1rem 0.5rem' : '1.5rem',
                boxShadow: isMobile ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: isMobile ? 'none' : '1px solid #e5e7eb',
                marginBottom: '1.5rem',
                borderTop: isMobile ? '1px solid #e5e7eb' : 'none',
                borderBottom: isMobile ? '1px solid #e5e7eb' : 'none'
              }}>
                <h5 style={{
                  marginBottom: '1rem',
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Manage Article
                </h5>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={enableEditState}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.625rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#3b82f6';
                    }}
                  >
                    <CiEdit />
                    Edit Article
                  </button>
                  
                  {currentArticle.status ? (
                    <button 
                      onClick={deleteArticle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#dc2626';
                      }}
                    >
                      <MdDelete />
                      Delete Article
                    </button>
                  ) : (
                    <button 
                      onClick={restoreArticle}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#059669';
                      }}
                    >
                      <MdRestore />
                      Restore Article
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div style={{
              background: isMobile ? 'transparent' : 'white',
              borderRadius: isMobile ? '0' : '12px',
              padding: isMobile ? '1rem 0.5rem' : '1.5rem',
              boxShadow: isMobile ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: isMobile ? 'none' : '1px solid #e5e7eb',
              borderTop: isMobile ? '1px solid #e5e7eb' : (isMobile ? 'none' : '1px solid #e5e7eb')
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  color: '#1f2937',
                  fontWeight: '700',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0'
                }}>
                  <FcComments />
                  Comments ({enrichedComments.length})
                </h3>
                
                <button
                  onClick={() => fetchUpdatedArticle(true)}
                  disabled={isRefreshingComments}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: isRefreshingComments ? '#e5e7eb' : '#f3f4f6',
                    color: isRefreshingComments ? '#9ca3af' : '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: isRefreshingComments ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isRefreshingComments) {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.color = '#4b5563';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRefreshingComments) {
                      e.target.style.background = '#f3f4f6';
                      e.target.style.color = '#6b7280';
                    }
                  }}
                >
                  <FaSync style={{ 
                    fontSize: '0.75rem',
                    animation: isRefreshingComments ? 'spin 1s linear infinite' : 'none'
                  }} />
                  {isRefreshingComments ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Comment Form */}
              {currentUser && currentUser.userType === "user" && (
                <div style={{
                  background: isMobile ? 'transparent' : '#f9fafb',
                  padding: isMobile ? '1rem 0' : '1.5rem',
                  borderRadius: isMobile ? '0' : '12px',
                  marginBottom: '1.5rem',
                  border: isMobile ? 'none' : '1px solid #e5e7eb',
                  borderTop: isMobile ? '1px solid #e5e7eb' : (isMobile ? 'none' : '1px solid #e5e7eb'),
                  borderBottom: isMobile ? '1px solid #e5e7eb' : (isMobile ? 'none' : '1px solid #e5e7eb')
                }}>
                  <h5 style={{
                    marginBottom: '1rem',
                    color: '#1f2937',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Add a comment
                  </h5>
                  <form onSubmit={handleSubmit(writeComment)}>
                    <div style={{ marginBottom: '1rem' }}>
                      <textarea 
                        className="form-control"
                        rows="4"
                        placeholder="What are your thoughts?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.95rem',
                          padding: '0.75rem',
                          resize: 'vertical',
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                          transition: 'border-color 0.2s ease',
                          width: '100%'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.outline = 'none';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                        }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!comment.trim()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: comment.trim() ? '#3b82f6' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: comment.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (comment.trim()) {
                          e.target.style.background = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (comment.trim()) {
                          e.target.style.background = '#3b82f6';
                        }
                      }}
                    >
                      <BiCommentAdd />
                      Post Comment
                    </button>
                  </form>
                </div>
              )}

              {/* Comments List */}
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {enrichedComments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    color: '#6b7280',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '1rem'
                    }}>
                      💬
                    </div>
                    <p style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      No comments yet
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#6b7280'
                    }}>
                      Be the first to share your thoughts about this article!
                    </p>
                  </div>
                ) : (
                  enrichedComments.map((commentObj, index) => (
                    <div key={index} style={{
                      background: isMobile ? 'transparent' : '#f9fafb',
                      border: isMobile ? 'none' : '1px solid #e5e7eb',
                      borderRadius: isMobile ? '0' : '12px',
                      padding: isMobile ? '1rem 0' : '1.25rem',
                      marginBottom: '1rem',
                      borderBottom: isMobile ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginRight: '0.75rem'
                        }}>
                          {(commentObj.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 style={{
                            margin: '0',
                            color: '#1f2937',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {commentObj.fullName || 'Anonymous User'}
                          </h6>
                          <p style={{
                            margin: '0',
                            color: '#6b7280',
                            fontSize: '0.75rem'
                          }}>
                            {commentObj.comment?.dateOfComment ? ISOtoUTC(commentObj.comment.dateOfComment) : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <p style={{
                        color: '#374151',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: '0',
                        paddingLeft: '3rem'
                      }}>
                        {commentObj.comment?.comment || 'No comment text'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form Card */
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            maxWidth: '600px',
            margin: '0 auto',
            width: '100%'
          }}>
            <h2 style={{
              marginBottom: '1.5rem',
              color: '#1f2937',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.5rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CiEdit />
              </div>
              Edit Article
            </h2>
            
            <form onSubmit={handleSubmit(saveModifiedArticle)}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="title" style={{
                  color: '#374151',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  display: 'block'
                }}>
                  Article Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  defaultValue={currentArticle.title}
                  {...register("title", { required: true })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    background: 'white',
                    width: '100%'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="content" style={{
                  color: '#374151',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  display: 'block'
                }}>
                  Article Content
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  rows="12"
                  defaultValue={currentArticle.content}
                  {...register("content", { required: true })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    transition: 'all 0.2s ease',
                    background: 'white',
                    width: '100%'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button 
                  type="submit" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#047857';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#059669';
                  }}
                >
                  <CiEdit />
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setArticleEditStatus(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6b7280';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Article;
