# Personal Portfolio - Sifa Birkan KADER

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS.

## Features

- 🌐 Bilingual support (English/Turkish)
- 🌙 Dark/Light theme toggle
- 📱 Fully responsive design
- 📧 Contact form with EmailJS
- ⚡ Fast loading with Vite
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- EmailJS
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/birkankader/personel-website.git
cd personel-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your EmailJS credentials:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

For the contact form to work, you need to set up EmailJS and add these environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Your EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS public key |

#### For Local Development:
Create a `.env` file in the root directory and add your values.

#### For Netlify Deployment:
Add the environment variables in your Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add each variable with its corresponding value

### EmailJS Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your Service ID, Template ID, and Public Key
5. Add them to your environment variables
