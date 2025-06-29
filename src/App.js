import React, { useState, useEffect } from 'react';
import './App.css';
import QuotesBackground from './QuotesBackground';
import questions from './questionsData';
import advices from './advicesData';

function App() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

useEffect(() => {
  let copyAttempts = 0;

  const handleCopy = (e) => {
    copyAttempts += 1;

    if (copyAttempts === 1) {
      alert("⚠️ Copying content is restricted. Please respect the creator’s work.");
    } else if (copyAttempts >= 2) {
      alert("This site will now close due to repeated copy attempts.");
      window.close(); // Try closing the window
      // If it fails (in most modern browsers), redirect instead:
      window.location.href = "about:blank";
    }

    e.preventDefault(); // Prevent actual copy
  };

  document.addEventListener('copy', handleCopy);

  return () => {
    document.removeEventListener('copy', handleCopy);
  };
}, []);

useEffect(() => {
  if (step === 4) {
    sendAnswersToBackend(answers);
    console.log("✅ Sent answers to backend");
  }
}, [step, answers ]);



  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateAnswer = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);

    
  };

  const allAnswered = answers.every((a) => a !== null);

  const clearAnswers = () => {
    setAnswers(Array(questions.length).fill(null));
  };

  const getFinalAdvice = () => {
    let scoreMap = {
      healed: 0,
      healing: 0,
      romantic: 0,
      guarded: 0,
      single: 0,
    };

    answers.forEach((ans) => {
      if (!ans) return;

      const cleaned = ans.replace(/^[A-D]\.\s*/, '').toLowerCase();

      if (cleaned.includes('support') || cleaned.includes('healed') || cleaned.includes('growth')) scoreMap.healed++;
      else if (cleaned.includes('toxic') || cleaned.includes('still') || cleaned.includes('miss')) scoreMap.healing++;
      else if (cleaned.includes('love') || cleaned.includes('feelings') || cleaned.includes('romantic')) scoreMap.romantic++;
      else if (cleaned.includes('guarded') || cleaned.includes('walls') || cleaned.includes('avoid')) scoreMap.guarded++;
      else if (cleaned.includes('single') || cleaned.includes('independent') || cleaned.includes('focused')) scoreMap.single++;
    });

    console.log('Score Map:', scoreMap);

    const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0 || sorted[0][1] === 0) {
      return 'Sorry, we couldn\'t find your advice. Please try again.';
    }

    const topType = sorted[0][0];
    const typeToAdviceKey = {
      healed: 'healed',
      healing: 'healing',
      romantic: 'serialLover',
      guarded: 'guarded',
      single: 'peacefulSingle',
    };

    const finalAdvice = advices[typeToAdviceKey[topType]];
    return finalAdvice || 'Sorry, we couldn\'t find your advice. Please try again.';
  };

async function sendAnswersToBackend(answers) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }), // send full answers array
    });

    if (!response.ok) {
      throw new Error('Failed to save answers');
    }
    const data = await response.json();
    console.log('Answers saved:', data);
  } catch (error) {
    console.error('Error sending answers:', error);
  }
}


return (
  <>
    <QuotesBackground /> {/* keep this outside and above .card */}
    <div className="card">
      {step === 1 && <WelcomePage nextStep={nextStep} />}
      {step === 2 && <ConsentPage nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && (
        <QuestionsPage
          nextStep={nextStep}
          prevStep={prevStep}
          questions={questions}
          answers={answers}
          updateAnswer={updateAnswer}
          allAnswered={allAnswered}
          clearAnswers={clearAnswers}
          sendAnswersToBackend={sendAnswersToBackend}
        />
      )}
      {step === 4 && <AdvicePage prevStep={prevStep} finalAdvice={getFinalAdvice()} />}
    </div>
  </>
);

}

function WelcomePage({ nextStep }) {
  return (
    <>
      <h1>Are you ready to dive deep?</h1>
      <p>This isn’t just another quiz. This is your gentle but brutally honest therapy session. Let’s revisit your past relationships and uncover something real.</p>
      <button onClick={nextStep}>Let's Begin</button>
    </>
  );
}

function ConsentPage({ nextStep, prevStep }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <h2>Before we begin — A sacred agreement</h2>
      <p>Hasil is your guide today. If you believe he is the wisest, wittiest, and most soulful soul therapist you’ll ever meet, please check the box below.</p>
      <label>
        <input
          type="checkbox"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
        I agree that Hasil is the best and I'm ready to explore.
      </label>
      <br />
      <button onClick={prevStep}>Back</button>
      <button onClick={nextStep} disabled={!agreed} style={{ opacity: agreed ? 1 : 0.5 }}>
        Agree & Continue
      </button>
    </>
  );
}

function QuestionsPage({ nextStep, prevStep, questions, answers, updateAnswer, allAnswered, clearAnswers, sendAnswersToBackend }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <h2>Coming up: Deep Relationship Questions</h2>
      <p>We’ll ask you 20 heartfelt questions. Be honest. Be brave. Be you.</p>

      <div className="questions-scroll">
       <form
  onSubmit={async (e) => {
    e.preventDefault();
    if (allAnswered) {
      await sendAnswersToBackend(answers); // ✅ send data to backend
      nextStep(); // move to advice page
    }
  }}
>


          {questions.map((q, idx) => (
            <div key={idx} className="question-block">
              <h3>Q{idx + 1}: {q.text}</h3>
              <div className="options">
                {q.options.map((opt, i) => (
                  <label key={i} className="option-label">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => updateAnswer(idx, opt)}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="nav-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={prevStep}>
              Back
            </button>

            <button
              type="button"
              onClick={clearAnswers}
              style={{
                backgroundColor: '#ff5c5c',
                color: 'white',
                borderRadius: '30px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Clear Answers
            </button>

            <button
              type="submit"
              disabled={!allAnswered}
              style={{ opacity: allAnswered ? 1 : 0.5 }}
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function AdvicePage({ prevStep, finalAdvice }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [feedback, setFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleFeedbackClick = (type) => {
    setFeedback(feedback === type ? null : type);
  };

  const handleStarClick = (star) => {
    setRating(star);
  };

  return (
    <>
      <h2>Your personalized advice is here 💌</h2>

      <div
        className="advice-container"
        style={{
          color: 'black',
          background: 'white',
          padding: '20px',
          whiteSpace: 'pre-line',
          borderRadius: '10px',
          marginBottom: '20px',
        }}
      >
        {finalAdvice}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Was this advice helpful?</h3>
        <button
          onClick={() => handleFeedbackClick('helpful')}
          style={{
            backgroundColor: feedback === 'helpful' ? '#4CAF50' : '#ddd',
            color: feedback === 'helpful' ? 'white' : 'black',
            padding: '10px 20px',
            borderRadius: '30px',
            border: 'none',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          👍 Helpful
        </button>
        <button
          onClick={() => handleFeedbackClick('notHelpful')}
          style={{
            backgroundColor: feedback === 'notHelpful' ? '#f44336' : '#ddd',
            color: feedback === 'notHelpful' ? 'white' : 'black',
            padding: '10px 20px',
            borderRadius: '30px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          👎 Not Helpful
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Rate this advice</h3>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            filled={star <= (hoverRating || rating)}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>

      {/* Back & Done buttons on same line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={prevStep}
          aria-label="Go Back"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '2.5rem',
            cursor: 'pointer',
            color: '#b30059',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ←
        </button>

        <button
  onClick={() => {
    if (window.confirm("Are you sure you want to close the website?")) {
      window.close();
      // fallback for browsers that block window.close()
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 100);
    }
  }}
  style={{
    backgroundColor: '#33cc99',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '30px',
    cursor: 'pointer',
  }}
>
  Done
</button>

      </div>
    </>
  );
}


function Star({ filled, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <span
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: 'pointer',
        color: filled ? '#ffb400' : '#ccc',
        fontSize: '2rem',
        marginRight: '5px',
        userSelect: 'none',
      }}
      role="button"
      aria-label={filled ? 'Filled star' : 'Empty star'}
      tabIndex={0}
    >
      ★
    </span>
  );
}

export default App;
