# First Accepted Balloon System (FAB)

A cool, "First Accepted" balloon tracking system for CPC competitions.

## Features
- **Admin Configuration**: Manage multiple sites, teams, and problem colors.
- **Operations Interface**: Judges/Staff can log "First Accepted" solutions efficiently. Checks for duplicates.
- **Volunteer Dashboard**: Real-time delivery queue for balloon runners. Mobile-friendly.
- **Public Scoreboard**: Neon-themed live feed of First Accepted teams and their balloons, with animations.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Usage**:
    - Navigate to `/admin` first to set up Sites, Teams, and Problems.
    - Open `/ops` on Judge computers.
    - Open `/volunteer` on Runner mobile devices.
    - Display `/public` on the main hall screen.

## Technologies
- React + Vite
- Vanilla CSS (Variables + Flexbox/Grid)
- Context API + LocalStorage
- React Icons

## Design
The system features a centralized "Neon Dark" theme in `src/styles/variables.css` for a modern competitive programming vibe.
