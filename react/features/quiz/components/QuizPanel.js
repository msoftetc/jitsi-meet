import React, { useState, useEffect } from 'react';
import './QuizPanel.css';

import { connect } from 'react-redux';
import axios from 'axios';

const QuizPanel = ({ isTeacher, roomId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    // Fetch questions from the API
    axios.get(`https://etutor-quiz.vercel.app/api/v1/question/exam/${roomId}?level=1`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('Error fetching quiz questions:', error);
      });
  }, [roomId]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setSelectedOption('');
    setShowAnswer(false);
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-panel">
      <h2>Quiz Time!</h2>
      <p>{currentQuestion.question.name}</p>
      <form>
        {['A', 'B', 'C', 'D'].map(option => (
          <div key={option}>
            <label>
              <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={handleOptionChange}
              />
              {currentQuestion[`opt_${option}`].name}
            </label>
          </div>
        ))}
      </form>
      <button onClick={handleSubmit}>Submit</button>
      {showAnswer && (
        <div>
          {selectedOption === currentQuestion.opt_correct
            ? <p>Correct!</p>
            : <p>Incorrect. The correct answer is {currentQuestion.opt_correct}.</p>}
          {isTeacher && (
            <button onClick={handleNextQuestion}>Next Question</button>
          )}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isTeacher: state['features/base/participants'].localParticipant.role === 'teacher',
    roomId: state['features/base/conference'].room,
  };
};

export default connect(mapStateToProps)(QuizPanel);
