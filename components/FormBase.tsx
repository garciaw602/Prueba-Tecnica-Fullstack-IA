
import React from 'react';
import { FormField, PersonaInput } from '../types';

interface FormBaseProps {
  title: string;
  icon: React.ReactNode;
  fields: FormField[];
  formData: Partial<PersonaInput>;
  isEditing: boolean;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  t: any;
}

const FormBase: React.FC<FormBaseProps> = ({
  title,
  icon,
  fields,
  formData,
  isEditing,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
  t
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all hover:shadow-indigo-100/50 dark:hover:shadow-indigo-950/20">
      <div className="bg-indigo-600 dark:bg-indigo-700 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEditing ? t.editMode : title}
          </h2>
        </div>
        {isEditing && (
          <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            {t.editMode}
          </span>
        )}
      </div>
      
      <form onSubmit={onSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-5">
          {fields.map((field) => (
            <div key={field.name} className="group">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 ml-1 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onChange}
                  placeholder={field.placeholder || `${t.placeholderWrite} ${field.label.toLowerCase()}...`}
                  required={field.required}
                  disabled={isLoading}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-700 dark:border-slate-700 bg-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:bg-slate-800 text-white font-medium placeholder:text-slate-500 shadow-inner"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t.btnProcessing}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{t.btnSave}</span>
              </>
            )}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-semibold rounded-2xl transition-all border border-slate-100 dark:border-slate-700"
            >
              {t.btnCancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormBase;
