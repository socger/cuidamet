/**
 * Tipos relacionados con mensajería y chat
 */

import { Provider } from './profiles';

export interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
  groundingChunks?: { web?: { uri: string; title: string } }[];
}

export interface ChatConversation {
  id: number;
  provider: Provider;
  messages: Message[];
}
