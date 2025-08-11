// public/assets/script.js

let token = localStorage.getItem("authToken");
let loggedInUserId = null; // Store the ID of the logged-in user

// --- DOM Element References ---
// Auth/App Containers
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const welcomeMessage = document.getElementById("welcome-message");

// Register/Login Form Elements
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");

// Register/Login/Logout references:
const registerButton = document.getElementById("register-button");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");

// Post Creation Form Elements
const postForm = document.getElementById("post-form");
const postTitleInput = document.getElementById("post-title-input");
const postContentInput = document.getElementById("post-content-input");
const postCategorySelect = document.getElementById("post-category-select"); // For creating posts

// Posts List Elements
const postsList = document.getElementById("posts-list"); // This is our <ul> element

// Post Detail Modal Elements
const postDetailModal = document.getElementById("post-detail-modal");
const closeButton = postDetailModal.querySelector(".close-button");
const detailPostTitle = document.getElementById("detail-post-title");
const detailPostAuthor = document.getElementById("detail-post-author");
const detailPostDate = document.getElementById("detail-post-date");
const detailPostCategory = document.getElementById("detail-post-category");
const detailPostContent = document.getElementById("detail-post-content");
const editButton = document.getElementById("edit-button");
const deleteButton = document.getElementById("delete-button");
const saveEditButton = document.getElementById("save-edit-button");
const cancelEditButton = document.getElementById("cancel-edit-button");

// Category selection for editing within the modal
const detailPostCategorySelect = document.getElementById("detail-post-category-select");
const detailCategoryLabel = document.getElementById("detail-category-label");


// Comment Section Elements
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const commentTextInput = document.getElementById("comment-text-input");

// Category Filter Element
const categoryFilterSelect = document.getElementById("category-filter");

let currentPostId = null; // Reference to the post currently being viewed/edited

// --- Helper Functions ---

// Toggles visibility of auth/app containers based on login status
const toggleAppVisibility = async () => { // Async to await fetch for loggedInUserId and welcome message
    if (token) {
        authContainer.classList.add("hidden");
        appContainer.classList.remove("hidden");
        await getLoggedInUserInfo(); // Fetch user info after login
        fetchPosts(); // Load all posts initially
        fetchCategories(); // Load categories for filtering and post creation/editing
    } else {
        authContainer.classList.remove("hidden");
        appContainer.classList.add("hidden");
        postsList.innerHTML = "<li>Please log in to view posts.</li>"; // Clear posts
        categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';
        postCategorySelect.innerHTML = '<option value="">Select a Category</option>';
        detailPostCategorySelect.innerHTML = '<option value="">Select a Category</option>'; 
        welcomeMessage.textContent = `Hello!`; // Reset message
    }
};

// Function to get the logged-in user's ID and username. For determining post ownership on the frontend
const getLoggedInUserInfo = async () => {
    if (!token) {
        loggedInUserId = null;
        welcomeMessage.textContent = `Hello!`;
        return;
    }
    try {
        const response = await fetch("http://localhost:3001/api/users/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            loggedInUserId = data.user.id;
            welcomeMessage.textContent = `Welcome, ${data.user.username}!`;
        } else if (response.status === 401 || response.status === 403) {
            console.error("Token expired or invalid, logging out.");
            logout(); // Log out if token is invalid
        } else {
            console.error("Failed to fetch logged in user info:", response.status);
            loggedInUserId = null;
            welcomeMessage.textContent = `Hello!`;
        }
    } catch (error) {
        console.error("Network error fetching user info:", error);
        loggedInUserId = null;
        welcomeMessage.textContent = `Hello!`;
    }
};

// --- Auth Functions ---

async function register() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all fields for registration.");
        return;
    }

    try {
        const res = await fetch("http://localhost:3001/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();

        if (res.ok) {
            alert("User registered successfully. Please login.");
            // Clear registration form fields
            usernameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
        } else {
            alert(`Registration failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Please try again.");
    }
}

async function login() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("http://localhost:3001/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("authToken", data.token);
            token = data.token;
            loggedInUserId = data.user_id; 

            alert("User Logged In successfully");
            toggleAppVisibility(); // Fetch categories and user info
            // Clear login form fields
            loginEmailInput.value = "";
            loginPasswordInput.value = "";
        } else {
            alert(`Login failed: ${data.message || 'Incorrect credentials'}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
    }
}

async function logout() {
    try {
        // Frontend logout simply clears the token.
        await fetch("http://localhost:3001/api/users/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, // Still send token if backend expects it
        });
    } catch (error) {
        console.warn("Logout endpoint error (might not exist or be necessary):", error);
    } finally {
        localStorage.removeItem("authToken");
        token = null;
        loggedInUserId = null;
        toggleAppVisibility(); 
        alert("Logged out successfully.");
    }
}

// --- Function to Fetch and Populate Categories ---
const fetchCategories = async () => {
    if (!token) {
        console.warn("No token available. Cannot fetch categories.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/categories", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error("Unauthorized to fetch categories. Logging out.");
                logout(); // Log out if token is invalid
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();

        // Populate the filter dropdown
        categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.category_name;
            categoryFilterSelect.appendChild(option);
        });

        // Populate the post creation/edit form dropdown (postCategorySelect)
        postCategorySelect.innerHTML = '<option value="">Select a Category</option>';
        // Populate the detail modal's category select as well (detailPostCategorySelect)
        detailPostCategorySelect.innerHTML = '<option value="">Select a Category</option>';

        categories.forEach(category => {
            const option1 = document.createElement("option");
            option1.value = category.id;
            option1.textContent = category.category_name;
            postCategorySelect.appendChild(option1);

            const option2 = document.createElement("option"); 
            option2.value = category.id;
            option2.textContent = category.category_name;
            detailPostCategorySelect.appendChild(option2); 
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        // Display user-friendly error message if needed
    }
};

// Function to fetch all posts from the backend API and display them
const fetchPosts = async (categoryId = "") => { 
    if (!token) {
        postsList.innerHTML = "<li>Please log in to view posts.</li>";
        return;
    }

    try {
        // Construct the URL. If categoryId is provided, append it as a query parameter.
        let url = "http://localhost:3001/api/posts";
        if (categoryId) {
            url += `?category_id=${categoryId}`; 
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert("Session expired or unauthorized. Please log in again.");
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();
        postsList.innerHTML = ""; // Clear current list

        if (posts.length === 0) {
            postsList.innerHTML = "<li>No posts yet. Create one above!</li>";
            return;
        }

        posts.forEach((post) => {
            const li = document.createElement("li");
            const createdDate = new Date(post.createdOn);
            const formattedDate = createdDate.toLocaleString('en-GB', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            });

            li.innerHTML = `
                <div class="post-info" data-id="${post.id}">
                    <span class="post-title">${post.title}</span><br>
                    <span class="post-meta">
                        By: ${post.User ? post.User.username : 'Unknown User'} on ${formattedDate}
                        ${post.category ? ` (Category: ${post.category.category_name})` : ''} </span>
                </div>
            `;
            postsList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        postsList.innerHTML = "<li>Error loading posts. Please try again.</li>";
    }
};

// Function to fetch a single post by ID and display it in the modal window.
const viewPost = async (id) => {
    if (!token) {
        alert("Please log in to view post details.");
        return;
    }
    try {
        const response = await fetch(`http://localhost:3001/api/posts/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 404) {
                alert("Post not found.");
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();

        currentPostId = post.id;
        detailPostTitle.textContent = post.title;

        const createdDate = new Date(post.createdOn);
        detailPostDate.textContent = createdDate.toLocaleString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        detailPostAuthor.textContent = post.User ? post.User.username : 'Unknown User';
        detailPostContent.value = post.content;
        detailPostContent.readOnly = true;

        // Set the category in the modal for display
        detailPostCategory.textContent = post.category ? post.category.category_name : 'Uncategorized';
        detailPostCategory.style.display = 'inline'; // Display span is visible in view mode
        // Hidden initially for view mode
        detailPostCategorySelect.value = post.category ? post.category.id : '';
        detailPostCategorySelect.style.display = 'none'; // Ensure hidden in view mode
        detailCategoryLabel.style.display = 'none'; // Label is hidden in view mode


        // Show/hide buttons based on ownership and state
        const isOwner = (post.user_id === loggedInUserId);
        editButton.style.display = isOwner ? 'inline-block' : 'none';
        deleteButton.style.display = isOwner ? 'inline-block' : 'none';
        saveEditButton.style.display = 'none';
        cancelEditButton.style.display = 'none';

        renderComments(post.comments);

        postDetailModal.style.display = "flex";
    } catch (error) {
        console.error("Error viewing post:", error);
        alert("Could not load post details: " + error.message);
    }
};

// Function to enable editing mode for the post
const enableEditMode = () => {
    detailPostContent.readOnly = false;
    detailPostContent.focus();

    // Toggle button visibility
    editButton.style.display = 'none';
    deleteButton.style.display = 'none';
    saveEditButton.style.display = 'inline-block';
    cancelEditButton.style.display = 'inline-block';
    detailPostCategory.style.display = 'none'; // Hide the display span
    detailPostCategorySelect.style.display = 'block'; // Show the select dropdown
    detailCategoryLabel.style.display = 'block'; // Show the label for the select
};

// Function to save edited post
const saveEditedPost = async () => {
    const updatedTitle = detailPostTitle.textContent;
    const updatedContent = detailPostContent.value.trim();
    const updatedCategoryId = detailPostCategorySelect.value;

    if (!updatedTitle || !updatedContent) {
        alert("Post title and content cannot be empty.");
        return;
    }
    // Check that a category is selected for edited posts
    if (!updatedCategoryId) {
        alert("Please select a category for your post.");
        return;
    }

    if (!token) {
        alert("You must be logged in to update a post.");
        return;
    }

    try {
        const updateBody = { title: updatedTitle, content: updatedContent };
        // Include category_id in the update body
        if (updatedCategoryId) {
            updateBody.category_id = updatedCategoryId;
        } else {
            updateBody.category_id = null; // Explicitly send null if no category is selected
        }


        const response = await fetch(`http://localhost:3001/api/posts/${currentPostId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        alert("Post updated successfully!");
        postDetailModal.style.display = "none";
        fetchPosts(); // Refresh list to show updated content
    } catch (error) {
        console.error("Error updating post:", error);
        alert("Failed to update post: " + error.message);
    }
};

// Function to delete a post
const deletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
        return;
    }
    if (!token) {
        alert("You must be logged in to delete a post.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/posts/${currentPostId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        alert("Post deleted successfully!");
        postDetailModal.style.display = "none";
        fetchPosts();
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post: " + error.message);
    }
};

// --- Comment Functions ---

const renderComments = (comments) => {
    commentsList.innerHTML = '';

    if (comments && comments.length > 0) {
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment-item');
            const commentDate = new Date(comment.createdAt);
            const formattedCommentDate = commentDate.toLocaleString('en-GB', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            });
            commentDiv.innerHTML = `
                <p>${comment.comment_text}</p>
                <small>By ${comment.CommentAuthor ? comment.CommentAuthor.username : 'Unknown'} on ${formattedCommentDate}</small>
            `;
            commentsList.appendChild(commentDiv);
        });
    } else {
        commentsList.innerHTML = '<p>No comments yet. Be the first!</p>';
    }
};

const newCommentHandler = async (event) => {
    event.preventDefault();

    const commentText = commentTextInput.value.trim();

    if (!commentText) {
        alert('Please enter a comment.');
        return;
    }
    if (!token) {
        alert('You must be logged in to add a comment.');
        return;
    }
    if (!currentPostId) {
        alert('Error: No post selected to comment on.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/comments', {
            method: 'POST',
            body: JSON.stringify({
                comment_text: commentText,
                post_id: currentPostId,
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            commentTextInput.value = '';
            viewPost(currentPostId); // Re-fetch post details to show new comment
        } else {
            const errorData = await response.json();
            alert(`Failed to add comment: ${errorData.message || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Network or server error submitting comment:', err);
        alert('An error occurred while submitting your comment.');
    }
};


// --- Event Listeners ---

document.addEventListener("DOMContentLoaded", () => {
    registerButton.addEventListener("click", register);
    loginButton.addEventListener("click", login);
    logoutButton.addEventListener("click", logout);

    // Post creation form submission
    postForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();
        const category_id = postCategorySelect.value; // Get selected category ID

        if (!title || !content) {
            alert("Please enter both a title and some content for your post.");
            return;
        }
        if (!category_id) {
            alert("Please select a category for your post.");
            return;
        }
        if (!token) {
            alert("You must be logged in to create a post.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, category_id }), 
            });

            if (response.ok) {
                alert("Post created successfully!");
                postTitleInput.value = "";
                postContentInput.value = "";
                postCategorySelect.value = "";
                fetchPosts(); // Refresh the list
            } else {
                const errorData = await response.json();
                console.error("Error creating post:", errorData.message || "Unknown error");
                alert("Failed to create post: " + (errorData.message || "Server error."));
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Network error. Could not connect to the server.");
        }
    });

    // Handle clicks on the post-info div within the posts list (for viewing post details)
    postsList.addEventListener("click", (event) => {
        const postInfoDiv = event.target.closest(".post-info");
        if (postInfoDiv) {
            const postId = postInfoDiv.dataset.id;
            viewPost(postId);
        }
    });

    // Close the modal when the 'x' is clicked
    closeButton.addEventListener("click", () => {
        postDetailModal.style.display = "none";
        detailPostContent.readOnly = true;
        // Ensure proper display state when modal is closed
        detailPostCategorySelect.style.display = 'none';
        detailCategoryLabel.style.display = 'none';
        detailPostCategory.style.display = 'inline';
    });

    // Close the modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === postDetailModal) {
            postDetailModal.style.display = "none";
            detailPostContent.readOnly = true;
            // Ensure proper display state when modal is closed by clicking outside
            detailPostCategorySelect.style.display = 'none';
            detailCategoryLabel.style.display = 'none';
            detailPostCategory.style.display = 'inline';
        }
    });

    // Modal action buttons
    editButton.addEventListener("click", enableEditMode);
    saveEditButton.addEventListener("click", saveEditedPost);
    cancelEditButton.addEventListener("click", () => {
        detailPostContent.readOnly = true;
        editButton.style.display = 'inline-block';
        deleteButton.style.display = 'inline-block';
        saveEditButton.style.display = 'none';
        cancelEditButton.style.display = 'none';
        detailPostCategorySelect.style.display = 'none';
        detailCategoryLabel.style.display = 'none';
        detailPostCategory.style.display = 'inline';

        viewPost(currentPostId); 
    });
    deleteButton.addEventListener("click", deletePost);

    // Comment form submission
    commentForm.addEventListener("submit", newCommentHandler);

    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener("change", (event) => {
            const selectedCategoryId = event.target.value;
            fetchPosts(selectedCategoryId); 
        });
    }
    toggleAppVisibility();
});