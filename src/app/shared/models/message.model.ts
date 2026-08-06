export interface ParticipantSummary {
  id: number;
  name: string;
}

export interface MessagePreview {
  body: string;
  createdAt: string;
  senderId: number;
}

export interface Thread {
  id: number;
  /** Nulo quando a sessão de origem já foi cancelada. */
  appointmentId: number | null;
  contextLabel: string;
  otherParticipant: ParticipantSummary | null;
  lastMessage: MessagePreview | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  threadId: number;
  senderId: number;
  senderName: string;
  body: string;
  createdAt: string;
}

/** Forma do Slice<T> devolvido por GET /api/threads/{id}/messages. */
export interface MessageSlice {
  content: ChatMessage[];
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}
