export interface ListItem {
  id: string;
  text: string;
  iconName?: string;
}

export interface FeatureCategory {
  id: string;
  icon: string;
  iconName?: string;
  customIconDataUrl?: string;
  name: string;
  items: ListItem[];
}

export interface CTAButton {
  id: string;
  label: string;
  buttonUrl: string;
}

export interface FormData {
  // Branding
  companyName: string;
  productName: string;
  version: string;
  tagline: string;
  brandColor: string;
  logoUrl: string;
  heroImageUrl: string;
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  // Features
  featureCategories: FeatureCategory[];
  featuresImageUrl: string;
  // New Feature Highlights
  highlightTitle: string;
  highlightDesc: string;
  highlightImageUrl: string;
  highlightVideoUrl: string;
  // Enhancements
  enhancements: ListItem[];
  // Hosted Environment
  hostedEnvEnabled: boolean;
  hostedEnvDesc: string;
  hostedEnvImageUrl: string;
  hostedEnvUrl: string;
  adminUser: string;
  adminPass: string;
  sysadminUser: string;
  sysadminPass: string;
  generalPass: string;
  // Demo Section
  demoTitle: string;
  demoImageUrl: string;
  demoButtons: CTAButton[];
  footerText: string;
  // Footer gradient colors and opacity
  footerGradientColor1: string;
  footerGradientColor2: string;
  footerGradientOpacity1: number; // 0-100 percentage
  footerGradientOpacity2: number; // 0-100 percentage
  // Optional CSS background for the footer (e.g. "linear-gradient(135deg,#ff000022,#00ff0044)").
  // If omitted, the generator will build a gradient from the footer gradient colors.
  footerGradient?: string;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
}

export interface WelcomeFormData {
  // Branding
  companyName: string;
  logoUrl: string;
  accentColor: string;
  // Headline
  headline: string;
  // Employee
  employeeName: string;
  employeePhotoUrl: string;
  jobTitle: string;
  employeeEmail: string;
  // Bio sections
  about: string;
  education: string;
  experience: string;
  // Welcome quote
  welcomeQuote: string;
  welcomeClosing: string;
  // Q&A
  qaItems: QAItem[];
}

