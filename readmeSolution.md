# Full Stack Notes Application using Node and Express

## Introduction:

Herewith my submission for Week-8's challenge: a full-stack 'Tech Blog' application, using Node, Express, and MySQL, Sequelize, and JWT authentication. The Tech Blog application provides a dynamic platform for creating, managing, and displaying blog posts.  It allows registered users to compose and publish new blog posts, categorise them, and publish to a wide audience of other registered users. The app provides a means for users to browse all existing posts (or subsets of all posts) sorted by category. Users can then read and comment on the posts of their choice.

---

## The Solution:

The solution comprises an Express server (backend), serving frontend files and providing a RESTful API managing the Blog (Posts and Comments). The server serves frontend files from a directory named 'public', making the frontend (HTML, CSS and JS files), directly accessible to clients. The server provides a set of API endpoints for performing CRUD (Create, Read, Update, Delete) operations on the Blog. The Blog data being persisted in a MySQL database. Communication requests, between frontend and backend applications is managed using JSON Web Token (JWT) authentication.

### Design Strategy

The design of this application was largely dictated be the specification brief for the challenge. The design decisions (on form and function), left to the author, will be discussed here.
The development strategy that I envisaged for this project was an API-first, backend-driven, iterative approach. First defining what data structures and functionalities were to be exposed via an API. Then, building and testing the backend, and finally building and testing the user interface. Throughout the process, build and test in small, manageable sprints.

#### Planning & Requirements (what and why):

Defining Core Functionality (what the application should do) was largely defined within the challenge brief. Design decisions, to provision functionality, and sequencing are discussed here:

- Design the Data Model (Entities & Relationships):

- Identify Entities, based on the functionality (i.e., User, Post, Comment, Category).

- Define Attributes for each entity (i.e., user: id, username, email, password; post: id, title, content, user_id, category_id, createdOn).

- Establish Relationships, by defining how entities relate to each other (i.e., one user has many posts, one post belongs to one category, one Post has many comments, one comment belongs to one user).

This 'requirements' data model naturally dictates our database schema and ORM models.


Define the API Endpoints:

Based on the functionality and data model, we could proceed to design the API routes for each operation. Thus, defining our "API Contracts."
For each endpoint, I specified the :

- HTTP Method: (GET, POST, PUT, DELETE).

- Path: (/api/posts, /api/users/login, /api/posts/:id).

- Request Body (for POST/PUT): What data is expected? (i.e.,  { "title": "...", "content": "...", "category_id": ... })
        
- Response Body (for all): What data will be returned on success/failure? (i.e., 200 OK, 400 Bad Request, 500 Internal Server Error).


With a clear plan (of function and form) I could begin backend development, taking an iterative, test-driven approach.
The Database setup and ORM configuration had already been provided, as had Core Authentication & User Management.
Some basic user routes had been supplied in prior exercises. These needed to be augmented and enhanced to fulfil the API routes for each functional operation. VSCode’s REST Client was extensively used here, to ensure that key contracts (registration, login, and token validation) work correctly, before moving on. The author systematically defining and testing (VSCode REST Client) API requests for all the data resources (i.e., GET /api/posts, and POST /api/comments).

---

### API Endpoints:

The application provides a comprehensive set of API endpoints for managing users, categories, posts, and comments. Most of the endpoints are protected by authentication, ensuring that only authorized users can perform actions like creating, updating, or deleting content.

#### Category Endpoints (/api/categories), manage the blog post categories:

- GET /api/categories - Retrieves a list of all available categories (ordered alphabetically by name).

- GET /api/categories/:id - Fetches a single category by its unique ID. 

- POST /api/categories - Creates a new category. A category_name must be provided in the request body. 

- PUT /api/categories/:id - Updates an existing category identified by its ID. A new category_name must be provided in the request body.

- DELETE /api/categories/:id - Deletes a category by its unique ID.

#### Comment Endpoints (/api/comments), for managing comments on blog posts.

- POST /api/comments - Creates a new comment on a post. The request body must include comment_text and post_id. The user_id is automatically derived from the authenticated user. 

#### Post Endpoints (/api/posts), handle the core blog posts, including their content, author, comments, and categories.

- GET /api/posts - Retrieves all blog posts. Posts are ordered by their creation date (newest first) and include associated user, comments (with comment authors), and category information. 

- GET /api/posts/:id - Fetches a single blog post by its unique ID, along with its associated user, comments, and category details.

- POST /api/posts - Creates a new blog post. The request body must include title, content, and optionally category_id. The user_id and postedBy fields are automatically populated from the authenticated user.

- PUT /api/posts/:id - Updates an existing blog post identified by its ID. The author of the post can update the title, content, and category_id. Requires authentication AND ownership.

- DELETE /api/posts/:id - Deletes a blog post by its unique ID. Requires authentication and ownership.

#### User Endpoints (/api/users), manage user accounts, including registration, login, and profile management.

- GET /api/users/me - Retrieves the profile data of the currently authenticated user.

- GET /api/users/:id - Fetches a single user's profile data by their unique ID. The password is always excluded from the response for security. Public (does not require authentication).

- ET /api/users - Retrieves a list of all registered users. 

- POST /api/users - Registers a new user. The username, email, and password must be provided in the request body. Upon successful registration, a token is returned. Access: Public.

- POST /api/users/login - Authenticates a user and logs them in. Request body must include valid email and password. Upon successful login, a token is returned for future authenticated requests. Access: Public.

- POST /api/users/logout - Handles user logout. For our JWT-based authentication, the token is discarded. The server returns a 204 No Content response.

The solution source and test files have been judiciously commented, to provide in-line documentation. So, specific solution features and coding strategies will not be repeated here.

The routes files (routes/category.js, comment-routes.js, post.js, user.js, and index.js) apply the frontend logic for the Blog Post application, using these endpoints. A test plan and procedure for the endpoints is given at blog_post_api_tests.http, within the root folder of this project. Unless specified, each API request requires JWT authentication (application of the Bearer: <token>. within the request body). Most endpoints require the user to be logged in (and possibly prove ownership). This application employs JSON Web Token (JWT) Authentication. JSON Web Token (JWT) authentication is new to the author. So, justification/explanation is warranted here.

---

### JSON Web Token (JWT) Authentication:

JWT authentication is designed to be stateless, such that the server does not keep a record of ‘sessions’ in the traditional sense (like cookie-based sessions where the server stores session IDs). With JWT, when we successfully log in, the server verifies our credentials, and, if correct and current, it generates a new JWT. This token contains encoded information (i.e., user ID, email, and an expiration timestamp). Every JWT has an expiration claim. This limits the lifetime of the token (i.e., 1 hr, 24 hrs). Once the claim expires, the token becomes invalid. If we log in again (even if our current token has not expired), we are requesting a new authentication instance. The server responds by issuing a new token with a fresh expiration time.

#### Token Passing with JWTs

While JWTs are stateless on the server, they enable a "stateless session" for the client. Here is the flow for our client:

- Registration: Initial Registration is completed using personal credentials (username, e-mail address, and a self-generated password). On registration, a new JWT is generated and returned to the user. However, this token is not employed in the initial login. A user must be logged in, to access data services.

- Login: To login the user offers their credentials (submitted at registration), via the /api/users/login endpoint. On successful authentication (login), the server generates and returns a JWT. The client stores the new token on the frontend (browser application), in localStorage or sessionStorage. In the VSCode REST Client (or Postman), we manually copy the token into a local (@authToken) variable. As this represents the current "active session" token, it must be replaced each time a new token is generated (subsequent logins).

- Subsequent authenticated requests: For any API endpoint that requires authentication (like creating a post, getting all posts, updating a category, deleting a comment), our client (browser or REST Client) must include its valid token in the Authorization header of the request. The standard format is Authorization: Bearer <token>. When the server receives such a request, it extracts the token from the Authorization header, verifies the token's signature (to ensure it hasn't been tampered with), and checks validity (not expired). If the token is valid and unexpired, the server allows the request to proceed and identifies the user based on the token's claims. If invalid or expired, the server returns an error (i.e., 401 Unauthorized or 403 Forbidden).

---

### Frontend Development & Integration
Once the backend API was stable and thoroughly tested, I began building the user-facing application. This was actually lifted (with considerable modification) from week-7’s challenge (the Note Pad application). Once again, during this part of development, I employed iterative development and continuous testing. This required me to build single small modules at a time, testing the module, then move to the next module. This, in the hope of catches issues early, when they are easier to isolate and rectify. Testing was integrated throughout the process. I used MySQL Workbench to confirm the status of data, and the VSCode REST Client to test API function and client interaction.

---

## Installation Strategy

The installation strategy for a Node.js server involves using npm (Node Package Manager), as bundled with Node.js. The goal is to set up the project with all its external dependencies (like Express) correctly installed and managed. First, we need to install Node, per the operating system in question. See the official Node.js website for details: https://nodejs.org/. Our application uses Sequelize as an Object Relational Mapper (ORM), which supports various databases. We will need a database server installed and set up (this example employs MySQL).

Having successfully installed MySQL and Node, we can go to install credentials and configure the interfaces, within VSCode.

Ensure that the database credentialss are loaded into the .env environmental file, within the project root directory. For our example, copy the `.env.example` file, renaming it `.env`, then update the environment variables (DB_PASSWORD={"YOUR DB PASSWORD HERE"}).

| Procedure                                                            | Command                     |
|:---------------------------------------------------------------------|:----------------------------|
| Log in to the MySQL database (use predeclared credentials)           |$: mysql -u root -p          |
| Set up the database                                                  |SQL> source db/schema.sql;   |
| Quit out of MySQL                                                    |SQL> quit;                   |
| Verify Node installed and accessible from our project file.          |$: node -v                   |
| Initialise npm (creating package.json file).                         |$: npm init                  |
| Install depandencies (creating node_modules and package-lock.json).  |$: npm install               |
| Seed the database with test data                                     |$: npm run seed              |
| Run the application                                                  |$: npm start                 |
|                                                                      |                             |

Based on our configuration files, the application frontend will now be accessible at http://localhost:3001

---

## Deployment

### GitHub:

The source and dependency files have been pushed to my GitHub 'BlogPost' repository for public access at https://github.com/paulmayer-fullstacker/BlogPost. Before pushing to gitHub, a .gitignore file was created to exclude (ignore) the node_modules dependency directory and the environmental variable (.env file). The addition of this line in the .gitignore file 'node_modules/' causes git to ignore a node_modules directory, held within any subdirectory. The addition of a line containing '.env', will causes git to ignore a .env file, held within any subdirectory.

### Render:

It was intended to deploy the Tech Blog application to the Render hosting site, for public access. However, Render no longer supports direct hosting of MySQL databases. Render does provide a fully managed PostgreSQL service, but this would require significant backend recoding, to accommodate the new SQL dialect. The author experimented with the option of deploying MySQL as a Private Service (SQL deployed to a Docker container hosted on GitHub) that React could access over the Internet. Unfortunately (discovered after much time and effort), React does not support Private Service access on its free tier. Deployment to Render was considered too arduous, and was thus withdrawn from this submission.

### YouTube:

In lieu of the Render shortfall, a short video illustrating use of the Tech Blog application was uploaded to YouTube. The (unlisted) video can be viewed at: https://youtu.be/-A7fg039kEc

---

## To Conclude:

I hope that that this submission is adequate and appropriate, at this stage of the course.  

I believe that the project does fulfil the challenge requirements brief and serves a useful Tech Blog app.

---

<br/>

<hr style="height: 5px; background-color: black; border: none;">