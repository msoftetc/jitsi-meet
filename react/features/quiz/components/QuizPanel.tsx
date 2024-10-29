// react/features/quiz/components/QuizPanel.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
import { connect , ConnectedProps} from 'react-redux';
import axios from 'axios';
import { IReduxState } from '../../app/types'; // Adjust the import path as necessary
import { getLocalParticipant } from '../../base/participants/functions';
import { IJitsiConference } from '../../base/conference/reducer';

interface QuestionOption {
  name: string;
}

interface Question {
  _id: string;
  id: string;
  exam_id: string;
  opt_correct: string;
  __v: number;
  description: string;
  question: {
    name: string;
  };
  opt_A: QuestionOption;
  opt_B: QuestionOption;
  opt_C: QuestionOption;
  opt_D: QuestionOption;
  exam: string;
}
const mapStateToProps = (state: IReduxState) => {
  const localParticipant = getLocalParticipant(state);
  const roomId = state['features/base/conference'].room || '';

  return {
    isTeacher: localParticipant?.role === 'moderator',
    roomId,
  };
};


const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type QuizPanelProps = PropsFromRedux;

const QuizPanel: React.FC<QuizPanelProps> = ({ isTeacher, roomId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  useEffect(() => {
    const headersList = {
      Accept: "*/*",
      etutor_id: "96712"
    };
  
    // Fetch questions from the API with headers
    axios
      .get<Question[]>(
        "http://localhost:3001/questions.json",
        { headers: headersList }
      )
      .then((response) => {
        setQuestions(response.data);
        //CUSTOM_CONSOLE
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz questions:", error);
      });
  }, [roomId]);

  const handleOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
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
        {['A', 'B', 'C', 'D'].map((option) => {
          const optionKey = `opt_${option}` as keyof Question;
          const optionData = currentQuestion[optionKey] as QuestionOption;

          return (
            <div key={option}>
              <label>
                <input
                  type="radio"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                />
                {optionData.name}
              </label>
            </div>
          );
        })}

      </form>
      <button onClick={handleSubmit}>Submit</button>
      {showAnswer && (
        <div>
          {selectedOption === currentQuestion.opt_correct ? (
            <p>Correct!</p>
          ) : (
            <p>
              Incorrect. The correct answer is {currentQuestion.opt_correct}.
            </p>
          )}
          {isTeacher && <button onClick={handleNextQuestion}>Next Question</button>}
        </div>
      )}
    </div>
  );
};




export default connector(QuizPanel);
