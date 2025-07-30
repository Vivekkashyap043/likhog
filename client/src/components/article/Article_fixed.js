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
import { FaHeart, FaRegHeart, FaEye, FaArrowLeft } from "react-icons/fa";

function Article() {
  const { state } = useLocation();
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

  // Fetch author details
  const fetchAuthorDetails = async (username) => {
    try {
      const response = await axios.get(`http://localhost:4000/user-api/user-details/${username}`);
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

  // Enrich comments with full names
  const enrichCommentsWithFullNames = async (comments) => {
    if (!comments || comments.length === 0) {
      setEnrichedComments([]);
      return;
    }

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        try {
          // If the comment already has a full name (newer comments), use it
          if (comment.username && !comment.username.includes('@')) {
            return { ...comment, displayName: comment.username };
          }
          
          // For older comments with email usernames, fetch full name
          const response = await axios.get(`http://localhost:4000/user-api/user-details/${comment.username}`);
          return { ...comment, displayName: response.data.fullName };
        } catch (error) {
          console.error('Error fetching user details for comment:', error);
          // Fallback: clean up email username
          const fallbackName = comment.username?.split('@')[0] || 'Anonymous User';
          return { ...comment, displayName: fallbackName };
        }
      })
    );
    
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
  }, [currentUser, state.likedUsers, currentArticle.comments]);

  // Increment view count when article is read (only once per user per article)
  const incrementViewCount = async () => {
    try {
      await axiosWithToken.post(`http://localhost:4000/user-api/view/${state.articleId}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    try {
      console.log('Toggling like for article:', state.articleId);
      const res = await axiosWithToken.post(`http://localhost:4000/user-api/like/${state.articleId}`);
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
      `http://localhost:4000/author-api/article/${currentArticle.articleId}`
    );
    if (res.data.message === "article deleted") {
      setCurrentArticle({ ...currentArticle, status: false });
    }
  };

  const restoreArticle = async () => {
    let res = await axiosWithToken.put(
      `http://localhost:4000/author-api/article/${currentArticle.articleId}`
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

    let res = await axiosWithToken.post(
      `http://localhost:4000/user-api/comment/${currentArticle.articleId}`,
      commentObj
    );
    if (res.data.message === "Comment posted") {
      setComment("");
      const updatedArticle = {
        ...currentArticle,
        comments: [...currentArticle.comments, res.data.comment]
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
      "http://localhost:4000/author-api/article",
      editedArticle
    );

    if (res.data.message === "Article modified") {
      setCurrentArticle({ ...res.data.article });
      setArticleEditStatus(false);
    }
  };

  function ISOtoUTC(iso) {
    let date = new Date(iso).getDate();
    let day = new Date(iso).getMonth() + 1;
    let year = new Date(iso).getFullYear();
    return `${date}/${day}/${year}`;
  }

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '2rem 1rem'
    }}>
      {/* Simple Navigation */}
      <nav style={{
        maxWidth: '800px',
        margin: '0 auto 2rem auto'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem',
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

      {/* Main Card Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {articleEditStatus === false ? (
          /* Article Card - Matching the provided image design */
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb'
          }}>
            {/* Category Tag - Top Left */}
            <div style={{
              padding: '1.5rem 1.5rem 0 1.5rem'
            }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.375rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ARTICLE
              </span>
            </div>

            {/* Article Content */}
            <div style={{
              padding: '1rem 1.5rem 1.5rem 1.5rem'
            }}>
              {/* Title */}
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1.2',
                marginBottom: '1rem',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                {currentArticle.title}
              </h1>

              {/* Description/Excerpt */}
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                {currentArticle.content.length > 150 
                  ? currentArticle.content.substring(0, 150) + '...'
                  : currentArticle.content
                }
              </p>

              {/* Stats Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FcClock />
                  <span>{ISOtoUTC(currentArticle.dateOfCreation)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaEye style={{ color: '#6b7280' }} />
                  <span>{currentArticle.views || 0} views</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaHeart style={{ color: '#6b7280' }} />
                  <span>{likesCount} likes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FcComments />
                  <span>{currentArticle.comments?.length || 0} comments</span>
                </div>
              </div>

              {/* Read Full Article Button */}
              <button 
                onClick={() => {
                  // Show full content instead of excerpt
                  document.getElementById('full-content').style.display = 
                    document.getElementById('full-content').style.display === 'none' ? 'block' : 'none';
                  document.getElementById('read-btn').textContent = 
                    document.getElementById('read-btn').textContent === 'Read Full Article' ? 'Hide Article' : 'Read Full Article';
                }}
                id="read-btn"
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

            {/* Full Article Content - Hidden by default */}
            <div id="full-content" style={{ display: 'none' }}>
              {/* Author Info */}
              <div style={{
                padding: '1.5rem',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.25rem',
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
              </div>

              {/* Like Button */}
              {currentUser && currentUser.userType === "user" && (
                <div style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
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

              {/* Full Article Content */}
              <article style={{
                padding: '2rem 1.5rem',
                background: 'white',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  lineHeight: '1.7',
                  fontSize: '1.125rem',
                  color: '#374151',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  {currentArticle.content.split('\n').map((paragraph, index) => (
                    <p key={index} style={{
                      marginBottom: '1.5rem',
                      fontSize: '1.125rem',
                      lineHeight: '1.7',
                      color: '#374151'
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>

              {/* Author Actions */}
              {currentUser?.username === currentArticle.username && (
                <div style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb'
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
                padding: '1.5rem',
                background: 'white',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  color: '#1f2937',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FcComments />
                  Comments ({enrichedComments.length})
                </h3>

                {/* Comment Form */}
                {currentUser && currentUser.userType === "user" && (
                  <div style={{
                    background: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '1px solid #e5e7eb'
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
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        marginBottom: '1rem'
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
                            {(commentObj.fullName || commentObj.comment.username?.split('@')[0] || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h6 style={{
                              margin: '0',
                              color: '#1f2937',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}>
                              {commentObj.fullName || commentObj.comment.username?.split('@')[0] || 'Anonymous User'}
                            </h6>
                            <p style={{
                              margin: '0',
                              color: '#6b7280',
                              fontSize: '0.75rem'
                            }}>
                              {ISOtoUTC(commentObj.comment.dateOfComment)}
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
                          {commentObj.comment.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form Card */
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9'
          }}>
            <h2 style={{
              marginBottom: '2rem',
              color: '#1e293b',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="title" style={{
                  color: '#374151',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  fontSize: '1rem',
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
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    padding: '1rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="content" style={{
                  color: '#374151',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  fontSize: '1rem',
                  display: 'block'
                }}>
                  Article Content
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  rows="15"
                  defaultValue={currentArticle.content}
                  {...register("content", { required: true })}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    padding: '1rem',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    resize: 'vertical',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
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
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.875rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(5, 150, 105, 0.4)';
                  }}
                >
                  <CiEdit />
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setArticleEditStatus(false)}
                  style={{
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.875rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(100, 116, 139, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(100, 116, 139, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(100, 116, 139, 0.4)';
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
