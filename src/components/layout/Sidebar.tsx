import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', icon: '⌂', label: 'Dashboard' },
  { to: '/browse', icon: '⊞', label: 'Browse' },
  { to: '/flashcards', icon: '◈', label: 'Flashcards' },
  { to: '/affixes', icon: '⊕', label: 'Affixes' },
  { to: '/progress', icon: '◎', label: 'Progress' },
  { to: '/suggest', icon: '✦', label: 'Suggest a Word' },
];

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-800 bg-[#13151f] h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="text-lg font-bold text-white tracking-tight">GRE Etymology</div>
        <div className="text-xs text-slate-500 mt-0.5">Vocabulary through word roots</div>
      </div>
      <div className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-slate-800 text-[10px] text-slate-600 leading-relaxed">
        Words sourced from<br />Manhattan 5lb • Kaplan GRE<br />Magoosh Flashcards
      </div>
    </nav>
  );
}
