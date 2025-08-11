// public/assets/single-post.js

// Function to get the post ID from the URL (i.e., /post/123)
const getPostIdFromUrl = () => {
  const path = window.location.pathname;
  const parts = path.split('/');
  return parts[parts.length - 1]; // ID is the last part of the URL
};

const postId = getPostIdFromUrl();
let token = localStorage.getItem("authToken"); // Get token from localStorage

// Function to fetch and display post details and comments
const fetchPostAndComments = async () => {
  if (!postId) {
    console.error('Post ID not found in URL.');
    document.getElementById('post-details').innerHTML = '<p>Error: Post ID not found.</p>';
    document.getElementById('comments-section').style.display = 'none';
    return;
  }

  try {
    // Fetch Post Details
    const postResponse = await fetch(`/api/posts/${postId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }, // Send token if post details require auth
    });

    if (!postResponse.ok) {
        // Handle cases where token is invalid or expired
        if (postResponse.status === 401 || postResponse.status === 403) {
            alert("Please log in to view this post.");
            // Clear token and redirect to homepage/login page
            localStorage.removeItem("authToken");
            window.location.href = '/';
            return;
        }
      throw new Error('Failed to fetch post details. Status: ' + postResponse.status);
    }
    const postData = await postResponse.json();

    if (!postData) { // If post not found (i.e., ID doesn't exist)
      document.getElementById('post-details').innerHTML = '<p>Post not found.</p>';
      document.getElementById('comments-section').style.display = 'none';
      return;
    }

    document.getElementById('post-title').textContent = postData.title;
    document.getElementById('post-content').textContent = postData.content;
    document.getElementById('post-author').textContent = postData.User ? postData.User.username : 'Unknown User';
    // document.getElementById('post-date').textContent = new Date(postData.createdAt).toLocaleString();
    document.getElementById('post-date').textContent = new Date(postData.createdOn).toLocaleString();

    // --- Fetch Comments for this Post ---
    const commentsListElement = document.getElementById('comments-list');
    commentsListElement.innerHTML = ''; // Clear existing comments

    if (postData.comments && postData.comments.length > 0) {
      postData.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment-item');
        commentDiv.innerHTML = `
          <p>${comment.comment_text}</p>
          <small>By ${comment.CommentAuthor ? comment.CommentAuthor.username : 'Unknown User'} on ${new Date(comment.createdAt).toLocaleString()}</small>
        `;
        commentsListElement.appendChild(commentDiv);
      });
    } else {
      commentsListElement.innerHTML = '<p>No comments yet. Be the first!</p>';
    }

  } catch (error) {
    console.error('Error fetching post or comments:', error);
    document.getElementById('post-details').innerHTML = '<p>Error loading post. Please try refreshing.</p>';
    document.getElementById('comments-section').style.display = 'none';
  }
};


// Function to handle new comment submission
const newCommentHandler = async (event) => {
  event.preventDefault(); // Prevent default form submission

  const commentText = document.getElementById('comment-text').value.trim();

  if (!token) { // Ensure user is logged in
    alert('You must be logged in to add a comment.');
    localStorage.removeItem("authToken"); // Clear token as it is not valid
    window.location.href = '/'; // Redirect to login page
    return;
  }

  if (commentText && postId) {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          comment_text: commentText,
          post_id: postId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send the token for authentication
        },
      });

      if (response.ok) {
        // If successful, clear the form and re-fetch comments
        document.getElementById('comment-text').value = '';
        fetchPostAndComments(); // Reload post and comments
      } else {
        const errorData = await response.json();
        alert(`Failed to add comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network or server error:', err);
      alert('An error occurred while submitting your comment.');
    }
  } else {
    alert('Please enter a comment.');
  }
};

// Event listener for the comment form
document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', newCommentHandler);
  } else {
    console.error("Comment form not found on the page.");
  }
  fetchPostAndComments(); // Call on page load to display initial data
});