# VetPal 

VetPal is a AI-powered mobile application designed to help pet owners organize veterinary records, track health data, and interact with an AI assistant that can use their pet's medical history as context.

Built with **React Native and Expo**, VetPal combines Firebase cloud services with the Google Gemini API to turn veterinary documents into structured health information that can be stored, visualized, and referenced later.

## Features

### AI-Powered Document Extraction

Users can upload photos of veterinary documents, such as bills or medical records.

VetPal:

1. Converts the uploaded image to Base64.
2. Sends the document to the Google Gemini API.
3. Requests structured output using a predefined JSON schema.
4. Extracts medical information and health telemetry.
5. Stores the resulting data in Cloud Firestore.

This reduces the need to manually enter information from veterinary documents.

### Health Telemetry Dashboard

VetPal stores health measurements over time and displays them as visual charts.

<img width="300" alt="image" src="https://github.com/user-attachments/assets/10c69102-261e-4bbd-96fe-d872028c6d6b" />

Supported telemetry can include information such as:

* Weight
* Temperature (Coming Soon)


Historical data is retrieved from Firestore and displayed as time-series visualizations, allowing users to see how their pet's health metrics change over time.

### Context-Aware AI Chat
VetPal includes an AI assistant that can use a pet's stored medical history as additional context when responding to questions.

<img width="300" alt="image" src="https://github.com/user-attachments/assets/95e3d11e-1fac-40fa-9da3-a9b3522a6362" />

The chat system combines:

* Medical history stored in Firestore
* Previous conversation history stored locally with AsyncStorage
* Google Gemini for AI-generated responses

Chat history persists locally across app sessions so users can continue previous conversations without storing every message in the cloud.

> **Note:** VetPal is an educational project and is not a replacement for professional veterinary care. AI-generated responses should not be treated as medical diagnoses.


### Custom Pet Profiles

Users can create profiles for their pets and upload profile images.

Images are stored using Firebase Storage and associated with each pet's profile.

---

## Tech Stack

### Frontend

* React Native
* Expo
* Expo Router
* TypeScript
* React Context API
* AsyncStorage

### Backend / Cloud

* Firebase Authentication
* Cloud Firestore
* Firebase Storage

### AI

* Google Gemini API
* Multimodal document processing
* Structured JSON extraction


---

## Document Processing Flow

```text
Veterinary Document
        │
        ▼
Image Upload
        │
        ▼
Convert Image to Base64
        │
        ▼
Google Gemini API
        │
        ▼
Structured JSON Response
        │
        ▼
Validate / Parse Data
        │
        ▼
Cloud Firestore
        │
        ▼
Update Pet Health Dashboard
```

---

## Installation

### Requirements

Before running the project, install or configure:

* Node.js 18+
* Expo
* A Firebase project
* Google Gemini API key

Your Firebase project should have the following services enabled:

* Firebase Authentication
* Cloud Firestore
* Firebase Storage

### Clone the Repository

```bash
git clone https://github.com/joseph22724/PawLog.git
cd PawLog
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory.

```env
EXPO_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
EXPO_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
```

## Running the Application

Start the Expo development server:

```bash
npx expo start
```

From there, you can run VetPal using:

* Expo Go on a physical iOS or Android device
* iOS Simulator
* Android Emulator

For a physical device, scan the QR code displayed by Expo.

---

## Testing

VetPal was tested using several approaches.

### UI / UX Testing

Manual testing was performed using Expo Go on physical mobile devices to verify:

* Application navigation
* Native phone integration
* Maps integration
* Local AsyncStorage persistence

### API Testing

Gemini API requests were tested with veterinary documents to verify that document content could be processed and converted into structured application data.

### Database Integration Testing

Firebase integration was tested to verify:

* User authentication
* Firestore reads and writes
* Telemetry storage
* Document storage and retrieval


**Version 1.0.0**

Initial release: May 12, 2026

---

## Contributors

**Joseph Garcia**


---

## Future Improvements

Potential improvements to VetPal include:

* Expanded support for additional veterinary document formats
* More health metrics and visualization options
* Improved document extraction validation
* Enhanced AI conversation context management
* Notifications for medications and appointments
* Improved accessibility and responsive behavior across device sizes

---

## Disclaimer

VetPal was developed as an educational software project.

The application's AI functionality is intended to help organize information and provide general guidance. It does **not** provide professional veterinary diagnoses or replace consultation with a licensed veterinarian.
