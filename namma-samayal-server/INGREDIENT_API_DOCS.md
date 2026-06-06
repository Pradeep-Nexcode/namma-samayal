# Ingredients API Documentation

## Base URL
```
http://localhost:5000/api/ingredients
```

## Data Model

### Ingredient Structure
```typescript
interface Ingredient {
  _id: string;
  name: {
    en: string;           // English name (required)
    ta?: string;          // Tamil name (optional)
  };
  slug: string;           // URL-friendly identifier
  category: {             // Main category object
    _id: string;
    name: { en: string; ta?: string; };
    slug: string;
    parent: string | null;
    level: number;
  };
  subCategory?: {         // Subcategory object (optional)
    _id: string;
    name: { en: string; ta?: string; };
    slug: string;
    parent: string;
    level: number;
  };
  description?: {         // Ingredient description (optional)
    en: string;
    ta?: string;
  };
  imageUrl?: string;       // Image URL (optional)
  nutrition?: {           // Nutritional information (optional)
    calories?: number;    // Calories per 100g
    protein?: number;     // Protein in grams per 100g
    carbs?: number;       // Carbohydrates in grams per 100g
    fat?: number;         // Fat in grams per 100g
  };
  tags: string[];          // Tags for categorization
  isActive: boolean;      // true for active, false for deleted
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

---

## 📋 GET All Ingredients (List)

**Endpoint:** `GET /`

**Description:** Get paginated list of ingredients with filtering options

**Query Parameters:**
```
category?: string         // Filter by main category ID
subCategory?: string      // Filter by subcategory ID
search?: string          // Search in name.en, name.ta, and description.en
page?: number            // Page number (default: 1)
limit?: number           // Items per page (1-100, default: 10)
includeInactive?: boolean // Include inactive ingredients (default: false)
```

**Example Request:**
```bash
GET /api/ingredients?category=64f8a1b2c3d4e5f6a7b8c9d0&page=1&limit=10&search=tomato
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": {
        "en": "Tomato",
        "ta": "தக்காளி"
      },
      "slug": "tomato",
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": {
          "en": "Vegetables",
          "ta": "காய்கறிகள்"
        },
        "slug": "vegetables",
        "parent": null,
        "level": 0
      },
      "subCategory": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": {
          "en": "Fresh Vegetables",
          "ta": "புதிய காய்கறிகள்"
        },
        "slug": "fresh-vegetables",
        "parent": "64f8a1b2c3d4e5f6a7b8c9d1",
        "level": 1
      },
      "description": {
        "en": "Fresh red tomato, rich in vitamins",
        "ta": "புதிய சிவப்பு தக்காளி, வைட்டமின்கள் நிறைந்தது"
      },
      "imageUrl": "https://example.com/images/tomato.jpg",
      "nutrition": {
        "calories": 18,
        "protein": 0.9,
        "carbs": 3.9,
        "fat": 0.2
      },
      "tags": ["vegetable", "cooking", "salad"],
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

## 🔍 GET Ingredient by ID

**Endpoint:** `GET /:id`

**Description:** Get detailed information about a specific ingredient

**Path Parameters:**
```
id: string    // Ingredient ID
```

**Example Request:**
```bash
GET /api/ingredients/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": {
      "en": "Tomato",
      "ta": "தக்காளி"
    },
    "slug": "tomato",
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": {
        "en": "Vegetables",
        "ta": "காய்கறிகள்"
      },
      "slug": "vegetables",
      "parent": null,
      "level": 0
    },
    "subCategory": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": {
        "en": "Fresh Vegetables",
        "ta": "புதிய காய்கறிகள்"
      },
      "slug": "fresh-vegetables",
      "parent": "64f8a1b2c3d4e5f6a7b8c9d1",
      "level": 1
    },
    "description": {
      "en": "Fresh red tomato, rich in vitamins and antioxidants",
      "ta": "புதிய சிவப்பு தக்காளி, வைட்டமின்கள் மற்றும் ஆக்ஸிஜனேற்றிகள் நிறைந்தது"
    },
    "imageUrl": "https://example.com/images/tomato.jpg",
    "nutrition": {
      "calories": 18,
      "protein": 0.9,
      "carbs": 3.9,
      "fat": 0.2
    },
    "tags": ["vegetable", "cooking", "salad", "vitamin-c"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## ➕ CREATE Ingredient (Admin Only)

**Endpoint:** `POST /`

**Description:** Create a new ingredient with image upload support

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
image: File                    // Image file (optional)
name[en]: string              // English name (required)
name[ta]: string              // Tamil name (optional)
slug: string                  // Custom slug (optional, auto-generated if not provided)
category: string              // Main category ID (required)
subCategory: string           // Subcategory ID (optional)
description[en]: string       // English description (optional)
description[ta]: string       // Tamil description (optional)
imageUrl: string              // Image URL (optional, overrides uploaded image)
nutrition[calories]: number   // Calories (optional)
nutrition[protein]: number    // Protein in grams (optional)
nutrition[carbs]: number       // Carbs in grams (optional)
nutrition[fat]: number         // Fat in grams (optional)
tags: string[]                // Tags array (optional)
```

**Example Request (JSON):**
```json
{
  "name": {
    "en": "Onion",
    "ta": "வெங்காயம்"
  },
  "slug": "onion",
  "category": "64f8a1b2c3d4e5f6a7b8c9d1",
  "subCategory": "64f8a1b2c3d4e5f6a7b8c9d2",
  "description": {
    "en": "Fresh onion, essential for cooking",
    "ta": "புதிய வெங்காயம், சமையலுக்கு அவசியம்"
  },
  "nutrition": {
    "calories": 40,
    "protein": 1.1,
    "carbs": 9.3,
    "fat": 0.1
  },
  "tags": ["vegetable", "cooking", "aromatic"]
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Ingredient created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "name": {
      "en": "Onion",
      "ta": "வெங்காயம்"
    },
    "slug": "onion",
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": {
        "en": "Vegetables",
        "ta": "காய்கறிகள்"
      },
      "slug": "vegetables",
      "parent": null,
      "level": 0
    },
    "subCategory": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": {
        "en": "Fresh Vegetables",
        "ta": "புதிய காய்கறிகள்"
      },
      "slug": "fresh-vegetables",
      "parent": "64f8a1b2c3d4e5f6a7b8c9d1",
      "level": 1
    },
    "description": {
      "en": "Fresh onion, essential for cooking",
      "ta": "புதிய வெங்காயம், சமையலுக்கு அவசியம்"
    },
    "imageUrl": "/uploads/ingredients/onion-123456789.jpg",
    "nutrition": {
      "calories": 40,
      "protein": 1.1,
      "carbs": 9.3,
      "fat": 0.1
    },
    "tags": ["vegetable", "cooking", "aromatic"],
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## ✏️ UPDATE Ingredient (Admin Only)

**Endpoint:** `PATCH /:id`

**Description:** Update an existing ingredient with image upload support

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Path Parameters:**
```
id: string    // Ingredient ID to update
```

**Form Data:** (Same as CREATE, all fields optional)
```
image: File                    // New image file (optional)
name[en]: string              // English name (optional)
name[ta]: string              // Tamil name (optional)
slug: string                  // New slug (optional)
category: string              // New main category ID (optional)
subCategory: string           // New subcategory ID (optional)
description[en]: string       // English description (optional)
description[ta]: string       // Tamil description (optional)
imageUrl: string              // Image URL (optional)
nutrition[calories]: number   // Calories (optional)
nutrition[protein]: number    // Protein in grams (optional)
nutrition[carbs]: number       // Carbs in grams (optional)
nutrition[fat]: number         // Fat in grams (optional)
tags: string[]                // Tags array (optional)
```

**Example Request (JSON):**
```json
{
  "name": {
    "en": "Red Onion",
    "ta": "சிவப்பு வெங்காயம்"
  },
  "description": {
    "en": "Fresh red onion with mild flavor",
    "ta": "மென்மையான சுவையுடன் புதிய சிவப்பு வெங்காயம்"
  },
  "tags": ["vegetable", "cooking", "aromatic", "sweet"]
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Ingredient updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "name": {
      "en": "Red Onion",
      "ta": "சிவப்பு வெங்காயம்"
    },
    "slug": "red-onion",
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": {
        "en": "Vegetables",
        "ta": "காய்கறிகள்"
      },
      "slug": "vegetables",
      "parent": null,
      "level": 0
    },
    "subCategory": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": {
        "en": "Fresh Vegetables",
        "ta": "புதிய காய்கறிகள்"
      },
      "slug": "fresh-vegetables",
      "parent": "64f8a1b2c3d4e5f6a7b8c9d1",
      "level": 1
    },
    "description": {
      "en": "Fresh red onion with mild flavor",
      "ta": "மென்மையான சுவையுடன் புதிய சிவப்பு வெங்காயம்"
    },
    "imageUrl": "/uploads/ingredients/red-onion-123456789.jpg",
    "nutrition": {
      "calories": 40,
      "protein": 1.1,
      "carbs": 9.3,
      "fat": 0.1
    },
    "tags": ["vegetable", "cooking", "aromatic", "sweet"],
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

---

## 🗑️ DELETE Ingredient (Admin Only)

**Endpoint:** `DELETE /:id`

**Description:** Soft delete an ingredient (sets isActive to false) and removes associated image

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
```
id: string    // Ingredient ID to delete
```

**Example Request:**
```bash
DELETE /api/ingredients/64f8a1b2c3d4e5f6a7b8c9d3
```

**Response Format:**
```json
{
  "success": true,
  "message": "Ingredient deleted successfully"
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
    },
    {
      "field": "category",
      "message": "category must be a valid category id"
    }
  ]
}
```

### Category Validation Error (400/404)
```json
{
  "success": false,
  "message": "Category not found or inactive"
}
```

### Subcategory Validation Error (400/404)
```json
{
  "success": false,
  "message": "subCategory must belong to the selected category"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Ingredient not found"
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

### 1. Load All Ingredients for Home Screen
```bash
GET /api/ingredients?page=1&limit=20
```

### 2. Filter by Category
```bash
GET /api/ingredients?category=64f8a1b2c3d4e5f6a7b8c9d1&limit=50
```

### 3. Filter by Subcategory
```bash
GET /api/ingredients?subCategory=64f8a1b2c3d4e5f6a7b8c9d2
```

### 4. Search Ingredients
```bash
GET /api/ingredients?search=tomato&page=1&limit=10
```

### 5. Get Ingredient Details
```bash
GET /api/ingredients/64f8a1b2c3d4e5f6a7b8c9d0
```

### 6. Combined Filter and Search
```bash
GET /api/ingredients?category=64f8a1b2c3d4e5f6a7b8c9d1&search=fresh&page=1&limit=15
```

---

## 🔧 Important Notes

1. **Soft Delete:** Ingredients are never permanently deleted, only marked as inactive
2. **Image Upload:** Supports both file upload and URL-based images
3. **Auto-generated Slugs:** If no slug is provided, it's auto-generated from the English name
4. **Category Validation:** Main category must be level 0, subcategory must belong to main category
5. **Search:** Full-text search works on name.en, name.ta, and description.en fields
6. **Sorting:** Ingredients are sorted alphabetically by English name
7. **Multilingual:** Supports both English and Tamil names and descriptions
8. **Nutrition:** All nutritional values are per 100g serving
9. **Tags:** Flexible tagging system for categorization and search
10. **Image Cleanup:** When deleting an ingredient, the associated image is also deleted

---

## 🧪 Sample Data for Testing

### Basic Ingredient Creation
```json
{
  "name": {
    "en": "Potato",
    "ta": "உருளைக்கிழங்கு"
  },
  "category": "64f8a1b2c3d4e5f6a7b8c9d1",
  "subCategory": "64f8a1b2c3d4e5f6a7b8c9d2",
  "description": {
    "en": "Starchy vegetable, versatile for cooking",
    "ta": "மாவுச்சத்து நிறைந்த காய், சமையலுக்கு பல்துறை"
  },
  "nutrition": {
    "calories": 77,
    "protein": 2,
    "carbs": 17,
    "fat": 0.1
  },
  "tags": ["vegetable", "starchy", "cooking", "versatile"]
}
```

### Ingredient with Image URL
```json
{
  "name": {
    "en": "Garlic",
    "ta": "பூண்டு"
  },
  "category": "64f8a1b2c3d4e5f6a7b8c9d1",
  "imageUrl": "https://example.com/images/garlic.jpg",
  "description": {
    "en": "Aromatic bulb used for flavoring",
    "ta": "சுவைக்காக பயன்படுத்தப்படும் நறுமணக் குமிழி"
  },
  "tags": ["aromatic", "flavoring", "cooking"]
}
```

---

## 📊 Advanced Filtering Examples

### Get Vegetables Only
```bash
GET /api/ingredients?category=VEGETABLE_CATEGORY_ID
```

### Get Fresh Vegetables
```bash
GET /api/ingredients?subCategory=FRESH_VEGETABLES_SUBCATEGORY_ID
```

### Search for High-Protein Ingredients
```bash
GET /api/ingredients?search=protein&page=1&limit=20
```

### Get All Ingredients with Pagination
```bash
GET /api/ingredients?page=3&limit=25&includeInactive=false
```
