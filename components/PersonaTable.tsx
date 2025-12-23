
import React from 'react';
import { Persona } from '../types';

interface PersonaTableProps {
  personas: Persona[];
  onEdit: (persona: Persona) => void;
  onDelete: (id: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  t: any;
}

const PersonaTable: React.FC<PersonaTableProps> = ({
  personas,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  t
}) => {
  const filtered = personas.filter(p => 
    `${p.nombre} ${p.apellido} ${p.documento}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.tableTitle}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.tableSubtitle}</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.tableSearch}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-white placeholder:text-slate-500 font-medium shadow-inner"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.tableHeaderName}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.tableHeaderDoc}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.tableHeaderExtra}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.tableHeaderOrigin}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{t.tableHeaderActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{p.nombre} {p.apellido}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-sm font-medium border border-slate-200 dark:border-slate-700">
                      {p.documento}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {p.ciudad && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="text-indigo-400">📍</span> {p.ciudad}
                        </span>
                      )}
                      {p.correo && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="text-indigo-400">📧</span> {p.correo}
                        </span>
                      )}
                      {!p.ciudad && !p.correo && <span className="text-xs text-slate-400 italic">{t.extraNoData}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.source === 'FormA' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                      {p.source === 'FormA' ? t.originBasic : t.originExtended}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(p)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  {t.tableNoResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonaTable;
