import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStore } from '../lib/db.js';
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGE_SETTING, t as translate } from '../lib/i18n.js';
import { setSpeechLanguage } from '../lib/voice.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const store = useMemo(() => getStore(), []);
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    let live = true;
    store.getSetting(LANGUAGE_SETTING, DEFAULT_LANGUAGE).then((saved) => {
      if (live && isLanguage(saved)) setLanguageState(saved);
    }).catch((error) => console.warn('[CogniCare] could not load patient language', error));
    return () => {
      live = false;
    };
  }, [store]);

  useEffect(() => {
    setSpeechLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next) => {
    if (!isLanguage(next)) return;
    setLanguageState(next);
    store.setSetting(LANGUAGE_SETTING, next)
      .catch((error) => console.warn('[CogniCare] could not save patient language', error));
  }, [store]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key, values) => translate(language, key, values),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
