# MLM P2P Investment Backend

A professional Node.js + Express + MongoDB backend for the MLM P2P Investment system with JWT-based authentication.

## Features

✓ **User Authentication** - Register and login with email/password  
✓ **JWT Authorization** - Secure token-based authentication (30-day expiry)  
✓ **Role-Based Access** - Admin and regular user roles  
✓ **Hashed Passwords** - bcryptjs with 10 salt rounds  
✓ **MongoDB Integration** - Mongoose ODM with schema validation  
✓ **CORS Support** - Cross-origin requests enabled  
✓ **Input Validation** - express-validator for request validation  
✓ **Admin Seeding** - Automatic admin user creation on startup  

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: express-cors
- **Environment**: dotenv

## Folder Structure

```
p2pbackend/
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/
│   └── authController.js     # Authentication business logic
├── middleware/
│   └── auth.js               # JWT verification & role authorization
├── models/
│   └── User.js               # User schema with password hashing
├── routes/
│   └── auth.js               # Authentication API routes
├── server.js                 # Express server setup
├── seed.js                   # Admin user seeding script
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── .gitignore                # Git ignore file
```

## Installation

### 1. Prerequisites

Make sure you have installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download Community Edition](https://www.mongodb.com/try/download/community)

### 2. Clone and Navigate

```bash
cd p2pbackend
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator

### 4. Setup Environment Variables

Create a `.env` file in the `p2pbackend` folder by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and update if needed:

```env
MONGODB_URI=mongodb://localhost:27017/mlm_db
JWT_SECRET=my_super_strong_jwt_secret_change_this
PORT=5000
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### 5. Ensure MongoDB is Running

**On macOS (using Homebrew):**
```bash
brew services start mongodb-community
```

**On Windows:**
- MongoDB Community Server typically runs as a service after installation
- Check Services app to confirm `MongoDB Server` is running

**On Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongo --eval "db.adminCommand('ping')"
```

### 6. Start the Backend Server

**Development mode (recommended):**
```bash
npm run dev
```

This uses `nodemon` to auto-reload on file changes.

**Production mode:**
```bash
npm start
```

**Expected output:**
```
✓ MongoDB Connected: localhost
✓ Admin user seeded successfully
✓ Server running on http://localhost:5000
✓ API endpoints available at http://localhost:5000/api/auth
✓ Admin credentials: admin@gmail.com / admin123
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Admin",
      "email": "admin@gmail.com",
      "role": "admin"
    }
  }
  ```

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin",
      "email": "admin@gmail.com",
      "role": "admin",
      "createdAt": "2026-05-14T10:00:00.000Z",
      "updatedAt": "2026-05-14T10:00:00.000Z"
    }
  }
  ```

### 4. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "MLM P2P Backend is running",
    "timestamp": "2026-05-14T10:00:00.000Z"
  }
  ```

## Default Admin Credentials

Email: `admin@gmail.com`  
Password: `admin123`

These credentials are automatically seeded to the database on first server startup.

## Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mlm_db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `my_super_strong_jwt_secret_change_this` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |

## Authentication

### Using JWT Token

All protected routes require a JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Token Structure

The JWT token contains:
```json
{
  "id": "user_id_here",
  "role": "admin_or_user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

Token expires in **30 days** by default.

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongo --eval "db.adminCommand('ping')"`
- Check `MONGODB_URI` in `.env`
- Try connecting locally: `mongodb://localhost:27017/mlm_db`

### "Port 5000 is already in use"
- Change `PORT` in `.env` to an available port (e.g., 5001)
- Or kill the process: `lsof -ti :5000 | xargs kill -9`

### "Invalid token" error
- Ensure you're sending the token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Check if token has expired (30-day limit)

### Seeds script not running
- Ensure MongoDB is connected before server starts
- Run manually: `npm run seed`

## Development Tips

### Using Nodemon
For automatic server restart on file changes:
```bash
npm run dev
```

### Testing Endpoints

Using `curl`:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'

# Get profile (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

Using **Postman** (recommended):
1. Import the API endpoints
2. Set Authorization header: `Bearer YOUR_TOKEN`
3. Test each endpoint

## Security Notes

⚠️ **Important for Production:**
1. Change `JWT_SECRET` to a strong random string
2. Use HTTPS instead of HTTP
3. Set `NODE_ENV=production`
4. Store sensitive data in environment variables only
5. Implement rate limiting
6. Add request logging
7. Enable MongoDB authentication
8. Regular security audits

## Scripts

```bash
npm start          # Start server in production mode
npm run dev        # Start with nodemon (auto-reload)
npm run seed       # Seed admin user manually
```

## Common Commands

```bash
# Create .env from template
cp .env.example .env

# Start MongoDB (macOS)
brew services start mongodb-community

# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Install dependencies
npm install

# Start backend
npm run dev

# Test API
curl http://localhost:5000/api/auth/login
```

## Next Steps

1. **Frontend Integration** - Use the admin login component in p2pfrontend
2. **Add More Routes** - Implement endpoints for MLM operations
3. **Database Indexing** - Add indexes for better query performance
4. **Error Handling** - Expand global error handler
5. **Logging** - Implement structured logging

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in terminal
3. Verify environment variables
4. Ensure all services are running

---

**Created**: May 14, 2026  
**Version**: 1.0.0  
**Last Updated**: May 14, 2026
# P2P-backend
