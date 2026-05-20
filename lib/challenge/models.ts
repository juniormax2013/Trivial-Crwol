// ---------------------------------------------------------------
// CHALLENGE QUESTIONS — TYPE MODELS
// ---------------------------------------------------------------

export type ChallengeQuestionType = 'multiple_choice' | 'true_false' | 'fill_blanks' | 'match_columns';

export interface ChallengeOption {
  id: string;
  text: string;
}

export interface ChallengeQuestion {
  id: string;
  language: string; // 'es' | 'ht' | 'fr'
  questionType: ChallengeQuestionType;
  questionText: string;
  correctAnswer: string;
  explanation: string;
  bibleReference: string;
  options?: ChallengeOption[]; // For MCQ (options list) and fill_blanks (word bank list)
  matchPairs?: { left: string; right: string }[]; // For columns matching
}
