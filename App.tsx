
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
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
    subtitle: 'Plataforma intuitiva para el control de registros civiles, diseñada con altos estándares de UI/UX.',
    basicTab: 'Básico (Form A)',
    extendedTab: 'Extendido (Form B)',
    basicTitle: 'Nuevo Registro Básico',
    extendedTitle: 'Nuevo Registro Extendido',
    recordsInSystem: 'Registros en Sistema',
    synced: 'Sincronizado localmente',
    footerName: 'Wilson García - Portafolio',
    footerTech: 'Prueba Técnica React 19 & Tailwind',
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
    toastUpdated: 'Registro actualizado',
    toastDeleted: 'Registro eliminado',
    toastEditing: 'Editando a',
    toastErrorLoad: 'Error al cargar datos',
    toastErrorProcess: 'Error al procesar',
    toastErrorDelete: 'Error al eliminar',
    toastFormBRequirement: 'En el formulario extendido, Ciudad y Correo son obligatorios.',
    confirmDelete: '¿Está seguro de eliminar este registro?',
    tableTitle: 'Listado Consolidado',
    tableSubtitle: 'Gestión centralizada de registros',
    tableSearch: 'Buscar por nombre o documento...',
    tableHeaderName: 'Nombre Completo',
    tableHeaderDoc: 'Documento',
    tableHeaderExtra: 'Información Extra',
    tableHeaderOrigin: 'Origen',
    tableHeaderActions: 'Acciones',
    tableNoResults: 'No se encontraron registros.',
    originBasic: 'Básico',
    originExtended: 'Extendido',
    extraNoData: 'Sin datos extra'
  }
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const t = translations.es;
  const [isDark, setIsDark] = useState(false);

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
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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
      setter(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    } else if (['nombre', 'apellido', 'ciudad'].includes(name)) {
      setter(prev => ({ ...prev, [name]: value.replace(/[0-9]/g, '') }));
    } else {
      setter(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, data: PersonaInput, source: 'FormA' | 'FormB') => {
    e.preventDefault();
    if (source === 'FormB' && ((data.correo && !data.ciudad) || (!data.correo && data.ciudad))) {
      showToast(t.toastFormBRequirement, "error");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await apiService.update(editingId, data);
        const refresh = (list: Persona[]): Persona[] => list.map(p => p.id === editingId ? { ...updated, source: p.source } : p);
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
    return Array.from(new Map(combined.map(item => [item.id, item])).values()).sort((a, b) => b.id - a.id);
  }, [personasA, personasB]);

  const basicFields: FormField[] = [
    { name: 'nombre', label: t.nombre, required: true },
    { name: 'apellido', label: t.apellido, required: true },
    { name: 'documento', label: t.documento, required: true, placeholder: t.placeholderNumbers },
  ];

  const extendedFields: FormField[] = [
    ...basicFields,
    { name: 'correo', label: t.correo, type: 'email', required: !!formDataExtended.ciudad || !!formDataExtended.correo },
    { name: 'ciudad', label: t.ciudad, required: !!formDataExtended.correo || !!formDataExtended.ciudad },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="fixed top-6 left-6 z-40 flex gap-2">
        <button onClick={() => setIsDark(!isDark)} className="p-3 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:scale-110 transition-all active:scale-95">
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Persona <span className="text-indigo-600">{t.title}</span> Pro
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">{t.subtitle}</p>
        </header>

        <nav className="flex justify-center mb-12">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex gap-2">
            <NavLink to="/" className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm ${isActive ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {t.basicTab}
            </NavLink>
            <NavLink to="/extended" className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm ${isActive ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {t.extendedTab}
            </NavLink>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-5">
            <Routes>
              <Route path="/" element={<FormBase title={t.basicTitle} icon="👤" fields={basicFields} formData={formDataBasic} isEditing={!!editingId} isLoading={loading} onChange={(e) => handleChange(e, setFormDataBasic)} onSubmit={(e) => handleSubmit(e, formDataBasic, 'FormA')} onCancel={() => { setEditingId(null); setFormDataBasic(INITIAL_BASIC); navigate('/'); }} t={t} />} />
              <Route path="/extended" element={<FormBase title={t.extendedTitle} icon="🚀" fields={extendedFields} formData={formDataExtended} isEditing={!!editingId} isLoading={loading} onChange={(e) => handleChange(e, setFormDataExtended)} onSubmit={(e) => handleSubmit(e, formDataExtended, 'FormB')} onCancel={() => { setEditingId(null); setFormDataExtended(INITIAL_EXTENDED); navigate('/extended'); }} t={t} />} />
            </Routes>
          </aside>

          <section className="lg:col-span-7">
            <PersonaTable personas={consolidated} onEdit={handleEdit} onDelete={handleDelete} searchQuery={searchQuery} onSearchChange={setSearchQuery} t={t} />
          </section>
        </div>
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
