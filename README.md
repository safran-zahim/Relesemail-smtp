# Email Generator

A professional email generator for product releases and internal communications. Built with React, TypeScript, and Vite.

## Features

- **Release Email Template**: Create stunning release announcement emails with feature categories, highlights, and hosted environment details.
- **Live Preview**: See your changes in real-time with a built-in iframe preview.
- **Copy & Download**: Copy the generated HTML to your clipboard or download it as an `.html` file.
- **Payload Tracking**: Monitor the size of your email to ensure it stays within common email client limits (e.g., 700KB).
- **Smooth Navigation**: Synchronized scrolling between the editor and the preview.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository or download the source code.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Building for Production

To create a production build:
```bash
npm run build
```
The output will be in the `dist` directory.

## Usage

1. Fill in the **Branding & Identity** section with your company details.
2. Customize the **Hero Section** and **Feature Categories**.
3. Add **New Feature Highlights** with images and CTA links.
4. Preview the email on the right side of the screen.
5. Use the **Copy HTML** or **Download** buttons to export your email.
