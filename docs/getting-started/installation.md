# 🚀 Getting Started with Event RSVP Manager

This guide will help you set up the Event RSVP Manager on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [MySQL](https://www.mysql.com/) or [PostgreSQL](https://www.postgresql.org/)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/event-rsvp.git
cd event-rsvp
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the `.env.local` file with your configuration:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/event_rsvp"
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # JWT
   JWT_SECRET=your-jwt-secret
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   ```

### 4. Set Up the Database

1. Create a new database in your MySQL/PostgreSQL server:
   ```sql
   CREATE DATABASE event_rsvp;
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## First Steps

1. **Create an Account**
   - Click on "Sign Up" and fill in your details
   - Verify your email address (if email verification is enabled)

2. **Create Your First Event**
   - Navigate to the "Events" page
   - Click on "Create Event"
   - Fill in the event details and save

3. **Invite Guests**
   - Go to your event
   - Click on "Invite Guests"
   - Copy the invitation link or import guests from a CSV file

## Troubleshooting

### Database Connection Issues
- Ensure your database server is running
- Verify the database credentials in `.env.local`
- Check if the database user has the correct permissions

### Authentication Problems
- Clear your browser cookies and local storage
- Ensure the `NEXTAUTH_SECRET` is set and consistent
- Check the browser's console for any error messages

### Development Server Won't Start
- Make sure no other application is using port 3000
- Check for any error messages in the terminal
- Try deleting `node_modules` and `package-lock.json` then run `npm install` again

## Next Steps

- [User Guide](../guides/README.md)
- [API Reference](../api/README.md)
- [Deployment Guide](../deployment/README.md)
