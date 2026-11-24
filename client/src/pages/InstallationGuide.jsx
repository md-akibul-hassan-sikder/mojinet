import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const PLATFORMS = [
  {
    id: 'ios', icon: '🍎', name: 'iOS / iPadOS', short: 'iPhone & iPad', req: 'Check the app listing for the current minimum iOS version',
    formats: 'App Store', color: '#1677ff',
    intro: 'Install the app through the App Store and review its publisher, compatibility, and permissions before opening it.',
    steps: ['Open the App Store on your iPhone or iPad.', 'Search for the exact app name "karing or clash MI" to web google.com or bing.com(If you are in China).', 'Check the developer name, reviews, compatibility, and privacy information.', 'Tap Get and authenticate with your Apple Account if requested.', 'Open the app and review its welcome screen and permission prompts.'],
    tips: ['If the app is unavailable, check device compatibility and App Store availability for your region.', 'If an update is offered, install it from the App Store rather than a third-party download page.']
  },
  {
    id: 'android', icon: '🤖', name: 'Android', short: 'Phones & tablets', req: 'Check the app listing or publisher documentation',
    formats: 'Google Play or publisher-verified package', color: '#20a66a',
    intro: 'Prefer Google Play. If your organization provides another installation method, verify the publisher and package before proceeding.',
    steps: ['Open Google Play and search for the exact app name.', 'Search for "Clash or Clash MI" to web google.com or bing.com(If you are in China).', 'Tap Install and wait for the installation to finish.', 'Open the app from your app drawer.', 'Review the initial setup and allow only permissions that are necessary for the feature you intend to use.'],
    tips: ['If installation fails, check available storage, Android version, and whether the device is managed.', 'Do not install an APK from an unknown website or disable device security protections to force an installation.']
  },
  {
    id: 'windows', icon: '🪟', name: 'Windows', short: 'Windows desktop', req: 'Windows 10 or later; confirm the app publisher’s current requirements',
    formats: 'Publisher-verified EXE or MSIX package', color: '#1686d9',
    intro: 'Choose the installer that matches your Windows device and processor architecture. Use a publisher-verified source.',
    steps: ['Open Settings → System → About to check your Windows version and System type.', 'Search for "Clash Verge or Clash MI" to web google.com or bing.com(If you are in China).', 'Check the file name, publisher information, and architecture before running it.', 'Open the installer and follow the on-screen setup wizard.', 'Launch the app from the Start menu and review its first-run information.'],
    tips: ['If Windows displays a security warning, stop and verify the publisher and download source. Do not bypass a warning for an unknown file.', 'If setup fails, restart Windows, check available disk space, and download a fresh installer from the verified source.']
  },
  {
    id: 'macos', icon: '💻', name: 'macOS', short: 'Mac computers', req: 'Check the publisher’s current macOS requirement',
    formats: 'Publisher-verified DMG or PKG', color: '#737780',
    intro: 'Check whether your Mac uses Apple silicon or Intel, then select a compatible build from the verified publisher.',
    steps: ['Choose Apple menu → About This Mac to identify your Mac model and chip.', 'Search for "Karing" to web google.com or bing.com(If you are in China)', 'Check that the build supports your Mac and current macOS version.', 'Open the DMG or PKG and follow the publisher’s installation instructions.', 'Open the app from Applications and review the first-run prompts.'],
    tips: ['If macOS cannot verify the developer, do not override the warning unless your organization has independently verified the app and instructed you to install it.', 'If the app does not open, check for a compatible update and consult the publisher’s support documentation.']
  },
  {
    id: 'linux', icon: '🐧', name: 'Linux', short: 'Linux desktop', req: 'Depends on distribution and package architecture',
    formats: 'Publisher-verified DEB, RPM, or AppImage', color: '#d99b20',
    intro: 'Select a package compatible with your Linux distribution and processor architecture. Follow the publisher’s documented installation method.',
    steps: ['Identify your Linux distribution and version in system settings or its release information.', 'Confirm whether your system uses a DEB- or RPM-based package format.', 'Download the matching package from the verified publisher.', 'Review the package details and install it using your distribution’s normal software installer.', 'Launch the app from your application menu and check for updates.'],
    tips: ['A package built for a different distribution or architecture may not install correctly.', 'If dependencies are missing, use your distribution’s package manager and consult the app publisher’s documentation.']
  },
  {
    id: 'tv', icon: '📺', name: 'Android TV', short: 'TV & streaming devices', req: 'Check Android TV version and device compatibility',
    formats: 'Google Play for TV or manufacturer-approved installation', color: '#0d8a78',
    intro: 'Use the TV’s supported app store whenever possible. Confirm that the app is designed for a TV interface and remote control.',
    steps: ['Open the app store on your Android TV or Google TV device.', 'Search for the exact app name and verify its publisher.', 'Check that the app supports your TV model and Android TV version.', 'Select Install and wait for the process to complete.', 'Open the app from the TV home screen and navigate using the remote.'],
    tips: ['Some phone apps are not designed for TV screens or remote navigation.', 'If the app is not listed, check the device manufacturer’s support information rather than installing an unknown package.']
  }
];

const QUICK_CHECKS = [
  { title: 'Check your device', text: 'Confirm the operating-system version, processor architecture, and available storage before downloading.' },
  { title: 'Verify the source', text: 'Use the official app store or a distribution page that is linked from the software publisher’s own website.' },
  { title: 'Review permissions', text: 'Read permission prompts carefully. Allow only what is necessary and expected for the app.' },
  { title: 'Keep it updated', text: 'Install updates from the same trusted distribution channel and review release notes when available.' }
];

const FAQS = [
  { q: 'The installer will not open. What should I check?', a: 'Confirm that the download completed, the package matches your operating system and processor, and your device has enough free storage. If the problem continues, download a fresh copy from the verified publisher and consult its support documentation.' },
  { q: 'How do I know whether a download is genuine?', a: 'Start from the software publisher’s own website or a recognized app store. Check the publisher name, product name, version, release notes, and file type. Avoid download mirrors and unexpected pop-up download buttons.' },
  { q: 'Why is my device showing a compatibility warning?', a: 'The app may require a newer operating-system version or a different processor architecture. Check the publisher’s current system requirements before installing.' },
  { q: 'Can I install the same app on multiple devices?', a: 'That depends on the app’s terms, account policy, and device support. Check the publisher’s documentation or your organization’s instructions.' },
  { q: 'Where can I get help?', a: 'Open a support conversation from your dashboard and include your device model, operating-system version, app version, and a screenshot of the error. Do not share passwords, private account details, or confidential access links.' }
];

export default function InstallationGuide() {
  const [activePlatform, setActivePlatform] = useState('windows');
  const [openFaq, setOpenFaq] = useState(0);
  const selectedPlatform = useMemo(
    () => PLATFORMS.find((platform) => platform.id === activePlatform) || PLATFORMS[0],
    [activePlatform]
  );

  return (
    <main className="container page install-guide">
      <style>{`
        .install-guide{--ig-ink:var(--text-primary,#172033);--ig-muted:var(--text-muted,#697386);--ig-line:var(--border-color,#e7eaf0);--ig-card:var(--card-bg,#fff);padding-bottom:56px}
        .install-guide *{box-sizing:border-box}
        .ig-back{display:inline-flex;align-items:center;gap:8px;color:var(--ig-muted);font-size:13px;text-decoration:none;margin:2px 0 22px}
        .ig-back:hover{color:var(--ig-ink)}
        .ig-hero{position:relative;overflow:hidden;border:1px solid var(--ig-line);border-radius:24px;padding:clamp(26px,5vw,52px);background:radial-gradient(circle at 85% 15%,rgba(75,130,255,.16),transparent 34%),linear-gradient(135deg,var(--ig-card),color-mix(in srgb,var(--ig-card) 88%,#dce8ff));}
        .ig-eyebrow{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--ig-line);border-radius:999px;padding:7px 11px;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ig-muted);background:var(--ig-card)}
        .ig-hero h1{font-size:clamp(30px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:18px 0 12px;color:var(--ig-ink)}
        .ig-hero p{max-width:690px;color:var(--ig-muted);font-size:15px;line-height:1.75;margin:0}
        .ig-tags{display:flex;flex-wrap:wrap;gap:9px;margin-top:23px}.ig-tag{font-size:12px;font-weight:700;border:1px solid var(--ig-line);border-radius:999px;padding:8px 11px;background:var(--ig-card);color:var(--ig-ink)}
        .ig-section{margin-top:38px}.ig-section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:17px}.ig-section h2{font-size:22px;letter-spacing:-.025em;color:var(--ig-ink);margin:0}.ig-section-desc{font-size:13px;line-height:1.7;color:var(--ig-muted);margin:7px 0 0;max-width:720px}
        .ig-platform-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.ig-platform{appearance:none;text-align:left;width:100%;border:1px solid var(--ig-line);border-radius:16px;background:var(--ig-card);padding:17px;cursor:pointer;transition:border-color .18s,transform .18s,box-shadow .18s;color:inherit}.ig-platform:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(20,35,60,.07)}.ig-platform[aria-pressed="true"]{border-color:var(--ig-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--ig-accent) 15%,transparent)}
        .ig-platform-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.ig-platform-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:color-mix(in srgb,var(--ig-accent) 12%,transparent);font-size:21px}.ig-selected{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ig-accent)}.ig-platform strong{display:block;color:var(--ig-ink);font-size:14px;margin-top:13px}.ig-platform small{display:block;color:var(--ig-muted);font-size:11px;margin-top:5px;line-height:1.5}
        .ig-detail{border:1px solid var(--ig-line);border-radius:20px;background:var(--ig-card);overflow:hidden}.ig-detail-head{display:flex;align-items:center;gap:15px;padding:22px;border-bottom:1px solid var(--ig-line);background:linear-gradient(90deg,color-mix(in srgb,var(--ig-accent) 8%,var(--ig-card)),var(--ig-card))}.ig-detail-icon{display:grid;place-items:center;flex:0 0 50px;height:50px;border-radius:15px;background:color-mix(in srgb,var(--ig-accent) 13%,transparent);font-size:25px}.ig-detail-head h3{margin:0;color:var(--ig-ink);font-size:18px}.ig-detail-head p{margin:4px 0 0;color:var(--ig-muted);font-size:12px;line-height:1.5}.ig-detail-body{padding:22px}.ig-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:15px}.ig-meta span{font-size:11px;font-weight:700;color:var(--ig-muted);background:color-mix(in srgb,var(--ig-line) 50%,transparent);border-radius:8px;padding:7px 9px}.ig-intro{color:var(--ig-muted);font-size:13px;line-height:1.75;margin:0 0 20px}.ig-steps{list-style:none;padding:0;margin:0;display:grid;gap:12px}.ig-step{display:grid;grid-template-columns:28px 1fr;gap:12px;align-items:start}.ig-step-num{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:color-mix(in srgb,var(--ig-accent) 12%,transparent);color:var(--ig-accent);font-size:12px;font-weight:800}.ig-step p{margin:3px 0 0;color:var(--ig-ink);font-size:13px;line-height:1.65}.ig-tips{margin-top:22px;padding:15px 16px;border-radius:13px;background:color-mix(in srgb,#e8a23b 9%,var(--ig-card));border:1px solid color-mix(in srgb,#e8a23b 25%,var(--ig-line))}.ig-tips strong{font-size:12px;color:var(--ig-ink)}.ig-tips ul{margin:9px 0 0;padding-left:18px;color:var(--ig-muted);font-size:12px;line-height:1.7}.ig-check-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ig-check{border:1px solid var(--ig-line);border-radius:15px;background:var(--ig-card);padding:17px}.ig-check-icon{font-size:19px}.ig-check h3{font-size:13px;color:var(--ig-ink);margin:11px 0 6px}.ig-check p{font-size:12px;line-height:1.65;color:var(--ig-muted);margin:0}.ig-faq{border:1px solid var(--ig-line);border-radius:14px;background:var(--ig-card);overflow:hidden}.ig-faq+.ig-faq{margin-top:9px}.ig-faq button{display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%;padding:16px 18px;border:0;background:transparent;text-align:left;color:var(--ig-ink);font-size:13px;font-weight:700;cursor:pointer}.ig-faq button span:last-child{font-size:18px;color:var(--ig-muted)}.ig-faq p{padding:0 18px 17px;margin:0;color:var(--ig-muted);font-size:12px;line-height:1.75}.ig-footer{margin-top:38px;padding:23px;border:1px solid var(--ig-line);border-radius:18px;background:var(--ig-card);display:flex;align-items:center;justify-content:space-between;gap:18px}.ig-footer h3{font-size:16px;color:var(--ig-ink);margin:0 0 5px}.ig-footer p{font-size:12px;color:var(--ig-muted);line-height:1.6;margin:0}.ig-footer a{white-space:nowrap;text-decoration:none}.ig-note{font-size:11px;line-height:1.65;color:var(--ig-muted);margin-top:15px}
        @media(max-width:850px){.ig-platform-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ig-check-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.ig-platform-grid{grid-template-columns:1fr 1fr;gap:8px}.ig-platform{padding:12px}.ig-platform strong{font-size:12px}.ig-platform small{font-size:10px}.ig-detail-head,.ig-detail-body{padding:17px}.ig-footer{align-items:flex-start;flex-direction:column}.ig-footer a{width:100%;text-align:center}.ig-section-head{display:block}}
      `}</style>

      <Link to="/dashboard" className="ig-back">← Back to dashboard</Link>

      <section className="ig-hero">
        <span className="ig-eyebrow">Customer installation centre</span>
        <h1>Installation Guide</h1>
        <p>A clear, device-by-device guide to checking compatibility, installing the application safely, and keeping it up to date. Choose your device below to see the relevant instructions.</p>
        <div className="ig-tags">
          <span className="ig-tag">6 platform guides</span>
          <span className="ig-tag">Step-by-step instructions</span>
          <span className="ig-tag">Safety & troubleshooting</span>
          <span className="ig-tag">Mobile-friendly</span>
        </div>
      </section>

      <section className="ig-section">
        <div className="ig-section-head">
          <div>
            <h2>Choose your device</h2>
            <p className="ig-section-desc">Select the platform you want to install the application on. The instructions below will update automatically.</p>
          </div>
        </div>
        <div className="ig-platform-grid">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              className="ig-platform"
              style={{ '--ig-accent': platform.color }}
              aria-pressed={activePlatform === platform.id}
              onClick={() => setActivePlatform(platform.id)}
            >
              <div className="ig-platform-top">
                <span className="ig-platform-icon">{platform.icon}</span>
                {activePlatform === platform.id && <span className="ig-selected">Selected</span>}
              </div>
              <strong>{platform.name}</strong>
              <small>{platform.short}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="ig-section" aria-live="polite">
        <div className="ig-section-head">
          <div>
            <h2>{selectedPlatform.name} installation</h2>
            <p className="ig-section-desc">Follow these steps in order. Menu names may vary slightly depending on your device and app version.</p>
          </div>
        </div>
        <article className="ig-detail" style={{ '--ig-accent': selectedPlatform.color }}>
          <header className="ig-detail-head">
            <span className="ig-detail-icon">{selectedPlatform.icon}</span>
            <div>
              <h3>{selectedPlatform.name}</h3>
              <p>{selectedPlatform.short}</p>
            </div>
          </header>
          <div className="ig-detail-body">
            <div className="ig-meta">
              <span>Compatibility: {selectedPlatform.req}</span>
              <span>Package: {selectedPlatform.formats}</span>
            </div>
            <p className="ig-intro">{selectedPlatform.intro}</p>
            <ol className="ig-steps">
              {selectedPlatform.steps.map((step, index) => (
                <li className="ig-step" key={`${selectedPlatform.id}-${index}`}>
                  <span className="ig-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="ig-tips">
              <strong>Helpful checks</strong>
              <ul>{selectedPlatform.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </div>
          </div>
        </article>
      </section>

      <section className="ig-section">
        <div className="ig-section-head">
          <div>
            <h2>Before you install</h2>
            <p className="ig-section-desc">A few quick checks help prevent failed installations and avoid unsafe downloads.</p>
          </div>
        </div>
        <div className="ig-check-grid">
          {QUICK_CHECKS.map((item, index) => (
            <article className="ig-check" key={item.title}>
              <span className="ig-check-icon">{['📋', '🔎', '🔐', '🔄'][index]}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ig-section">
        <div className="ig-section-head">
          <div>
            <h2>Common questions</h2>
            <p className="ig-section-desc">Quick answers to common installation and compatibility issues.</p>
          </div>
        </div>
        {FAQS.map((faq, index) => (
          <article className="ig-faq" key={faq.q}>
            <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
              <span>{faq.q}</span><span aria-hidden="true">{openFaq === index ? '−' : '+'}</span>
            </button>
            {openFaq === index && <p>{faq.a}</p>}
          </article>
        ))}
        <p className="ig-note">System requirements and app-store availability can change. Always confirm the latest compatibility information with the software publisher before installing. Never share passwords, payment details, or private account links with support.</p>
      </section>

      <footer className="ig-footer">
        <div>
          <h3>Need help with installation?</h3>
          <p>Contact the support team from your dashboard. Include your device type and the exact error message so the team can assist you.</p>
        </div>
        <Link to="/dashboard" className="btn btn--primary btn--sm">Return to dashboard</Link>
      </footer>
    </main>
  );
}
