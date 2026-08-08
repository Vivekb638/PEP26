# StudyStack Backend

Structured Express + MongoDB backend with:

- Course CRUD APIs
- User CRUD APIs
- Register/Login authentication with JWT

## Deployed on render - 
- https://studystack-4nix.onrender.com

## Project Structure

```
StudyStack/
├── config/
│   └── db.js
├── controllers/
│   ├── courseController.js
│   └── authController.js
├── middleware/
│   ├── auth.js
│   ├── logger.js
│   └── errorHandler.js
├── models/
│   ├── Course.js
│   └── User.js
├── routes/
│   ├── courseRoutes.js
│   └── authRoutes.js
├── .env
├── app.js
├── server.js
└── package.json
```

## Run

1. Install dependencies:
   `npm install`
2. Update [`.env`](./.env) values.
3. Start server:
   `npm run dev`

## API Endpoints

- `GET /`
- `POST /register`
- `POST /login`
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/courses`
- `GET /api/courses`
- `GET /api/courses/:id`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
