# Assignment (Enhanced Authentication API)

In this assignment, I have improved the existing backend API for an authentication system to include a new feature allowing users to set their profiles as public or private. Additionally, I have implemented functionality to allow admin users to view both public and private user profiles, while normal users can only access public profiles. 

## Requirements
- Node.js: JavaScript runtime environment for server-side code.
- Express.js: Backend framework for building RESTful APIs.
- MongoDB: Database for data persistence.

## Versions
- Node - v20.9.0
- npm - 10.1.0

- Rest can be fetched from package.json

## Installation & Usage
- Clone the repo and open with VS code
- Open the terminal and install the dependencies by typing
  ```
  npm install
  ```
- After installation run the below command to start the server
```
npm run dev
```
- Now the server will start, open the postman or any web API testing tool to test the API endpoints
- The base route for all the endpoints:
```
  http://localhost:4000/api/v1/user
```
- The routes that are public are:
  ```
  http://localhost:4000/api/v1/user/register
  http://localhost:4000/api/v1/user/auth
  http://localhost:4000/api/v1/user/refresh
  http://localhost:4000/api/v1/user/logout
  ```
- Private routes:
  ```
  http://localhost:4000/api/v1/user/profiles
  http://localhost:4000/api/v1/user/profiles/:id
  http://localhost:4000/api/v1/user/profiles/:id
  http://localhost:4000/api/v1/user/profiles/:id/visibility
  http://localhost:4000/api/v1/user/admin 
  http://localhost:4000/api/v1/user/profiles/public
  http://localhost:4000/api/v1/user/profiles/admins
  http://localhost:4000/api/v1/user/profiles/users
  http://localhost:4000/api/v1/user/superuser/:id
  ```
- Whenever an access token expires we need to hit a GET request on /refresh endpoint to get a new access token. The access token is set for a shorter duration of only 30 seconds and will expire after that. So for private routes, we need to refresh our access token.
- An admin can be set through the endpoint PATCH /superuser/:id this is on a temporary basis for testing only if the functionality is proper or not.


###Routes
- POST /register - This API endpoint is for new user registration. The data can be posted in raw JSON or form data if uploading a photo from the device.
- POST /auth - This API endpoint is for logging in as a registered user.
- GET /refresh - This API endpoint is for a request for an access token every time the access token expires. 
- GET /logout - This API endpoint is for logging out from the current session.
- GET /profiles - This API endpoint is for getting all the public profiles that are visible to normal user
- GET /profiles/:id - This API endpoint is for fetching a detailed user profile.
- PATCH /profiles/:id - This API endpoint is for updating a user profile.
- PATCH /profiles/:id/visibility - This API endpoint is for setting the profile as public or private.
- GET/admin - This API endpoint is for getting all public and private profiles that are visible to the admin.

- GET /profiles/public - This API endpoint is for fetching all public profiles
- GET /profiles/admins - This API endpoint is for fetching all the profiles whose role is admin
- GET /profiles/users - This API endpoint is for fetching all profiles whose role is a user.
  
- PATCH /superuser/:id - This API endpoint is a temporary endpoint for setting an admin.
