// public/assets/script.js

// This file contains all the client-side JavaScript logic for the blog application.
// It handles user authentication, post creation, viewing, editing, and deleting,
// as well as comment functionality and dynamic UI updates.

// Global Variables
let token = localStorage.getItem("authToken");
let loggedInUserId = null;

// The base URL for your API. Use your Render backend service URL.
const API_BASE_URL = 'https://underworld-wizards.onrender.com'; // Render service URL**

// DOM Element References
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
const postCategorySelect = document.getElementById("post-category-select"); // For creating posts
const postContentEditor = document.getElementById("post-content-editor");

// Posts List Elements
const postsList = document.getElementById("posts-list"); // This is our <ul> element
const authorPosts = document.getElementById("author-posts"); // a ul for specific author

// Post Detail Modal Elements
const postDetailModal = document.getElementById("post-detail-modal");
const closeButton = postDetailModal.querySelector(".close-button");
const detailPostTitle = document.getElementById("detail-post-title");
const detailPostAuthor = document.getElementById("detail-post-author");
const detailPostDate = document.getElementById("detail-post-date");
const detailPostCategory = document.getElementById("detail-post-category");
const detailPostContentEditor = document.getElementById("detail-post-content-editor");
const editButton = document.getElementById("edit-button");
const deleteButton = document.getElementById("delete-button");
const saveEditButton = document.getElementById("save-edit-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const followButton = document.getElementById("follow-button");// button to follow authors

// Category selection for editing within the modal
const detailPostCategorySelect = document.getElementById("detail-post-category-select");
const detailCategoryLabel = document.getElementById("detail-category-label");

// Comment Section Elements
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const commentTextInput = document.getElementById("comment-text-input");

// Category Filter Element
const categoryFilterSelect = document.getElementById("category-filter");

// Custom Message Modal Elements
const messageModal = document.getElementById('message-modal');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const messageOkButton = document.getElementById('message-ok-button');
const messageCancelButton = document.getElementById('message-cancel-button');
const messageCloseButton = document.getElementById('message-close-button');

let messageCallback = null;
let currentPostId = null; // Reference to the post currently being viewed/edited
let selectedAuthorId = null; // reference to author of the selected post to be used in follow

// Quill.js Editor Initialization
const commonQuillOptions = {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ]
    }
};

// Quill.js Initialization for Post Creation.
const postQuill = new Quill('#post-content-editor', {
    ...commonQuillOptions,
    placeholder: 'Write your post content here...'
});

// Quill.js Initialization for Post Details
const detailQuill = new Quill('#detail-post-content-editor', {
    ...commonQuillOptions,
});
detailQuill.enable(false);


// Custom Modal Functions (replacing default alert() / confirm())

// Displays custom alert modal with a given message.
const showAlert = (message) => {
    // FIX: ensure modal exists
    if (!messageModal) {
        console.warn("messageModal not found; falling back to window.alert");
        window.alert(message);
        return;
    }
    messageTitle.textContent = 'Notification';
    messageText.textContent = message;
    messageOkButton.classList.remove('hidden');
    messageCancelButton.classList.add('hidden');
    messageModal.style.display = 'flex';

    messageOkButton.onclick = () => {
        messageModal.style.display = 'none';
    };
    messageCloseButton.onclick = () => {
        messageModal.style.display = 'none';
    };
};

// Displays custom confirmation modal and executes callback function based on the user's choice
const showConfirm = (message, callback) => {
    // FIX: ensure modal exists
    if (!messageModal) {
        const ok = window.confirm(message);
        if (callback) callback(ok);
        return;
    }
    messageTitle.textContent = 'Confirm Action';
    messageText.textContent = message;
    messageOkButton.classList.remove('hidden');
    messageCancelButton.classList.remove('hidden');
    messageModal.style.display = 'flex';

    messageCallback = callback;

    messageOkButton.onclick = () => {
        messageModal.style.display = 'none';
        if (messageCallback) messageCallback(true);
        messageCallback = null; // FIX: reset
    };
    messageCancelButton.onclick = () => {
        messageModal.style.display = 'none';
        if (messageCallback) messageCallback(false);
        messageCallback = null; // FIX: reset
    };
    messageCloseButton.onclick = () => {
        messageModal.style.display = 'none';
        if (messageCallback) messageCallback(false);
        messageCallback = null; // FIX: reset
    };
};

// Helper Functions

// Toggles visibility of auth/app containers based on login status
const toggleAppVisibility = async () => { // Async to await fetch for loggedInUserId and welcome message
    if (token) {
        authContainer.classList.add("hidden");
        appContainer.classList.remove("hidden");
        await getLoggedInUserInfo(); // Fetch user info, posts, and categories after login
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

// Function to get the logged-in user's ID and username.
const getLoggedInUserInfo = async () => {
    if (!token) {
        loggedInUserId = null;
        welcomeMessage.textContent = `Hello!`;
        return;
    }
    try {
        const response = await fetch("${API_BASE_URL}/api/users/me", {
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
            logout();
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

// Auth Functions
async function register() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
        showAlert("Please fill in all fields for registration.");
        return;
    }

    try {
        const res = await fetch("${API_BASE_URL}/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();

        if (res.ok) {
            showAlert("User registered successfully. Please login.");
            usernameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
        } else {
            showAlert(`Registration failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        showAlert("An error occurred during registration. Please try again.");
    }
}

async function login() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!email || !password) {
        showAlert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("${API_BASE_URL}/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("authToken", data.token);
            token = data.token;
            loggedInUserId = data.user_id;
            showAlert("User Logged In successfully");
            toggleAppVisibility();
            loginEmailInput.value = "";
            loginPasswordInput.value = "";
        } else {
            showAlert(`Login failed: ${data.message || 'Incorrect credentials'}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
        showAlert("An error occurred during login. Please try again.");
    }
}

async function logout() {
    try {
        await fetch("${API_BASE_URL}/api/users/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        console.warn("Logout endpoint error (might not exist or be necessary):", error);
    } finally {
        localStorage.removeItem("authToken");
        token = null;
        loggedInUserId = null;
        toggleAppVisibility();
        showAlert("Logged out successfully.");
    }
}

// Function to Fetch and Populate Categories
const fetchCategories = async () => {
    if (!token) {
        console.warn("No token available. Cannot fetch categories.");
        return;
    }

    try {
        const response = await fetch("${API_BASE_URL}/api/categories", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error("Unauthorized to fetch categories. Logging out.");
                logout();
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

        // Populate the post creation/edit form dropdowns
        postCategorySelect.innerHTML = '<option value="">Select a Category</option>';
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
    }
};

// Function to fetch all posts
const fetchPosts = async (categoryId = "") => {
    if (!token) {
        postsList.innerHTML = "<li>Please log in to view posts.</li>";
        return;
    }

    try {
        let url = "${API_BASE_URL}/api/posts";
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
                showAlert("Session expired or unauthorized. Please log in again.");
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();
        postsList.innerHTML = "";

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
                        By: ${post.user ? post.user.username : 'Unknown User'} on ${formattedDate}
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
        showAlert("Please log in to view post details.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 404) {
                showAlert("Post not found.");
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
        detailPostAuthor.textContent = post.user ? post.user.username : 'Unknown User';
        selectedAuthorId = post.user ? post.user.id : null; // FIX: set null when unknown
        detailQuill.root.innerHTML = post.content; // Set Quill content
        detailQuill.enable(false); // read-only initially

        // Category display/edit controls
        detailPostCategory.textContent = post.category ? post.category.category_name : 'Uncategorized';
        detailPostCategory.style.display = 'inline';
        detailPostCategorySelect.value = post.category ? post.category.id : '';
        detailPostCategorySelect.style.display = 'none';
        detailCategoryLabel.style.display = 'none';

        // Show/hide buttons based on ownership
        const isOwner = (post.user_id === loggedInUserId);
        editButton.style.display = isOwner ? 'inline-block' : 'none';
        deleteButton.style.display = isOwner ? 'inline-block' : 'none';
        saveEditButton.style.display = 'none';
        cancelEditButton.style.display = 'none';
        followButton.style.display = isOwner ? 'none' : 'inline-block'; // FIX: remove unconditional override

        renderComments(post.comments);

        postDetailModal.style.display = "flex";
    } catch (error) {
        console.error("Error viewing post:", error);
        showAlert("Could not load post details: " + error.message);
    }
};

// Enable editing mode for the post
const enableEditMode = () => {
    detailQuill.enable(true);
    detailQuill.focus();

    // Toggle button visibility
    editButton.style.display = 'none';
    deleteButton.style.display = 'none';
    saveEditButton.style.display = 'inline-block';
    cancelEditButton.style.display = 'inline-block';
    detailPostCategory.style.display = 'none';
    detailPostCategorySelect.style.display = 'block';
    detailCategoryLabel.style.display = 'block';
};

// Save edited post
const saveEditedPost = async () => {
    const updatedTitle = detailPostTitle.textContent;
    const updatedContent = detailQuill.root.innerHTML;
    const updatedCategoryId = detailPostCategorySelect.value;

    if (!updatedTitle || !updatedContent) {
        showAlert("Post title and content cannot be empty.");
        return;
    }
    if (!updatedCategoryId) {
        showAlert("Please select a category for your post.");
        return;
    }
    if (!token) {
        showAlert("You must be logged in to update a post.");
        return;
    }

    try {
        const updateBody = { title: updatedTitle, content: updatedContent };
        updateBody.category_id = updatedCategoryId || null;

        const response = await fetch(`${API_BASE_URL}/api/posts/${currentPostId}`, {
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

        showAlert("Post updated successfully!");
        postDetailModal.style.display = "none";
        fetchPosts();
    } catch (error) {
        console.error("Error updating post:", error);
        showAlert("Failed to update post: " + error.message);
    }
};

// Delete a post
const deletePost = () => {
    showConfirm("Are you sure you want to delete this post? This action cannot be undone.", async (confirmed) => {
        if (!confirmed) return;

        if (!token) {
            showAlert("You must be logged in to delete a post.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${currentPostId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showAlert("Post deleted successfully!");
            postDetailModal.style.display = "none";
            fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            showAlert("Failed to delete post: " + error.message);
        }
    });
};

// Comment Functions
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
        showAlert('Please enter a comment.');
        return;
    }
    if (!token) {
        showAlert('You must be logged in to add a comment.');
        return;
    }
    if (!currentPostId) {
        showAlert('Error: No post selected to comment on.');
        return;
    }

    try {
        const response = await fetch('${API_BASE_URL}/api/comments', {
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
            showAlert(`Failed to add comment: ${errorData.message || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Network or server error submitting comment:', err);
        showAlert('An error occurred while submitting your comment.');
    }
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Event listeners for authentication buttons
    registerButton.addEventListener("click", register);
    loginButton.addEventListener("click", login);
    logoutButton.addEventListener("click", logout);

    // Post creation form submission
    postForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postQuill.root.innerHTML; // Get HTML content from Quill
        const category_id = postCategorySelect.value; // Get selected category ID

        if (!title || !content.replace(/<p><br><\/p>/g, '').trim()) {
            showAlert("Please enter both a title and some content for your post.");
            return;
        }
        if (!category_id) {
            showAlert("Please select a category for your post.");
            return;
        }
        if (!token) {
            showAlert("You must be logged in to create a post.");
            return;
        }

        try {
            const response = await fetch("${API_BASE_URL}/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, category_id }),
            });

            if (response.ok) {
                showAlert("Post created successfully!");
                postTitleInput.value = "";
                postQuill.root.innerHTML = "";
                postCategorySelect.value = "";
                fetchPosts();
            } else {
                const errorData = await response.json();
                console.error("Error creating post:", errorData.message || "Unknown error");
                showAlert("Failed to create post: " + (errorData.message || "Server error."));
            }
        } catch (error) {
            console.error("Error creating post:", error);
            showAlert("Network error. Could not connect to the server.");
        }
    });

    // Handle clicks on the posts list (for viewing post details)
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
        detailQuill.enable(false);
        detailPostCategorySelect.style.display = 'none';
        detailCategoryLabel.style.display = 'none';
        detailPostCategory.style.display = 'inline';
        authorPosts.innerHTML=" ";
        followButton.innerHTML="follow";
    });

    // Close the modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === postDetailModal) {
            postDetailModal.style.display = "none";
            detailQuill.enable(false);
            detailPostCategorySelect.style.display = 'none';
            detailCategoryLabel.style.display = 'none';
            detailPostCategory.style.display = 'inline';
            authorPosts.innerHTML=" ";
            followButton.innerHTML="follow";
        }
    });

    // Event listeners for the modal's action buttons
    editButton.addEventListener("click", enableEditMode);
    saveEditButton.addEventListener("click", saveEditedPost);
    cancelEditButton.addEventListener("click", () => {
        detailQuill.enable(false);
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

    // Handle submission of a new comment
    commentForm.addEventListener("submit", newCommentHandler);

    // Filter by category
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener("change", (event) => {
            const selectedCategoryId = event.target.value;
            fetchPosts(selectedCategoryId);
        });
    }

    // Initial call to set the app's visibility state
    toggleAppVisibility();
});

// Follow button
followButton.addEventListener('click', ()=>{
    switch(followButton.innerHTML){
        case "follow": {
            followButton.innerHTML="unfollow";
            let selectedAuthor = detailPostAuthor.textContent;
            fetchAuthorPosts(selectedAuthorId);
            break;
        }
        case "unfollow":{
            followButton.innerHTML="follow";
            authorPosts.innerHTML=" ";
            break;
        }
    }
});

// function to follow author
const fetchAuthorPosts = async (id) => {
    try {
        let url = "${API_BASE_URL}/api/posts";
        if (id) {
            url += `?user_id=${id}`;
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
                showAlert("Session expired or unauthorized. Please log in again."); // FIX: use showAlert
                logout();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();
        authorPosts.innerHTML = "";

        if (posts.length === 0) {
            authorPosts.innerHTML = "<li>No posts yet. Create one above!</li>";
            return;
        }

        posts.forEach((post) => {
            if (post.user.id == id) {
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
                            By: ${post.user ? post.user.username : 'Unknown User'} on ${formattedDate}
                            ${post.category ? ` (Category: ${post.category.category_name})` : ''} </span>
                        <button onclick="displayDetail(${post.id}, this)">select this article</button>
                    </div>
                `;
                authorPosts.appendChild(li);
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        authorPosts.innerHTML = "<li>Error loading posts. Please try again.</li>";
    }
};

function displayDetail(postId, btn){
    btn.innerHTML="pressed" + " " + postId;
    authorPosts.innerHTML="";
    followButton.innerHTML="follow";
    postDetailModal.style.display = "none";
    viewPost(postId);
    followButton.click();
}
