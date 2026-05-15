// ---------------------------------------------------------------
// CATEGORY MODULE — MODELS
// ---------------------------------------------------------------

export interface CategoryModel {
  id: string;          // Firestore document ID (slug-based usually)
  name: string;        // Display name (e.g. "Pentateuco")
  slug: string;        // URL-friendly name
  icon: string;        // Lucide icon name (e.g. "book-open")
  description: string; // Explanatory text
  questionCount: number;
  isActive: boolean;
  order: number;       // For display sorting
  createdAt: string;   // ISO String
  updatedAt: string;
}

export const BIBLICAL_ICONS = [
  { id: 'book-open', label: 'Libro Abierto' },
  { id: 'scroll', label: 'Pergamino' },
  { id: 'cross', label: 'Cruz' },
  { id: 'crown', label: 'Corona' },
  { id: 'flame', label: 'Fuego / Espíritu' },
  { id: 'heart', label: 'Amor / Gracia' },
  { id: 'sword', label: 'Palabra de Dios' },
  { id: 'shield', label: 'Fe / Protección' },
  { id: 'anchor', label: 'Esperanza' },
  { id: 'music', label: 'Salmos / Alabanza' },
  { id: 'mountain', label: 'Monte / Presencia' },
  { id: 'star', label: 'Promesa / Guía' },
  { id: 'droplets', label: 'Agua / Bautismo' },
];
