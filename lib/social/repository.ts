// ---------------------------------------------------------------
// SOCIAL MODULE — REPOSITORY
// ---------------------------------------------------------------

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy,
  limit,
  or
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FriendRequest, Friendship } from './models';
import { AppUserModel } from '@/lib/user/models';

const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const FRIENDSHIPS_COLLECTION = 'friendships';
const USERS_COLLECTION = 'users';

/**
 * HELPER: Generate Friendship ID
 * Sorts UIDs alphabetically to ensure unique ID regardless of who invited who
 */
export function getFriendshipId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(sender: AppUserModel, receiver: AppUserModel): Promise<void> {
  const requestId = `${sender.uid}_${receiver.uid}`;
  const docRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  
  const now = new Date().toISOString();
  const request: FriendRequest = {
    id: requestId,
    senderId: sender.uid,
    senderName: sender.fullName || sender.username,
    senderAvatar: sender.photoURL || null,
    receiverId: receiver.uid,
    receiverName: receiver.fullName || receiver.username,
    receiverAvatar: receiver.photoURL || null,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(docRef, request);
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string, senderId: string, receiverId: string): Promise<void> {
  // Update request status
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  await updateDoc(requestRef, {
    status: 'accepted',
    updatedAt: new Date().toISOString()
  });

  // Create Friendship
  const friendshipId = getFriendshipId(senderId, receiverId);
  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  
  const friendship: Friendship = {
    id: friendshipId,
    user1Id: senderId,
    user2Id: receiverId,
    createdAt: new Date().toISOString()
  };
  
  await setDoc(friendshipRef, friendship);
}

/**
 * Reject / Delete a friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: new Date().toISOString()
  });
}

/**
 * Cancel a friend request (sender deletes it)
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  await deleteDoc(requestRef);
}

/**
 * Remove a friend
 */
export async function removeFriend(uid1: string, uid2: string): Promise<void> {
  const friendshipId = getFriendshipId(uid1, uid2);
  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  await deleteDoc(friendshipRef);
  
  // Clean up any old requests to prevent UI weirdness
  const id1 = `${uid1}_${uid2}`;
  const id2 = `${uid2}_${uid1}`;
  await deleteDoc(doc(db, FRIEND_REQUESTS_COLLECTION, id1));
  await deleteDoc(doc(db, FRIEND_REQUESTS_COLLECTION, id2));
}

/**
 * Get all pending requests for a user (either received or sent)
 */
export async function getPendingFriendRequests(uid: string, type: 'received' | 'sent'): Promise<FriendRequest[]> {
  const field = type === 'received' ? 'receiverId' : 'senderId';
  
  const q = query(
    collection(db, FRIEND_REQUESTS_COLLECTION),
    where(field, '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as FriendRequest);
}

/**
 * Get Friends list for a user
 */
export async function getFriendsList(uid: string): Promise<AppUserModel[]> {
  // Find friendships where user1Id == uid OR user2Id == uid
  const q1 = query(collection(db, FRIENDSHIPS_COLLECTION), where('user1Id', '==', uid));
  const q2 = query(collection(db, FRIENDSHIPS_COLLECTION), where('user2Id', '==', uid));
  
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const friendUids = [
    ...snap1.docs.map(doc => (doc.data() as Friendship).user2Id),
    ...snap2.docs.map(doc => (doc.data() as Friendship).user1Id)
  ];
  
  if (friendUids.length === 0) return [];
  
  // Fetch user profiles (Note: 'in' queries support max 10 elements. To support more, we'd chunk array or fetch individually)
  // For simplicity, we fetch them individually here to avoid 'in' limits if friends > 10.
  const friendDocs = await Promise.all(
    friendUids.map(fUid => getDoc(doc(db, USERS_COLLECTION, fUid)))
  );
  
  return friendDocs
    .filter(d => d.exists())
    .map(d => d.data() as AppUserModel);
}

/**
 * Search users by username (exact or starts with)
 * Firestore doesn't do great wildcard search without standard extensions, 
 * but we can fetch recent active users or simple matches.
 */
export async function searchGlobalUsers(searchTerm: string, limitCount = 50): Promise<AppUserModel[]> {
  const termLowercase = searchTerm.toLowerCase();
  
  // Since we want case-insensitive substring search for both username and fullName,
  // and we don't have Algolia or a dedicated lowercase field, we will fetch recent users
  // and filter them in memory. In a large production app, you would use Algolia or Typesense.
  const q = query(
    collection(db, USERS_COLLECTION),
    limit(200) // fetch a pool of users to search through
  );
  const snap = await getDocs(q);
  
  const allUsers = snap.docs.map(doc => doc.data() as AppUserModel);
  
  const matchedUsers = allUsers.filter(u => {
    const un = u.username?.toLowerCase() || '';
    const fn = u.fullName?.toLowerCase() || '';
    const em = u.email?.toLowerCase() || '';
    return un.includes(termLowercase) || fn.includes(termLowercase) || em.includes(termLowercase);
  });
  
  return matchedUsers.slice(0, limitCount);
}

/**
 * Check relationship status between two users
 */
export async function checkFriendshipStatus(
  myUid: string, 
  otherUid: string
): Promise<{ status: 'none' | 'friends' | 'pending_sent' | 'pending_received'; requestId?: string }> {
  if (myUid === otherUid) return { status: 'none' };
  
  // Check if they are friends
  const friendshipId = getFriendshipId(myUid, otherUid);
  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const friendshipDoc = await getDoc(friendshipRef);
  if (friendshipDoc.exists()) {
    return { status: 'friends' };
  }
  
  // Check if myUid sent a request to otherUid
  const sentId = `${myUid}_${otherUid}`;
  const sentRef = doc(db, FRIEND_REQUESTS_COLLECTION, sentId);
  const sentDoc = await getDoc(sentRef);
  if (sentDoc.exists() && sentDoc.data()?.status === 'pending') {
    return { status: 'pending_sent', requestId: sentId };
  }
  
  // Check if myUid received a request from otherUid
  const receivedId = `${otherUid}_${myUid}`;
  const receivedRef = doc(db, FRIEND_REQUESTS_COLLECTION, receivedId);
  const receivedDoc = await getDoc(receivedRef);
  if (receivedDoc.exists() && receivedDoc.data()?.status === 'pending') {
    return { status: 'pending_received', requestId: receivedId };
  }
  
  return { status: 'none' };
}
