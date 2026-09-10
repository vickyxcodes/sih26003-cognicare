import { LANGUAGES } from '../lib/i18n.js';
import { useLanguage } from './LanguageContext.jsx';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className="patient-language-bar flex items-center gap-2">
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t('language.label')}
        className="language-select"
      >
        <option value={LANGUAGES.en.code}>{t('language.english')}</option>
        <option value={LANGUAGES.as.code}>{t('language.assamese')}</option>
      </select>
    </label>
  );
}
