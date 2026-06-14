// ---------------------------------------------------------------
// CACHE MODULE — ANSWERS & PROGRESS SYNC QUEUE
// Guarda en memoria y localStorage las respuestas y el progreso
// del jugador para enviarlos en lotes (batching) y soportar offline.
// ---------------------------------------------------------------

import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updatePlayerProgress } from '@/lib/arena/repository';

export interface PendingProgress {
  id: string; // unique identifier for queue
  type: 'crown_arena' | 'reto_sagrado';
  roomId: string;
  userId: string;
  score: number;
  currentQuestion: number;
  isFinished: boolean;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'bc_pending_progress_queue';

class ProgressQueue {
  private queue: PendingProgress[] = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    // Iniciar auto-sync cada 15 segundos si estamos en el cliente
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
      setInterval(() => this.sync(), 15000);
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      console.error('[ProgressQueue] Error al cargar cola:', e);
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[ProgressQueue] Error al guardar cola:', e);
    }
  }

  /**
   * Encola una actualización de progreso.
   * Si es el final de la partida (isFinished = true), intenta forzar el sync inmediato.
   */
  public enqueue(
    type: 'crown_arena' | 'reto_sagrado',
    roomId: string,
    userId: string,
    score: number,
    currentQuestion: number,
    isFinished: boolean
  ) {
    // Evitar duplicados del mismo tipo, room y user. Nos quedamos con el más reciente.
    this.queue = this.queue.filter(
      item => !(item.type === type && item.roomId === roomId && item.userId === userId && !isFinished)
    );

    const pendingItem: PendingProgress = {
      id: `${type}_${roomId}_${userId}_${currentQuestion}_${Date.now()}`,
      type,
      roomId,
      userId,
      score,
      currentQuestion,
      isFinished,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(pendingItem);
    this.saveQueue();

    // Si es final o la cola tiene varios elementos, o si estamos online, intentar sync
    if (isFinished || this.queue.length >= 3) {
      this.sync();
    }
  }

  /**
   * Sincroniza todos los elementos pendientes en la cola con Firebase.
   */
  public async sync(): Promise<void> {
    if (this.isSyncing || this.queue.length === 0) return;
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.log('[ProgressQueue] Dispositivo offline, posponiendo sincronización.');
      return;
    }

    this.isSyncing = true;
    console.log(`[ProgressQueue] Sincronizando ${this.queue.length} actualizaciones de progreso...`);

    const itemsToProcess = [...this.queue];

    for (const item of itemsToProcess) {
      try {
        if (item.type === 'crown_arena') {
          await updatePlayerProgress(
            item.roomId,
            item.userId,
            item.score,
            item.currentQuestion,
            item.isFinished
          );
        } else {
          // Reto Sagrado
          const playerRef = doc(db, `reto_sagrado_rooms/${item.roomId}/players`, item.userId);
          await setDoc(
            playerRef,
            {
              score: item.score,
              currentQuestion: item.currentQuestion,
              isFinished: item.isFinished,
              updatedAt: new Date(item.timestamp).toISOString(),
            },
            { merge: true }
          );
        }

        // Eliminar de la cola si tuvo éxito
        this.queue = this.queue.filter(q => q.id !== item.id);
        this.saveQueue();
      } catch (error) {
        console.error(`[ProgressQueue] Error al sincronizar elemento ${item.id}:`, error);
        item.retries += 1;
        
        // Si falló más de 5 veces, lo removemos para no bloquear la cola indefinidamente
        if (item.retries > 5) {
          this.queue = this.queue.filter(q => q.id !== item.id);
          this.saveQueue();
        }
      }
    }

    this.isSyncing = false;
  }

  /**
   * Fuerza el envío inmediato de todo el progreso acumulado de un juego específico.
   */
  public async forceFlush(roomId: string, userId: string): Promise<void> {
    // Filtrar elementos correspondientes a esta partida
    const matchItems = this.queue.filter(item => item.roomId === roomId && item.userId === userId);
    if (matchItems.length === 0) return;

    console.log(`[ProgressQueue] Flushing inmediato para sala ${roomId}...`);
    await this.sync();
  }

  /**
   * Obtiene el tamaño actual de la cola.
   */
  public getPendingCount(): number {
    return this.queue.length;
  }
}

export const progressSyncQueue = new ProgressQueue();
