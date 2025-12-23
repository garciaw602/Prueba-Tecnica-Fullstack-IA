
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Persona, PersonaInput, FormField } from './types';
import { apiService } from './services/apiService';
import FormBase from './components/FormBase';
import PersonaTable from './components/PersonaTable';
import Toast, { ToastType } from './components/Toast';

const INITIAL_BASIC: PersonaInput = { nombre: '', apellido: '', documento: '' };
const INITIAL_EXTENDED: PersonaInput = { nombre: '', apellido: '', documento: '', correo: '', ciudad: '' };

const BASIC_FIELDS: FormField[] = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'apellido', label: 'Apellido', required: true },
  { name: 'documento', label: 'Documento', required: true, placeholder: 'Solo números' },
];

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [personasA, setPersonasA] = useState<Persona[]>([]);
  const [personasB, setPersonasB] = useState<Persona[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formDataBasic, setFormDataBasic] = useState<PersonaInput>(INITIAL_BASIC);
  const [formDataExtended, setFormDataExtended] = useState<PersonaInput>(INITIAL_EXTENDED);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const all = await apiService.getAll();
        setPersonasA(all.filter(p => p.source === 'FormA'));
        setPersonasB(all.filter(p => p.source === 'FormB'));
      } catch (error) {
        showToast("Error al cargar los datos", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<PersonaInput>>) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real según requerimientos
    if (name === 'documento') {
      // Regla: No puede llevar letras (solo números)
      const onlyNumbers = value.replace(/\D/g, '');
      setter(prev => ({ ...prev, [name]: onlyNumbers }));
    } else if (name === 'nombre' || name === 'apellido' || name === 'ciudad') {
      // Regla: No deben llevar números (solo texto/espacios)
      const noNumbers = value.replace(/[0-9]/g, '');
      setter(prev => ({ ...prev, [name]: noNumbers }));
    } else {
      // Excepción: Correo y otros campos permiten mezcla
      setter(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, data: PersonaInput, source: 'FormA' | 'FormB') => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    if (source === 'FormB') {
      if ((data.correo && !data.ciudad) || (!data.correo && data.ciudad)) {
        showToast("En el formulario extendido, Ciudad y Correo son obligatorios.", "error");
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
        showToast("Registro actualizado correctamente", "success");
      } else {
        const created = await apiService.create(data, source);
        if (source === 'FormA') setPersonasA(prev => [...prev, created]);
        else setPersonasB(prev => [...prev, created]);
        showToast("Registro creado con éxito", "success");
      }
      
      setFormDataBasic(INITIAL_BASIC);
      setFormDataExtended(INITIAL_EXTENDED);
      if (editingId) navigate('/'); 
    } catch (err: any) {
      showToast(err.message || "Error al procesar la solicitud", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = useCallback((persona: Persona) => {
    setEditingId(persona.id);
    if (persona.source === 'FormA') {
      setFormDataBasic({ 
        nombre: persona.nombre, 
        apellido: persona.apellido, 
        documento: persona.documento 
      });
      navigate('/');
    } else {
      setFormDataExtended({
        nombre: persona.nombre,
        apellido: persona.apellido,
        documento: persona.documento,
        correo: persona.correo || '',
        ciudad: persona.ciudad || ''
      });
      navigate('/extended');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Editando a ${persona.nombre}...`, "info");
  }, [navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    setLoading(true);
    try {
      await apiService.delete(id);
      setPersonasA(prev => prev.filter(p => p.id !== id));
      setPersonasB(prev => prev.filter(p => p.id !== id));
      showToast("Registro eliminado", "success");
    } catch (err) {
      showToast("Error al eliminar", "error");
    } finally {
      setLoading(false);
    }
  };

  const consolidated = useMemo(() => {
    const combined = [...personasA, ...personasB];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.sort((a, b) => b.id - a.id);
  }, [personasA, personasB]);

  const EXTENDED_FIELDS = useMemo((): FormField[] => [
    ...BASIC_FIELDS,
    { 
      name: 'correo', 
      label: 'Correo Electrónico', 
      type: 'email', 
      required: !!formDataExtended.ciudad || !!formDataExtended.correo 
    },
    { 
      name: 'ciudad', 
      label: 'Ciudad', 
      required: !!formDataExtended.correo || !!formDataExtended.ciudad 
    },
  ], [formDataExtended.correo, formDataExtended.ciudad]);

  return (
    <div className="min-h-screen bg-[#fcfdfe] transition-all duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Technical Test | Full-Stack</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Persona <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Management</span> Pro
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Una plataforma intuitiva para el control y organización de registros civiles, diseñada con los más altos estándares de UI/UX.
          </p>
        </header>

        <nav className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 flex gap-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => { if(!editingId) { setFormDataBasic(INITIAL_BASIC); setEditingId(null); } }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Básico (Form A)
            </NavLink>
            <NavLink 
              to="/extended" 
              className={({ isActive }) => `px-8 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => { if(!editingId) { setFormDataExtended(INITIAL_EXTENDED); setEditingId(null); } }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Extendido (Form B)
            </NavLink>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-5 animate-in slide-in-from-left-8 duration-700">
            <Routes>
              <Route path="/" element={
                <FormBase
                  title="Nuevo Registro Básico"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
                  fields={BASIC_FIELDS}
                  formData={formDataBasic}
                  isEditing={!!editingId}
                  isLoading={loading}
                  onChange={(e) => handleChange(e, setFormDataBasic)}
                  onSubmit={(e) => handleSubmit(e, formDataBasic, 'FormA')}
                  onCancel={() => { setEditingId(null); setFormDataBasic(INITIAL_BASIC); navigate('/'); }}
                />
              } />
              <Route path="/extended" element={
                <FormBase
                  title="Nuevo Registro Extendido"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
                  fields={EXTENDED_FIELDS}
                  formData={formDataExtended}
                  isEditing={!!editingId}
                  isLoading={loading}
                  onChange={(e) => handleChange(e, setFormDataExtended)}
                  onSubmit={(e) => handleSubmit(e, formDataExtended, 'FormB')}
                  onCancel={() => { setEditingId(null); setFormDataExtended(INITIAL_EXTENDED); navigate('/extended'); }}
                />
              } />
            </Routes>
            
            <div className="mt-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black">
                {consolidated.length}
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Registros en Sistema</h4>
                <p className="text-xs text-indigo-500 font-medium">Sincronizado con base de datos local</p>
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
            />
          </section>
        </div>

        <footer className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs italic">WG</div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Wilson García - Technical Portfolio</span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            Prueba Técnica React v18 & Tailwind 3.4
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
