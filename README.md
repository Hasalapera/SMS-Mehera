# SMS-Mehera

**SMS-Mehera** is a comprehensive Sales Management System specifically designed for Mehera International (Pvt) Ltd. It provides the capability to efficiently manage all business processes such as users, customers, products, inventory, orders, sales targets, reports, notifications, and deliveries.

---

## Project Overview

This system is built on React.js (Frontend) and Node.js/Express.js (Backend) technologies, using PostgreSQL as the database. It simplifies tasks related to various business sectors by providing different functionalities and dashboards based on user roles.

### Main User Roles

*   **Admin**: Full control of the system.
*   **Manager**: Management-level supervision and reporting.
*   **Sales Representative**: Customer and order management.
*   **Online Store Keeper**: Online order management.
*   **Logistics Officer**: Deliveries and related processes.

---

## Main Features

*   **User Authentication**: Secure login system based on JWT (Access & Refresh Tokens).
*   **Role-Based Access Control (RBAC)**: Restricting access to features and data based on each user role.
*   **User Management**: Creating users, updating information, and activating/deactivating accounts.
*   **Product & Inventory Management**: Management of products, their variants, brands, and categories. Notification of stock levels and critical stock.
*   **Customer Management (CRM)**: Management of customer information and their related notes.
*   **Order Management**: Order creation, viewing history, creating quotations, and handling online orders.
*   **Offline Order Synchronization**: Enables sales representatives to create and save orders even in low-connectivity or offline environments. Orders are stored locally using Dexie.js and automatically synced with the server once a stable internet connection is restored.
*   **Advanced Order Tracking & Confirmation**: Real-time order status updates (approved, shipped, delivered). Automated dispatch notifications via Email and WhatsApp, including a secure delivery confirmation system using a unique link and a One-Time Password (OTP).
*   **Cloud Media Management**: Uploading and optimization of images for products, profiles, and system logos via Cloudinary.
*   **Reporting & Analytics**: Dynamic reports on sales, product summaries, and sales representative performance.
*   **QuickBooks CSV Export**: Generates sales reports in a CSV format compatible with QuickBooks, simplifying accounting and financial reconciliation processes.
*   **Notification System**: Notifying users about important system events.
*   **AI Assistant**: AI assistant based on Google Gemini API for product and beauty information.
*   **System & Profile Customization**: Ability for users to update their profiles and for administrators to change system logos and themes.
*   **Automated Emails**: Automatically sending welcome and password information emails to new users.

---

## Technologies Used

### Frontend

*   **Framework**: React.js (v19)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (v4)
*   **Routing**: React Router DOM
*   **State Management**: React Context API
*   **HTTP Client**: Axios
*   **UI/UX**: Framer Motion, Lucide React
*   **Notifications**: React Hot Toast, SweetAlert2
*   **Document Generation**: jsPDF, html2canvas, React to Print
*   **Offline Storage**: Dexie.js

### Backend

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **ORM**: Sequelize
*   **Authentication**: JSON Web Tokens (JWT)
*   **Password Hashing**: bcrypt
*   **File Uploads**: Multer, Cloudinary
*   **Email**: Nodemailer
*   **AI Integration**: Google Gemini API
*   **Testing**: Jest, Supertest

### Database

* PostgreSQL

### Deployment

*   **Frontend & Backend**: Render
*   **Database**: Render PostgreSQL
*   **Image & Asset Storage**: Cloudinary

---

## Project Structure

```
SMS-Mehera/
├── backend/
│   ├── config/         # Database, Cloudinary configurations
│   ├── controllers/    # Business logic for each route
│   ├── middlewares/    # JWT verification, role checks
│   ├── migrations/     # Sequelize database migrations
│   ├── models/         # Sequelize data models
│   ├── routes/         # API endpoint definitions
│   ├── scripts/        # Migration helper scripts
│   ├── utils/          # Email senders, crypto utilities
│   ├── nodemon.json
│   ├── package.json
│   └── server.js       # Main server entry point
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance configuration
    │   ├── assets/       # Static images, logos
    │   ├── components/   # Reusable React components
    │   ├── pages/        # Main application pages and context
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `frontend` folder and add the backend API URL:
    ```env
    VITE_API_URL=http://localhost:5001
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `backend` folder and add the following environment variables:
    ```env
    # Server Configuration
    NODE_ENV=development
    PORT=5001
    
    # Database Connection
    DATABASE_URL=your_postgresql_database_url
    
    # JWT Secrets
    JWT_SECRET=your_strong_jwt_secret
    JWT_REFRESH_SECRET=your_strong_jwt_refresh_secret
    
    # Email (Nodemailer with Gmail)
    EMAIL_USER=your_gmail_address
    EMAIL_PASS=your_gmail_app_password
    
    # Cloudinary API Credentials
    CLOUD_NAME=your_cloudinary_cloud_name
    API_KEY=your_cloudinary_api_key
    API_SECRET=your_cloudinary_api_secret

    # Google Gemini API Key
    GEMINI_API_KEY=your_gemini_api_key

    # Crypto Key for sensitive data
    CRYPTO_SECRET_KEY=a_secure_32_character_long_secret_key
    CRYPTO_IV=a_secure_16_character_long_iv_string
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## Database Setup

This project uses PostgreSQL with Sequelize ORM.

1.  Ensure your `DATABASE_URL` in the backend `.env` file is correctly configured.
2.  Navigate to the `backend` directory.
3.  Run the database migrations to create all necessary tables:
    ```bash
    npm run migrate:run
    ```
4.  To rollback the latest migration:
    ```bash
    npm run migrate:rollback
    ```

---

## Available Backend Scripts

*   `npm run dev`: Starts the backend server in development mode with Nodemon for auto-reloading.
*   `npm start`: Starts the backend server for production.
*   `npm run migrate:run`: Executes all pending Sequelize migrations.
*   `npm run migrate:rollback`: Reverts the most recent migration.
*   `npm test`: Runs the backend test suite using Jest.

---

## API Modules

The backend contains API modules for:

*   `/api/users`
*   `/api/support`
*   `/api/brands`
*   `/api/category`
*   `/api/products`
*   `/api/stock`
*   `/api/customers`
*   `/api/orders`
*   `/api/ask-ai`
*   `/api/contact`
*   `/api/settings`
*   `/api/notifications`
*   `/api/report`
*   `/api/salesTarget`
*   `/api/workshops`

---

## Local Development URLs

*   **Frontend**: `http://localhost:5173`
*   **Backend**: `http://localhost:5001`

---

## Production URLs

*   **Website**: `https://www.mehera.lk`
*   **Frontend Deployment**: `https://sms-mehera-frontend.onrender.com`

---

## Security Notes

*   **Environment Variables**: Never commit `.env` files to version control. Use the provided `.env.example` as a template.
*   **Secrets**: All secrets (Database URL, JWT keys, API keys) must be kept private and should be configured as environment variables in the deployment environment.
*   **Data Encryption**: Sensitive user data like contact numbers are encrypted in the database.

---

## Future Improvements

*   Implement complete API documentation using tools like Swagger.
*   Expand the test suite to cover more edge cases and increase code coverage.
*   Add a comprehensive Database ER Diagram to the documentation.
*   Develop a CI/CD pipeline for automated testing and deployment.
*   Containerize the application using Docker for easier deployment and scalability.

---

## Author

Developed by **Team Mapogo**.

---

## License

This project is developed for internal business purposes. Unauthorized copying, distribution, or commercial use is not allowed without permission.
