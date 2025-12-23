
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Persona, PersonaInput, FormField } from './types';
import { apiService } from './services/apiService';
import FormBase from './components/FormBase';
import PersonaTable from './components/PersonaTable';
import Toast, { ToastType } from './components/Toast';

const INITIAL_BASIC: PersonaInput = { nombre: '', apellido: '', documento: '' };
const INITIAL_EXTENDED: PersonaInput = { nombre: '', apellido: '', documento: '', correo: '', ciudad: '' };

const translations = {
  es: {
    title: 'Management',
    subtitle: 'Una plataforma intuitiva para el control y organización de registros civiles, diseñada con los más altos estándares de UI/UX.',
    basicTab: 'Básico (Form A)',
    extendedTab: 'Extendido (Form B)',
    basicTitle: 'Nuevo Registro Básico',
    extendedTitle: 'Nuevo Registro Extendido',
    recordsInSystem: 'Registros en Sistema',
    synced: 'Sincronizado con base de datos local',
    footerName: 'Wilson García - Portafolio Técnico',
    footerTech: 'Prueba Técnica React v18 & Tailwind 3.4',
    nombre: 'Nombre',
    apellido: 'Apellido',
    documento: 'Documento',
    correo: 'Correo Electrónico',
    ciudad: 'Ciudad',
    placeholderNumbers: 'Solo números',
    placeholderWrite: 'Escriba su',
    btnSave: 'Guardar Información',
    btnProcessing: 'Procesando...',
    btnCancel: 'Cancelar y Salir',
    editMode: 'Modo Edición',
    toastCreated: 'Registro creado con éxito',
    toastUpdated: 'Registro actualizado correctamente',
    toastDeleted: 'Registro eliminado',
    toastEditing: 'Editando a',
    toastErrorLoad: 'Error al cargar los datos',
    toastErrorProcess: 'Error al procesar la solicitud',
    toastErrorDelete: 'Error al eliminar',
    toastFormBRequirement: 'En el formulario extendido, Ciudad y Correo son obligatorios.',
    confirmDelete: '¿Está seguro de eliminar este registro?',
    tableTitle: 'Listado Consolidado',
    tableSubtitle: 'Gestión centralizada de registros',
    tableSearch: 'Buscar por nombre...',
    tableHeaderName: 'Nombre Completo',
    tableHeaderDoc: 'Documento',
    tableHeaderExtra: 'Información Extra',
    tableHeaderOrigin: 'Origen',
    tableHeaderActions: 'Acciones',
    tableNoResults: 'No se encontraron registros que coincidan con la búsqueda.',
    originBasic: 'Básico',
    originExtended: 'Extendido',
    extraNoData: 'Sin datos extra'
  },
  en: {
    title: 'Management',
    subtitle: 'An intuitive platform for control and organization of civil records, designed with the highest UI/UX standards.',
    basicTab: 'Basic (Form A)',
    extendedTab: 'Extended (Form B)',
    basicTitle: 'New Basic Record',
    extendedTitle: 'New Extended Record',
    recordsInSystem: 'Records in System',
    synced: 'Synced with local database',
    footerName: 'Wilson García - Technical Portfolio',
    footerTech: 'Technical Test React v18 & Tailwind 3.4',
    nombre: 'First Name',
    apellido: 'Last Name',
    documento: 'Document ID',
    correo: 'Email Address',
    ciudad: 'City',
    placeholderNumbers: 'Numbers only',
    placeholderWrite: 'Write your',
    btnSave: 'Save Information',
    btnProcessing: 'Processing...',
    btnCancel: 'Cancel and Exit',
    editMode: 'Edit Mode',
    toastCreated: 'Record created successfully',
    toastUpdated: 'Record updated correctly',
    toastDeleted: 'Record deleted',
    toastEditing: 'Editing',
    toastErrorLoad: 'Error loading data',
    toastErrorProcess: 'Error processing request',
    toastErrorDelete: 'Error deleting',
    toastFormBRequirement: 'In the extended form, City and Email are mandatory.',
    confirmDelete: 'Are you sure you want to delete this record?',
    tableTitle: 'Consolidated List',
    tableSubtitle: 'Centralized record management',
    tableSearch: 'Search by name...',
    tableHeaderName: 'Full Name',
    tableHeaderDoc: 'Document',
    tableHeaderExtra: 'Extra Info',
    tableHeaderOrigin: 'Origin',
    tableHeaderActions: 'Actions',
    tableNoResults: 'No records found matching the search.',
    originBasic: 'Basic',
    originExtended: 'Extended',
    extraNoData: 'No extra data'
  }
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isDark, setIsDark] = useState(false);
  
  const t = translations[language];

  const [personasA, setPersonasA] = useState<Persona[]>([]);
  const [personasB, setPersonasB] = useState<Persona[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formDataBasic, setFormDataBasic] = useState<PersonaInput>(INITIAL_BASIC);
  const [formDataExtended, setFormDataExtended] = useState<PersonaInput>(INITIAL_EXTENDED);
  
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const all = await apiService.getAll();
        setPersonasA(all.filter(p => p.source === 'FormA'));
        setPersonasB(all.filter(p => p.source === 'FormB'));
      } catch (error) {
        showToast(t.toastErrorLoad, "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [t.toastErrorLoad]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<PersonaInput>>) => {
    const { name, value } = e.target;
    if (name === 'documento') {
      const onlyNumbers = value.replace(/\D/g, '');
      setter(prev => ({ ...prev, [name]: onlyNumbers }));
    } else if (name === 'nombre' || name === 'apellido' || name === 'ciudad') {
      const noNumbers = value.replace(/[0-9]/g, '');
      setter(prev => ({ ...prev, [name]: noNumbers }));
    } else {
      setter(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, data: PersonaInput, source: 'FormA' | 'FormB') => {
    e.preventDefault();
    if (source === 'FormB') {
      if ((data.correo && !data.ciudad) || (!data.correo && data.ciudad)) {
        showToast(t.toastFormBRequirement, "error");
        return;
      }
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await apiService.update(editingId, data);
        const refresh = (list: Persona[]): Persona[] => 
          list.map(p => p.id === editingId ? { ...updated, source: p.source } : p);
        
        setPersonasA(refresh);
        setPersonasB(refresh);
        setEditingId(null);
        showToast(t.toastUpdated, "success");
      } else {
        const created = await apiService.create(data, source);
        if (source === 'FormA') setPersonasA(prev => [...prev, created]);
        else setPersonasB(prev => [...prev, created]);
        showToast(t.toastCreated, "success");
      }
      
      setFormDataBasic(INITIAL_BASIC);
      setFormDataExtended(INITIAL_EXTENDED);
      if (editingId) navigate('/'); 
    } catch (err: any) {
      showToast(err.message || t.toastErrorProcess, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = useCallback((persona: Persona) => {
    setEditingId(persona.id);
    if (persona.source === 'FormA') {
      setFormDataBasic({ nombre: persona.nombre, apellido: persona.apellido, documento: persona.documento });
      navigate('/');
    } else {
      setFormDataExtended({ nombre: persona.nombre, apellido: persona.apellido, documento: persona.documento, correo: persona.correo || '', ciudad: persona.ciudad || '' });
      navigate('/extended');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`${t.toastEditing} ${persona.nombre}...`, "info");
  }, [navigate, t.toastEditing]);

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    setLoading(true);
    try {
      await apiService.delete(id);
      setPersonasA(prev => prev.filter(p => p.id !== id));
      setPersonasB(prev => prev.filter(p => p.id !== id));
      showToast(t.toastDeleted, "success");
    } catch (err) {
      showToast(t.toastErrorDelete, "error");
    } finally {
      setLoading(false);
    }
  };

  const consolidated = useMemo(() => {
    const combined = [...personasA, ...personasB];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.sort((a, b) => b.id - a.id);
  }, [personasA, personasB]);

  const basicFields = useMemo((): FormField[] => [
    { name: 'nombre', label: t.nombre, required: true },
    { name: 'apellido', label: t.apellido, required: true },
    { name: 'documento', label: t.documento, required: true, placeholder: t.placeholderNumbers },
  ], [t]);

  const extendedFields = useMemo((): FormField[] => [
    ...basicFields,
    { name: 'correo', label: t.correo, type: 'email', required: !!formDataExtended.ciudad || !!formDataExtended.correo },
    { name: 'ciudad', label: t.ciudad, required: !!formDataExtended.correo || !!formDataExtended.ciudad },
  ], [basicFields, t, formDataExtended.correo, formDataExtended.ciudad]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Configuration Toolbar */}
      <div className="fixed top-6 left-6 z-40 flex gap-2">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:scale-110 transition-all active:scale-95"
          title="Toggle Theme"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 7.757l.707-.707M12 7a5 5 0 110 10 5 5 0 010-10z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        <button 
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-4 py-3 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-400 hover:scale-110 transition-all active:scale-95 uppercase tracking-widest"
        >
          {language}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Technical Test | Full-Stack</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Persona <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{t.title}</span> Pro
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </header>

        <nav className="flex justify-center mb-12">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex gap-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              onClick={() => { if(!editingId) { setFormDataBasic(INITIAL_BASIC); setEditingId(null); } }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {t.basicTab}
            </NavLink>
            <NavLink 
              to="/extended" 
              className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              onClick={() => { if(!editingId) { setFormDataExtended(INITIAL_EXTENDED); setEditingId(null); } }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t.extendedTab}
            </NavLink>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-5 animate-in slide-in-from-left-8 duration-700">
            <Routes>
              <Route path="/" element={
                <FormBase
                  title={t.basicTitle}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
                  fields={basicFields}
                  formData={formDataBasic}
                  isEditing={!!editingId}
                  isLoading={loading}
                  onChange={(e) => handleChange(e, setFormDataBasic)}
                  onSubmit={(e) => handleSubmit(e, formDataBasic, 'FormA')}
                  onCancel={() => { setEditingId(null); setFormDataBasic(INITIAL_BASIC); navigate('/'); }}
                  t={t}
                />
              } />
              <Route path="/extended" element={
                <FormBase
                  title={t.extendedTitle}
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
                  fields={extendedFields}
                  formData={formDataExtended}
                  isEditing={!!editingId}
                  isLoading={loading}
                  onChange={(e) => handleChange(e, setFormDataExtended)}
                  onSubmit={(e) => handleSubmit(e, formDataExtended, 'FormB')}
                  onCancel={() => { setEditingId(null); setFormDataExtended(INITIAL_EXTENDED); navigate('/extended'); }}
                  t={t}
                />
              } />
            </Routes>
            
            <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-slate-900/50 rounded-3xl border border-indigo-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black">
                {consolidated.length}
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">{t.recordsInSystem}</h4>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">{t.synced}</p>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7 animate-in slide-in-from-right-8 duration-700">
            <PersonaTable 
              personas={consolidated}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              t={t}
            />
          </section>
        </div>

        <footer className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs italic">WG</div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{t.footerName}</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest">
            {t.footerTech}
          </p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
