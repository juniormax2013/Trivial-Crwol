// ---------------------------------------------------------------
// BIBLE JOURNEY MODULE — FIRESTORE REPOSITORY
// ---------------------------------------------------------------

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  increment,
  runTransaction
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateUserStats } from "@/lib/user/repository";
import { BIBLE_LESSONS, getLessonById, LessonQuestion } from "./data";

export interface UserBibleProgress {
  lessonId: string;
  bookId: string;
  unitId: string;
  status: 'locked' | 'unlocked' | 'completed';
  score: number;
  xpEarned: number;
  completedAt: string;
  attempts: number;
}

export interface UserHearts {
  heartsRemaining: number;
  maxHearts: number;
  lastRefillTime: string;
}

export interface UserBibleStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface ReviewQuestion {
  id: string;
  lessonId: string;
  question_type: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  wrongCount: number;
  lastWrongAt: string;
  nextReviewAt: string;
  mastered: boolean;
  correctStreak: number;
}

export interface BibleAchievement {
  id: string;
  title: string;
  description: string;
  icon: string; // footprint, book, fire, shield, chest
  conditionType: string;
  conditionValue: number;
  xpBonus: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const PROGRESS_COLLECTION = "bible_progress";
const HEARTS_COLLECTION = "bible_hearts";
const REVIEWS_COLLECTION = "bible_reviews";
const ACHIEVEMENTS_COLLECTION = "bible_achievements";

// Refill timer rule: 1 heart every 2 hours (7200000 ms)
const REFILL_INTERVAL_MS = 2 * 60 * 60 * 1000; 

// ==========================================
// 1. USER PROGRESS FUNCTIONS
// ==========================================

/**
 * FETCH ALL BIBLE PROGRESS FOR A USER
 * If empty, initializes lesson 1 as 'unlocked' and others as 'locked'
 */
export async function getUserBibleProgress(uid: string): Promise<Record<string, UserBibleProgress>> {
  try {
    const colRef = collection(db, "users", uid, PROGRESS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    const progressMap: Record<string, UserBibleProgress> = {};
    snapshot.docs.forEach(doc => {
      progressMap[doc.id] = doc.data() as UserBibleProgress;
    });

    // If no progress exists, initialize the first lesson as unlocked
    if (Object.keys(progressMap).length === 0) {
      const firstLesson = BIBLE_LESSONS[0];
      const initialProgress: UserBibleProgress = {
        lessonId: firstLesson.id,
        bookId: firstLesson.book_id,
        unitId: firstLesson.unit_id,
        status: 'unlocked',
        score: 0,
        xpEarned: 0,
        completedAt: '',
        attempts: 0
      };

      await setDoc(doc(db, "users", uid, PROGRESS_COLLECTION, firstLesson.id), initialProgress);
      progressMap[firstLesson.id] = initialProgress;
      
      // Lock other lessons in map for simple UI matching
      BIBLE_LESSONS.slice(1).forEach(l => {
        progressMap[l.id] = {
          lessonId: l.id,
          bookId: l.book_id,
          unitId: l.unit_id,
          status: 'locked',
          score: 0,
          xpEarned: 0,
          completedAt: '',
          attempts: 0
        };
      });
    } else {
      // Ensure all loaded lessons are mapped, locking missing ones
      BIBLE_LESSONS.forEach(l => {
        if (!progressMap[l.id]) {
          progressMap[l.id] = {
            lessonId: l.id,
            bookId: l.book_id,
            unitId: l.unit_id,
            status: 'locked',
            score: 0,
            xpEarned: 0,
            completedAt: '',
            attempts: 0
          };
        }
      });
    }

    return progressMap;
  } catch (error) {
    console.error("Error getting user bible progress:", error);
    return {};
  }
}

/**
 * COMPLETE A BIBLE LESSON
 * Saves status, grants rewards (XP/coins/crowns), and unlocks the next lesson in sequence.
 */
export async function completeBibleLesson(
  uid: string,
  lessonId: string,
  stats: { score: number; correctAnswers: number; totalQuestions: number }
): Promise<{ xpEarned: number; coinsEarned: number; crownsEarned: number; nextLessonId: string | null }> {
  try {
    const lesson = getLessonById(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const now = new Date().toISOString();
    const docRef = doc(db, "users", uid, PROGRESS_COLLECTION, lessonId);
    const progressSnap = await getDoc(docRef);
    
    let attempts = 1;
    if (progressSnap.exists()) {
      attempts = (progressSnap.data().attempts || 0) + 1;
    }

    // 1. Calculate Rewards
    let xpEarned = lesson.xp_reward; // e.g. 10 XP for normal, 50 XP for boss
    let coinsEarned = lesson.is_boss_level ? 25 : 10;
    let crownsEarned = lesson.is_boss_level ? 3 : 1;

    // Perfect score bonus (+5 XP, +5 coins)
    const isPerfect = stats.score === 100;
    if (isPerfect) {
      xpEarned += 5;
      coinsEarned += 5;
    }

    // 2. Save Current Lesson Progress
    const progressUpdate: UserBibleProgress = {
      lessonId,
      bookId: lesson.book_id,
      unitId: lesson.unit_id,
      status: 'completed',
      score: stats.score,
      xpEarned,
      completedAt: now,
      attempts
    };
    await setDoc(docRef, progressUpdate, { merge: true });

    // 3. Unlock Next Lesson
    let nextLessonId: string | null = null;
    const nextLesson = BIBLE_LESSONS.find(
      l => l.unit_id === lesson.unit_id && l.order_number === lesson.order_number + 1
    );

    if (nextLesson) {
      nextLessonId = nextLesson.id;
      const nextDocRef = doc(db, "users", uid, PROGRESS_COLLECTION, nextLesson.id);
      const nextSnap = await getDoc(nextDocRef);
      
      // Only set to unlocked if not already completed
      if (!nextSnap.exists() || nextSnap.data().status !== 'completed') {
        await setDoc(nextDocRef, {
          lessonId: nextLesson.id,
          bookId: nextLesson.book_id,
          unitId: nextLesson.unit_id,
          status: 'unlocked',
          score: 0,
          xpEarned: 0,
          completedAt: '',
          attempts: 0
        }, { merge: true });
      }
    }

    // 4. Update Global User Stats
    await updateUserStats(uid, {
      xp: xpEarned,
      coins: coinsEarned,
      crowns: crownsEarned,
      correctAnswers: stats.correctAnswers,
      totalQuestionsPlayed: stats.totalQuestions
    });

    // 5. Update Streak and Check Achievements
    await updateBibleStreak(uid);
    await checkAndAwardAchievements(uid);

    return { xpEarned, coinsEarned, crownsEarned, nextLessonId };
  } catch (error) {
    console.error("Error completing bible lesson:", error);
    throw error;
  }
}

// ==========================================
// 2. LIVES & HEARTS MANAGEMENT
// ==========================================

/**
 * GET USER BIBLE HEARTS WITH TIME-BASED AUTO REFILLS
 */
export async function getUserHearts(uid: string): Promise<UserHearts> {
  const defaultState: UserHearts = {
    heartsRemaining: 5,
    maxHearts: 5,
    lastRefillTime: new Date().toISOString()
  };

  try {
    const docRef = doc(db, "users", uid, HEARTS_COLLECTION, "state");
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, defaultState);
      return defaultState;
    }

    const state = snap.data() as UserHearts;
    
    // Check if auto-refill is needed
    if (state.heartsRemaining < state.maxHearts) {
      const now = new Date();
      const lastRefill = new Date(state.lastRefillTime);
      const timeDiffMs = now.getTime() - lastRefill.getTime();
      
      if (timeDiffMs >= REFILL_INTERVAL_MS) {
        const heartsToAdd = Math.floor(timeDiffMs / REFILL_INTERVAL_MS);
        const newHearts = Math.min(state.maxHearts, state.heartsRemaining + heartsToAdd);
        
        // Calculate new aligned refill time
        const newRefillTime = new Date(lastRefill.getTime() + (heartsToAdd * REFILL_INTERVAL_MS)).toISOString();
        
        const updatedState: UserHearts = {
          heartsRemaining: newHearts,
          maxHearts: state.maxHearts,
          lastRefillTime: newHearts === state.maxHearts ? now.toISOString() : newRefillTime
        };
        
        await setDoc(docRef, updatedState);
        return updatedState;
      }
    }

    return state;
  } catch (error) {
    console.error("Error getting user hearts:", error);
    return defaultState;
  }
}

/**
 * CONSUME A HEART ON INCORRECT ANSWERS
 */
export async function consumeHeart(uid: string): Promise<UserHearts> {
  try {
    const docRef = doc(db, "users", uid, HEARTS_COLLECTION, "state");
    const currentState = await getUserHearts(uid);

    if (currentState.heartsRemaining <= 0) {
      return currentState;
    }

    const isStartingRefillTimer = currentState.heartsRemaining === currentState.maxHearts;
    const now = new Date().toISOString();

    const updatedState: UserHearts = {
      ...currentState,
      heartsRemaining: currentState.heartsRemaining - 1,
      lastRefillTime: isStartingRefillTimer ? now : currentState.lastRefillTime
    };

    await setDoc(docRef, updatedState);
    return updatedState;
  } catch (error) {
    console.error("Error consuming heart:", error);
    throw error;
  }
}

/**
 * REFILL A SPECIFIC NUMBER OF HEARTS (Used in reviews or purchases)
 */
export async function refillHearts(uid: string, count: number): Promise<UserHearts> {
  try {
    const docRef = doc(db, "users", uid, HEARTS_COLLECTION, "state");
    const currentState = await getUserHearts(uid);

    const newHearts = Math.min(currentState.maxHearts, currentState.heartsRemaining + count);
    const now = new Date().toISOString();

    const updatedState: UserHearts = {
      ...currentState,
      heartsRemaining: newHearts,
      lastRefillTime: newHearts === currentState.maxHearts ? now : currentState.lastRefillTime
    };

    await setDoc(docRef, updatedState);
    return updatedState;
  } catch (error) {
    console.error("Error refilling hearts:", error);
    throw error;
  }
}

// ==========================================
// 3. STREAK MANAGEMENT
// ==========================================

/**
 * UPDATE BIBLE DAILY STREAK
 */
export async function updateBibleStreak(uid: string): Promise<UserBibleStreak> {
  const docRef = doc(db, "users", uid, HEARTS_COLLECTION, "streak");
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const defaultStreak: UserBibleStreak = {
    currentStreak: 1,
    longestStreak: 1,
    lastActivityDate: todayStr
  };

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, defaultStreak);
      return defaultStreak;
    }

    const data = snap.data() as UserBibleStreak;
    const lastDateStr = data.lastActivityDate;

    if (lastDateStr === todayStr) {
      // Already active today, streak stays the same
      return data;
    }

    const today = new Date(todayStr);
    const lastDate = new Date(lastDateStr);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = data.currentStreak;
    let longest = data.longestStreak;

    if (diffDays === 1) {
      // Consecutive day!
      newStreak += 1;
      if (newStreak > longest) {
        longest = newStreak;
      }
    } else {
      // Streak broken (diffDays > 1)
      newStreak = 1;
    }

    const updatedStreak: UserBibleStreak = {
      currentStreak: newStreak,
      longestStreak: longest,
      lastActivityDate: todayStr
    };

    await setDoc(docRef, updatedStreak);

    // Sync streak inside main user doc also
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      streakDays: newStreak,
      bestStreak: longest,
      updatedAt: new Date().toISOString()
    });

    return updatedStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return defaultStreak;
  }
}

/**
 * FETCH CURRENT STREAK
 */
export async function getBibleStreak(uid: string): Promise<UserBibleStreak> {
  try {
    const docRef = doc(db, "users", uid, HEARTS_COLLECTION, "streak");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserBibleStreak;
    }
  } catch (error) {
    console.error("Error getting streak:", error);
  }
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: "" };
}

// ==========================================
// 4. SPACED REPETITION REVIEW CENTER
// ==========================================

/**
 * SAVE A FAILED QUESTION FOR SPACED REPETITION REVIEW
 */
export async function addQuestionToReview(uid: string, question: LessonQuestion): Promise<void> {
  try {
    const docRef = doc(db, "users", uid, REVIEWS_COLLECTION, question.id);
    const snap = await getDoc(docRef);
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    
    if (snap.exists()) {
      // Question already in review database, increment failures
      await updateDoc(docRef, {
        wrongCount: increment(1),
        lastWrongAt: now.toISOString(),
        nextReviewAt: tomorrow.toISOString(),
        mastered: false,
        correctStreak: 0
      });
    } else {
      // Create new review card
      const newCard: ReviewQuestion = {
        id: question.id,
        lessonId: question.lesson_id,
        question_type: question.question_type,
        questionText: question.question_text,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        options: question.options || undefined,
        wrongCount: 1,
        lastWrongAt: now.toISOString(),
        nextReviewAt: tomorrow.toISOString(),
        mastered: false,
        correctStreak: 0
      };
      await setDoc(docRef, newCard);
    }
  } catch (error) {
    console.error("Error adding question to review:", error);
  }
}

/**
 * FETCH QUESTIONS AVAILABLE FOR REVIEW (nextReviewAt <= now AND mastered == false)
 */
export async function getQuestionsForReview(uid: string): Promise<ReviewQuestion[]> {
  try {
    const colRef = collection(db, "users", uid, REVIEWS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const nowStr = new Date().toISOString();

    const questions: ReviewQuestion[] = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data() as ReviewQuestion;
      // Filter active review cards that are not yet mastered and due for practice
      if (!data.mastered && data.nextReviewAt <= nowStr) {
        questions.push(data);
      }
    });

    return questions;
  } catch (error) {
    console.error("Error getting review questions:", error);
    return [];
  }
}

/**
 * SUBMIT SPACED REPETITION REVIEW ANSWER
 * Implements interval increases: 1 day -> 3 days -> 7 days -> mastered!
 */
export async function submitReviewAnswer(uid: string, questionId: string, isCorrect: boolean): Promise<void> {
  try {
    const docRef = doc(db, "users", uid, REVIEWS_COLLECTION, questionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data() as ReviewQuestion;
    const now = new Date();

    if (isCorrect) {
      const newCorrectStreak = (data.correctStreak || 0) + 1;
      let nextReviewMs = 24 * 60 * 60 * 1000; // 1 day default
      let mastered = false;

      if (newCorrectStreak === 2) {
        nextReviewMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      } else if (newCorrectStreak === 3) {
        nextReviewMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      } else if (newCorrectStreak >= 4) {
        mastered = true;
      }

      const nextReviewDate = new Date(now.getTime() + nextReviewMs).toISOString();

      await updateDoc(docRef, {
        correctStreak: newCorrectStreak,
        nextReviewAt: nextReviewDate,
        mastered,
        lastWrongAt: data.lastWrongAt // stays unchanged
      });

      // Reward: practicing reviews awards +1 heart and +5 XP
      await refillHearts(uid, 1);
      await updateUserStats(uid, {
        xp: 5,
        coins: 2,
        crowns: 0
      });
    } else {
      // Failed again, push back to tomorrow, reset streak
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      await updateDoc(docRef, {
        correctStreak: 0,
        nextReviewAt: tomorrow,
        wrongCount: increment(1),
        lastWrongAt: now.toISOString()
      });
    }
  } catch (error) {
    console.error("Error submitting review answer:", error);
  }
}

// ==========================================
// 5. ACHIEVEMENTS SYSTEM
// ==========================================

const BIBLE_ACHIEVEMENTS_LIST: BibleAchievement[] = [
  {
    id: 'first_step',
    title: 'Primer Paso',
    description: 'Completa tu primera lección del Camino Bíblico.',
    icon: 'footprint',
    conditionType: 'lessons_completed',
    conditionValue: 1,
    xpBonus: 25,
    unlocked: false
  },
  {
    id: 'genesis_student',
    title: 'Estudiante de Génesis',
    description: 'Completa 4 lecciones de Génesis para demostrar tu devoción.',
    icon: 'book',
    conditionType: 'genesis_lessons_completed',
    conditionValue: 4,
    xpBonus: 100,
    unlocked: false
  },
  {
    id: 'fiel_7_days',
    title: '7 Días Fiel',
    description: 'Mantén una racha diaria de estudio de 7 días.',
    icon: 'fire',
    conditionType: 'streak_days',
    conditionValue: 7,
    xpBonus: 150,
    unlocked: false
  },
  {
    id: 'no_errors',
    title: 'Sin errores',
    description: 'Completa una lección perfecta con 100% de precisión.',
    icon: 'shield',
    conditionType: 'perfect_lesson',
    conditionValue: 1,
    xpBonus: 75,
    unlocked: false
  }
];

/**
 * GET USER ACHIEVEMENTS STATUS
 */
export async function getUserAchievements(uid: string): Promise<BibleAchievement[]> {
  try {
    const colRef = collection(db, "users", uid, ACHIEVEMENTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    const unlockedMap: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      unlockedMap[doc.id] = doc.data().unlockedAt;
    });

    return BIBLE_ACHIEVEMENTS_LIST.map(ach => {
      const isUnlocked = !!unlockedMap[ach.id];
      return {
        ...ach,
        unlocked: isUnlocked,
        unlockedAt: unlockedMap[ach.id]
      };
    });
  } catch (error) {
    console.error("Error getting achievements:", error);
    return BIBLE_ACHIEVEMENTS_LIST;
  }
}

/**
 * RUN DYNAMIC CHECKS AND UNLOCK BIBLE JOURNEY BADGES
 */
export async function checkAndAwardAchievements(uid: string): Promise<void> {
  try {
    const progress = await getUserBibleProgress(uid);
    const streak = await getBibleStreak(uid);
    
    // Calculate stats
    const lessonsList = Object.values(progress);
    const completedCount = lessonsList.filter(l => l.status === 'completed').length;
    const completedGenesisCount = lessonsList.filter(l => l.bookId === 'genesis' && l.status === 'completed').length;
    const hasPerfect = lessonsList.some(l => l.status === 'completed' && l.score === 100);

    const achievementsDocRef = collection(db, "users", uid, ACHIEVEMENTS_COLLECTION);

    for (const ach of BIBLE_ACHIEVEMENTS_LIST) {
      let isMet = false;

      if (ach.conditionType === 'lessons_completed' && completedCount >= ach.conditionValue) {
        isMet = true;
      } else if (ach.conditionType === 'genesis_lessons_completed' && completedGenesisCount >= ach.conditionValue) {
        isMet = true;
      } else if (ach.conditionType === 'streak_days' && streak.currentStreak >= ach.conditionValue) {
        isMet = true;
      } else if (ach.conditionType === 'perfect_lesson' && hasPerfect) {
        isMet = true;
      }

      if (isMet) {
        const docRef = doc(achievementsDocRef, ach.id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          const now = new Date().toISOString();
          // Unlock achievement
          await setDoc(docRef, {
            id: ach.id,
            unlockedAt: now
          });
          
          // Reward user XP globally for unlocking this achievement
          await updateUserStats(uid, {
            xp: ach.xpBonus,
            coins: Math.round(ach.xpBonus / 5),
            crowns: 1
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}
