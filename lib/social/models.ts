// ---------------------------------------------------------------
// SOCIAL MODULE — TYPE MODELS
// ---------------------------------------------------------------

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string; // Document ID
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string | null;
  status: FriendRequestStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Friendship {
  id: string; // user1Id_user2Id (alphabetically sorted)
  user1Id: string;
  user2Id: string;
  createdAt: string;
}
