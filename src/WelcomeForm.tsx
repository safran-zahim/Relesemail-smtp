import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Section, Field, Input, ImageField } from './components';
import type { WelcomeFormData, QAItem } from './types';
import { generateId } from './types';

const DEFAULT_QA: QAItem[] = [
  { id: generateId(), question: 'Your favorite movies of all time?', answer: '' },
  { id: generateId(), question: 'What is playing in your car/home right now?', answer: '' },
  { id: generateId(), question: 'If you had one wish, what would it be?', answer: '' },
  { id: generateId(), question: "You're stuck on a deserted island — one meal, what is it?", answer: '' },
  { id: generateId(), question: 'You absolutely CANNOT live without?', answer: '' },
  { id: generateId(), question: 'In the next year, what are you most looking forward to?', answer: '' },
  { id: generateId(), question: "What's the greatest advice anyone's ever given you?", answer: '' },
  { id: generateId(), question: 'One thing others should definitely know about you?', answer: '' },
];

export const WELCOME_INITIAL: WelcomeFormData = {
  companyName: '',
  logoUrl: '',
  accentColor: '#F35C17',
  headline: "You're Part of The Family Now",
  employeeName: '',
  employeePhotoUrl: '',
  jobTitle: '',
  employeeEmail: '',
  about: '',
  education: '',
  experience: '',
  welcomeQuote: '',
  welcomeClosing: "We're excited to see their contributions to our team.",
  qaItems: DEFAULT_QA,
};

export default function WelcomeForm({
  form,
  setForm,
}: {
  form: WelcomeFormData;
  setForm: (f: WelcomeFormData) => void;
}) {
  const [newQ, setNewQ] = useState('');
  const set = <K extends keyof WelcomeFormData>(key: K, val: WelcomeFormData[K]) =>
    setForm({ ...form, [key]: val });

  const updateQA = (id: string, patch: Partial<QAItem>) =>
    set('qaItems', form.qaItems.map(q => q.id === id ? { ...q, ...patch } : q));
  const removeQA = (id: string) => set('qaItems', form.qaItems.filter(q => q.id !== id));
  const addQA = () => {
    if (!newQ.trim()) return;
    set('qaItems', [...form.qaItems, { id: generateId(), question: newQ.trim(), answer: '' }]);
    setNewQ('');
  };

  return (
    <div className="space-y-4">
      {/* Branding */}
      <Section title="Company Branding" icon="🏢" color="violet">
        <Field label="Company Name">
          <Input value={form.companyName} onChange={v => set('companyName', v)} placeholder="TechSolutions" />
        </Field>
        <Field label="Accent Color">
          <div className="flex gap-2 items-center">
            <input type="color" value={form.accentColor}
              onChange={e => set('accentColor', e.target.value)}
              className="h-10 w-14 rounded-xl border border-indigo-100 cursor-pointer p-0.5" />
            <Input value={form.accentColor} onChange={v => set('accentColor', v)} placeholder="#F35C17" />
          </div>
        </Field>
        <ImageField label="Company Logo" value={form.logoUrl} onChange={v => set('logoUrl', v)} hint="optional" />
      </Section>

      {/* Headline */}
      <Section title="Email Headline" icon="✉️" color="indigo">
        <Field label="Headline Text">
          <Input value={form.headline} onChange={v => set('headline', v)} placeholder="You're Part of The Family Now" />
        </Field>
      </Section>

      {/* Employee Info */}
      <Section title="Employee Information" icon="👤" color="pink">
        <ImageField label="Employee Photo" value={form.employeePhotoUrl} onChange={v => set('employeePhotoUrl', v)} hint="headshot" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name">
            <Input value={form.employeeName} onChange={v => set('employeeName', v)} placeholder="Shawn Mitchell" />
          </Field>
          <Field label="Job Title">
            <Input value={form.jobTitle} onChange={v => set('jobTitle', v)} placeholder="Senior Full-Stack Developer" />
          </Field>
        </div>
        <Field label="Work Email" hint="optional">
          <Input value={form.employeeEmail} onChange={v => set('employeeEmail', v)} placeholder="shawn@company.com" type="email" />
        </Field>
      </Section>

      {/* Bio Sections */}
      <Section title="Bio Sections" icon="📄" color="emerald">
        <Field label="About" hint="short bio">
          <textarea value={form.about} onChange={e => set('about', e.target.value)} rows={3}
            placeholder="I'm passionate about creating innovative solutions..."
            className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none" />
        </Field>
        <Field label="Education" hint="optional">
          <textarea value={form.education} onChange={e => set('education', e.target.value)} rows={2}
            placeholder="MSc Computer Science from MIT..."
            className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none" />
        </Field>
        <Field label="Experience Highlights" hint="optional">
          <textarea value={form.experience} onChange={e => set('experience', e.target.value)} rows={2}
            placeholder="7+ years in full-stack development..."
            className="w-full px-3 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none" />
        </Field>
      </Section>

      {/* Welcome Quote */}
      <Section title="Welcome Quote" icon="💬" color="amber">
        <Field label="Quote / Comment from Company">
          <textarea value={form.welcomeQuote} onChange={e => set('welcomeQuote', e.target.value)} rows={3}
            placeholder='"Shawn is an exceptional developer..."'
            className="w-full px-3 py-2.5 bg-white border border-amber-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none" />
        </Field>
        <Field label="Closing Line">
          <Input value={form.welcomeClosing} onChange={v => set('welcomeClosing', v)} placeholder="We're excited to see their contributions." />
        </Field>
      </Section>

      {/* Q&A */}
      <Section title="Q&A — Get to Know Them" icon="🙋" color="sky">
        <div className="space-y-4">
          {form.qaItems.map((qa, i) => (
            <div key={qa.id} className="border border-sky-100 rounded-2xl bg-sky-50/40 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                <input value={qa.question} onChange={e => updateQA(qa.id, { question: e.target.value })}
                  placeholder="Question..."
                  className="flex-1 px-3 py-1.5 bg-white border border-sky-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:border-sky-400 transition" />
                <button onClick={() => removeQA(qa.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea value={qa.answer} onChange={e => updateQA(qa.id, { answer: e.target.value })}
                rows={2} placeholder="Answer..."
                className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-sky-400 transition resize-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={newQ} onChange={e => setNewQ(e.target.value)}
            placeholder="Add a new question..."
            onKeyDown={e => e.key === 'Enter' && addQA()}
            className="flex-1 px-3 py-2 bg-white border border-sky-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-sky-400 transition" />
          <button onClick={addQA} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-xl transition">
            <Plus size={13} /> Add
          </button>
        </div>
      </Section>
    </div>
  );
}
