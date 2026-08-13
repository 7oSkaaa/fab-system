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

3. **Configure free background push notifications**:
   - In Firebase Console, open **Project settings → Cloud Messaging → Web Push certificates** and generate a key pair.
   - Add the public key as `VITE_FIREBASE_VAPID_KEY` in the Vercel project environment and local `.env`.
   - Create a Firebase service-account key and add its complete JSON as the server-only Vercel variable `FIREBASE_SERVICE_ACCOUNT_JSON`.
   - Add the admin email as the server-only Vercel variable `SUPER_ADMIN_EMAIL`.
   - The notification sender runs in the included Vercel Functions free tier; Firebase Cloud Functions are not required.

4.  **Usage**:
    - Navigate to `/admin` first to set up Sites, Teams, and Problems.
    - Open `/ops` on Judge computers.
    - Open `/volunteer` on Runner mobile devices.
    - Display `/public` on the main hall screen.
    - On iPhone/iPad, use **Share → Add to Home Screen**, open FAB from its Home Screen icon, and tap **Enable background alerts**. iOS only permits Web Push for installed Home Screen web apps.

## Technologies
- React + Vite
- Vanilla CSS (Variables + Flexbox/Grid)
- Firebase Firestore, Cloud Functions, and Cloud Messaging
- React Icons

## Design
The system includes responsive ICPC-inspired light and dark themes in `src/styles/variables.css`.
