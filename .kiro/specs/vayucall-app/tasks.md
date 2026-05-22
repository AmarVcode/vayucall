# Implementation Plan: Vayucall App

## Overview

Implement a mobile-first React SPA for real-time video calling. The app uses Firebase Authentication for identity management and the Agora NG SDK (`agora-rtc-sdk-ng`) for video/audio. The implementation is broken into incremental phases: project scaffolding, auth layer, routing, dashboard, video call room, call controls, and final integration. Each phase builds directly on the previous one so no code is left orphaned.

---

## Tasks

- [x] 1. Scaffold project and configure tooling
  - [x] 1.1 Initialise Vite + React + TypeScript project and install dependencies
    - Run `npm create vite@latest vayucall-app -- --template react-ts`
    - Install runtime deps: `firebase`, `agora-rtc-sdk-ng`, `react-router-dom`
    - Install dev deps: `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `jsdom`
    - _Requirements: 10.1_

  - [x] 1.2 Configure Tailwind CSS with deep-blue / cyan-neon palette
    - Run `npx tailwindcss init -p`
    - Extend `tailwind.config.ts` with custom colours: `deepBlue`, `cyan`, `neonBlue`
    - Add Tailwind directives to `src/index.css`
    - _Requirements: 10.1, 10.4_

  - [x] 1.3 Configure Vitest and React Testing Library
    - Add `vitest.config.ts` with `jsdom` environment and `setupFiles` pointing to `src/test/setup.ts`
    - Create `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`
    - _Requirements: (testing infrastructure)_

  - [x] 1.4 Create environment variable types and `.env.example`
    - Add `src/env.d.ts` declaring `VITE_FIREBASE_*` and `VITE_AGORA_APP_ID` variables
    - Create `.env.example` with placeholder values
    - _Requirements: 6.1, 6.4_

- [ ] 2. Implement Firebase configuration and AuthContext
  - [x] 2.1 Create Firebase initialisation module
    - Create `src/lib/firebase.ts` that calls `initializeApp` with env-var config and exports `auth`
    - _Requirements: 1.2, 2.3_

  - [-] 2.2 Implement AuthContext with onAuthStateChanged and 10-second timeout
    - Create `src/contexts/AuthContext.tsx` implementing the `AuthContextValue` interface from the design
    - Wrap `onAuthStateChanged` in `useEffect`; start a 10-second `setTimeout` that sets `loading=false` and `currentUser=null` if Firebase has not responded
    - Export `useAuth` convenience hook
    - _Requirements: 4.4, 4.5, 4.6_

  - [ ] 2.3 Write unit tests for AuthContext
    - Mock `onAuthStateChanged` to test: loading state resolves to authenticated user, loading state resolves to null (unauthenticated), 10-second timeout fires and defaults to unauthenticated
    - _Requirements: 4.5, 4.6_

- [ ] 3. Implement client-side validation utilities
  - [x] 3.1 Create validation helper functions
    - Create `src/utils/validation.ts` exporting: `isValidEmail(email: string): boolean`, `isValidPassword(password: string): boolean`, `isValidChannelName(name: string): boolean`
    - Email rule: exactly one `@`, non-empty domain, max 254 chars
    - Password rule: 6–128 chars (registration); 8–128 chars (reset)
    - Channel name rule: 1–50 chars, not whitespace-only
    - _Requirements: 1.2, 1.4, 1.5, 2.2, 5.4, 5.5_

  - [-] 3.2 Write property test for email validation (Property 1 & 2)
    - **Property 1: Valid login inputs always attempt authentication**
    - **Property 2: Invalid login inputs are always rejected client-side**
    - **Validates: Requirements 2.2, 2.3**
    - Use `fast-check` to generate valid emails (containing `@` with non-empty domain, ≤254 chars) and verify `isValidEmail` returns `true`; generate invalid emails and verify `false`

  - [-] 3.3 Write property test for registration validation (Property 3)
    - **Property 3: Registration rejects invalid inputs client-side**
    - **Validates: Requirements 1.2, 1.4, 1.5**
    - Use `fast-check` to generate arbitrary email + password pairs; verify `isValidEmail && isValidPassword` iff both pass their rules

  - [ ] 3.4 Write property test for channel name validation (Property 4)
    - **Property 4: Channel name validation is consistent**
    - **Validates: Requirements 5.4, 5.5**
    - Use `fast-check` to generate whitespace-only strings and verify `isValidChannelName` returns `false`; generate non-empty non-whitespace strings ≤50 chars and verify `true`

- [ ] 4. Implement authentication screen and forms
  - [ ] 4.1 Create AuthScreen component with view-state management
    - Create `src/screens/AuthScreen.tsx` managing `view: 'login' | 'register' | 'forgotPassword'` state
    - Switching views clears all form fields (pass a `key` prop or call reset callbacks)
    - Display the Vayucall logo in the header
    - _Requirements: 2.7, 10.2_

  - [ ] 4.2 Implement LoginForm component
    - Create `src/components/auth/LoginForm.tsx`
    - Fields: email (max 254), password (max 128)
    - On submit: run `isValidEmail` + `isValidPassword`; if invalid show inline error and do NOT call `AuthContext.login`; if valid call `login` and handle Firebase error codes per the error-mapping table in the design
    - Show loading spinner and disable submit button while request is in progress
    - Include "Forgot Password" link that switches view to `forgotPassword`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 4.3 Implement RegisterForm component
    - Create `src/components/auth/RegisterForm.tsx`
    - Fields: email (max 254), password (6–128)
    - On submit: run validation; if invalid show inline error and do NOT call `AuthContext.register`; if valid call `register` and handle Firebase error codes
    - Show loading spinner and disable submit button while request is in progress
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 4.4 Implement ForgotPasswordForm component
    - Create `src/components/auth/ForgotPasswordForm.tsx`
    - Field: email
    - On submit: call `AuthContext.sendPasswordReset`; on success show confirmation message with link back to login; on error show inline error
    - Show loading spinner and disable submit button while request is in progress
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 4.5 Write property test for form switching (Property 5)
    - **Property 5: Form switching always clears all fields**
    - **Validates: Requirements 2.7**
    - Use `fast-check` to generate arbitrary field values and error states; render `AuthScreen`; switch view; assert all inputs are empty strings and error messages are cleared

  - [ ] 4.6 Write unit tests for LoginForm validation behaviour
    - Test: valid email + valid password → `AuthContext.login` called
    - Test: invalid email → validation error shown, `login` NOT called
    - Test: password < 6 chars → validation error shown, `login` NOT called
    - Test: loading state disables submit button
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ] 4.7 Write unit tests for RegisterForm validation behaviour
    - Test: valid inputs → `AuthContext.register` called
    - Test: invalid email → error shown, `register` NOT called
    - Test: password < 6 chars → error shown, `register` NOT called
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 5. Implement routing and ProtectedRoute
  - [ ] 5.1 Set up React Router v6 with route map
    - Update `src/App.tsx` to wrap the app in `AuthContext.Provider` and `BrowserRouter`
    - Define routes: `/` (redirect), `/auth` → `AuthScreen`, `/dashboard` → `Dashboard` (protected), `/call/:channelName` → `CallRoom` (protected)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 5.2 Implement ProtectedRoute component
    - Create `src/components/routing/ProtectedRoute.tsx`
    - If `loading` is true: render a full-screen loading spinner
    - If unauthenticated: redirect to `/auth` saving `state.from` for post-login redirect
    - If authenticated and on `/auth`: redirect to `/dashboard`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7_

  - [ ] 5.3 Write property test for protected route redirect (Property 10)
    - **Property 10: Unauthenticated access to any protected route redirects to auth screen**
    - **Validates: Requirements 4.1, 4.2**
    - Use `fast-check` to generate arbitrary protected route paths (e.g., `/dashboard`, `/call/<random-channel-name>`); render app in unauthenticated state; verify redirect to `/auth` for all paths

  - [ ] 5.4 Write unit tests for ProtectedRoute
    - Test: unauthenticated user on `/dashboard` → redirected to `/auth`
    - Test: authenticated user on `/auth` → redirected to `/dashboard`
    - Test: loading state renders spinner, not redirect
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 6. Checkpoint — Auth and routing complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Dashboard screen
  - [ ] 7.1 Create Dashboard component
    - Create `src/screens/Dashboard.tsx`
    - Display greeting with `currentUser.email` from `useAuth()`
    - Display Vayucall logo in header
    - Channel name input: max 50 chars; on submit validate with `isValidChannelName`; if invalid show inline error; if valid navigate to `/call/:channelName`
    - Logout button: call `AuthContext.logout()` then navigate to `/auth`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ] 7.2 Write property test for Dashboard greeting (Property 11)
    - **Property 11: Dashboard greeting always contains the user's email**
    - **Validates: Requirements 5.1**
    - Use `fast-check` to generate arbitrary valid email strings as `currentUser.email`; render Dashboard; verify greeting text contains the exact email string

  - [ ] 7.3 Write unit tests for Dashboard
    - Test: "Join Call" with valid channel name navigates to `/call/<name>`
    - Test: "Join Call" with empty string shows validation error
    - Test: "Join Call" with whitespace-only string shows validation error
    - Test: "Logout" button calls `AuthContext.logout`
    - _Requirements: 5.4, 5.5, 5.7, 5.8_

- [ ] 8. Implement AgoraService module
  - [ ] 8.1 Create AgoraService module
    - Create `src/services/AgoraService.ts` implementing the `AgoraService` interface from the design
    - `init(appId)`: calls `AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })`
    - `joinChannel(client, appId, channelName, token, uid)`: calls `client.join(...)`
    - `createLocalTracks()`: calls `AgoraRTC.createMicrophoneAndCameraTracks()`
    - `publishTracks(client, tracks)`: calls `client.publish(tracks)`
    - `leaveChannel(client, tracks)`: unpublishes, closes each track, calls `client.leave()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.7, 9.8_

- [ ] 9. Implement CallRoom screen and sub-components
  - [ ] 9.1 Create CallControls component
    - Create `src/components/call/CallControls.tsx`
    - Props: `isMuted`, `isCameraOff`, `onToggleMute`, `onToggleCamera`, `onLeave`
    - Render mute/unmute button, camera on/off button, leave button
    - All buttons must meet 44×44 px minimum tap target
    - Apply visually distinct styles for muted / camera-off states
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.6_

  - [ ] 9.2 Create RemoteVideoTile component
    - Create `src/components/call/RemoteVideoTile.tsx`
    - Props: `remoteUser: RemoteUser`
    - Call `videoTrack.play(containerRef.current)` in `useEffect` when track is available
    - Show "Camera Off" placeholder when `videoTrack` is null
    - _Requirements: 8.2, 8.6_

  - [ ] 9.3 Create RemoteVideoGrid component
    - Create `src/components/call/RemoteVideoGrid.tsx`
    - Props: `remoteUsers: RemoteUser[]`
    - Render CSS grid: 1 col < 768 px, 2 cols 768–1023 px, 3+ cols ≥ 1024 px
    - Show "Waiting for others…" message when `remoteUsers` is empty
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [ ] 9.4 Create LocalVideoOverlay component
    - Create `src/components/call/LocalVideoOverlay.tsx`
    - Props: `localVideoTrack: ICameraVideoTrack | null`, `isCameraOff: boolean`
    - Call `localVideoTrack.play(containerRef.current)` in `useEffect`
    - Show "Camera Off" placeholder when `isCameraOff` is true or track is null
    - Fixed position bottom-right; max 160×120 px mobile, 200×150 px desktop
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 9.5 Implement CallRoom screen with full Agora lifecycle
    - Create `src/screens/CallRoom.tsx`
    - On mount: `AgoraService.init` → `createLocalTracks` → `joinChannel` → `publishTracks`; set `isJoining=true` during join; handle all error scenarios (permission denied, init failure, join timeout, publish failure) with inline error message and "Return to Dashboard" button
    - Subscribe to `user-published` event: add remote user to `remoteUsers` state and play audio track
    - Subscribe to `user-unpublished` event: remove remote user from `remoteUsers` state
    - Mute toggle: call `localAudioTrack.setEnabled(!isMuted)`; on error revert state and show error
    - Camera toggle: call `localVideoTrack.setEnabled(!isCameraOff)`; on error revert state and show error
    - Leave button: call `AgoraService.leaveChannel` then navigate to `/dashboard`
    - `beforeunload` handler: call `AgoraService.leaveChannel`
    - On unmount: call `AgoraService.leaveChannel`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 9.1, 9.7, 9.8, 9.9_

  - [ ] 9.6 Write property test for remote user grid consistency (Property 6)
    - **Property 6: Remote user grid membership is consistent with channel events**
    - **Validates: Requirements 8.1, 8.3**
    - Use `fast-check` to generate arbitrary sequences of `user-published` / `user-unpublished` events with random UIDs; simulate events against `remoteUsers` state reducer; verify rendered UID set equals expected set after each event

  - [ ] 9.7 Write property test for audio mute toggle round-trip (Property 7)
    - **Property 7: Audio mute toggle is a round-trip**
    - **Validates: Requirements 9.3, 9.4**
    - Use `fast-check` to generate arbitrary initial mute states (boolean); mock Agora audio track; verify toggle changes state to opposite and track `setEnabled` called with correct value; verify double-toggle restores original state

  - [ ] 9.8 Write property test for camera toggle round-trip (Property 8)
    - **Property 8: Camera toggle is a round-trip**
    - **Validates: Requirements 9.5, 9.6**
    - Use `fast-check` to generate arbitrary initial camera states (boolean); mock Agora video track; verify toggle changes state to opposite and track `setEnabled` called with correct value; verify double-toggle restores original state

  - [ ] 9.9 Write property test for failed track toggle state revert (Property 9)
    - **Property 9: Failed track toggle reverts to previous state**
    - **Validates: Requirements 9.9**
    - Use `fast-check` to generate arbitrary initial mute/camera states; mock Agora track `setEnabled` to throw; verify UI state is unchanged after the failed toggle attempt

  - [ ] 9.10 Write unit tests for CallControls
    - Test: mute button click calls `onToggleMute`
    - Test: camera button click calls `onToggleCamera`
    - Test: leave button click calls `onLeave`
    - Test: `isMuted=true` renders visually distinct muted style
    - Test: `isCameraOff=true` renders visually distinct camera-off style
    - _Requirements: 9.1, 9.3, 9.5_

  - [ ] 9.11 Write unit tests for RemoteVideoGrid
    - Test: empty `remoteUsers` renders "Waiting for others…" message
    - Test: non-empty `remoteUsers` renders correct number of `RemoteVideoTile` components
    - _Requirements: 8.4, 8.5_

- [ ] 10. Checkpoint — Core feature complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Apply global UI styling and responsiveness
  - [ ] 11.1 Apply deep-blue / cyan palette and card-based layouts globally
    - Update `src/index.css` and component-level Tailwind classes to use the custom palette
    - Wrap forms and content sections in card containers with consistent padding and border-radius
    - Apply CSS transitions (150–300 ms) to all interactive elements (buttons, inputs)
    - _Requirements: 10.1, 10.4, 10.5_

  - [ ] 11.2 Ensure all interactive controls meet 44×44 px minimum tap target
    - Audit all buttons and inputs; add `min-h-[44px] min-w-[44px]` Tailwind classes where needed
    - _Requirements: 10.6_

  - [ ] 11.3 Verify and enforce mobile-first responsive layout breakpoints
    - Confirm single-column layout < 768 px, two-column 768–1023 px, multi-column ≥ 1024 px across all screens
    - Confirm local video overlay stays within bounds (160×120 px mobile, 200×150 px desktop) and does not clip
    - _Requirements: 10.3, 7.4, 7.5, 8.4_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical phase boundaries
- Property tests use `fast-check` and validate universal correctness properties defined in the design document
- Unit tests use Vitest + React Testing Library and validate specific examples and edge cases
- The Agora token is passed as `null` in testing mode (Requirement 6.4)
- Firebase error codes must be mapped to user-friendly messages per the error table in the design document

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["2.3", "4.1", "8.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 5, "tasks": ["4.5", "4.6", "4.7", "5.2"] },
    { "id": 6, "tasks": ["5.3", "5.4", "7.1", "9.1", "9.2", "9.3", "9.4"] },
    { "id": 7, "tasks": ["7.2", "7.3", "9.5"] },
    { "id": 8, "tasks": ["9.6", "9.7", "9.8", "9.9", "9.10", "9.11", "11.1"] },
    { "id": 9, "tasks": ["11.2", "11.3"] }
  ]
}
```
