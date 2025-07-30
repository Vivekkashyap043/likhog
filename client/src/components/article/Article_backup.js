import "./Article.css";
import { useLocation } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
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
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-11 col-sm-11 col-md-9 col-lg-9 mx-auto">
          {articleEditStatus === false ? (
            <div>
              {/* Article Details */}
              <div className="article-header">
                <button 
                  className="btn btn-outline-primary mb-3 d-flex align-items-center"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="me-2" />
                  Back to Articles
                </button>
                
                <h1 className="display-4 mb-3">{currentArticle.title}</h1>
                
                <div className="article-meta d-flex flex-wrap align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center">
                    <FcPortraitMode className="me-2" />
                    <span>{currentArticle.username}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FcCalendar className="me-2" />
                    <span>Created: {ISOtoUTC(currentArticle.dateOfCreation)}</span>
                  </div>
                  {currentArticle.dateOfModification && (
                    <div className="d-flex align-items-center">
                      <FcClock className="me-2" />
                      <span>Modified: {ISOtoUTC(currentArticle.dateOfModification)}</span>
                    </div>
                  )}
                </div>

                {/* Article Stats */}
                <div className="article-stats d-flex gap-4 mb-4">
                  <div className="d-flex align-items-center">
                    <FaEye className="me-2 text-info" />
                    <span>{currentArticle.views || 0} views</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2">{likesCount} likes</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FcComments className="me-2" />
                    <span>{currentArticle.comments?.length || 0} comments</span>
                  </div>
                </div>

                {/* Like Button */}
                {currentUser && currentUser.userType === "user" && (
                  <div className="mb-4">
                    <button 
                      className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center`}
                      onClick={handleLikeToggle}
                    >
                      {isLiked ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                      {isLiked ? 'Unlike' : 'Like'} ({likesCount})
                    </button>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="article-content mb-5">
                <p className="lead">{currentArticle.content}</p>
              </div>

              {/* Author Actions */}
              {currentUser?.username === currentArticle.username && (
                <div className="author-actions mb-4">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning"
                      onClick={enableEditState}
                    >
                      <CiEdit className="me-2" />
                      Edit Article
                    </button>
                    
                    {currentArticle.status ? (
                      <button 
                        className="btn btn-danger"
                        onClick={deleteArticle}
                      >
                        <MdDelete className="me-2" />
                        Delete Article
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success"
                        onClick={restoreArticle}
                      >
                        <MdRestore className="me-2" />
                        Restore Article
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="comments-section">
                <h4 className="mb-4">
                  <FcComments className="me-2" />
                  Comments ({enrichedComments.length})
                </h4>

                {/* Write Comment */}
                {currentUser && currentUser.userType === "user" && (
                  <div className="write-comment mb-4">
                    <form onSubmit={handleSubmit(writeComment)}>
                      <div className="mb-3">
                        <textarea 
                          className="form-control"
                          rows="3"
                          placeholder="Write your comment here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary d-flex align-items-center"
                        disabled={!comment.trim()}
                      >
                        <BiCommentAdd className="me-2" />
                        Post Comment
                      </button>
                    </form>
                  </div>
                )}

                {/* Display Comments */}
                <div className="comments-list">
                  {enrichedComments.length === 0 ? (
                    <p className="text-muted">No comments yet. Be the first to comment!</p>
                  ) : (
                    enrichedComments.map((commentObj, index) => (
                      <div key={index} className="comment-item p-3 mb-3 border rounded">
                        <div className="comment-header d-flex align-items-center mb-2">
                          <FcPortraitMode className="me-2" />
                          <strong>{commentObj.displayName || commentObj.username}</strong>
                          <span className="text-muted ms-auto">
                            {ISOtoUTC(commentObj.dateOfCreation)}
                          </span>
                        </div>
                        <div className="comment-content">
                          <p className="mb-0">{commentObj.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Article Form */
            <div>
              <form onSubmit={handleSubmit(saveModifiedArticle)}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    defaultValue={currentArticle.title}
                    {...register("title", { required: true })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Content</label>
                  <textarea
                    className="form-control"
                    id="content"
                    rows="10"
                    defaultValue={currentArticle.content}
                    {...register("content", { required: true })}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setArticleEditStatus(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Article;
