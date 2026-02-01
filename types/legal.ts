/**
 * Tipos relacionados con documentos legales
 */

import React from 'react';

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}
