import { useCallback, useLayoutEffect, useState } from 'react';
import SmoothScrollProvider, { useSmoothScroll } from './lib/SmoothScroll.jsx';
import Hero from './components/Hero.jsx';
import Statement from './components/Statement.jsx';
import About from './components/About.jsx';
import FacadeInstall from './components/FacadeInstall.jsx';
import Services from './components/Services.jsx';
import Systems from './components/Systems.jsx';
import Problems from './components/Problems.jsx';
import Capability from './components/Capability.jsx';
import Clients from './components/Clients.jsx';
import WhyUs from './components/WhyUs.jsx';
import Precision from './components/Precision.jsx';
import ClosingCTA from './components/ClosingCTA.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import NavPill from './components/NavPill.jsx';
import MenuOverlay from './components/MenuOverlay.jsx';
import content from './content.json';

export default function App() {
  return (
    <SmoothScrollProvider>
      <Page />
    </SmoothScrollProvider>
  );
}

function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lenis } = useSmoothScroll();

  // The overlay owns the scroll while it is up. This has to be a layout
  // effect: a menu link both closes the overlay and navigates, and the
  // delegated lenis.scrollTo runs as the click bubbles on to the document —
  // Lenis ignores scrollTo while stopped, so the restart must have already
  // committed by then.
  useLayoutEffect(() => {
    if (!lenis) return undefined;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [lenis, menuOpen]);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // A menu link both navigates and closes the overlay. It is handled here
  // rather than by the delegated handler in SmoothScrollProvider, because
  // closing the overlay detaches the anchor mid-click — and because Lenis
  // is stopped at that instant and would drop the scrollTo.
  const navigateFromMenu = useCallback(
    (event, href) => {
      const target = document.getElementById(href.slice(1));
      setMenuOpen(false);
      if (!target || !lenis) return; // no Lenis: let the native anchor jump
      event.preventDefault();
      lenis.start();
      lenis.scrollTo(target, { duration: 1.6 });
    },
    [lenis]
  );

  return (
    <>
      <main>
        <Hero content={content.hero} brand={content.brand} media={content.images.heroMedia} />
        <Statement content={content.intro} />
        <About content={content.about} />
        <FacadeInstall content={content.install} floors={26} reflect={1.6} />
        <Services content={content.services} />
        <Systems content={content.systems} />
        <Problems content={content.problems} />
        <Capability content={content.capability} />
        <Clients content={content.clients} />
        <WhyUs content={content.why} />
        <Precision content={content.precision} />
        <ClosingCTA content={content.cta} />
      </main>

      <SiteFooter content={content.footer} brand={content.brand} />

      <NavPill content={content.nav} onOpenMenu={openMenu} />
      <MenuOverlay
        content={content.nav}
        brand={content.brand}
        open={menuOpen}
        onClose={closeMenu}
        onNavigate={navigateFromMenu}
      />
    </>
  );
}
