import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Mail, Copy, Check, Download, Zap, Plus, Trash2, Send } from 'lucide-react';
import { Section, Field, Input, ListEditor, ImageField } from './components';
import { generateEmailHTML } from './emailGenerator';
import { generateWelcomeEmailHTML } from './welcomeGenerator';
import type { FormData, FeatureCategory, CTAButton, WelcomeFormData } from './types';
import { generateId } from './types';
import WelcomeForm, { WELCOME_INITIAL } from './WelcomeForm';
import { featureIcons } from './icons';

type TemplateType = 'release' | 'welcome';

const g = generateId;

const FEATURE_ICON_KEYS = Array.from({ length: 14 }, (_, i) => `icon_${String(i + 1).padStart(2, '0')}`);

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const DEFAULT_CATEGORIES: FeatureCategory[] = [
  {
    id: g(), icon: '⭐', name: 'Sample Category',
    items: [
      { id: g(), text: 'Sample feature improvement or update description' },
    ],
  },
].map((cat, i) => {
  const DEFAULT_ICON_NAMES = ['icon_01'];
  return {
    ...cat,
    iconName: DEFAULT_ICON_NAMES[i % DEFAULT_ICON_NAMES.length]
  };
});

const DEFAULT_BUTTONS: CTAButton[] = [
  { id: g(), label: 'Demo Video', buttonUrl: '' },
  { id: g(), label: 'Presentation Slide Deck', buttonUrl: '' },
  { id: g(), label: 'Release Notes & Build Information', buttonUrl: '' },
  { id: g(), label: 'Schema Changes in 8.1', buttonUrl: '' },
];

const INITIAL: FormData = {
  companyName: 'OrangeHRM',
  productName: 'ORANGEHRM',
  version: '8.1',
  tagline: 'Is Out As a Stable Version',
  brandColor: '#f97316',
  logoUrl: '',
  heroImageUrl: '',
  heroTitle: 'NEW FEATURE HIGHLIGHTS',
  heroSubtitle: 'Experience the new features in action. Click the button below to watch quick walkthrough videos.',
  featureCategories: DEFAULT_CATEGORIES,
  featuresImageUrl: '',
  highlightTitle: 'NEW FEATURE HIGHLIGHTS',
  highlightDesc: 'Experience the new features in action. Click the button below to watch quick walkthrough videos.\nOrangeHRM Citra: A Smarter Look. A Smoother Experience.',
  highlightImageUrl: '',
  highlightVideoUrl: '',
  enhancements: [
    { id: g(), text: 'Customer Reported Bug Fixes' },
  ],
  hostedEnvEnabled: true,
  hostedEnvDesc: "If you would like to play around with the new features, please feel free to use the below system. However, please ensure you don't change the default passwords of admin accounts.",
  hostedEnvImageUrl: '',
  hostedEnvUrl: 'https://81-tag-kord.orangehrm.com/',
  adminUser: 'admin',
  adminPass: 'BestSystemEver100%',
  sysadminUser: '_ohrmSysAdmin_',
  sysadminPass: '>+$8YuqH3;W~&Nmw',
  generalPass: 'user@OHRM123',
  demoTitle: 'Stakeholder Demo (Feature Demo)\nVideo & Slide',
  demoImageUrl: '',
  demoButtons: DEFAULT_BUTTONS,
  footerText: 'Bring Innovation to Human Resource Management !!!',
  footerGradientColor1: '#f97316',
  footerGradientColor2: '#f97316',
  footerGradientOpacity1: 13,
  footerGradientOpacity2: 27,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function App() {
  const [template, setTemplate] = useState<TemplateType>('release');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [welcome, setWelcome] = useState<WelcomeFormData>(WELCOME_INITIAL);
  const [testRecipient, setTestRecipient] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [iconPickerCategoryId, setIconPickerCategoryId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  }, []);

  const emailHTML = template === 'release'
    ? generateEmailHTML(form)
    : generateWelcomeEmailHTML(welcome);

  const previewFilename = template === 'release'
    ? `${form.productName || 'release'}-${form.version || 'email'}.html`
    : `welcome-${(welcome.employeeName || 'new-member').replace(/\s+/g, '-').toLowerCase()}.html`;

  const emailSubject = template === 'release'
    ? 'Local Test: OrangeHRM 8.1'
    : `Local Test: Welcome ${welcome.employeeName || 'New Member'}`;

  const sendPayload = useMemo(() => {
    const payload = JSON.stringify({
      subject: emailSubject,
      htmlBody: emailHTML,
      to: testRecipient.trim() || undefined,
    });
    const bytes = new TextEncoder().encode(payload).length;
    return { payload, bytes };
  }, [emailSubject, emailHTML, testRecipient]);

  const handleCopy = async () => {
    try {
      const blob = new Blob([emailHTML], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([item]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(emailHTML);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        const el = document.createElement('textarea');
        el.value = emailHTML;
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([emailHTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = previewFilename;
    a.click();
  };

  const [activeSection, setActiveSection] = useState<string>('section-branding');
  const lastScrollSource = useRef<'form' | 'preview' | null>(null);
  const scrollTimeout = useRef<any>(null);

  const scrollToPreview = useCallback((sectionId: string) => {
    if (lastScrollSource.current === 'preview') return;
    lastScrollSource.current = 'form';
    setActiveSection(sectionId);
    
    if (!iframeRef.current?.contentWindow) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    const element = doc.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { lastScrollSource.current = null; }, 1000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeSection) {
        scrollToPreview(activeSection);
      }
    }, 100); 
    return () => clearTimeout(timer);
  }, [emailHTML, activeSection, scrollToPreview]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_SCROLL' && lastScrollSource.current !== 'form') {
        lastScrollSource.current = 'preview';
        const sectionId = event.data.sectionId;
        setActiveSection(sectionId);
        const formElement = document.getElementById(`form-${sectionId}`);
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => { lastScrollSource.current = null; }, 1000);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (lastScrollSource.current === 'preview') return;
        const visibleEntry = entries.find(e => e.isIntersecting);
        if (visibleEntry) {
          const sectionId = visibleEntry.target.id.replace('form-', '');
          setActiveSection(sectionId);
          scrollToPreview(sectionId);
        }
      },
      { threshold: 0.5, rootMargin: '-10% 0px -70% 0px' }
    );

    const formSections = document.querySelectorAll('[id^="form-section-"]');
    formSections.forEach(s => observer.observe(s));

    const handleFocus = (e: FocusEvent) => {
      const section = (e.target as HTMLElement).closest('[id^="form-section-"]');
      if (section) {
        const sectionId = section.id.replace('form-', '');
        setActiveSection(sectionId);
        scrollToPreview(sectionId);
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('focusin', handleFocus);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('focusin', handleFocus);
      observer.disconnect();
    };
  }, [scrollToPreview]);

  const handleSendTestMail = async () => {
    setSending(true);
    setSendStatus(null);
    try {
      if (sendPayload.bytes > 4000000) throw new Error('Email too large (Limit 4MB)');
      const response = await fetch('/api/send-test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: sendPayload.payload });
      if (!response.ok) throw new Error('Failed');
      setSendStatus('Sent!');
    } catch (e) {
      setSendStatus('Error');
    } finally {
      setSending(false);
    }
  };

  const addCategory = () => set('featureCategories', [...form.featureCategories, { id: g(), icon: '⭐', name: '', iconName: 'icon_01', items: [{ id: g(), text: '' }] }]);
  const removeCategory = (id: string) => set('featureCategories', form.featureCategories.filter(c => c.id !== id));
  const updateCategory = (id: string, patch: Partial<FeatureCategory>) => set('featureCategories', form.featureCategories.map(c => c.id === id ? { ...c, ...patch } : c));
  const uploadCategoryIcon = async (id: string, file?: File) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateCategory(id, { customIconDataUrl: dataUrl });
  };
  const openIconPicker = (id: string) => setIconPickerCategoryId(id);
  const closeIconPicker = () => setIconPickerCategoryId(null);
  const selectedIconCategory = iconPickerCategoryId
    ? form.featureCategories.find(c => c.id === iconPickerCategoryId) || null
    : null;

  const addDemoBtn = () => set('demoButtons', [...form.demoButtons, { id: g(), label: '', buttonUrl: '' }]);
  const removeDemoBtn = (id: string) => set('demoButtons', form.demoButtons.filter(b => b.id !== id));
  const updateDemoBtn = (id: string, patch: Partial<CTAButton>) => set('demoButtons', form.demoButtons.map(b => b.id === id ? { ...b, ...patch } : b));

  return (
    <div className="min-h-screen bg-[#F0F1F5]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-3">
          <Zap className="text-indigo-600" />
          <span className="font-bold text-gray-900">Email Generator</span>
          <div className="flex bg-indigo-50 rounded-xl p-1 ml-4">
            {([['release', '📢 Release'], ['welcome', '🎉 Welcome']] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTemplate(t)} className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${template === t ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>{label}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <input type="email" value={testRecipient} onChange={e => setTestRecipient(e.target.value)} placeholder="Test email" className="px-3 py-1.5 rounded-lg border border-indigo-200 text-xs focus:outline-none bg-white" />
            <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${sendPayload.bytes > 4000000
              ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
              : sendPayload.bytes > 3000000
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
              Payload: {formatBytes(sendPayload.bytes)}
            </div>
            <button onClick={handleSendTestMail} disabled={sending} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-all"><Send size={14} /> Send</button>
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-all">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy HTML'}</button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all"><Download size={14} /> Download</button>
          </div>
        </div>
      </header>

      <div className="lg:hidden flex border-b border-indigo-100 bg-white sticky top-16 z-10">
        {(['form', 'preview'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-xs font-semibold ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50' : 'text-gray-500'}`}>{tab === 'form' ? '✏️ Editor' : '👁️ Preview'}</button>
        ))}
      </div>

      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 items-start">
          <div className={`space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
            {template === 'welcome' && <WelcomeForm form={welcome} setForm={setWelcome} />}
            {template === 'release' && (
              <div className="space-y-6 pb-20">
                <div id="form-section-branding">
                  <Section title="Branding & Identity" icon="🎨" color="violet">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Field label="Company Name"><Input value={form.companyName} onChange={v => set('companyName', v)} /></Field>
                      <Field label="Product Name"><Input value={form.productName} onChange={v => set('productName', v)} /></Field>
                      <Field label="Version"><Input value={form.version} onChange={v => set('version', v)} /></Field>
                      <Field label="Brand Color">
                        <div className="flex gap-2 items-center">
                          <input type="color" value={form.brandColor} onChange={e => set('brandColor', e.target.value)} className="h-10 w-14 rounded-xl border border-indigo-100 cursor-pointer p-0.5" />
                          <Input value={form.brandColor} onChange={v => set('brandColor', v)} />
                        </div>
                      </Field>
                    </div>
                    <ImageField label="Logo" value={form.logoUrl} onChange={v => set('logoUrl', v)} />
                    <Field label="Tagline"><Input value={form.tagline} onChange={v => set('tagline', v)} /></Field>
                  </Section>
                </div>

                <div id="form-section-hero">
                  <Section title="Hero Section" icon="🖼️" color="indigo">
                    <ImageField label="Hero Banner" value={form.heroImageUrl} onChange={v => set('heroImageUrl', v)} />
                  </Section>
                </div>

                <div id="form-section-features">
                  <Section title="Feature Categories" icon="⚡" color="amber">
                    <div className="space-y-4">
                      {form.featureCategories.map((cat) => (
                        <div key={cat.id} className="border border-amber-100 rounded-2xl bg-amber-50/40 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openIconPicker(cat.id)}
                              className="relative h-12 w-12 rounded-xl border border-amber-300 bg-white flex items-center justify-center overflow-hidden hover:bg-amber-50 transition-colors shrink-0"
                              title="Choose or upload icon"
                              aria-label="Choose or upload icon"
                            >
                              {cat.customIconDataUrl ? (
                                <img src={cat.customIconDataUrl} alt="custom icon" className="h-9 w-9 object-contain" />
                              ) : cat.iconName && featureIcons[cat.iconName] ? (
                                <img src={featureIcons[cat.iconName]} alt="selected icon" className="h-9 w-9 object-contain" />
                              ) : (
                                <span className="text-amber-600 text-xs font-semibold">Icon</span>
                              )}
                              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">+</span>
                            </button>
                            <input value={cat.name} onChange={e => updateCategory(cat.id, { name: e.target.value })} placeholder="Category name" className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none" />
                            <button onClick={() => removeCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                          <ListEditor items={cat.items} onChange={items => updateCategory(cat.id, { items })} placeholder="Feature description..." />
                        </div>
                      ))}
                    </div>
                    <button onClick={addCategory} className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-all w-full justify-center"><Plus size={14} /> Add Category</button>
                    <div className="pt-4 mt-4 border-t border-amber-100"><ImageField label="Section Image" value={form.featuresImageUrl} onChange={v => set('featuresImageUrl', v)} /></div>
                  </Section>
                </div>

                <div id="form-section-highlights">
                  <Section title="New Feature Highlights" icon="🌟" color="pink">
                    <Field label="Title"><Input value={form.highlightTitle} onChange={v => set('highlightTitle', v)} /></Field>
                    <Field label="Description"><textarea value={form.highlightDesc} onChange={e => set('highlightDesc', e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:outline-none transition resize-none" /></Field>
                    <ImageField label="Highlight Image" value={form.highlightImageUrl} onChange={v => set('highlightImageUrl', v)} />
                    <Field label="CTA URL"><Input value={form.highlightVideoUrl} onChange={v => set('highlightVideoUrl', v)} /></Field>
                  </Section>
                </div>

                <div id="form-section-enhancements">
                  <Section title="Enhancements / Bug Fixes" icon="🔧" color="emerald">
                    <ListEditor items={form.enhancements} onChange={items => set('enhancements', items)} withIcons={true} placeholder="Improvement or bug fix..." />
                  </Section>
                </div>

                <div id="form-section-hosted">
                  <Section title="Hosted Environment" icon="🌐" color="sky">
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl mb-3 border border-sky-100">
                      <input type="checkbox" checked={form.hostedEnvEnabled} onChange={e => set('hostedEnvEnabled', e.target.checked)} className="w-4 h-4 accent-sky-600" />
                      <label className="text-sm font-medium text-sky-800">Include Section</label>
                    </div>
                    {form.hostedEnvEnabled && (
                      <div className="space-y-3">
                        <Field label="Description"><textarea value={form.hostedEnvDesc} onChange={e => set('hostedEnvDesc', e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-white border border-sky-100 rounded-xl text-sm focus:outline-none transition resize-none" /></Field>
                        <ImageField label="Env Image" value={form.hostedEnvImageUrl} onChange={v => set('hostedEnvImageUrl', v)} />
                        <Field label="Hosted Env URL"><Input value={form.hostedEnvUrl} onChange={v => set('hostedEnvUrl', v)} /></Field>
                      </div>
                    )}
                  </Section>
                </div>

                <div id="form-section-demo">
                  <Section title="Stakeholder Demo" icon="🎬" color="orange">
                    <Field label="Title"><textarea value={form.demoTitle} onChange={e => set('demoTitle', e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-white border border-orange-100 rounded-xl text-sm focus:outline-none transition resize-none" /></Field>
                    <ImageField label="Demo Image" value={form.demoImageUrl} onChange={v => set('demoImageUrl', v)} />
                    <div className="space-y-2 mt-3">
                      {form.demoButtons.map((btn, bi) => (
                        <div key={btn.id} className="flex gap-2 items-center">
                          <span className="text-xs text-gray-400 w-4">{bi + 1}.</span>
                          <input value={btn.label} onChange={e => updateDemoBtn(btn.id, { label: e.target.value })} placeholder="Label" className="flex-1 px-3 py-2 bg-white border border-orange-100 rounded-xl text-sm focus:outline-none" />
                          <input value={btn.buttonUrl} onChange={e => updateDemoBtn(btn.id, { buttonUrl: e.target.value })} placeholder="Button URL" className="flex-1 px-3 py-2 bg-white border border-orange-100 rounded-xl text-sm focus:outline-none" />
                          <button onClick={() => removeDemoBtn(btn.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addDemoBtn} className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-xs font-semibold hover:bg-orange-200 transition-all"><Plus size={13} /> Add Button</button>
                  </Section>
                </div>

                <div id="form-section-footer">
                  <Section title="Footer" icon="📝" color="indigo">
                    <Field label="Footer Text"><Input value={form.footerText} onChange={v => set('footerText', v)} /></Field>
                    <Field label="Gradient Color 1">
                      <div className="flex gap-2 items-center">
                        <input type="color" value={form.footerGradientColor1} onChange={e => set('footerGradientColor1', e.target.value)} className="h-10 w-14 rounded-xl border border-indigo-100 cursor-pointer p-0.5" />
                        <Input value={form.footerGradientColor1} onChange={v => set('footerGradientColor1', v)} />
                      </div>
                    </Field>
                    <Field label={`Opacity 1: ${form.footerGradientOpacity1}%`}>
                      <input type="range" min="0" max="100" value={form.footerGradientOpacity1} onChange={e => set('footerGradientOpacity1', parseInt(e.target.value))} className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer" />
                    </Field>
                    <Field label="Gradient Color 2">
                      <div className="flex gap-2 items-center">
                        <input type="color" value={form.footerGradientColor2} onChange={e => set('footerGradientColor2', e.target.value)} className="h-10 w-14 rounded-xl border border-indigo-100 cursor-pointer p-0.5" />
                        <Input value={form.footerGradientColor2} onChange={v => set('footerGradientColor2', v)} />
                      </div>
                    </Field>
                    <Field label={`Opacity 2: ${form.footerGradientOpacity2}%`}>
                      <input type="range" min="0" max="100" value={form.footerGradientOpacity2} onChange={e => set('footerGradientOpacity2', parseInt(e.target.value))} className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer" />
                    </Field>
                  </Section>
                </div>
              </div>
            )}
          </div>

          <div className={`lg:sticky lg:top-24 ${activeTab === 'form' ? 'hidden lg:block' : ''}`}>
            {sendPayload.bytes > 4000000 && (
              <div className="mb-3 p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-pulse">
                <Zap size={14} className="text-red-600" />
                <span>CRITICAL: Size Limit Exceeded (Max 4MB). Email will be clipped!</span>
              </div>
            )}
            {sendStatus && <div className={`mb-3 p-3 rounded-xl text-xs font-semibold border ${sendStatus.includes('Error') ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>{sendStatus}</div>}
            <div className="flex items-center gap-2 mb-3"><Mail className="text-indigo-600" size={16} /><span className="font-bold text-gray-800 text-sm">Live Email Preview</span></div>
            <div className="rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-xl bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-3 px-3 py-1 bg-white rounded-md text-[10px] text-gray-400 font-mono text-center truncate">{previewFilename}</div>
              </div>
              <iframe ref={iframeRef} title="Preview" srcDoc={emailHTML} className="w-full" style={{ height: 'calc(100vh - 180px)', minHeight: '600px', border: 'none' }} />
            </div>
          </div>
        </div>
      </main>

      {selectedIconCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeIconPicker}>
          <div
            className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-amber-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/60">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Choose Feature Icon</h3>
                <p className="text-xs text-gray-500">Default icons are shown first. You can also upload a local image.</p>
              </div>
              <button onClick={closeIconPicker} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-white border border-amber-100">Close</button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Default icons</p>
                  <p className="text-xs text-gray-500">Click an icon to apply it to {selectedIconCategory.name || 'this category'}.</p>
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold cursor-pointer hover:bg-amber-100 transition-colors">
                  <Plus size={14} /> Upload icon
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      void uploadCategoryIcon(selectedIconCategory.id, file);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {FEATURE_ICON_KEYS.map(iconKey => {
                  const active = selectedIconCategory.iconName === iconKey && !selectedIconCategory.customIconDataUrl;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => {
                        updateCategory(selectedIconCategory.id, { iconName: iconKey, customIconDataUrl: undefined });
                        closeIconPicker();
                      }}
                      className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${active ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50/60'}`}
                    >
                      <img src={featureIcons[iconKey]} alt="" className="h-8 w-8 object-contain" />
                    </button>
                  );
                })}
              </div>

              {selectedIconCategory.customIconDataUrl && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white border border-amber-200 flex items-center justify-center overflow-hidden">
                      <img src={selectedIconCategory.customIconDataUrl} alt="custom icon" className="h-10 w-10 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Custom icon selected</p>
                      <p className="text-xs text-gray-500">This image came from local storage.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateCategory(selectedIconCategory.id, { customIconDataUrl: undefined, iconName: 'icon_01' });
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 border border-amber-200 bg-white hover:bg-amber-100"
                  >
                    Clear custom icon
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
