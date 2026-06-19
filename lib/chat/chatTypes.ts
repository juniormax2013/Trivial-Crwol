export type ChatType = 'global' | 'private' | 'match' | 'clan';

export interface ChatUser {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export interface ChatRoom {
  id: string; // Document ID (e.g. 'global_main', 'private_uid1_uid2', 'match_gameId')
  type: ChatType;
  participants: string[];
  createdAt: any;
  updatedAt: any;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageAt: any;
  // Dynamic fields parsed in client
  displayName?: string;
  photoURL?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: any;
  deleted: boolean;
  reportedCount: number;
}
