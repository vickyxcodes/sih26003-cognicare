import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { BASE_PATH } from '../pwa.config.js';
import { registerServiceWorker } from './lib/swRegister.js';
import { getStore, onQueued } from './lib/db.js';
import { createSyncManager } from './lib/sync.js';
import { createFirestoreRemote } from './lib/remote.js';
import { installDemoConsole } from './lib/demoConsole.js';

/**
 * React StrictMode is intentionally NOT used: its double-invoked effects make
 * the speech synthesiser talk twice and reminder timers fire twice in dev,
 * which is confusing during a live demo. (See DECISIONS.md)
 */
createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={BASE_PATH}>
    <App />
  </BrowserRouter>
);

registerServiceWorker();

/**
 * Sync is composed here and nowhere else, after the app has rendered. It is a
 * no-op until `.env` carries Firebase credentials, it only ever copies rows that
 * IndexedDB already holds, and no screen waits on it - so the patient side plays
 * exactly the same with the network off, off for good, or never configured.
 */
createSyncManager({
  store: getStore(),
  remote: createFirestoreRemote(),
  watchQueue: onQueued,
}).start();

/**
 * The demo seeder's only wiring into the app: it puts `window.cognicare` on the
 * page and checks for a `?demo=` parameter. It renders nothing, adds no route and
 * writes nothing unless a demonstrator asks it to, so the patient's app is
 * identical with or without this line. See src/lib/demoConsole.js.
 */
installDemoConsole({ store: getStore() });
