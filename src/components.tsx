import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, X, Image } from 'lucide-react';

// ─── Reusable UI Components ───────────────────────────────────────

export function Input({
  value, onChange, placeholder, type = 'text', className = ''
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition shadow-sm ${className}`}
    />
  );
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-2 text-gray-400 normal-case font-normal">{hint}</span>}
    </label>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  );
}

export function Section({
  title, icon, children, color = 'indigo', defaultOpen = true
}: {
  title: string; icon: string; children: React.ReactNode;
  color?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    sky: 'bg-sky-50 border-sky-200 text-sky-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };
  const headerCls = colorMap[color] || colorMap.indigo;
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border-b text-left transition hover:brightness-95 ${headerCls}`}
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <span className="text-base">{icon}</span>
          {title}
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

export function ListEditor({
  items, onChange, placeholder, withIcons, iconOptions
}: {
  items: { id: string; text: string; iconName?: string }[];
  onChange: (items: { id: string; text: string; iconName?: string }[]) => void;
  placeholder: string;
  withIcons?: boolean;
  iconOptions?: string[];
}) {
  const genId = () => Math.random().toString(36).slice(2);
  const add = () => onChange([...items, { id: genId(), text: '', iconName: withIcons && iconOptions?.length ? iconOptions[items.length % iconOptions.length] : undefined }]);
  const remove = (id: string) => onChange(items.filter(i => i.id !== id));
  const update = (id: string, patch: Partial<{ text: string; iconName: string }>) => onChange(items.map(i => i.id === id ? { ...i, ...patch } : i));
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2">
          {withIcons && iconOptions ? (
            <select value={item.iconName || ''} onChange={e => update(item.id, { iconName: e.target.value })} className="w-24 px-1 py-2 bg-white border border-indigo-100 rounded-xl text-center text-xs focus:outline-none focus:border-indigo-400">
              <option value="">None</option>
              {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          ) : (
            <span className="text-gray-400 text-xs w-5 shrink-0">{idx + 1}.</span>
          )}
          <input
            value={item.text}
            onChange={e => update(item.id, { text: e.target.value })}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          <button onClick={() => remove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition mt-1 px-1 py-1 hover:bg-indigo-50 rounded-lg">
        <Plus size={13} /> Add item
      </button>
    </div>
  );
}

export function ImageField({
  label, value, onChange, hint
}: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;

      // Skip canvas processing for GIFs to preserve animation
      if (file.type === 'image/gif') {
        onChange(src);
        setExpanded(false);
        return;
      }

      const img = new window.Image();

      img.onload = () => {
        const maxDimension = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height);
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          onChange(src);
          setExpanded(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let output = canvas.toDataURL('image/jpeg', 0.82);

        // If still heavy, reduce quality once more.
        if (output.length > 1_800_000) {
          output = canvas.toDataURL('image/jpeg', 0.68);
        }

        onChange(output);
        setExpanded(false);
      };

      img.onerror = () => {
        onChange(src);
        setExpanded(false);
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  }, [onChange]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div className="space-y-1.5">
      <Label hint={hint}>{label}</Label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {value ? (
        /* ── Image preview with Change/Remove on hover ── */
        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 bg-gray-50 group">
          <img
            src={value}
            alt="uploaded"
            className="w-full object-cover max-h-40"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-gray-700 shadow hover:bg-indigo-50 transition"
            >
              <Upload size={12} /> Change
            </button>
            <button
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-red-600 shadow hover:bg-red-50 transition"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : expanded ? (
        /* ── Full Drop Zone (only when user clicks Add) ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 py-5 px-4 select-none
            ${dragging
              ? 'border-purple-500 bg-purple-100 scale-[1.01]'
              : 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
            }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-purple-200' : 'bg-purple-100'}`}>
            <Image size={18} className="text-purple-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-purple-700">
              {dragging ? 'Drop image here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-purple-400 mt-0.5">PNG, JPG, GIF, WebP supported</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-xl shadow-sm">
              <Upload size={12} className="text-purple-500" />
              <span className="text-xs font-semibold text-purple-600">Browse Files</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setExpanded(false); }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ── Compact trigger (default when empty) ── */
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 text-purple-600 text-xs font-semibold transition w-full"
        >
          <Image size={13} className="shrink-0" />
          <span>Add image</span>
          <span className="ml-auto text-purple-300 text-[10px] font-normal">optional</span>
        </button>
      )}
    </div>
  );
}

