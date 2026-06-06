# Authentication & User Management API Documentation

## Base URL
```
http://localhost:5000/api/users
```

## Data Model

### User Structure
```typescript
interface User {
  _id: string;
  username: string;           // Unique username (3-30 chars)
  email: string;              // Unique email address
  firstName: string;          // First name (max 50 chars)
  lastName: string;           // Last name (max 50 chars)
  role: "user" | "admin";     // User role
  language: "en" | "ta";      // Preferred language
  profileImage?: string;      // Profile image URL (optional)
  bio?: string;               // User bio (max 200 chars, optional)
  favoriteRecipes: string[];  // Array of favorite recipe IDs
  savedRecipes: string[];     // Array of saved recipe IDs
  createdRecipes: string[];   // Array of created recipe IDs
  isActive: boolean;          // Account status
  lastLogin?: string;         // Last login timestamp (optional)
  createdAt: string;          // Account creation timestamp
  updatedAt: string;          // Last update timestamp
}
```

---

## 📝 REGISTER User

**Endpoint:** `POST /register`

**Description:** Register a new user account

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",           // Required (3-30 chars)
  "email": "john@example.com",     // Required (valid email)
  "password": "password123",       // Required (min 6 chars)
  "firstName": "John",             // Required
  "lastName": "Doe"                // Required
}
```

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

---

## 👤 GET User Profile

**Endpoint:** `GET /profile`

**Description:** Get current user's profile with populated recipes

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
    "bio": "Passionate home cook",
    "favoriteRecipes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Tomato Soup",
        "slug": "tomato-soup",
        "cookingTime": 30
      }
    ],
    "savedRecipes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "title": "Chicken Curry",
        "slug": "chicken-curry",
        "cookingTime": 45
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
  "firstName": "Jonathan",           // Optional
  "lastName": "Doe-Smith",           // Optional
  "bio": "Professional chef",       // Optional (max 200 chars)
  "profileImage": "https://example.com/new-profile.jpg"  // Optional (valid URL)
}
```

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
    "bio": "Professional chef",
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
recipeId: string    // Recipe ID to add to favorites
```

**Example Request:**
```bash
POST /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe added to favorites"
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

**Example Request:**
```bash
DELETE /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe removed from favorites"
}
```

---

## 📌 SAVE Recipe

**Endpoint:** `POST /saved/:recipeId`

**Description:** Save a recipe to user's saved recipes list

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
recipeId: string    // Recipe ID to save
```

**Example Request:**
```bash
POST /api/users/saved/64f8a1b2c3d4e5f6a7b8c9d2
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe saved"
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

**Example Request:**
```bash
DELETE /api/users/saved/64f8a1b2c3d4e5f6a7b8c9d2
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe removed from saved list"
}
```

---

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### User Already Exists (400)
```json
{
  "success": false,
  "message": "User already exists"
}
```

### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Account Deactivated (401)
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

### Not Authenticated (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Invalid Token (401)
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### User Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Invalid Recipe ID (400)
```json
{
  "success": false,
  "message": "Invalid recipe id"
}
```

---

## 🔐 JWT Token Format

The API uses JWT (JSON Web Tokens) for authentication. The token must be included in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Token Payload Structure:**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "iat": 1642248000,
  "exp": 1642334400
}
```

**Token Expiration:** Configurable via environment variable (default: 24 hours)

---

## 📱 Mobile App Usage Examples

### 1. User Registration
```bash
POST /api/users/register
{
  "username": "foodie123",
  "email": "user@example.com",
  "password": "securepass123",
  "firstName": "Alice",
  "lastName": "Johnson"
}
```

### 2. User Login
```bash
POST /api/users/login
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

### 3. Get User Profile
```bash
GET /api/users/profile
Authorization: Bearer <token>
```

### 4. Update Profile
```bash
PUT /api/users/profile
Authorization: Bearer <token>
{
  "bio": "Love cooking traditional recipes",
  "profileImage": "https://example.com/avatar.jpg"
}
```

### 5. Manage Favorites
```bash
# Add to favorites
POST /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
Authorization: Bearer <token>

# Remove from favorites
DELETE /api/users/favorites/64f8a1b2c3d4e5f6a7b8c9d1
Authorization: Bearer <token>
```

### 6. Manage Saved Recipes
```bash
# Save recipe
POST /api/users/saved/64f8a1b2c3d4e5f6a7b8c9d2
Authorization: Bearer <token>

# Unsave recipe
DELETE /api/users/saved/64f8a1b2c3d4e5f6a7b8c9d2
Authorization: Bearer <token>
```

---

## 🔧 Important Notes

1. **Password Security:** Passwords are hashed using bcrypt with salt rounds (12)
2. **Token Security:** JWT tokens are signed with a secret key from environment variables
3. **Rate Limiting:** API endpoints are rate-limited to prevent abuse
4. **Input Validation:** All inputs are validated and sanitized
5. **Unique Constraints:** Email and username must be unique
6. **Soft Delete:** Users are deactivated rather than permanently deleted
7. **Profile Image:** Must be a valid URL (no file upload for profile images)
8. **Language Support:** Users can set preferred language (en/ta)
9. **Role System:** Two roles available: "user" and "admin"
10. **Auto-population:** Favorite and saved recipes are automatically populated with recipe details

---

## 🧪 Sample Data for Testing

### Registration Example
```json
{
  "username": "testuser123",
  "email": "test@example.com",
  "password": "testpass123",
  "firstName": "Test",
  "lastName": "User"
}
```

### Login Example
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

### Profile Update Example
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "Updated bio description",
  "profileImage": "https://example.com/profile.jpg"
}
```

---

## 🔄 Token Refresh Flow

Since JWT tokens expire, implement this flow in your mobile app:

1. **Store Token:** Save JWT token securely in device storage
2. **Auto-refresh:** Check token expiration before API calls
3. **Re-authenticate:** If token expired, redirect to login screen
4. **Manual Logout:** Provide logout option to clear stored token

---

## 🛡️ Security Best Practices

1. **HTTPS:** Always use HTTPS in production
2. **Token Storage:** Store tokens securely (Keychain on iOS, Keystore on Android)
3. **Token Expiration:** Handle token expiration gracefully
4. **Input Validation:** Client-side validation for better UX
5. **Error Handling:** Don't expose sensitive error details to users
6. **Rate Limiting:** Respect API rate limits
7. **Logout:** Implement proper logout to clear tokens

---

## 📊 User Statistics

The user profile includes arrays for:
- **favoriteRecipes:** Recipes user has marked as favorites
- **savedRecipes:** Recipes user has saved for later
- **createdRecipes:** Recipes user has created (populated automatically)

These arrays are populated with full recipe objects when fetching the profile, making it easy to display user-specific content in the mobile app.
