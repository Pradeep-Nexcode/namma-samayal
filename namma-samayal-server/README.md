# Namma Samayal Server

A Node.js backend API for the Namma Samayal recipe management application.

## Features

- User authentication (register/login)
- Recipe CRUD operations
- Recipe rating system
- Favorites and saved recipes
- Search and filtering
- JWT-based authentication
- Input validation
- Rate limiting
- Comprehensive error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express-validator for input validation

## Project Structure

```
namma-samayal-server/
├── src/
│   ├── config/        # DB, environment configurations
│   ├── controllers/   # Business logic handlers
│   ├── middleware/    # Custom middleware (auth, etc.)
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API route definitions
│   ├── services/      # External services (future: AI, scraping)
│   ├── utils/         # Helper functions
│   ├── app.js         # Express app configuration
│   └── server.js      # Server entry point
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd namma-samayal-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/namma-samayal
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (make sure it's running on your system)

5. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Recipes

- `GET /api/recipes` - Get all public recipes (with pagination, search, filtering)
- `GET /api/recipes/:id` - Get a specific recipe
- `POST /api/recipes` - Create a new recipe (protected)
- `PUT /api/recipes/:id` - Update a recipe (protected, owner only)
- `DELETE /api/recipes/:id` - Delete a recipe (protected, owner only)
- `POST /api/recipes/:id/rate` - Rate a recipe (protected)

### User Favorites & Saved Recipes

- `POST /api/users/favorites/:recipeId` - Add recipe to favorites (protected)
- `DELETE /api/users/favorites/:recipeId` - Remove from favorites (protected)
- `POST /api/users/saved/:recipeId` - Save a recipe (protected)
- `DELETE /api/users/saved/:recipeId` - Unsave a recipe (protected)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
```

## Validation

All input data is validated using express-validator. Required fields and constraints are enforced at the API level.

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Window: 15 minutes
- Max requests: 100 per IP

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
