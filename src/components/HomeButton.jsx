import { useNavigate } from 'react-router-dom';
import { HomeIcon } from './icons.jsx';

/**
 * The single, always-visible way out of any patient screen.
 * Design rule: one home button, same place, same look, every screen.
 */
export default function HomeButton({ onLeave, label = 'Home' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="tap-target bg-white text-ink border-4 border-ink/15 px-6 gap-3 text-xl"
      onClick={() => {
        if (onLeave) onLeave();
        navigate('/');
      }}
    >
      <HomeIcon className="h-9 w-9 text-primary" />
      <span>{label}</span>
    </button>
  );
}
