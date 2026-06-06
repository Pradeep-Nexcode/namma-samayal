# Recipes API Documentation

## Base URL
```
http://localhost:5000/api/recipes
```

## Data Model

### Recipe Structure
```typescript
interface Recipe {
  _id: string;
  dishName: {
    en: string;           // English dish name (required)
    ta?: string;          // Tamil dish name (optional)
  };
  slug: string;           // URL-friendly identifier
  title?: string;         // Optional title (max 100 chars)
  location: {
    country: string;      // Country of origin (required)
    state?: string;       // State/region (optional)
    region?: string;      // Regional classification (optional)
    city?: string;        // City (optional)
  };
  description: {
    en: string;           // English description (required)
    ta?: string;          // Tamil description (optional)
  };
  ingredients: [
    {
      ingredient: {       // Ingredient object with full details
        _id: string;
        name: { en: string; ta?: string; };
        slug: string;
        category: { name: { en: string; ta?: string; }; slug: string; };
        subCategory?: { name: { en: string; ta?: string; }; slug: string; };
        imageUrl?: string;
        nutrition?: { calories: number; protein: number; carbs: number; fat: number; };
      };
      quantity?: string;  // Quantity (e.g., "2 cups", "1 tbsp")
      unit?: string;      // Unit (e.g., "cups", "tbsp", "kg")
    }
  ];
  steps: [
    {
      step?: number;       // Step number (optional)
      description: {
        en: string;       // English step description (required)
        ta?: string;      // Tamil step description (optional)
      };
    }
  ];
  speciality?: {
    en: string;           // English speciality description (optional)
    ta?: string;          // Tamil speciality description (optional)
  };
  cookingTime?: number;   // Cooking time in minutes (optional)
  servings?: number;      // Number of servings (optional)
  difficulty: "easy" | "medium" | "hard";  // Difficulty level
  category?: {            // Main category object (optional)
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
  imageUrl?: string;      // Recipe image URL (optional)
  tags: string[];         // Tags array
  createdBy: {            // Creator user object
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  isPublic: boolean;      // Public visibility status
  isApproved: boolean;    // Admin approval status
  ratings: [
    {
      user: string;       // User ID who rated
      rating: number;     // Rating value (1-5)
    }
  ];
  averageRating: number;  // Average rating (0-5)
  source: "manual" | "youtube" | "blog" | "ai";  // Recipe source
  coordinates?: {         // Geographic coordinates (optional)
    lat?: number;
    lng?: number;
  };
  createdAt: string;      // Creation timestamp
  updatedAt: string;      // Last update timestamp
}
```

---

## 📋 GET All Recipes (List)

**Endpoint:** `GET /`

**Description:** Get paginated list of recipes with advanced filtering

**Query Parameters:**
```
page?: number            // Page number (default: 1)
limit?: number           // Items per page (1-100, default: 10)
category?: string        // Filter by main category ID
subCategory?: string     // Filter by subcategory ID
difficulty?: string      // Filter by difficulty (easy|medium|hard)
country?: string         // Filter by country
state?: string           // Filter by state
region?: string          // Filter by region
search?: string          // Search in dishName.en and description.en
```

**Example Request:**
```bash
GET /api/recipes?page=1&limit=20&difficulty=easy&search=tomato
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "dishName": {
        "en": "Tomato Soup",
        "ta": "தக்காளி சூப்"
      },
      "slug": "tomato-soup",
      "title": "Classic Tomato Soup",
      "location": {
        "country": "Italy",
        "region": "Tuscany"
      },
      "description": {
        "en": "A classic Italian tomato soup with fresh basil",
        "ta": "புதிய துளசி கொண்ட கிளாசிக் இத்தாலிய தக்காளி சூப்"
      },
      "ingredients": [
        {
          "ingredient": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "name": {
              "en": "Tomato",
              "ta": "தக்காளி"
            },
            "slug": "tomato",
            "category": {
              "name": {
                "en": "Vegetables",
                "ta": "காய்கறிகள்"
              },
              "slug": "vegetables"
            },
            "imageUrl": "https://example.com/tomato.jpg",
            "nutrition": {
              "calories": 18,
              "protein": 0.9,
              "carbs": 3.9,
              "fat": 0.2
            }
          },
          "quantity": "4",
          "unit": "cups"
        }
      ],
      "steps": [
        {
          "step": 1,
          "description": {
            "en": "Heat olive oil in a large pot",
            "ta": "பெரிய பாத்திரத்தில் ஆலிவ் ஆயிலை சூடேற்றுங்கள்"
          }
        }
      ],
      "cookingTime": 30,
      "servings": 4,
      "difficulty": "easy",
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": {
          "en": "Soups",
          "ta": "சூப்ஸ்"
        },
        "slug": "soups",
        "parent": null,
        "level": 0
      },
      "imageUrl": "https://example.com/tomato-soup.jpg",
      "tags": ["soup", "italian", "vegetarian", "easy"],
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "username": "chef123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "isPublic": true,
      "isApproved": true,
      "ratings": [],
      "averageRating": 0,
      "source": "manual",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🔍 GET Recipe by ID

**Endpoint:** `GET /:id`

**Description:** Get detailed information about a specific recipe

**Path Parameters:**
```
id: string    // Recipe ID
```

**Example Request:**
```bash
GET /api/recipes/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "dishName": {
      "en": "Tomato Soup",
      "ta": "தக்காளி சூப்"
    },
    "slug": "tomato-soup",
    "title": "Classic Tomato Soup",
    "location": {
      "country": "Italy",
      "region": "Tuscany",
      "city": "Florence"
    },
    "description": {
      "en": "A classic Italian tomato soup with fresh basil and garlic",
      "ta": "புதிய துளசி மற்றும் பூண்டு கொண்ட கிளாசிக் இத்தாலிய தக்காளி சூப்"
    },
    "ingredients": [
      {
        "ingredient": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": {
            "en": "Tomato",
            "ta": "தக்காளி"
          },
          "slug": "tomato",
          "category": {
            "name": {
              "en": "Vegetables",
              "ta": "காய்கறிகள்"
            },
            "slug": "vegetables"
          },
          "subCategory": {
            "name": {
              "en": "Fresh Vegetables",
              "ta": "புதிய காய்கறிகள்"
            },
            "slug": "fresh-vegetables"
          },
          "imageUrl": "https://example.com/tomato.jpg",
          "nutrition": {
            "calories": 18,
            "protein": 0.9,
            "carbs": 3.9,
            "fat": 0.2
          }
        },
        "quantity": "4",
        "unit": "cups"
      }
    ],
    "steps": [
      {
        "step": 1,
        "description": {
          "en": "Heat olive oil in a large pot over medium heat",
          "ta": "நடுத்த சூடேற்றத்தில் பெரிய பாத்திரத்தில் ஆலிவ் ஆயிலை சூடேற்றுங்கள்"
        }
      },
      {
        "step": 2,
        "description": {
          "en": "Add chopped garlic and sauté for 1 minute",
          "ta": "நறுக்கப்பட்ட பூண்டை சேர்த்து 1 நிமிடம் வறுக்கவும்"
        }
      }
    ],
    "speciality": {
      "en": "Traditional Tuscan recipe passed down through generations",
      "ta": "தலைமுறைகளாக மாற்றப்பட்ட பாரம்பரிய டஸ்கன் சமையல் முறை"
    },
    "cookingTime": 30,
    "servings": 4,
    "difficulty": "easy",
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": {
        "en": "Soups",
        "ta": "சூப்ஸ்"
      },
      "slug": "soups",
      "parent": null,
      "level": 0
    },
    "subCategory": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": {
        "en": "Vegetarian Soups",
        "ta": "சைவ சூப்ஸ்"
      },
      "slug": "vegetarian-soups",
      "parent": "64f8a1b2c3d4e5f6a7b8c9d2",
      "level": 1
    },
    "imageUrl": "https://example.com/tomato-soup.jpg",
    "tags": ["soup", "italian", "vegetarian", "easy", "traditional"],
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "username": "chef123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "isPublic": true,
    "isApproved": true,
    "ratings": [
      {
        "user": "64f8a1b2c3d4e5f6a7b8c9d5",
        "rating": 5
      },
      {
        "user": "64f8a1b2c3d4e5f6a7b8c9d6",
        "rating": 4
      }
    ],
    "averageRating": 4.5,
    "source": "manual",
    "coordinates": {
      "lat": 43.7696,
      "lng": 11.2558
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## ➕ CREATE Recipe

**Endpoint:** `POST /`

**Description:** Create a new recipe with image upload support

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
image: File                              // Recipe image file (optional)
dishName[en]: string                   // English dish name (required)
dishName[ta]: string                   // Tamil dish name (optional)
slug: string                           // Custom slug (optional, auto-generated if not provided)
title: string                          // Recipe title (optional, max 100 chars)
location[country]: string              // Country (required)
location[state]: string                 // State (optional)
location[region]: string                // Region (optional)
location[city]: string                  // City (optional)
description[en]: string                // English description (required)
description[ta]: string                // Tamil description (optional)
ingredients: string                    // JSON array of ingredients (required)
steps: string                          // JSON array of steps (required)
speciality[en]: string                 // English speciality (optional)
speciality[ta]: string                 // Tamil speciality (optional)
cookingTime: number                     // Cooking time in minutes (optional)
servings: number                        // Number of servings (optional)
difficulty: string                      // Difficulty: easy|medium|hard (optional, default: medium)
category: string                        // Main category ID (optional)
subCategory: string                     // Subcategory ID (optional)
tags: string                            // JSON array of tags (optional)
source: string                          // Source: manual|youtube|blog|ai (optional, default: manual)
coordinates[lat]: number                 // Latitude (optional)
coordinates[lng]: number                 // Longitude (optional)
```

**Ingredients Array Format (JSON string):**
```json
[
  {
    "ingredient": "64f8a1b2c3d4e5f6a7b8c9d1",
    "quantity": "2",
    "unit": "cups"
  },
  {
    "ingredient": "64f8a1b2c3d4e5f6a7b8c9d2",
    "quantity": "1",
    "unit": "tbsp"
  }
]
```

**Steps Array Format (JSON string):**
```json
[
  {
    "step": 1,
    "description": {
      "en": "Heat oil in pan",
      "ta": "பானில் எண்ணெயை சூடேற்றுங்கள்"
    }
  },
  {
    "step": 2,
    "description": {
      "en": "Add vegetables",
      "ta": "காய்கறிகளை சேர்க்கவும்"
    }
  }
]
```

**Tags Array Format (JSON string):**
```json
["italian", "vegetarian", "easy", "quick"]
```

**Example Request (JSON):**
```json
{
  "dishName": {
    "en": "Pasta Carbonara",
    "ta": "பாஸ்தா கார்போனாரா"
  },
  "location": {
    "country": "Italy",
    "region": "Lazio",
    "city": "Rome"
  },
  "description": {
    "en": "Classic Italian pasta with eggs, cheese, and pancetta",
    "ta": "முட்டை, சீஸ் மற்றும் பான்செட்டா கொண்ட கிளாசிக் இத்தாலிய பாஸ்தா"
  },
  "ingredients": [
    {
      "ingredient": "64f8a1b2c3d4e5f6a7b8c9d1",
      "quantity": "400",
      "unit": "grams"
    },
    {
      "ingredient": "64f8a1b2c3d4e5f6a7b8c9d2",
      "quantity": "4",
      "unit": "pieces"
    }
  ],
  "steps": [
    {
      "step": 1,
      "description": {
        "en": "Boil pasta according to package instructions",
        "ta": "பேக்கேஜ் வழிகாட்டுதல்களுக்கு ஏற்ப பாஸ்தாவை கொதிக்கவும்"
      }
    }
  ],
  "cookingTime": 25,
  "servings": 4,
  "difficulty": "medium",
  "category": "64f8a1b2c3d4e5f6a7b8c9d3",
  "tags": ["italian", "pasta", "classic", "quick"],
  "source": "manual"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "dishName": {
      "en": "Pasta Carbonara",
      "ta": "பாஸ்தா கார்போனாரா"
    },
    "slug": "pasta-carbonara",
    "location": {
      "country": "Italy",
      "region": "Lazio",
      "city": "Rome"
    },
    "description": {
      "en": "Classic Italian pasta with eggs, cheese, and pancetta",
      "ta": "முட்டை, சீஸ் மற்றும் பான்செட்டா கொண்ட கிளாசிக் இத்தாலிய பாஸ்தா"
    },
    "ingredients": [
      {
        "ingredient": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": {
            "en": "Spaghetti",
            "ta": "ஸ்பேகெட்டி"
          },
          "slug": "spaghetti"
        },
        "quantity": "400",
        "unit": "grams"
      }
    ],
    "steps": [
      {
        "step": 1,
        "description": {
          "en": "Boil pasta according to package instructions",
          "ta": "பேக்கேஜ் வழிகாட்டுதல்களுக்கு ஏற்ப பாஸ்தாவை கொதிக்கவும்"
        }
      }
    ],
    "cookingTime": 25,
    "servings": 4,
    "difficulty": "medium",
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": {
        "en": "Pasta",
        "ta": "பாஸ்தா"
      },
      "slug": "pasta"
    },
    "imageUrl": "/uploads/recipes/pasta-carbonara-123456789.jpg",
    "tags": ["italian", "pasta", "classic", "quick"],
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "username": "chef123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "isPublic": true,
    "isApproved": false,
    "ratings": [],
    "averageRating": 0,
    "source": "manual",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## ✏️ UPDATE Recipe

**Endpoint:** `PUT /:id`

**Description:** Update an existing recipe with image upload support

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Path Parameters:**
```
id: string    // Recipe ID to update
```

**Form Data:** (Same as CREATE, all fields optional)
```
image: File                              // New image file (optional)
dishName[en]: string                   // English dish name (optional)
dishName[ta]: string                   // Tamil dish name (optional)
slug: string                           // New slug (optional)
title: string                          // Recipe title (optional)
location[country]: string              // Country (optional)
location[state]: string                 // State (optional)
location[region]: string                // Region (optional)
location[city]: string                  // City (optional)
description[en]: string                // English description (optional)
description[ta]: string                // Tamil description (optional)
ingredients: string                    // JSON array of ingredients (optional)
steps: string                          // JSON array of steps (optional)
speciality[en]: string                 // English speciality (optional)
speciality[ta]: string                 // Tamil speciality (optional)
cookingTime: number                     // Cooking time in minutes (optional)
servings: number                        // Number of servings (optional)
difficulty: string                      // Difficulty: easy|medium|hard (optional)
category: string                        // Main category ID (optional)
subCategory: string                     // Subcategory ID (optional)
tags: string                            // JSON array of tags (optional)
source: string                          // Source: manual|youtube|blog|ai (optional)
coordinates[lat]: number                 // Latitude (optional)
coordinates[lng]: number                 // Longitude (optional)
```

**Example Request (JSON):**
```json
{
  "dishName": {
    "en": "Updated Pasta Carbonara",
    "ta": "புதுப்பிக்கப்பட்ட பாஸ்தா கார்போனாரா"
  },
  "cookingTime": 30,
  "servings": 6,
  "difficulty": "easy",
  "tags": ["italian", "pasta", "classic", "updated"]
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "dishName": {
      "en": "Updated Pasta Carbonara",
      "ta": "புதுப்பிக்கப்பட்ட பாஸ்தா கார்போனாரா"
    },
    "slug": "updated-pasta-carbonara",
    "cookingTime": 30,
    "servings": 6,
    "difficulty": "easy",
    "tags": ["italian", "pasta", "classic", "updated"],
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

## 🗑️ DELETE Recipe

**Endpoint:** `DELETE /:id`

**Description:** Delete a recipe (only by recipe owner or admin)

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
```
id: string    // Recipe ID to delete
```

**Example Request:**
```bash
DELETE /api/recipes/64f8a1b2c3d4e5f6a7b8c9d7
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

---

## ⭐ RATE Recipe

**Endpoint:** `POST /:id/rate`

**Description:** Rate a recipe (1-5 stars)

**Authentication:** Required (JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
```
id: string    // Recipe ID to rate
```

**Request Body:**
```json
{
  "rating": 5    // Rating value (1-5)
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Recipe rated successfully",
  "data": {
    "userRating": 5,
    "averageRating": 4.2,
    "totalRatings": 12
  }
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
      "field": "dishName.en",
      "message": "Dish name (EN) is required"
    },
    {
      "field": "ingredients",
      "message": "At least one ingredient is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You can only update/delete your own recipes"
}
```

### Invalid Rating (400)
```json
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

---

## 📱 Mobile App Usage Examples

### 1. Browse Recipes with Filters
```bash
# Get easy Italian recipes
GET /api/recipes?difficulty=easy&country=Italy&page=1&limit=10

# Search for tomato recipes
GET /api/recipes?search=tomato&page=1&limit=20

# Filter by category
GET /api/recipes?category=64f8a1b2c3d4e5f6a7b8c9d0&limit=15
```

### 2. Create Recipe with Image
```bash
POST /api/recipes
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
image: [file]
dishName[en]: "Margherita Pizza"
dishName[ta]: "மார்கெரிட்டா பிஸ்ஸா"
location[country]: "Italy"
description[en]: "Classic Italian pizza with tomatoes and cheese"
ingredients: '[{"ingredient": "64f8a1b2c3d4e5f6a7b8c9d1", "quantity": "2", "unit": "cups"}]'
steps: '[{"step": 1, "description": {"en": "Prepare dough"}}]'
cookingTime: 30
difficulty: "medium"
```

### 3. Rate Recipe
```bash
POST /api/recipes/64f8a1b2c3d4e5f6a7b8c9d0/rate
Authorization: Bearer <token>
{
  "rating": 5
}
```

### 4. Update Recipe
```bash
PUT /api/recipes/64f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer <token>
{
  "cookingTime": 35,
  "servings": 6,
  "tags": ["italian", "pizza", "updated"]
}
```

---

## 🔧 Important Notes

### Recipe Visibility
- **isPublic**: Controls recipe visibility (true = visible to all users)
- **isApproved**: Admin approval status (false = pending approval)
- Public recipes are visible to all users
- Private recipes only visible to creator

### Rating System
- Users can rate recipes 1-5 stars
- Each user can rate a recipe only once
- Average rating is automatically calculated
- Rating history is maintained

### Image Upload
- Supports both file upload and URL-based images
- Image files are stored with unique names
- Old images are cleaned up on update

### Geographic Data
- Location supports country, state, region, city
- Optional coordinates for precise location
- Useful for location-based recipe discovery

### Multilingual Support
- All text fields support English and Tamil
- English is required for most fields
- Tamil is optional for better localization

### Recipe Sources
- **manual**: User-created recipes
- **youtube**: Recipes from YouTube videos
- **blog**: Recipes from food blogs
- **ai**: AI-generated recipes

---

## 🧪 Sample Data for Testing

### Basic Recipe Creation
```json
{
  "dishName": {
    "en": "Simple Salad",
    "ta": "எளிய சலாட்"
  },
  "location": {
    "country": "India"
  },
  "description": {
    "en": "Fresh and healthy mixed vegetable salad",
    "ta": "புதிய மற்றும் ஆரோக்கியமான கலந்த காய்கறி சலாட்"
  },
  "ingredients": [
    {
      "ingredient": "64f8a1b2c3d4e5f6a7b8c9d1",
      "quantity": "2",
      "unit": "cups"
    }
  ],
  "steps": [
    {
      "step": 1,
      "description": {
        "en": "Wash and chop vegetables",
        "ta": "காய்கறிகளை கழுவி நறுக்கவும்"
      }
    }
  ],
  "cookingTime": 15,
  "servings": 2,
  "difficulty": "easy",
  "tags": ["salad", "healthy", "quick", "vegetarian"]
}
```

---

## 📊 Advanced Filtering Examples

### Complex Search
```bash
# Get easy Italian recipes with tomatoes
GET /api/recipes?difficulty=easy&country=Italy&search=tomato

# Get vegetarian recipes by category
GET /api/recipes?category=VEGETARIAN_CATEGORY_ID&limit=20

# Get recipes from specific region
GET /api/recipes?region=Tuscany&cookingTime_max=30
```

### Pagination
```bash
# Get first page
GET /api/recipes?page=1&limit=10

# Get subsequent pages
GET /api/recipes?page=2&limit=10
```

---

## 🎯 Mobile App Best Practices

### Performance
- Use pagination for large recipe lists
- Cache recipe data for offline viewing
- Lazy load images for better performance
- Implement search debouncing

### User Experience
- Show loading states during API calls
- Display recipe difficulty with visual indicators
- Use ingredient images for better recognition
- Implement pull-to-refresh for recipe lists

### Error Handling
- Handle network errors gracefully
- Show user-friendly error messages
- Implement retry mechanisms
- Cache data for offline access

This comprehensive recipe API documentation provides everything needed for building a full-featured recipe mobile app!
