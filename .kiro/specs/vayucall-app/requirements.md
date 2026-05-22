# Requirements Document

## Introduction

Vayucall is a fast, free, mobile-first single-page web application for video calling. It enables users to authenticate via email and password, then create or join video call rooms using channel names. The application uses Firebase for authentication and Agora Web SDK for real-time video/audio communication. The UI is built with React.js and Tailwind CSS, featuring a deep blue and cyan/neon blue color palette with a native-app feel on mobile devices.

## Glossary

- **App**: The Vayucall single-page web application
- **Auth_Service**: Firebase Authentication service handling user identity
- **Auth_Context**: React context providing authentication state to all components
- **Video_Service**: Agora Web SDK client managing real-time video/audio streams
- **User**: An authenticated person using the App
- **Guest**: An unauthenticated person attempting to access the App
- **Channel**: A named video call room identified by a Channel_Name
- **Channel_Name**: A user-provided string that uniquely identifies a video call room
- **Local_Stream**: The video/audio feed captured from the current User's device
- **Remote_Stream**: A video/audio feed received from another participant in the same Channel
- **Dashboard**: The main screen shown to authenticated Users after login
- **Call_Room**: The screen displayed during an active video call session
- **Protected_Route**: A route that redirects unauthenticated Guests to the login screen
- **Token**: An Agora authentication token (null in testing mode, bypassing token validation)

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a Guest, I want to create an account with my email and password, so that I can access the video calling features of Vayucall.

#### Acceptance Criteria

1. THE App SHALL display a registration form with email and password input fields on the authentication screen.
2. WHEN a Guest submits a valid email (containing one `@` and a non-empty domain, maximum 254 characters) and a password between 6 and 128 characters, THE Auth_Service SHALL create a new user account and sign the User in automatically.
3. IF the submitted email is already registered, THEN THE App SHALL display an error message indicating the email is already in use.
4. IF the submitted password is fewer than 6 characters, THEN THE App SHALL display an error message indicating the password is too short.
5. IF the submitted email does not contain one `@` and a non-empty domain, THEN THE App SHALL display an error message indicating the email format is invalid.
6. WHILE a registration request is in progress, THE App SHALL display a loading indicator and disable the submit button until the Auth_Service returns a success or error response.
7. IF the Auth_Service is unreachable during registration, THEN THE App SHALL display an error message indicating a network or service error.

---

### Requirement 2: User Login

**User Story:** As a registered User, I want to log in with my email and password, so that I can access my Dashboard and join video calls.

#### Acceptance Criteria

1. THE App SHALL display a login form with email input (maximum 254 characters) and password input (maximum 128 characters) fields on the authentication screen.
2. IF a User submits a login form where the email does not contain one `@` and a non-empty domain, or the password is fewer than 6 characters, THEN THE App SHALL display a validation error and SHALL NOT call the Auth_Service.
3. WHEN a User submits a correctly formatted email and password between 6 and 128 characters, THE Auth_Service SHALL authenticate the User and redirect them to the Dashboard.
4. IF the submitted credentials are incorrect, THEN THE App SHALL display an error message indicating invalid email or password.
5. IF the Auth_Service is unreachable during login, THEN THE App SHALL display an error message indicating a network or service error.
6. WHILE a login request is in progress, THE App SHALL display a loading indicator and disable the submit button until the Auth_Service returns a success or error response.
7. WHEN a User selects the toggle to switch between login and registration forms, THE App SHALL display the other form and SHALL clear all input fields in the form being switched away from.

---

### Requirement 3: Password Reset

**User Story:** As a registered User, I want to reset my password via email, so that I can regain access to my account if I forget my password.

#### Acceptance Criteria

1. THE App SHALL display a "Forgot Password" link on the login form.
2. WHEN a User clicks the "Forgot Password" link, THE App SHALL display a password reset form with an email input field.
3. WHEN a User submits a valid email on the password reset form, THE Auth_Service SHALL send a password reset email containing a single-use password reset link to that address.
4. WHEN the password reset email is sent successfully, THE App SHALL display a confirmation message instructing the User to check their email, and SHALL provide a link to return to the login form.
5. IF the submitted email is not associated with any account, THEN THE App SHALL display an error message indicating no account was found for that email.
6. WHILE a password reset request is in progress, THE App SHALL display a loading indicator and disable the submit button until the Auth_Service returns a success or error response.
7. WHEN a User clicks the password reset link in their email, THE App SHALL display a form for the User to enter a new password between 8 and 128 characters.
8. IF a User submits a password reset link that has expired (older than 60 minutes) or has already been used, THEN THE App SHALL display an error message indicating the link is invalid or expired.
9. WHEN a User successfully submits a new password via the reset form, THE Auth_Service SHALL update the User's password and THE App SHALL redirect the User to the login form.

---

### Requirement 4: Protected Routes

**User Story:** As a system operator, I want unauthenticated users to be redirected to the login screen, so that the Dashboard and Call Room are accessible only to authenticated Users.

#### Acceptance Criteria

1. WHEN a Guest navigates to the Dashboard route, THE App SHALL redirect the Guest to the authentication screen.
2. WHEN a Guest navigates to a Call_Room route, THE App SHALL redirect the Guest to the authentication screen.
3. WHEN an authenticated User navigates to the authentication screen, THE App SHALL redirect the User to the Dashboard.
4. THE Auth_Context SHALL expose the current authentication state to all components in the App.
5. WHILE the Auth_Context is resolving the initial authentication state, THE App SHALL display a loading screen for a maximum of 10 seconds to prevent a flash of unauthenticated content.
6. IF the Auth_Context fails to resolve the authentication state within 10 seconds, THEN THE App SHALL default to the unauthenticated state and redirect the User to the authentication screen.
7. WHEN an authenticated User is redirected to the authentication screen from a protected route, THE App SHALL store the originally requested route and redirect the User to that route upon successful login.

---

### Requirement 5: Dashboard

**User Story:** As an authenticated User, I want a clean home screen where I can enter a channel name and join a video call, so that I can quickly start or join a meeting.

#### Acceptance Criteria

1. THE Dashboard SHALL display a greeting that includes the authenticated User's email address.
2. THE Dashboard SHALL display the Vayucall logo in the header.
3. THE Dashboard SHALL display a text input field for the User to enter a Channel_Name with a maximum length of 50 characters.
4. WHEN a User clicks the "Join Call" button with a non-empty, non-whitespace-only Channel_Name, THE App SHALL navigate the User to the Call_Room for that Channel_Name.
5. IF a User clicks the "Join Call" button with an empty or whitespace-only Channel_Name, THEN THE App SHALL display a validation error message indicating a channel name is required.
6. THE Dashboard SHALL display a "Logout" button.
7. WHEN a User clicks the "Logout" button, THE Auth_Service SHALL sign the User out.
8. WHEN the Auth_Service successfully signs the User out, THE App SHALL redirect the User to the authentication screen.

---

### Requirement 6: Video Call Initialization

**User Story:** As an authenticated User, I want the video call to initialize automatically when I join a room, so that I can start communicating without manual setup steps.

#### Acceptance Criteria

1. WHEN a User enters the Call_Room, THE Video_Service SHALL initialize an Agora client using the configured AGORA_APP_ID.
2. WHEN the Agora client is initialized, THE Video_Service SHALL request microphone and camera permissions from the User's browser.
3. WHEN permissions are granted, THE Video_Service SHALL create and publish the Local_Stream to the Channel identified by the Channel_Name.
4. IF the AGORA_TOKEN is not configured (null), THEN THE App SHALL pass null as the token when joining the Channel to bypass Agora token authentication in testing mode.
5. IF the browser denies microphone or camera permissions, THEN THE App SHALL display an error message indicating that permissions are required for the call.
6. IF the Video_Service fails to join the Channel within 30 seconds, THEN THE App SHALL display an error message and provide a button to return to the Dashboard.
7. IF the Agora client fails to initialize, THEN THE App SHALL display an error message indicating the video service is unavailable and provide a button to return to the Dashboard.
8. IF the Local_Stream fails to publish after joining the Channel, THEN THE App SHALL display an error message indicating the stream could not be started and provide a button to return to the Dashboard.

---

### Requirement 7: Local Video Display

**User Story:** As a User in a call, I want to see my own video feed in a picture-in-picture style overlay, so that I can monitor my own appearance without it dominating the screen.

#### Acceptance Criteria

1. WHEN the Local_Stream is published, THE Call_Room SHALL display the Local_Stream in a floating overlay no larger than 160×120 px on mobile and 200×150 px on desktop, positioned in the bottom-right corner of the screen.
2. WHEN the Local_Stream is published, THE Call_Room SHALL call the Agora video track's play method targeting the local video container element.
3. WHILE the User's camera is turned off, THE Call_Room SHALL display a placeholder with the text "Camera Off" in the local video container instead of the video feed.
4. THE local video overlay SHALL remain fully visible and not clipped on screen widths from 320 px (mobile) through 1920 px (desktop).
5. THE local video overlay SHALL not obscure the primary remote video feed area.

---

### Requirement 8: Remote Video Display

**User Story:** As a User in a call, I want to see the video feeds of all other participants in a responsive grid, so that I can have a clear view of everyone in the meeting.

#### Acceptance Criteria

1. WHEN a Remote_Stream is received from a remote User joining the Channel, THE Call_Room SHALL add a video container for that User to the remote video grid.
2. WHEN a Remote_Stream is received, THE Call_Room SHALL call the Agora video track's play method targeting that User's video container element.
3. WHEN a remote User identified by their unique Agora UID leaves the Channel, THE Call_Room SHALL remove the video container associated with that UID from the remote video grid.
4. THE remote video grid SHALL display one column on screen widths below 768 px, two columns on screen widths from 768 px to 1023 px, and three or more columns on screen widths of 1024 px and above.
5. WHILE no remote Users are present in the Channel, THE Call_Room SHALL display a message indicating the User is waiting for others to join.
6. WHILE a remote User's camera is disabled, THE Call_Room SHALL display a placeholder with the text "Camera Off" in that User's video container instead of the video feed.

---

### Requirement 9: Call Controls

**User Story:** As a User in a call, I want controls to mute my audio, turn off my camera, and leave the call, so that I can manage my participation in the meeting.

#### Acceptance Criteria

1. WHILE a User is in the Call_Room, THE Call_Room SHALL display a controls bar containing a mute/unmute audio button, a camera on/off button, and a "Leave Call" button.
2. WHEN a User enters the Call_Room, THE App SHALL initialize the audio button in the unmuted state and the camera button in the enabled state.
3. WHEN a User clicks the mute button, THE Video_Service SHALL mute the local audio track and THE App SHALL update the button to a visually distinct muted state (e.g., strikethrough icon or different color).
4. WHEN a User clicks the unmute button, THE Video_Service SHALL unmute the local audio track and THE App SHALL update the button to the unmuted state.
5. WHEN a User clicks the camera off button, THE Video_Service SHALL disable the local video track and THE App SHALL update the button to a visually distinct camera-off state.
6. WHEN a User clicks the camera on button, THE Video_Service SHALL enable the local video track and THE App SHALL update the button to the camera-on state.
7. WHEN a User clicks the "Leave Call" button, THE Video_Service SHALL unpublish and close all local tracks, leave the Channel, and THE App SHALL navigate the User back to the Dashboard.
8. IF the browser tab or window is closed while in a Call_Room, THEN THE Video_Service SHALL unpublish and close all local tracks and leave the Channel.
9. IF a toggle operation on the audio or video track fails, THEN THE App SHALL display an error message and revert the button to its previous state.

---

### Requirement 10: UI Styling and Responsiveness

**User Story:** As a User, I want the application to feel like a native mobile app with a modern design, so that the experience is visually appealing and easy to use on any device.

#### Acceptance Criteria

1. THE App SHALL apply a deep blue and cyan/neon blue color palette consistently across all screens.
2. THE App SHALL display the Vayucall logo prominently on the authentication screen and in the Dashboard header.
3. THE App SHALL use a mobile-first responsive layout that renders a single-column layout on screen widths below 768 px, a two-column layout on screen widths from 768 px to 1023 px, and a multi-column layout on screen widths of 1024 px and above.
4. THE App SHALL apply CSS transitions with a duration between 150 ms and 300 ms to interactive elements such as buttons and form inputs.
5. THE App SHALL use card-based layouts for forms and content sections to create visual hierarchy.
6. THE App SHALL render all interactive controls with a minimum tap target size of 44×44 px suitable for mobile use.
