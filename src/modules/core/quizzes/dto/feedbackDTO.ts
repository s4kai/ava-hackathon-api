export interface QuizFeedback {
  questionId: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
  studentAnswer: number;
}
