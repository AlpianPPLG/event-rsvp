# 🛠️ Development Guide

Welcome to the Event RSVP Manager development guide. This document will help you set up your development environment, understand the project structure, and follow our coding standards.

## Table of Contents
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Code Review Process](#code-review-process)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
event-rsvp/
├── .github/                 # GitHub workflows and templates
├── public/                  # Static files
│   ├── images/              # Image assets
│   └── favicon.ico          # Favicon
├── src/
│   ├── app/                 # Next.js pages and API routes
│   │   ├── api/             # API routes
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable components
│   │   ├── ui/              # Shadcn/ui components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts          # Authentication utilities
│   │   └── db.ts            # Database utilities
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── prisma/                  # Prisma schema and migrations
├── tests/                   # Test files
├── .env.example             # Example environment variables
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── next.config.js           # Next.js configuration
└── package.json             # Project dependencies and scripts
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm or Yarn
- Git
- Docker (optional, for local database)

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-rsvp.git
   cd event-rsvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Update the environment variables in .env.local
   ```

4. **Set up the database**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d
   
   # Or install MySQL/PostgreSQL locally
   # Then create a new database
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Avoid using `any` type
- Use interfaces for object types
- Use type guards for type narrowing

### Styling
- Use Tailwind CSS for styling
- Follow the BEM naming convention for custom CSS
- Mobile-first responsive design

### Component Structure
- One component per file
- Use functional components with TypeScript interfaces
- Follow the folder structure:
  ```
  components/
  ├── ComponentName/
  │   ├── index.tsx         # Main component
  │   ├── ComponentName.tsx # Sub-components
  │   ├── types.ts          # Type definitions
  │   └── index.test.tsx    # Tests
  ```

### Naming Conventions
- Components: `PascalCase` (e.g., `UserProfile`)
- Files: `kebab-case` (e.g., `user-profile.tsx`)
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `I` prefix (e.g., `IUser`)
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isLoading`)

### Code Formatting
- Use Prettier for code formatting
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Always use semicolons
- Use single quotes for strings

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

### Commit Message Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

**Example:**
```
feat(auth): add Google OAuth login

- Added Google OAuth provider
- Updated login page with Google button
- Added error handling for OAuth failures

Closes #123
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test path/to/test.tsx
```

### Test Structure
- Unit tests: `*.test.ts` or `*.spec.ts`
- Test files should be co-located with the code they test
- Use `@testing-library/react` for component testing
- Mock external dependencies

### Testing Guidelines
- Test public interfaces, not implementation details
- Write tests that resemble how users interact with your code
- Keep tests focused and independent
- Use descriptive test names

## Code Review Process

1. Create a pull request from your feature branch to `main`
2. Ensure all tests pass
3. Update documentation if needed
4. Request review from at least one team member
5. Address all review comments
6. Squash and merge when approved

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify database credentials in `.env.local`
- Ensure the database server is running
- Check for pending migrations

#### Dependency Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install`

#### TypeScript Errors
- Check for missing type definitions
- Ensure all required props are provided
- Run type checking: `npx tsc --noEmit`

## Performance Guidelines

- Use `React.memo` for expensive components
- Implement code splitting with `dynamic` imports
- Optimize images and assets
- Use `useCallback` and `useMemo` appropriately
- Monitor bundle size

## Security Best Practices

- Never commit sensitive data
- Use environment variables for configuration
- Validate and sanitize all user input
- Implement proper authentication and authorization
- Keep dependencies updated

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)

## Getting Help

- Check the [GitHub Issues](https://github.com/yourusername/event-rsvp/issues)
- Join our [Discord community](#)
- Email: dev-support@yourdomain.com
