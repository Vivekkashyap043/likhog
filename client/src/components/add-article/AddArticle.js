import React from "react";
import "./AddArticle.css";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { axiosWithToken } from "../../axiosWithToken";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaEye, FaTags, FaKeyboard, FaSpellCheck, FaFileAlt } from "react-icons/fa";
import { API_ENDPOINTS } from "../../config/api";

function AddArticle() {
  let { register, handleSubmit, watch, formState: { errors } } = useForm();
  let { currentUser } = useSelector(
    (state) => state.userAuthorLoginReducer
  );
  let [err, setErr] = useState("");
  let [isPreview, setIsPreview] = useState(false);
  let [wordCount, setWordCount] = useState(0);
  let [isPublishing, setIsPublishing] = useState(false);
  let navigate = useNavigate();

  // Watch content for word count
  const content = watch("content", "");
  const title = watch("title", "");

  // Update word count and character count
  React.useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const postNewArticle = async (article) => {
    try {
      setIsPublishing(true);
      setErr("");
      
      article.dateOfCreation = new Date();
      article.dateOfModification = new Date();
      article.articleId = Date.now();
      article.username = currentUser.username;
      article.authorFullName = currentUser.fullName; // Store author's full name
      article.comments = [];
      article.status = true;
      article.views = 0;
      article.likes = 0;
      article.likedUsers = []; // Initialize empty array for users who liked this article
      article.viewedUsers = []; // Initialize empty array for users who viewed this article
      
      // Make HTTP post request
      let res = await axiosWithToken.post(API_ENDPOINTS.AUTHOR.ARTICLE, article)
      console.log(res)
      if (res.data.message === 'New article created') {
        navigate(`/author-profile/articles-by-author/${currentUser.username}`)
      } else {
        setErr(res.data.message)
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      setErr(error.response?.data?.message || 'Failed to publish article. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const categories = [
    { value: "programming", label: "💻 Programming", icon: "💻" },
    { value: "AI&ML", label: "🤖 AI & Machine Learning", icon: "🤖" },
    { value: "database", label: "🗄️ Database", icon: "🗄️" },
    { value: "maths", label: "📊 Mathematics", icon: "📊" },
    { value: "physics", label: "⚛️ Physics", icon: "⚛️" },
    { value: "chemistry", label: "🧪 Chemistry", icon: "🧪" },
    { value: "environment", label: "🌱 Environment", icon: "🌱" },
    { value: "business", label: "💼 Business", icon: "💼" },
    { value: "law", label: "⚖️ Law", icon: "⚖️" },
    { value: "music", label: "🎵 Music", icon: "🎵" },
    { value: "sports", label: "⚽ Sports", icon: "⚽" },
    { value: "religion", label: "🙏 Religion", icon: "🙏" },
    { value: "social", label: "🌍 Social Issues", icon: "🌍" },
    { value: "other", label: "📝 Other", icon: "📝" }
  ];

  return (
    <div className="modern-editor">
      <div className="editor-container">
        {/* Editor Header */}
        <div className="editor-header">
          <div className="editor-title">
            <FaFileAlt />
            <h2>Create Your Story</h2>
          </div>
          <div className="editor-actions">
            <button 
              type="button" 
              className={`preview-btn ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(!isPreview)}
            >
              <FaEye />
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {err && (
          <div className="error-alert">
            <span>⚠️ {err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(postNewArticle)} className="editor-form">
          <div className="editor-main">
            {/* Left Panel - Writing Area */}
            <div className="writing-panel">
              {!isPreview ? (
                <>
                  {/* Title Input */}
                  <div className="title-section">
                    <input
                      type="text"
                      className="title-input"
                      placeholder="Enter your story title..."
                      {...register("title", { 
                        required: "Title is required",
                        minLength: { value: 3, message: "Title must be at least 3 characters" }
                      })}
                    />
                    {errors.title && <span className="error-text">{errors.title.message}</span>}
                  </div>

                  {/* Content Editor */}
                  <div className="content-section">
                    <div className="content-header">
                      <FaKeyboard />
                      <span>Start writing your story...</span>
                      <div className="word-count">
                        <FaSpellCheck />
                        {wordCount} words
                      </div>
                    </div>
                    <textarea
                      {...register("content", { 
                        required: "Content is required",
                        minLength: { value: 50, message: "Content must be at least 50 characters" }
                      })}
                      className="content-editor"
                      placeholder="Once upon a time... Share your thoughts, experiences, and ideas with the world. Make it engaging and authentic."
                      rows="20"
                    />
                    {errors.content && <span className="error-text">{errors.content.message}</span>}
                  </div>
                </>
              ) : (
                /* Preview Mode */
                <div className="preview-panel">
                  <div className="preview-title">
                    {title || "Your Story Title"}
                  </div>
                  <div className="preview-meta">
                    By {currentUser.username} • {new Date().toLocaleDateString()}
                  </div>
                  <div className="preview-content">
                    {content ? content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    )) : "Your story content will appear here..."}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Settings */}
            <div className="settings-panel">
              <div className="panel-section">
                <h3>
                  <FaTags />
                  Category
                </h3>
                <select
                  {...register("category", { required: "Please select a category" })}
                  className="category-select"
                >
                  <option value="">Choose a category...</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category.message}</span>}
              </div>

              <div className="panel-section">
                <h3>Publishing</h3>
                <div className="publishing-info">
                  <div className="info-item">
                    <strong>Status:</strong> Draft
                  </div>
                  <div className="info-item">
                    <strong>Visibility:</strong> Public
                  </div>
                  <div className="info-item">
                    <strong>Author:</strong> {currentUser.username}
                  </div>
                </div>
              </div>

              <div className="panel-section">
                <h3>📊 Stats</h3>
                <div className="stats-info">
                  <div className="stat-item">
                    <span className="stat-label">Words:</span>
                    <span className="stat-value">{wordCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Characters:</span>
                    <span className="stat-value">{content?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Reading time:</span>
                    <span className="stat-value">~{Math.max(1, Math.ceil((wordCount || 0) / 200))} min</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Paragraphs:</span>
                    <span className="stat-value">{content ? content.split('\n').filter(p => p.trim().length > 0).length : 0}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="publish-btn" disabled={isPublishing}>
                <FaSave />
                {isPublishing ? 'Publishing...' : 'Publish Story'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddArticle;
