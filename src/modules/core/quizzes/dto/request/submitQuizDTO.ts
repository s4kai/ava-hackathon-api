export class SubmitQuizDTO {
  quizId: number;
  studentId: number;
  answers: { questionId: number; answer: number }[];
}
