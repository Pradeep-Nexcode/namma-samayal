# User Routes API Documentation

## Base URL
```
http://localhost:5000/api/users
```

## Available Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/favorites/:recipeId` | Add to favorites | Yes |
| DELETE | `/favorites/:recipeId` | Remove from favorites | Yes |
| POST | `/saved/:recipeId` | Save recipe | Yes |
| DELETE | `/saved/:recipeId` | Remove from saved | Yes |

---

## 📝 REGISTER User

**Endpoint:** `POST /register`

**Description:** Create a new user account with validation

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",           // Required (3-30 chars, unique)
  "email": "john@example.com",     // Required (valid email, unique)
  "password": "password123",       // Required (min 6 chars)
  "firstName": "John",             // Required (max 50 chars)
  "lastName": "Doe"                // Required (max 50 chars)
}
```

**Validation Rules:**
- `username`: 3-30 characters, unique, trimmed
- `email`: Valid email format, unique, lowercase
- `password`: Minimum 6 characters
- `firstName`: Required, trimmed, max 50 characters
- `lastName`: Required, trimmed, max 50 characters

**Response Format:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "language": "en",
      "profileImage": null,
      "bio": null,
      "favoriteRecipes": [],
      "savedRecipes": [],
      "createdRecipes": [],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed"
}

// User Already Exists (400)
{
  "success": false,
  "message": "User already exists"
}
```

---

## 🔐 LOGIN User

**Endpoint:** `POST /login`

**Description:** Authenticate user and return JWT token

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",     // Required (valid email)
  "password": "password123"        // Required
}
```

**Validation Rules:**
- `email`: Valid email format, trimmed
- `password`: Required

**Response Format:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "language": "en",
      "profileImage": null,
      "bio": null,
      "favoriteRecipes": [],
      "savedRecipes": [],
      "createdRecipes": [],
      "isActive": true,
      "lastLogin": "2024-01-15T11:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
// Invalid Credentials (401)
{
  "success": false,
  "message": "Invalid email or password"
}

// Account Deactivated (401)
{
  "success": false,
  "message": "Account is deactivated"
}
```

---

## 👤 GET User Profile

**Endpoint:** `GET /profile`

**Description:** Get current user's complete profile with populated recipes

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "language": "en",
    "profileImage": "https://example.com/profile.jpg",
    "bio": "Passionate home cook who loves traditional recipes",
    "favoriteRecipes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Tomato Soup",
        "slug": "tomato-soup",
        "cookingTime": 30,
        "difficulty": "easy",
        "imageUrl": "https://example.com/tomato-soup.jpg"
      }
    ],
    "savedRecipes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "title": "Chicken Curry",
        "slug": "chicken-curry",
        "cookingTime": 45,
        "difficulty": "medium",
        "imageUrl": "https://example.com/chicken-curry.jpg"
      }
    ],
    "createdRecipes": [],
    "isActive": true,
    "lastLogin": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Features:**
- Auto-populates `favoriteRecipes` with full recipe objects
- Auto-populates `savedRecipes` with full recipe objects
- Includes user activity and preferences
- Excludes password hash for security

**Error Responses:**
```json
// Not Authenticated (401)
{
  "success": false,
  "message": "Access denied. No token provided."
}

// User Not Found (404)
{
  "success": false,
  "message": "User not found"
}
```

---

## ✏️ UPDATE User Profile

**Endpoint:** `PUT /profile`

**Description:** Update current user's profile information

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)
```json
{
  "firstName": "Jonathan",           // Optional (cannot be empty)
  "lastName": "Doe-Smith",           // Optional (cannot be empty)
  "bio": "Professional chef and food blogger",  // Optional (max 200 chars)
  "profileImage": "https://example.com/new-profile.jpg"  // Optional (valid URL)
}
```

**Validation Rules:**
- `firstName`: Optional, trimmed, not empty if provided
- `lastName`: Optional, trimmed, not empty if provided
- `bio`: Optional, trimmed, max 200 characters
- `profileImage`: Optional, valid URL format if provided

**Response Format:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "Jonathan",
    "lastName": "Doe-Smith",
    "role": "user",
    "language": "en",
    "profileImage": "https://example.com/new-profile.jpg",
    "bio": "Professional chef and food blogger",
    "favoriteRecipes": [],
    "savedRecipes": [],
    "createdRecipes": [],
    "isActive": true,
    "lastLogin": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Features:**
- Partial updates supported (send only fields to update)
- Runs validation on provided fields
- Returns updated user object
- Maintains all existing data

**Error Responses:**
```json
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "firstName",
      "message": "First name cannot be empty"
    }
  ]
}

// User Not Found (404)
{
  "success": false,
  "message": "User not found"
}
```

---

## ❤️ ADD Recipe to Favorites

**Endpoint:** `POST /favorites/:recipeId`

**Description:** Add a recipe to user's favorites list

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
recipeId: string    // Recipe ID to add to favorites (MongoDB ObjectId)
```

**Validation:**
- `recipeId`: Must be a valid MongoDB ObjectId

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe added to favorites"
}
```

**Features:**
- Prevents duplicate favorites
- Automatically updates user's favoriteRecipes array
- No response data needed (just success message)

**Error Responses:**
```json
// Invalid Recipe ID (400)
{
  "success": false,
  "message": "Invalid recipe id"
}

// Not Authenticated (401)
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## 💔 REMOVE Recipe from Favorites

**Endpoint:** `DELETE /favorites/:recipeId`

**Description:** Remove a recipe from user's favorites list

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
recipeId: string    // Recipe ID to remove from favorites
```

**Validation:**
- `recipeId`: Must be a valid MongoDB ObjectId

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe removed from favorites"
}
```

**Features:**
- Safely removes recipe from favorites array
- No error if recipe wasn't in favorites
- Updates user document immediately

**Error Responses:**
```json
// Invalid Recipe ID (400)
{
  "success": false,
  "message": "Invalid recipe id"
}
```

---

## 📌 SAVE Recipe

**Endpoint:** `POST /saved/:recipeId`

**Description:** Save a recipe to user's saved recipes list (for later viewing)

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
recipeId: string    // Recipe ID to save
```

**Validation:**
- `recipeId`: Must be a valid MongoDB ObjectId

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe saved"
}
```

**Features:**
- Prevents duplicate saves
- Separate from favorites (different use case)
- Good for "cook later" functionality

**Error Responses:**
```json
// Invalid Recipe ID (400)
{
  "success": false,
  "message": "Invalid recipe id"
}
```

---

## 🗑️ UNSAVE Recipe

**Endpoint:** `DELETE /saved/:recipeId`

**Description:** Remove a recipe from user's saved recipes list

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
recipeId: string    // Recipe ID to unsave
```

**Validation:**
- `recipeId`: Must be a valid MongoDB ObjectId

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe removed from saved list"
}
```

**Features:**
- Removes recipe from saved list
- No error if recipe wasn't saved
- Updates immediately

**Error Responses:**
```json
// Invalid Recipe ID (400)
{
  "success": false,
  "message": "Invalid recipe id"
}
```

---

## 🚨 Common Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Errors (401)
```json
// No Token
{
  "success": false,
  "message": "Access denied. No token provided."
}

// Invalid Token
{
  "success": false,
  "message": "Invalid token."
}

// Token Expired
{
  "success": false,
  "message": "Token expired."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Rate Limit (429)
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## 🔐 JWT Token Information

**Token Format:** `Authorization: Bearer <jwt_token>`

**Token Payload:**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "iat": 1642248000,
  "exp": 1642334400
}
```

**Token Expiration:** 24 hours (configurable)

**How to Use:**
1. Get token from login/register response
2. Include in Authorization header for protected routes
3. Handle token expiration gracefully
4. Store securely on mobile device

---

## 📱 Mobile App Usage Examples

### 1. Complete User Registration Flow
```bash
# Step 1: Register
POST /api/users/register
{
  "username": "foodlover123",
  "email": "user@example.com",
  "password": "securepass123",
  "firstName": "Alice",
  "lastName": "Johnson"
}

# Step 2: Save token for future requests
# Store: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Login and Profile Management
```bash
# Login
POST /api/users/login
{
  "email": "user@example.com",
  "password": "securepass123"
}

# Get profile
GET /api/users/profile
Authorization: Bearer <token>

# Update profile
PUT /api/users/profile
Authorization: Bearer <token>
{
  "bio": "Love cooking traditional Indian recipes",
  "profileImage": "https://example.com/avatar.jpg"
}
```

### 3. Recipe Interaction Flow
```bash
# Add to favorites
POST /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
Authorization: Bearer <token>

# Save for later
POST /api/users/saved/64f8a1b2c3d4e5f6a7b8c9d2
Authorization: Bearer <token>

# View updated profile with recipes
GET /api/users/profile
Authorization: Bearer <token>

# Remove from favorites
DELETE /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
Authorization: Bearer <token>
```

---

## 🔧 Important Implementation Notes

### Security Features
- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Security:** Signed tokens with expiration
- **Input Validation:** All inputs validated and sanitized
- **Rate Limiting:** Protection against brute force attacks
- **CORS Enabled:** Proper cross-origin configuration

### Data Relationships
- **favoriteRecipes:** Array of recipe ObjectIds
- **savedRecipes:** Array of recipe ObjectIds  
- **createdRecipes:** Array of recipe ObjectIds (auto-populated)
- **Profile Data:** Includes user preferences and settings

### Mobile App Considerations
- **Token Storage:** Use secure device storage
- **Offline Support:** Cache user profile data
- **Error Handling:** Display user-friendly error messages
- **Loading States:** Show loading during API calls
- **Refresh Logic:** Handle token expiration gracefully

### Performance Optimization
- **Population:** Favorite/saved recipes populated in profile
- **Partial Updates:** Profile updates support partial data
- **Efficient Queries:** Optimized database queries
- **Caching:** Consider client-side caching for profile data

---

## 🧪 Testing Data Examples

### Registration Test Data
```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "testpass123",
  "firstName": "Test",
  "lastName": "User"
}
```

### Profile Update Test Data
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "Updated bio for testing",
  "profileImage": "https://example.com/test-avatar.jpg"
}
```

### Recipe ID Examples
```bash
# Valid MongoDB ObjectId format
64f8a1b2c3d4e5f6a7b8c9d0

# Invalid format examples
invalid-id
123456
```

---

## 📊 User Data Structure Summary

### Core User Fields
- **Authentication:** username, email, password (hashed)
- **Profile:** firstName, lastName, bio, profileImage
- **Preferences:** language (en/ta), role (user/admin)
- **Activity:** lastLogin, createdAt, updatedAt
- **Status:** isActive (boolean)

### Recipe Relationships
- **favoriteRecipes:** Recipes user loves
- **savedRecipes:** Recipes to cook later
- **createdRecipes:** Recipes user created

### Security Fields
- **Password:** Hashed, never returned in responses
- **Token:** JWT for authentication
- **Role:** Access control (user/admin)

This documentation provides complete coverage of all user routes API endpoints for your mobile app development!
