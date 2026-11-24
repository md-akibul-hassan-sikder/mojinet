import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Tell the browser not to restore scroll automatically —
   we handle it ourselves so links always start from the top. */
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const NAVBAR_HEIGHT = 68;   // matches --navbar-height in index.css
const ANCHOR_OFFSET = 20;   // breathing room below the navbar

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // ① Hash anchor navigation (e.g. /#superfast from "Why so fast?")
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const top =
          el.getBoundingClientRect().top +
          window.scrollY -
          NAVBAR_HEIGHT -
          ANCHOR_OFFSET;
        window.scrollTo({ top, left: 0, behavior: 'smooth' });
        return;
      }
      // hash present but no matching element → fall through to top
    }

    // ② Regular route change → instant reset to the very top
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}