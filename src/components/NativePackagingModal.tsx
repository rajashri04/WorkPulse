import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Apple, 
  Terminal, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Download, 
  Layers, 
  Cpu 
} from 'lucide-react';

interface NativePackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativePackagingModal: React.FC<NativePackagingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'CAPACITOR' | 'ANDROID' | 'IOS' | 'PWA'>('CAPACITOR');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://workpulse.app';

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const capacitorCommands = `# 1. Install Capacitor core and CLI
npm install @capacitor/core
npm install -D @capacitor/cli

# 2. Build the production web bundle
npm run build

# 3. Add Android and iOS native project platforms
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# 4. Open in Android Studio or Xcode to compile .apk / .ipa
npx cap open android
npx cap open ios`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="native-packaging-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 id="native-packaging-title" className="text-base font-bold">
                Build & Run as Native Android / iOS App
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Turnkey pathways to package WorkPulse as an official APK, Google Play AAB, or Apple App Store IPA.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CAPACITOR')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'CAPACITOR'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Capacitor Native (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ANDROID'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Android APK Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('IOS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'IOS'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS Xcode / IPA Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('PWA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PWA'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Install on Real Phone (PWA)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'CAPACITOR' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                  <span>How Capacitor Produces 100% Native iOS & Android Binaries</span>
                </h3>
                <p className="text-indigo-900 mt-1 leading-relaxed">
                  Capacitor (by Ionic) takes this entire React application and automatically wraps it in official <strong>Android Studio (Java/Kotlin)</strong> and <strong>Xcode (Swift/Obj-C)</strong> native projects with native push notifications, biometrics, offline storage, and camera access.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Terminal Setup Commands:
                  </span>
                  <button
                    onClick={() => copyToClipboard(capacitorCommands, 1)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedIndex === 1 ? 'Copied!' : 'Copy Commands'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {capacitorCommands}
                </pre>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-semibold text-slate-900">Config file created:</span>
                <p className="text-slate-600">
                  We have already created <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono">capacitor.config.json</code> in this repository with App ID <code className="font-mono">com.workpulse.attendance</code>, splash screen configurations, and status bar themes!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ANDROID' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <span>Building Android APK & Google Play AAB Bundle</span>
                </h3>
                <p className="text-emerald-900 mt-1 leading-relaxed">
                  Generate signed APK files to distribute directly to employees via enterprise MDM or Google Play Store.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Generate Android Native Folder</strong>
                    <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      npx cap add android
                    </code>
                    <p className="text-slate-500 mt-1">This creates the <code className="font-mono">/android</code> directory with Gradle, Manifest, and Kotlin activity.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Open in Android Studio</strong>
                    <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      npx cap open android
                    </code>
                    <p className="text-slate-500 mt-1">Android Studio will automatically sync Gradle dependencies and configure the emulator.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">1-Click Build APK</strong>
                    <p className="text-slate-600 mt-1">
                      In Android Studio menu bar, click <strong className="text-slate-900">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                      Your standalone <code className="font-mono text-indigo-700">app-debug.apk</code> will be ready in seconds!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'IOS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
                <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  <span>Building iOS Native App with Xcode & Swift</span>
                </h3>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  Compile into a native iOS project compatible with iPhone, iPad, TestFlight, and Apple App Store.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Add iOS Target</strong>
                    <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      npx cap add ios
                    </code>
                    <p className="text-slate-500 mt-1">Generates an <code className="font-mono">/ios/App/App.xcworkspace</code> Xcode project with CocoaPods.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Open in Apple Xcode</strong>
                    <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      npx cap open ios
                    </code>
                    <p className="text-slate-500 mt-1">Opens directly inside Xcode on macOS for simulation or physical device debugging.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Run on iPhone or Archive for App Store</strong>
                    <p className="text-slate-600 mt-1">
                      Select your connected iPhone or iOS Simulator and press <strong className="text-slate-900">CMD + R</strong>. To distribute via TestFlight, click <strong className="text-slate-900">Product &gt; Archive</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PWA' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-950 text-sm">
                  Instant Installation on Your Actual Phone (Zero App Store Wait)
                </h3>
                <p className="text-amber-900 mt-1 leading-relaxed">
                  Because this app is certified as a Progressive Web App (PWA), you can open this exact link on your iPhone or Android phone right now and install it as a standalone app!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Apple className="w-4 h-4" />
                    <span>On Apple iPhone / iPad</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1.5">
                    <li>Open link in <strong>Safari</strong></li>
                    <li>Tap the <strong>Share</strong> button (box with upward arrow)</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                    <li>Tap <strong>Add</strong> in top right</li>
                  </ol>
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    ✓ Launches in full screen with no browser address bar!
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>On Google Android</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1.5">
                    <li>Open link in <strong>Chrome</strong></li>
                    <li>Tap <strong>Install App</strong> banner, or 3-dots menu</li>
                    <li>Tap <strong>Add to Home Screen / Install</strong></li>
                    <li>Confirm installation</li>
                  </ol>
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    ✓ Installs as an official WebAPK in your app drawer!
                  </p>
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="truncate min-w-0">
                  <span className="text-[11px] text-slate-500 font-medium block">Applet Preview Link:</span>
                  <span className="font-mono text-slate-800 text-xs truncate block">{currentUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(currentUrl, 2)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                  {copiedIndex === 2 ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <span className="text-slate-500 text-[11px]">
            Fully compatible with Capacitor 6+, Android Studio Hedgehog/Iguana, and Xcode 15+.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
