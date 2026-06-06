import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

export interface PixelLabHistoryItem {
  id?: string;
  characterName: string;
  description: string;
  negativeDescription?: string;
  width: number;
  height: number;
  view: string;
  direction: string;
  category: string;
  characterType: string;
  transparent: boolean;
  imageUrl: string;
  type: 'base' | 'rotation' | 'animation';
  createdAt: string;
}

export const pixellabService = {
  /**
   * Generates a base character using PixelLab API via safe backend route
   */
  async generateCharacter(params: {
    description: string;
    width: number;
    height: number;
    negativeDescription?: string;
    view?: string;
    direction?: string;
    noBackground?: boolean;
  }) {
    const response = await fetch('/api/admin/pixellab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateCharacter',
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar el personaje');
    }

    return response.json(); // returns { image: { base64, format, type }, usage }
  },

  /**
   * Generates rotation from a base image
   */
  async generateRotation(params: {
    fromImageBase64: string;
    fromFormat?: string;
    width?: number;
    height?: number;
    fromView?: string;
    toView?: string;
    fromDirection?: string;
    toDirection?: string;
  }) {
    const response = await fetch('/api/admin/pixellab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateRotation',
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar la rotación');
    }

    return response.json();
  },

  /**
   * Generates animation frames from reference image
   */
  async generateAnimation(params: {
    referenceImageBase64: string;
    referenceFormat?: string;
    description?: string;
    actionName?: string;
    width?: number;
    height?: number;
    view?: string;
    direction?: string;
    nFrames?: number;
  }) {
    const response = await fetch('/api/admin/pixellab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateAnimation',
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar la animación');
    }

    return response.json();
  },

  /**
   * Saves generated base64 image data to Firebase Storage and adds metadata history to Firestore.
   * Path: assets/characters/{characterName}/base.png, /rotations/..., /animations/...
   */
  async saveGeneratedAsset(params: {
    characterName: string;
    description: string;
    negativeDescription?: string;
    width: number;
    height: number;
    view: string;
    direction: string;
    category: string;
    characterType: string;
    transparent: boolean;
    base64Data: string;
    type: 'base' | 'rotation' | 'animation';
  }): Promise<string> {
    const { characterName, base64Data, type } = params;
    const cleanName = characterName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();

    let storagePath = `assets/characters/${cleanName}/base.png`;
    if (type === 'rotation') {
      storagePath = `assets/characters/${cleanName}/rotations/rotation_${timestamp}.png`;
    } else if (type === 'animation') {
      storagePath = `assets/characters/${cleanName}/animations/animation_${timestamp}.png`;
    }

    // 1. Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    // Remove dataUrl prefix if present
    const base64Content = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;

    await uploadString(storageRef, base64Content, 'base64', {
      contentType: 'image/png'
    });

    const downloadUrl = await getDownloadURL(storageRef);

    // 2. Add history record to Firestore
    const historyItem: PixelLabHistoryItem = {
      characterName: params.characterName,
      description: params.description,
      negativeDescription: params.negativeDescription || '',
      width: params.width,
      height: params.height,
      view: params.view,
      direction: params.direction,
      category: params.category,
      characterType: params.characterType,
      transparent: params.transparent,
      imageUrl: downloadUrl,
      type,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'pixellab_history'), historyItem);

    return downloadUrl;
  },

  /**
   * Retrieves last generated items from Firestore
   */
  async getGenerationHistory(limitCount: number = 20): Promise<PixelLabHistoryItem[]> {
    try {
      const q = query(
        collection(db, 'pixellab_history'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PixelLabHistoryItem[];
    } catch (e) {
      console.error("Error fetching PixelLab history:", e);
      return [];
    }
  }
};
