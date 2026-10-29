import { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => Promise<boolean>;
}

export function AndroidInstallModal({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  onInstall,
}: AndroidInstallModalProps) {
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'qr'>('direct');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://ais-pre-k5l7gekpch4jh3nzu7htjm-470301562015.asia-east1.run.app';

  // Generate QR code when QR tab or modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#00f0ff',
          light: '#040814',
        },
      }).catch(() => {});
    }
  }, [isOpen, activeTab, currentUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTriggerInstall = async () => {
    const success = await onInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-chakra">
      <div className="w-full max-w-xl bg-[#060c18] border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-slate-100 tracking-wider">
                ANDROID MOBILE & APK CENTER
              </h2>
              <div className="text-[11px] font-mono text-cyan-400">
                INSTALL NATIVELY AS WEBAPK OR GENERATE STANDALONE APK
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 my-4">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1-Tap Install (WebAPK)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Standalone APK</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* TAB 1: Direct 1-Tap Android WebAPK */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-slate-200">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Official Android WebAPK Technology
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On Android phones (Google Chrome, Samsung Internet, Edge, Brave), installing
                  automatically compiles an <strong>Android WebAPK</strong>. It creates a dedicated
                  app package with the NEON-X cyber icon in your App Drawer, operates 100% offline,
                  and runs in native full-screen with zero browser address bar!
                </p>
              </div>

              {/* Install Trigger Button */}
              {isInstalled ? (
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 flex items-center justify-center gap-2 font-mono text-xs font-bold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  APP IS ALREADY INSTALLED ON THIS DEVICE
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleTriggerInstall}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-slate-950 font-bold font-mono text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
                >
                  <Download className="w-4 h-4" />
                  {installSuccess ? 'INSTALLING...' : 'INSTALL NEON-X TO ANDROID NOW'}
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 text-xs">
                  <span className="text-cyan-400 font-semibold">Tip:</span> To install directly on
                  Android, open this URL in your Android mobile browser (Chrome/Edge/Samsung) and follow the steps below:
                </div>
              )}

              {/* Step-by-Step Android Browser Guide */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 font-semibold tracking-wider">
                  HOW TO INSTALL FROM ANDROID BROWSER
                </div>
                <div className="grid gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">Open in Chrome or Edge on Mobile</div>
                      <div className="text-slate-400 text-[11px]">
                        Scan the QR code or open your app link on your Android device.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">Tap Browser Menu (⋮)</div>
                      <div className="text-slate-400 text-[11px]">
                        Tap the 3 vertical dots at the top-right corner of Chrome.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">Tap "Install app" or "Add to Home screen"</div>
                      <div className="text-slate-400 text-[11px]">
                        Android generates the WebAPK file and installs it just like a Play Store app.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standalone APK Packaging (PWABuilder / Bubblewrap) */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 text-slate-200">
                <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
                  <Download className="w-4 h-4 text-purple-400" />
                  Generate Standalone .APK File (PWABuilder)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you need a physical <code>.apk</code> installer file to transfer via USB,
                  Bluetooth, or upload to Google Play Store / APKPure, you can package this compliant PWA
                  using <strong>PWABuilder</strong> (Microsoft's open-source PWA-to-APK engine).
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="text-xs font-mono text-slate-400 font-semibold">
                  YOUR PRODUCTION APP URL FOR APK BUILDER:
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-200">3-Step Free APK Generation:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Copy your app URL using the button above.</li>
                  <li>Open <strong>PWABuilder.com</strong> in your browser.</li>
                  <li>Paste the URL and click <strong>"Package for Android"</strong> to download your signed <code>.apk</code>!</li>
                </ol>
              </div>

              <a
                href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
              >
                <span>OPEN PWABUILDER TO DOWNLOAD APK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* TAB 3: Scan QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="p-3 rounded-2xl border border-cyan-500/40 bg-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>

              <div className="max-w-xs text-xs text-slate-300">
                Point your Android phone camera at this QR code to open NEON-X instantly on mobile,
                then tap <strong>"Install app"</strong>.
              </div>

              <div className="flex items-center gap-2 w-full max-w-sm">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1 shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>PWA & WEBAPK READY</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
