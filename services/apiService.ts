
import { Persona, PersonaInput } from '../types';

const STORAGE_KEY = 'personas_db_v2';

class PersonaApiService {
  private getDb(): Persona[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveDb(data: Persona[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getAll(): Promise<Persona[]> {
    await new Promise(r => setTimeout(r, 300));
    return this.getDb();
  }

  async create(data: PersonaInput, source: 'FormA' | 'FormB'): Promise<Persona> {
    await new Promise(r => setTimeout(r, 500));
    const db = this.getDb();

    // Backend-style validation: Unique Documento
    const exists = db.some(p => p.documento === data.documento);
    if (exists) {
      throw new Error(`Ya existe una persona registrada con el documento: ${data.documento}`);
    }

    const newPersona: Persona = {
      ...data,
      id: db.length > 0 ? Math.max(...db.map(p => p.id)) + 1 : 1,
      source
    };
    db.push(newPersona);
    this.saveDb(db);
    return newPersona;
  }

  async update(id: number, data: PersonaInput): Promise<Persona> {
    await new Promise(r => setTimeout(r, 500));
    const db = this.getDb();
    
    // Unique check excluding current ID
    const exists = db.some(p => p.documento === data.documento && p.id !== id);
    if (exists) {
      throw new Error(`Ya existe otra persona con el documento: ${data.documento}`);
    }

    const index = db.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Persona no encontrada');
    
    const updated = { ...db[index], ...data };
    db[index] = updated;
    this.saveDb(db);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await new Promise(r => setTimeout(r, 300));
    const db = this.getDb();
    const filtered = db.filter(p => p.id !== id);
    this.saveDb(filtered);
  }
}

export const apiService = new PersonaApiService();
