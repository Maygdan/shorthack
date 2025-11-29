import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startEvent, submitQuiz, submitFeedback } from '../api';

function Event() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await startEvent(id);
        setEvent(data);
        
        // Если это квиз, загружаем вопросы
        if (data.event_type === 'QUIZ') {
          setQuiz(data.quiz);
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAnswer = (questionId, answerId) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    
    if (existingAnswerIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { question_id: questionId, answer_id: answerId };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { question_id: questionId, answer_id: answerId }]);
    }
  };

  const submitQuizHandler = async () => {
    try {
      const result = await submitQuiz(id, answers);
      
      if (result.passed) {
        setQuizCompleted(true);
      }
      
      alert(`Quiz completed! Your score: ${result.score}%`);
    } catch (error) {
      alert('Error submitting quiz. Please try again.');
    }
  };

  const submitFeedbackHandler = async () => {
    try {
      await submitFeedback(id, feedback);
      setFeedbackSubmitted(true);
      alert('Thank you for your feedback!');
    } catch (error) {
      alert('Error submitting feedback. Please try again.');
    }
  };

  if (loading) return <div className="loading-container">Loading event...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="event-container">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Type: {event.event_type}</p>
      <p>Points: {event.points}</p>
      
      {event.event_type === 'QUIZ' && quiz && !quizCompleted && (
        <div className="quiz-container">
          <h2>Quiz</h2>
          {currentQuestion < quiz.questions.length ? (
            <div className="question-container">
              <h3>Question {currentQuestion + 1}</h3>
              <p>{quiz.questions[currentQuestion].question_text}</p>
              <div className="answers-container">
                {quiz.questions[currentQuestion].answers.map(answer => (
                  <button
                    key={answer.id}
                    className={`answer-btn ${answers.find(a => a.question_id === quiz.questions[currentQuestion].id && a.answer_id === answer.id) ? 'selected' : ''}`}
                    onClick={() => handleAnswer(quiz.questions[currentQuestion].id, answer.id)}
                  >
                    {answer.answer_text}
                  </button>
                ))}
              </div>
              <div className="quiz-controls">
                {currentQuestion > 0 && (
                  <button onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                    Previous
                  </button>
                )}
                {currentQuestion < quiz.questions.length - 1 ? (
                  <button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                    Next
                  </button>
                ) : (
                  <button onClick={submitQuizHandler} className="btn primary-btn">
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="quiz-completed">
              <h2>Quiz Completed!</h2>
              <p>Thank you for completing the quiz!</p>
            </div>
          )}
        </div>
      )}
      
      {quizCompleted && !feedbackSubmitted && (
        <div className="feedback-container">
          <h2>Provide Feedback</h2>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${star <= feedback.rating ? 'filled' : ''}`}
                onClick={() => setFeedback({...feedback, rating: star})}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="feedback-textarea"
            placeholder="Your feedback..."
            value={feedback.comment}
            onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
          />
          <button onClick={submitFeedbackHandler} className="btn primary-btn">
            Submit Feedback
          </button>
        </div>
      )}
      
      {feedbackSubmitted && (
        <div className="thank-you-container">
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted.</p>
          <button onClick={() => navigate('/')} className="btn">
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default Event;