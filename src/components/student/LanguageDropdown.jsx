// LanguageDropdown.jsx
import React, {useEffect, useRef, useState} from 'react';

const LANGS = [
  { label: 'English', code: 'en' },
  { label: 'Telugu',  code: 'te' },
  { label: 'Hindi',   code: 'hi' },
];

function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function pickLanguage(code) {
  // 1) Set cookie so language persists across route changes/reloads
  setCookie('googtrans', `/en/${code}`);
  setCookie('googtrans', `/auto/${code}`); // some builds look at this one

  // 2) Trigger Google’s own hidden <select>
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = code;
    select.dispatchEvent(new Event('change'));
  }
}

export default function LanguageDropdown({ assets }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Wait until Google injects its .goog-te-combo
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select || tries > 40) { // ~12s max wait
        setReady(!!select);
        clearInterval(timer);
      }
      tries++;
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const onPick = (lang) => {
    setOpen(false);
    if (!ready) return;         // widget not ready yet
    pickLanguage(lang.code);     // translate page
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setOpen(v => !v)}
        aria-label="Select Language"
        title="Select Language"
      >
        <img src={assets.language_icon} alt="Language" className="w-12 h-12" />
      </button>

      {open && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Select Language</p>
            <p className="text-xs text-gray-500 mb-2">
              Choose Preferred Language
              {!ready && <span className="ml-2 text-gray-400">(loading…)</span>}
            </p>
          </div>
          <ul className="py-2">
            {LANGS.map((l) => (
              <li
                key={l.code}
                onClick={() => onPick(l)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 text-gray-700"
              >
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
