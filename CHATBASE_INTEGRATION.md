# LifeSync Chatbase Integration Guide

This document outlines the steps to integrate **Chatbase** as the AI-powered support chatbot for the LifeSync platform.

## 1. Setup on Chatbase
1.  **Create an Account**: Sign up at [Chatbase.co](https://www.chatbase.co).
2.  **Create a New Chatbot**: Click on "New Chatbot".
3.  **Data Sources**:
    *   **Files/Text**: Upload the project abstract, FAQs about kidney donation, and HLA matching basics.
    *   **Website**: Provide the URL of your live site so the AI can crawl public pages for context.
4.  **Customize**: 
    *   Set the **Initial Message** to something welcoming: *"Hi! I'm the LifeSync Assistant. How can I help you today with kidney donation or platform features?"*
    *   Change the **Chat Bubble Icon** to match LifeSync's teal/medical theme.

## 2. Integration Steps

### Option A: Global Integration (Recommended)
To make the chatbot available on all pages, add the embed script to your root layout.

**File**: `client/app/layout.tsx`

```tsx
// Inside your RootLayout component, before the closing </body> tag
<script
  src="https://www.chatbase.co/embed.min.js"
  chatbotId="YOUR_CHATBOT_ID"
  domain="www.chatbase.co"
  defer>
</script>
```

### Option B: Conditional Integration
If you only want the chatbot on specific dashboards (e.g., Patient Dashboard):

**File**: `client/app/dashboard/patient/layout.tsx`

```tsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = "https://www.chatbase.co/embed.min.js";
  script.setAttribute("chatbotId", "YOUR_CHATBOT_ID");
  script.setAttribute("domain", "www.chatbase.co");
  script.defer = true;
  document.body.appendChild(script);
}, []);
```

## 3. Training Data Tips for LifeSync
To ensure the AI provides accurate medical and platform information, include the following in your knowledge base:
*   **HLA Compatibility Basics**: Brief explanation of A, B, and DR antigens.
*   **Platform Roles**: What can a Patient vs. Donor vs. Doctor do?
*   **Safety Protocols**: Information on HIPAA compliance and data privacy.
*   **Next Steps**: How to register, how to upload medical reports, and how matching works.

## 4. Environment Variables
It is recommended to store your `chatbotId` in an environment variable:
`.env.local`
```env
NEXT_PUBLIC_CHATBASE_ID=your_id_here
```
