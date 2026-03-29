# Customer Messages Module

## 📋 Overview
The Messages module allows real-time (via polling) communication between the customer at a specific table and the restaurant staff. It is designed to be accessible from any page via a floating action button.

## 🏗️ Structure
```
messages/
├── index.jsx           # Main Chat Component
├── index.module.css    # Chat Styles
├── index.js            # Module Exports
├── hooks/
│   └── useMessages.js  # Messaging logic & API integration
├── components/         # Sub-components (if split later)
└── utils/
    └── helpers.js      # Message formatting helpers
```

## 🚀 Features
- **Real-time Chat**: Messages are fetched automatically every 5 seconds.
- **Contextual**: Messages are linked to the table number and the current active invoice.
- **Quick Actions**: Common requests like "Call Staff", "Request Bill", "More Ice", etc.
- **Emergency Call**: Persistent "Gọi NV" (Call Staff) button in the chat header.
- **Floating Button**: Accessible from any page in the `CustomerLayout`.

## 🔌 API Integration
Uses `messageApi` to interact with:
- `POST /api/messages`: Send new message.
- `GET /api/messages/table/{tableId}/ordered`: Fetch chat history.

## 📱 Mobile Friendly
The UI is optimized for mobile devices with responsive message bubbles and easy-to-tap buttons.
