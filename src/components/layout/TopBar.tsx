import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', icon: '⌂', label: 'Home' },
  { to: '/browse', icon: '⊞', label: 'Browse' },
  { to: '/flashcards', icon: '◈', label: 'Cards' },
  { to: '/affixes', icon: '⊕', label: 'Affixes' },
  { to: '/progress', icon: '◎', label: 'Progress' },
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#13151f] sticky top-0 z-30">
        <span className="font-bold text-white text-sm">GRE Etymology</span>
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">
          {open ? '✕' : '☰'}
        </button>
      </header>
      {open && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/60" onClick={() => setOpen(false)}>
          <nav className="absolute top-12 left-0 right-0 bg-[#13151f] border-b border-slate-800 p-3 flex flex-col gap-1">
            {links.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    isActive ? 'bg-violet-600/20 text-violet-300 font-medium' : 'text-slate-300'
                  }`
                }
              >
                <span>{icon}</span>{label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
