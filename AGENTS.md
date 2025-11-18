# Cuidamet Agent Rules

This document outlines the rules and conventions to follow when developing the Cuidamet application.

## 1. Code Style and Formatting

*   **Follow existing conventions**: Before writing any code, analyze the existing codebase to understand and adopt its style.
*   **TypeScript**: Use TypeScript for all new code.
*   **ESLint and Prettier**: Use ESLint and Prettier to maintain a consistent code style. Run `npm run lint` and `npm run format` before committing your changes.
*   **Naming conventions**:
    *   Components: Use PascalCase (e.g., `MyComponent`).
    *   Variables and functions: Use camelCase (e.g., `myVariable`, `myFunction`).
    *   Types and interfaces: Use PascalCase (e.g., `MyType`, `MyInterface`).
*   **File structure**:
    *   Create a new file for each component.
    *   Group related components in a subdirectory.
    *   Keep icons in the `components/icons` directory.

## 2. Component Development

*   **Functional components**: Use functional components with hooks instead of class-based components.
*   **Props**: Use interfaces to define the props of each component.
*   **State management**: For simple component state, use the `useState` hook. For more complex global state, consider using a state management library like Redux or Zustand, but only after verifying its established usage within the project.
*   **Styling**: Use Tailwind CSS for styling. Avoid using inline styles or CSS files.

## 3. Data Management

*   **Types**: Define all data structures in the `types.ts` file.
*   **Mock data**: Use the `services/mockData.ts` and `services/mockChatData.ts` files to provide data during development.
*   **API integration**: When integrating with a real API, create a new service in the `services` directory to handle the API calls.

## 4. Version Control

*   **Git**: Use Git for version control.
*   **Commit messages**: Write clear and descriptive commit messages.
*   **Branches**: Create a new branch for each new feature or bug fix.

## 5. Testing

*   **Unit tests**: Write unit tests for all new components and functions.
*   **Testing library**: Use a testing library like Jest and React Testing Library.

By following these rules, we can ensure that the Cuidamet application is developed in a consistent, maintainable, and scalable way.
