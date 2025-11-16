# Feature-Based Architecture with Material UI and Tailwind CSS

## 🏗️ Project Structure

```
src/
├── core/                    # Core configuration and setup
│   ├── theme/              # MUI theme configuration
│   │   └── theme.ts
│   └── api/                # API client configuration
│       └── axiosInstance.ts
│
├── features/               # Feature modules
│   └── users/             # User management feature
│       ├── api/           # API calls specific to users
│       │   └── userApi.ts
│       ├── components/    # UI components for users
│       │   ├── UserForm.tsx
│       │   └── UserTable.tsx
│       ├── hooks/         # Custom hooks for users
│       │   └── useUsers.ts
│       ├── pages/         # Page components
│       │   └── UserManagementPage.tsx
│       ├── types/         # TypeScript types
│       │   └── user.types.ts
│       └── index.ts       # Public exports
│
├── shared/                # Shared/common code
│   ├── components/       # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── hooks/           # Shared custom hooks
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Utility functions
│
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
└── index.css            # Global styles (Tailwind)
```

## 🎨 Key Features

### Material UI Integration
- Custom theme configuration in `core/theme/theme.ts`
- ThemeProvider wraps the entire application
- Components use MUI components with custom styling

### Tailwind CSS Integration
- Configured to work alongside Material UI
- `preflight: false` to avoid conflicts with MUI base styles
- Used for utility classes like spacing, backgrounds, etc.

### Feature-Based Architecture
- Each feature (e.g., users) is self-contained
- Features include their own:
  - API calls
  - Components
  - Hooks
  - Types
  - Pages
- Easy to scale by adding new features

### Path Aliases
- `@/` - src root
- `@features/` - features directory
- `@shared/` - shared directory
- `@core/` - core directory

## 🚀 Usage

### Running the application
```bash
npm run dev
```

### Adding a new feature
1. Create a new folder in `src/features/`
2. Add subdirectories: `api/`, `components/`, `hooks/`, `pages/`, `types/`
3. Export public API through `index.ts`
4. Import and use in your application

### Example Component
```tsx
import { Button } from '@mui/material';

export const MyComponent = () => {
  return (
    <div className="p-4 bg-gray-50">
      <Button variant="contained">
        Material UI + Tailwind
      </Button>
    </div>
  );
};
```

## 📦 Dependencies
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Vite** - Build tool

## 🎯 Best Practices
1. Keep features independent and self-contained
2. Use Material UI for complex components
3. Use Tailwind for quick styling and layout
4. Share common code in the `shared/` directory
5. Keep business logic in hooks
6. Use TypeScript for type safety
