# Categories & Subcategories API Documentation

## Base URL
```
http://localhost:5000/api/categories
```

## Data Model

### Category Structure
```typescript
interface Category {
  _id: string;
  name: {
    en: string;        // English name (required)
    ta?: string;       // Tamil name (optional)
  };
  slug: string;        // URL-friendly identifier
  parent?: string;     // Parent category ID (null for main categories)
  level: number;       // 0 for main categories, 1 for subcategories
  isActive: boolean;   // true for active, false for deleted
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}
```

---

## 📋 GET All Categories (List)

**Endpoint:** `GET /`

**Description:** Get paginated list of categories with filtering options

**Query Parameters:**
```
level?: number          // Filter by level (0 = main categories, 1 = subcategories)
search?: string         // Search in name.en and name.ta fields
page?: number           // Page number (default: 1)
limit?: number          // Items per page (1-100, default: 10)
includeInactive?: boolean // Include inactive categories (default: false)
```

**Example Request:**
```bash
GET /api/categories?level=0&page=1&limit=10&search=indian
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": {
        "en": "Indian Cuisine",
        "ta": "இந்திய உணவு"
      },
      "slug": "indian-cuisine",
      "parent": null,
      "level": 0,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🌳 GET Category Tree

**Endpoint:** `GET /tree`

**Description:** Get hierarchical tree structure of all active categories with their subcategories

**Example Request:**
```bash
GET /api/categories/tree
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": {
          "en": "Indian Cuisine",
          "ta": "இந்திய உணவு"
        },
        "slug": "indian-cuisine",
        "parent": null,
        "level": 0,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      "subCategories": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": {
            "en": "North Indian",
            "ta": "வட இந்திய"
          },
          "slug": "north-indian",
          "parent": "64f8a1b2c3d4e5f6a7b8c9d0",
          "level": 1,
          "isActive": true,
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 📂 GET Subcategories by Parent

**Endpoint:** `GET /:id/subcategories`

**Description:** Get all subcategories for a specific parent category

**Path Parameters:**
```
id: string    // Parent category ID
```

**Example Request:**
```bash
GET /api/categories/64f8a1b2c3d4e5f6a7b8c9d0/subcategories
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": {
        "en": "North Indian",
        "ta": "வட இந்திய"
      },
      "slug": "north-indian",
      "parent": "64f8a1b2c3d4e5f6a7b8c9d0",
      "level": 1,
      "isActive": true,
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

---

## ➕ CREATE Category (Admin Only)

**Endpoint:** `POST /`

**Description:** Create a new category or subcategory

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": {
    "en": "Chinese Cuisine",    // Required
    "ta": "சீன உணவு"          // Optional
  },
  "slug": "chinese-cuisine",    // Optional (auto-generated if not provided)
  "parent": "64f8a1b2c3d4e5f6a7b8c9d0"  // Optional (null for main category)
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": {
      "en": "Chinese Cuisine",
      "ta": "சீன உணவு"
    },
    "slug": "chinese-cuisine",
    "parent": "64f8a1b2c3d4e5f6a7b8c9d0",
    "level": 1,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## ✏️ UPDATE Category (Admin Only)

**Endpoint:** `PATCH /:id`

**Description:** Update an existing category

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
```
id: string    // Category ID to update
```

**Request Body:**
```json
{
  "name": {
    "en": "Updated Name",
    "ta": "புதுப்பிக்கப்பட்ட பெயர்"
  },
  "slug": "updated-slug",    // Optional
  "parent": null             // Optional (null to make it main category)
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": {
      "en": "Updated Name",
      "ta": "புதுப்பிக்கப்பட்ட பெயர்"
    },
    "slug": "updated-slug",
    "parent": null,
    "level": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 🗑️ DELETE Category (Admin Only)

**Endpoint:** `DELETE /:id`

**Description:** Soft delete a category (sets isActive to false)

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
```
id: string    // Category ID to delete
```

**Example Request:**
```bash
DELETE /api/categories/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response Format:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
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
      "field": "name.en",
      "message": "name.en is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Category not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access denied. Please login first"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

---

## 📱 Mobile App Usage Examples

### 1. Load Main Categories for Home Screen
```bash
GET /api/categories?level=0&limit=20
```

### 2. Search Categories
```bash
GET /api/categories?search=indian&level=0
```

### 3. Load Category Tree for Navigation
```bash
GET /api/categories/tree
```

### 4. Load Subcategories when Category Selected
```bash
GET /api/categories/64f8a1b2c3d4e5f6a7b8c9d0/subcategories
```

### 5. Pagination for Large Lists
```bash
GET /api/categories?page=2&limit=10&level=0
```

---

## 🔧 Important Notes

1. **Soft Delete:** Categories are never permanently deleted, only marked as inactive
2. **Auto-generated Slugs:** If no slug is provided, it's auto-generated from the English name
3. **Hierarchy:** Only 2 levels supported (main categories and subcategories)
4. **Parent Validation:** Subcategories can only have main categories as parents
5. **Search:** Full-text search works on both English and Tamil names
6. **Sorting:** Categories are sorted alphabetically by English name
7. **Multilingual:** Supports both English and Tamil names

---

## 🧪 Sample Data for Testing

### Main Category Creation
```json
{
  "name": {
    "en": "South Indian",
    "ta": "தென்னிந்திய"
  },
  "slug": "south-indian",
  "parent": null
}
```

### Subcategory Creation
```json
{
  "name": {
    "en": "Tamil Nadu",
    "ta": "தமிழ்நாடு"
  },
  "slug": "tamil-nadu",
  "parent": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```
