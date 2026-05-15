import { doc, runTransaction, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "users";

export async function buyResource(
  uid: string,
  type: 'energy' | 'heart',
  amount: number,
  cost: number,
  currencyType: 'coin' | 'crown' = 'coin'
): Promise<boolean> {
  const userRef = doc(db, COLLECTION_NAME, uid);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("Usuario no encontrado.");
      }

      const userData = userSnap.data();
      const currentBalance = currencyType === 'coin' ? (userData.coins ?? 0) : (userData.crowns ?? 0);

      if (currentBalance < cost) {
        throw new Error(currencyType === 'coin' ? "Ou pa gen ase kòb." : "Ou pa gen ase kouwòn.");
      }

      const field = type === 'energy' ? 'jweEnergy' : 'jweHearts';
      const currentAmount = userData[field] ?? 0;
      const limit = type === 'energy' ? 100 : 10;

      if (currentAmount + amount > limit) {
        throw new Error(`Ou pa kapab gen plis pase ${limit} ${type === 'energy' ? 'enèji' : 'kè'}.`);
      }

      transaction.update(userRef, {
        [currencyType === 'coin' ? 'coins' : 'crowns']: currentBalance - cost,
        [field]: currentAmount + amount,
        updatedAt: new Date().toISOString(),
      });
    });
    return true;
  } catch (error: any) {
    console.error(`Error comprando ${type}:`, error);
    throw error;
  }
}

export async function buyPower(
  uid: string,
  powerId: string,
  amount: number,
  cost: number,
  currencyType: 'coin' | 'crown' = 'coin'
): Promise<boolean> {
  const userRef = doc(db, COLLECTION_NAME, uid);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("Usuario no encontrado.");
      }

      const userData = userSnap.data();
      const currentBalance = currencyType === 'coin' ? (userData.coins ?? 0) : (userData.crowns ?? 0);

      if (currentBalance < cost) {
        throw new Error(currencyType === 'coin' ? "No tienes suficientes monedas." : "No tienes suficientes coronas.");
      }

      const inventory = userData.inventory || {};
      const currentPowerAmount = inventory[powerId] || 0;

      transaction.update(userRef, {
        [currencyType === 'coin' ? 'coins' : 'crowns']: currentBalance - cost,
        [`inventory.${powerId}`]: currentPowerAmount + amount,
        updatedAt: new Date().toISOString(),
      });
    });
    return true;
  } catch (error: any) {
    console.error(`Error comprando poder ${powerId}:`, error);
    throw error;
  }
}

export async function buyCosmetic(
  uid: string,
  type: 'frame' | 'avatar',
  itemId: string,
  cost: number,
  currencyType: 'coin' | 'crown' = 'coin'
): Promise<boolean> {
  const userRef = doc(db, COLLECTION_NAME, uid);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("Usuario no encontrado.");
      }

      const userData = userSnap.data();
      const currentBalance = currencyType === 'coin' ? (userData.coins ?? 0) : (userData.crowns ?? 0);

      const ownedField = type === 'frame' ? 'ownedFrames' : 'ownedAvatars';
      const ownedItems = userData[ownedField] || [];

      if (ownedItems.includes(itemId)) {
        throw new Error("Ya posees este artículo.");
      }

      if (currentBalance < cost) {
        throw new Error(currencyType === 'coin' ? "No tienes suficientes monedas." : "No tienes suficientes coronas.");
      }

      transaction.update(userRef, {
        [currencyType === 'coin' ? 'coins' : 'crowns']: currentBalance - cost,
        // Since firestore doesn't natively have arrayUnion in transaction without FieldValue, we reconstruct:
        [ownedField]: [...ownedItems, itemId],
        updatedAt: new Date().toISOString(),
      });
    });
    return true;
  } catch (error: any) {
    console.error(`Error comprando cosmético ${itemId}:`, error);
    throw error;
  }
}

export async function equipCosmetic(
  uid: string,
  type: 'frame' | 'avatar',
  itemId: string | null
): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, uid);
  const activeField = type === 'frame' ? 'activeFrame' : 'activeAvatar';

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;

      if (itemId !== null) {
        const ownedField = type === 'frame' ? 'ownedFrames' : 'ownedAvatars';
        const ownedItems = userSnap.data()[ownedField] || [];
        if (!ownedItems.includes(itemId)) {
          throw new Error("No posees este artículo.");
        }
      }

      transaction.update(userRef, {
        [activeField]: itemId,
        updatedAt: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error(`Error equipando ${type}:`, error);
    throw error;
  }
}

export async function consumePower(
  uid: string,
  powerId: string
): Promise<boolean> {
  const userRef = doc(db, COLLECTION_NAME, uid);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("Usuario no encontrado.");
      }

      const userData = userSnap.data();
      const inventory = userData.inventory || {};
      const currentPowerAmount = inventory[powerId] || 0;

      if (currentPowerAmount <= 0) {
        throw new Error("No tienes unidades de este poder.");
      }

      transaction.update(userRef, {
        [`inventory.${powerId}`]: currentPowerAmount - 1,
        updatedAt: new Date().toISOString(),
      });
    });
    return true;
  } catch (error: any) {
    console.error(`Error consumiendo poder ${powerId}:`, error);
    throw error;
  }
}
