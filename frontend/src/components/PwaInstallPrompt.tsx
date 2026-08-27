import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, MoreVertical, Laptop, Check } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleOpenGuide = () => {
      setShowGuideModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('streetpet-open-install-guide', handleOpenGuide);

    // If in dev mode or standalone not detected, show prompt after 2 seconds if not dismissed
    const isDismissed = sessionStorage.getItem('streetpet_pwa_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('streetpet-open-install-guide', handleOpenGuide);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('streetpet-open-install-guide', handleOpenGuide);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show interactive manual install guide modal (for iOS Safari, Chrome Dev, etc.)
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('streetpet_pwa_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating PWA Card Banner */}
      {showPrompt && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] animate-in slide-in-from-bottom-5 duration-300">
          <div className="clay-card p-4 bg-gradient-to-br from-brand-50 via-white to-sky-50 border-2 border-brand-300 rounded-3xl shadow-2xl relative overflow-hidden text-left">
            <div
              aria-hidden
              className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-brand-300/30 blur-xl pointer-events-none"
            />

            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-md bg-white p-1">
                <img src={logoImg} alt="StreetPet Icon" className="w-full h-full object-contain" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    Aplikasi Tersedia
                  </span>
                  <button
                    onClick={handleDismiss}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                    title="Tutup Banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-black text-xs sm:text-sm text-slate-900 mt-1">
                  Install Aplikasi StreetPet
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  Akses cepat di layar HP, navigasi GPS akurat, dan peta offline tanpa address bar.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstallClick}
                    className="px-3.5 py-1.5 rounded-xl clay-btn-primary text-white text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pasang Sekarang</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 text-[11px] text-slate-500 font-bold hover:text-slate-700 transition"
                  >
                    Nanti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Installation Guide Modal (For iOS Safari, Dev Mode, & Desktop) */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="clay-card bg-white max-w-md w-full p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4 text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center p-1 shadow-xs">
                  <img src={logoImg} alt="StreetPet Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Cara Pasang Aplikasi StreetPet</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Bebas kuota, tanpa buka Play Store / App Store</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-3 text-xs text-slate-600">
              {/* iOS / iPhone Guide */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-brand-600" />
                  <span>Untuk iPhone / iPad (Safari):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-700 pl-1">
                  <li>
                    Tap tombol <strong>Bagikan / Share</strong> (<Share className="w-3 h-3 inline text-blue-600 mx-0.5" />) di bilah bawah Safari.
                  </li>
                  <li>
                    Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" / "Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline text-slate-700 mx-0.5" />).
                  </li>
                  <li>Tap <strong>Tambah / Add</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              {/* Android Guide */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Untuk Android (Chrome):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-700 pl-1">
                  <li>
                    Tap tombol menu titik tiga (<MoreVertical className="w-3 h-3 inline text-slate-700 mx-0.5" />) di pojok kanan atas browser.
                  </li>
                  <li>
                    Pilih <strong>"Pasang Aplikasi" / "Install App"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                  </li>
                </ol>
              </div>

              {/* Desktop / Laptop Guide */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>Untuk Komputer / Laptop (Chrome & Edge):</span>
                </span>
                <p className="text-[11px] font-medium text-slate-700">
                  Klik ikon <strong>Install (<Download className="w-3 h-3 inline text-brand-600 mx-0.5" />)</strong> yang muncul di sisi kanan bilah alamat (URL bar) browser Anda.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs transition shadow-sm"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
