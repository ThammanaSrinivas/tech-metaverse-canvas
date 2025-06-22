# Tech Metaverse Canvas Portfolio

A modern, interactive portfolio for a digital architect and developer. Features a 3D hero, animated CLI workflow, categorized technical skills, and robust testing.

## Features
- **Floating Developer Workflow CLI**: Animated, draggable CLI showing a 6-step dev workflow (write code, run tests, fix, deploy, etc.).
- **3D Hero Section**: Eye-catching intro with rainbow-gradient title.
- **About & Technical Skills**: About and collapsible, categorized skills with icons.
- **Contact**: Modern icons, up-to-date links.
- **Robust Testing**: Unit, functional, and performance tests with 90%+ coverage.

## Developer Workflow CLI
- Drag and drop anywhere on the page (desktop/mobile).
- Steps: Write Code → Run Tests → See Failure → Fix → All Pass → Deploy/Coverage.
- Fully accessible and responsive.

## Testing

### Unit Tests (UT)
- Test individual functions, hooks, and React components in isolation.
- Example: utils, About, Contact, ThemeToggle, FloatingCLI, ThemeContext.

### Functional Tests (FT)
- Simulate user flows and UI interactions.
- Example: Completing the CLI workflow, navigating steps, theme switching, mobile responsiveness.

### Performance Tests (PT)
- Measure render time, memory usage, and responsiveness of key components (e.g., FloatingCLI).

### How to Run
- **All tests:** `npm run test:all`
- **Unit tests:** `npm run test:unit`
- **Functional tests:** `npm run test:functional`
- **Performance tests:** `npm run test:performance`
- **Coverage:** `npm run test:coverage`

### Build Enforcement
- The build script (`npm run build`) will run all tests (UT, FT, PT) before building. If any test fails, the build fails.

## Getting Started

```sh
npm install
npm run dev
```

## Technologies
- Vite, React, TypeScript, shadcn-ui, Tailwind CSS


## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.