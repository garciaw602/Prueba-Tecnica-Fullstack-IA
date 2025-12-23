
export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo?: string;
  ciudad?: string;
  source: 'FormA' | 'FormB';
}

export type PersonaInput = Omit<Persona, 'id' | 'source'>;

export interface FormField {
  name: keyof PersonaInput;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
