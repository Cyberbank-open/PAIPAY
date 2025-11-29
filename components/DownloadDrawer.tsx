import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface DownloadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadDrawer: React.FC<DownloadDrawerProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'select' | 'ios-confirm' | 'android-confirm'>('select');
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) setStep('select');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[80] p-6 pb-10 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] animate-fade-in-up">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{t.download_drawer.select_title}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.download_drawer.select_subtitle}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setStep('ios-confirm')}
                className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-100 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                  <i className="ri-apple-fill text-2xl text-black"></i>
                </div>
                <span className="font-bold text-gray-900">iOS</span>
                <span className="text-[10px] text-gray-400 mt-0.5">App Store</span>
              </button>

              <button 
                onClick={() => setStep('android-confirm')}
                className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-gray-100 active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                  <i className="ri-android-fill text-2xl text-[#3DDC84]"></i>
                </div>
                <span className="font-bold text-gray-900">Android</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Play / APK</span>
              </button>
            </div>
          </div>
        )}

        {step === 'ios-confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-300">
                <i className="ri-apple-fill text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">App Store</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-100">
                <i className="ri-error-warning-fill align-bottom mr-1"></i>
                {t.download_drawer.ios_tip}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('select')} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">{t.download_drawer.btn_back}</button>
              <button type="button" onClick={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center py-3.5 rounded-xl bg-black text-white font-bold text-sm shadow-lg shadow-gray-200 active:scale-95 transition-transform">
                {t.download_drawer.btn_confirm}
              </button>
            </div>
          </div>
        )}

        {step === 'android-confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#3DDC84] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
                <i className="ri-android-fill text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Android</h3>
              <p className="text-sm text-gray-500 mt-1">{t.download_drawer.android_rec}</p>
            </div>
            
            <div className="space-y-3">
               <button type="button" onClick={(e) => e.preventDefault()} className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <i className="ri-google-play-fill text-xl text-gray-600"></i>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Google Play</div>
                      <div className="text-[10px] text-gray-400">Recommended</div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300"></i>
               </button>

               <button type="button" onClick={(e) => e.preventDefault()} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 border border-transparent rounded-xl active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <i className="ri-download-cloud-2-line text-xl text-gray-600"></i>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Direct APK</div>
                      <div className="text-[10px] text-gray-400">v2.4.0 • 45.2 MB</div>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300"></i>
               </button>
            </div>
            
            <button onClick={() => setStep('select')} className="w-full py-3 text-gray-400 text-xs font-medium">{t.download_drawer.btn_back}</button>
          </div>
        )}
      </div>
    </>
  );
};

export default DownloadDrawer;