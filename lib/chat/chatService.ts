import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  getDoc,
  startAfter,
  getDocs,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatUser, ChatMessage, ChatRoom } from "./chatTypes";

/**
 * Creates or retrieves a private chatroom between two users.
 */
export async function createOrGetPrivateChat(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  const ids = [currentUserId, otherUserId].sort();
  const chatId = `private_${ids[0]}_${ids[1]}`;
  const chatRef = doc(db, "chats", chatId);

  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    await setDoc(chatRef, {
      type: "private",
      participants: ids,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: "",
      lastMessageSenderId: "",
      lastMessageAt: null,
    });
  }

  return chatId;
}

/**
 * Creates or retrieves a match chatroom for a specific game/duel.
 */
export async function createMatchChat(
  gameId: string,
  participantIds: string[]
): Promise<string> {
  const chatId = `match_${gameId}`;
  const chatRef = doc(db, "chats", chatId);

  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    await setDoc(chatRef, {
      type: "match",
      participants: participantIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: "",
      lastMessageSenderId: "",
      lastMessageAt: null,
    });
  }

  return chatId;
}

/**
 * Sends a message in a chat room and updates the chat metadata.
 */
export async function sendMessage(
  chatId: string,
  text: string,
  currentUser: ChatUser
): Promise<void> {
  const cleanText = text.trim();

  if (!cleanText) return;
  if (cleanText.length > 500) {
    throw new Error("El mensaje no puede tener más de 500 caracteres.");
  }

  const chatRef = doc(db, "chats", chatId);
  const messagesCollection = collection(db, "chats", chatId, "messages");
  const messageRef = doc(messagesCollection);

  const chatSnap = await getDoc(chatRef);
  const exists = chatSnap.exists();

  const batch = writeBatch(db);

  batch.set(messageRef, {
    text: cleanText,
    senderId: currentUser.uid,
    senderName: currentUser.displayName,
    senderAvatar: currentUser.photoURL || "",
    createdAt: serverTimestamp(),
    deleted: false,
    reportedCount: 0,
  });

  if (!exists) {
    // Determine participants: for global_main it's empty, for private it's the two users
    let participants: string[] = [];
    let type = 'global';
    if (chatId.startsWith('private_')) {
      participants = chatId.replace('private_', '').split('_');
      type = 'private';
    } else if (chatId.startsWith('match_')) {
      type = 'match';
    }

    batch.set(chatRef, {
      type,
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: cleanText,
      lastMessageSenderId: currentUser.uid,
      lastMessageAt: serverTimestamp(),
    });
  } else {
    batch.update(chatRef, {
      lastMessage: cleanText,
      lastMessageSenderId: currentUser.uid,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

/**
 * Subscribes to messages in a chatroom with a dynamic limit.
 */
export function subscribeToMessages(
  chatId: string,
  limitCount: number,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    messagesRef,
    where("createdAt", ">=", twentyFourHoursAgo),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ChatMessage))
      .reverse();

    callback(messages);
  });
}

export function getTimestampMs(val: any): number {
  if (!val) return 0;
  if (typeof val.toDate === 'function') {
    return val.toDate().getTime();
  }
  if (val.seconds !== undefined) {
    return val.seconds * 1000;
  }
  if (val instanceof Date) {
    return val.getTime();
  }
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Subscribes to all chatrooms where the user is a participant.
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: ChatRoom[]) => void
) {
  const chatsRef = collection(db, "chats");

  // Query only chats where the user is a participant
  const privateQuery = query(
    chatsRef,
    where("participants", "array-contains", userId),
    limit(50)
  );

  const globalDocRef = doc(db, "chats", "global_main");

  let privateRooms: ChatRoom[] = [];
  let globalRoom: ChatRoom | null = null;

  const triggerCallback = () => {
    const combined = [...privateRooms];
    if (globalRoom) {
      combined.push(globalRoom);
    }
    // Sort combined by updatedAt descending
    combined.sort((a, b) => {
      const aTime = getTimestampMs(a.updatedAt);
      const bTime = getTimestampMs(b.updatedAt);
      return bTime - aTime;
    });
    callback(combined);
  };

  const unsubPrivate = onSnapshot(privateQuery, (snapshot) => {
    privateRooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ChatRoom));
    triggerCallback();
  }, (err) => {
    console.error("Error subscribing to private chats:", err);
  });

  const unsubGlobal = onSnapshot(globalDocRef, (docSnap) => {
    if (docSnap.exists()) {
      globalRoom = {
        id: docSnap.id,
        ...docSnap.data()
      } as ChatRoom;
    } else {
      globalRoom = null;
    }
    triggerCallback();
  }, (err) => {
    console.error("Error subscribing to global chat:", err);
  });

  return () => {
    unsubPrivate();
    unsubGlobal();
  };
}

/**
 * Marks a message as deleted (soft delete).
 */
export async function softDeleteMessage(
  chatId: string,
  messageId: string
): Promise<void> {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  await updateDoc(messageRef, {
    text: "",
    deleted: true,
  });
}

/**
 * Reports a message for moderation.
 */
export async function reportMessage(
  chatId: string,
  messageId: string,
  reporterId: string,
  reason: string
): Promise<void> {
  await addDoc(collection(db, "messageReports"), {
    chatId,
    messageId,
    reporterId,
    reason,
    createdAt: serverTimestamp(),
  });
}

/**
 * Blocks a user.
 */
export async function blockUser(
  currentUserId: string,
  targetUserId: string
): Promise<void> {
  const blockRef = doc(db, "users", currentUserId, "blockedUsers", targetUserId);

  await setDoc(blockRef, {
    blocked: true,
    createdAt: serverTimestamp(),
  });
}
