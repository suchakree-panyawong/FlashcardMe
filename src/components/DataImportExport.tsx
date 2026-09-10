import React, { useRef } from 'react';
import { Flashcard } from '@/types/flashcard';
import { validateImportData } from '@/lib/security';
import { FileDown, FileUp, RotateCcw, ShieldCheck, Database } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface DataImportExportProps {
  cards: Flashcard[];
  onImportCards: (importedCards: Flashcard[]) => { addedCount: number; updatedCount: number; skippedCount: number };
  onResetToDefault: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({
  cards,
  onImportCards,
  onResetToDefault,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { language, t } = useLanguage();

  const handleExportJSON = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cards, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute('href', dataStr);
      anchor.setAttribute(
        'download',
        `flashcardme_backup_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showToast(t('exportSuccess'), `${cards.length} ${t('cards')} JSON`, 'success');
    } catch {
      showToast(t('exportFailed'), t('exportFailedMessage'), 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { isValid, cards: validatedCards, error } = validateImportData(json);

        if (!isValid) {
          showToast(t('invalidData'), error || t('invalidDataMessage'), 'error');
          return;
        }

        const result = onImportCards(validatedCards);
        showToast(
          t('importSuccess'),
          `${t('added')}: ${result.addedCount} · ${t('updated')}: ${result.updatedCount} · ${t('skipped')}: ${result.skippedCount}`,
          result.skippedCount > 0 ? 'info' : 'success'
        );
      } catch {
        showToast(t('invalidFile'), t('invalidJson'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Card */}
      <div className="surface-lift bg-white border border-slate-200/80 rounded-3xl p-5 shadow-soft">
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">{t('backupTitle')}</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed thai-text mt-2">
          {t('storedInBrowser')}
        </p>
      </div>

      {/* Stats */}
      <div className="surface-lift bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Database className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-xl font-black text-slate-900">{cards.length} {t('cardsStored')}</p>
          <p className="text-xs text-slate-500 font-medium">{t('storedInLocalStorage')}</p>
        </div>
      </div>

      {/* Export / Import Buttons */}
      <div className="surface-lift bg-white border border-slate-200/80 rounded-3xl p-5 shadow-soft space-y-3">
        <h4 className="text-sm font-bold text-slate-700">{t('exportImport')}</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="backup-action backup-action-import flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-center space-y-2 transition-all active:scale-95"
          >
            <FileDown className="w-6 h-6 text-indigo-600" />
            <div>
              <span className="font-bold text-emerald-700 text-sm block">{t('importJson')}</span>
              <span className="text-[10px] text-emerald-400">{t('importData')}</span>
            </div>
          </button>

          <button
            onClick={handleExportJSON}
            className="backup-action backup-action-export flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-center space-y-2 transition-all active:scale-95"
          >
            <FileUp className="w-6 h-6 text-emerald-600" />
            <div>
              <span className="font-bold text-indigo-700 text-sm block">{t('exportJson')}</span>
              <span className="text-[10px] text-indigo-400">{t('exportData')}</span>
            </div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed thai-text">
          {t('importReplaces')}
        </p>
      </div>

      {/* Reset Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">{t('resetCards')}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t('publicStarterCards')}</p>
          </div>
          <button
            onClick={() => {
              if (confirm(t('resetConfirm'))) {
                onResetToDefault();
                showToast(language === 'th' ? 'รีเซ็ตแล้ว' : 'Reset complete', t('resetDone'), 'info');
              }
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reset')}</span>
          </button>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
        <p className="text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('security')}</span>
        </p>
        <p className="text-[11px] text-emerald-600 leading-relaxed thai-text">
          XSS Protection · Input Sanitization · Zero Server DB · Client-Side Isolation
        </p>
      </div>
    </div>
  );
};
