
"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"

interface Flashcard {
  question: string;
  answer: string;
}

interface Matching {
  terms: string[];
  definitions: string[];
}

export default function QuizGame() {
  const [filedetails, setFiledetails] = useState<any[]>([]);
  const [currentfile, setCurrentfile] = useState('');
  const [format, setFormat] = useState('');
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // For flashcards
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // For matching game
  const [matchedPairs, setMatchedPairs] = useState<{[key: number]: number}>({});
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [incorrectMatch, setIncorrectMatch] = useState<boolean>(false);

  async function fileselect(val: string) {
    setCurrentfile(val);
    // Reset game state when selecting a new file
    setQuizData(null);
    setGameStarted(false);
    setFlashcards([]);
  }

  async function handleradiochange(e: any) {
    setFormat(e.target.value);
    // Reset game state when changing format
    setQuizData(null);
    setGameStarted(false);
    setFlashcards([]);
  }

  async function callgeneratequiz() {
    try {
      setLoading(true);
      const response: any = await axios.post('/api/generateflashcards', {
        filename: currentfile,
        format
      });

      if (format === 'matching') {
        const matchingData = response.data.matching || { terms: [], definitions: [] };
        setQuizData(matchingData);
        // Shuffle definitions for matching game
        const shuffled = [...(matchingData.definitions || [])];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledDefinitions(shuffled);
      } else {
        // For flashcards - the response.data.flashcards is already an array of flashcards
        console.log("Flashcards data:", response.data.flashcards);
        if (Array.isArray(response.data.flashcards)) {
          setFlashcards(response.data.flashcards);
        } else {
          console.error("Unexpected flashcards format:", response.data.flashcards);
          setFlashcards([]);
        }
      }
      
      // Reset game state
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setMatchedPairs({});
      setSelectedTerm(null);
      setSelectedDefinition(null);
      setGameStarted(true);
      
    } catch (e: any) {
      console.error("Error generating quiz:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleTermClick(index: number) {
    if (!quizData || !quizData.terms || !quizData.definitions || !shuffledDefinitions.length) {
      return;
    }

    if (Object.keys(matchedPairs).includes(index.toString())) {
      return;
    }
    
    setSelectedTerm(index);
    setIncorrectMatch(false);
    
    // If a definition is already selected, check if it's a match
    if (selectedDefinition !== null) {
      // Need to find the original index of the definition in the shuffled array
      const definitionIndex = shuffledDefinitions.findIndex(
        def => def === quizData.definitions[index]
      );
      
      if (selectedDefinition === definitionIndex) {
        // It's a match!
        setMatchedPairs({...matchedPairs, [index]: selectedDefinition});
      } else {
        // Not a match - show red highlight
        setIncorrectMatch(true);
      }
      
      // Reset selections after a short delay
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
        setIncorrectMatch(false);
      }, 1000);
    }
  }

  function handleDefinitionClick(index: number) {
    if (!quizData || !quizData.terms || !quizData.definitions || !shuffledDefinitions.length) {
      return;
    }

    // Check if this definition is already matched
    if (Object.values(matchedPairs).includes(index)) {
      return;
    }
    
    setSelectedDefinition(index);
    setIncorrectMatch(false);
    
    // If a term is already selected, check if it's a match
    if (selectedTerm !== null) {
      // Need to find the original index of the definition in the shuffled array
      const definitionIndex = shuffledDefinitions.findIndex(
        def => def === quizData.definitions[selectedTerm]
      );
      
      if (index === definitionIndex) {
        // It's a match!
        setMatchedPairs({...matchedPairs, [selectedTerm]: index});
      } else {
        // Not a match - show red highlight
        setIncorrectMatch(true);
      }
      
      // Reset selections after a short delay
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
        setIncorrectMatch(false);
      }, 1000);
    }
  }

  function toggleAnswer() {
    setIsFlipping(true);
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setTimeout(() => {
        setIsFlipping(false);
      }, 250);
    }, 250);
  }

  function nextCard() {
    if (flashcards.length > 0 && currentCardIndex < flashcards.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        setTimeout(() => {
          setIsFlipping(false);
        }, 250);
      }, 250);
    }
  }

  function prevCard() {
    if (currentCardIndex > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
        setShowAnswer(false);
        setTimeout(() => {
          setIsFlipping(false);
        }, 250);
      }, 250);
    }
  }

  function resetGame() {
    setGameStarted(false);
    setQuizData(null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setMatchedPairs({});
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setFlashcards([]);
  }

  useEffect(() => {
    async function findfiledetails() {
      try {
        const response: any = await axios.get('/api/findtext');
        setFiledetails(response.data.filedetails || []);
      } catch (e) {
        console.error("Error fetching file details:", e);
        setFiledetails([]);
      }
    }
    findfiledetails();
  }, []);

  const titleColor = "#1F6E7D"; // RGB: 31, 110, 125

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen font-sans relative">
      {/* Added navigation button to the top right */}
      <div className="absolute top-4 right-4">
        <Link href="/" passHref>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 font-bold"
            style={{fontFamily: "'Montserrat', sans-serif"}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </button>
        </Link>
      </div>
      
      <h1 className="text-4xl font-extrabold text-center mb-8 tracking-tight" style={{fontFamily: "'Poppins', sans-serif", color: titleColor}}>Interactive Study Quiz</h1>
      
      {!gameStarted ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
          <h2 className="text-2xl font-bold mb-6" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Select a File and Quiz Format</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {filedetails && filedetails.map((val: any, index) => (
              <button 
                key={index}
                onClick={() => fileselect(val.filename)}
                className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md font-medium ${
                  currentfile === val.filename 
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md' 
                    : 'bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-100 text-indigo-700 hover:border-indigo-300'
                }`}
                style={{fontFamily: "'Nunito', sans-serif"}}
              >
                {val.filename}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-8 mb-8">
            <div className="flex items-center space-x-3">
              <input 
                type="radio" 
                id="flashcards-option"
                onChange={handleradiochange} 
                value="flashcards" 
                checked={format === 'flashcards'}
                className="w-5 h-5 text-indigo-600"
              />
              <label htmlFor="flashcards-option" className="text-lg text-gray-800 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>Flashcards</label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="radio" 
                id="matching-option"
                onChange={handleradiochange} 
                value="matching" 
                checked={format === 'matching'}
                className="w-5 h-5 text-indigo-600"
              />
              <label htmlFor="matching-option" className="text-lg text-gray-800 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>Matching</label>
            </div>
          </div>
          
          <button 
            disabled={!format || !currentfile || loading} 
            onClick={callgeneratequiz}
            className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto font-bold ${
              !format || !currentfile || loading 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
            style={{fontFamily: "'Montserrat', sans-serif"}}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Generate {format}</span>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
          <div className="flex justify-between mb-6 items-center">
            <h2 className="text-2xl font-bold" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>
              {format === 'flashcards' ? 'Flashcards' : 'Matching Game'} - {currentfile}
            </h2>
            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-gray-700 flex items-center space-x-2 font-medium"
              style={{fontFamily: "'Nunito', sans-serif"}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Selection</span>
            </button>
          </div>

          {format === 'flashcards' && flashcards.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className={`w-full max-w-lg bg-black border rounded-2xl shadow-lg overflow-hidden mb-8 perspective-1000 ${isFlipping ? 'cursor-wait' : 'cursor-pointer'}`}>
                <div 
                  className={`relative w-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipping ? (showAnswer ? 'rotate-y-180' : 'rotate-y-0') : (showAnswer ? 'rotate-y-180' : 'rotate-y-0')
                  }`}
                  style={{ transformStyle: 'preserve-3d', minHeight: '300px' }}
                  onClick={toggleAnswer}
                >
                  {/* Question Side */}
                  <div 
                    className="absolute w-full h-full backface-hidden p-8 bg-gradient-to-br from-indigo-50 to-blue-50"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-sm text-gray-500 mb-4 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                    
                    <div className="mb-4 text-center">
                      <h3 className="text-lg font-semibold mb-4" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Question</h3>
                      <div className="p-4 rounded-xl bg-white shadow-inner border border-indigo-100 min-h-32 flex items-center justify-center">
                        <p className="text-gray-800 text-lg font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>{flashcards[currentCardIndex]?.question || "No question available"}</p>
                      </div>
                    </div>
                    
                    <div className="text-center text-indigo-500 mt-6 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
                      <p>Click card to reveal answer</p>
                    </div>
                  </div>
                  
                  {/* Answer Side */}
                  <div 
                    className="absolute w-full h-full backface-hidden p-8 rotate-y-180 bg-gradient-to-br from-blue-50 to-indigo-50"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-sm text-gray-500 mb-4 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                    
                    <div className="mb-4 text-center">
                      <h3 className="text-lg font-semibold mb-4" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Answer</h3>
                      <div className="p-4 rounded-xl bg-white shadow-inner border border-blue-100 min-h-32 flex items-center justify-center">
                        <p className="text-gray-800 text-lg font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>{flashcards[currentCardIndex]?.answer || "No answer available"}</p>
                      </div>
                    </div>
                    
                    <div className="text-center text-blue-500 mt-6 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
                      <p>Click card to see question</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <button 
                  onClick={prevCard}
                  disabled={currentCardIndex === 0 || isFlipping}
                  className={`px-5 py-2 rounded-xl transition-all duration-300 transform flex items-center space-x-2 font-medium ${
                    currentCardIndex === 0 || isFlipping
                      ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:scale-105'
                  }`}
                  style={{fontFamily: "'Nunito', sans-serif"}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <button 
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1 || isFlipping}
                  className={`px-5 py-2 rounded-xl transition-all duration-300 transform flex items-center space-x-2 font-medium ${
                    currentCardIndex === flashcards.length - 1 || isFlipping
                      ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:scale-105'
                  }`}
                  style={{fontFamily: "'Nunito', sans-serif"}}
                >
                  <span>Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : format === 'flashcards' ? (
            <div className="text-center py-12 bg-indigo-50 rounded-xl font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
              <p className="text-gray-600">No flashcards available. Try generating again or selecting a different file.</p>
            </div>
          ) : null}

          {format === 'matching' && quizData && quizData.terms && quizData.definitions ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Terms</h3>
                  <div className="space-y-3">
                    {quizData.terms.map((term: string, index: number) => {
                      const isMatched = Object.keys(matchedPairs).includes(index.toString());
                      const isSelected = selectedTerm === index;
                      const isIncorrect = isSelected && incorrectMatch;
                      
                      return (
                        <div 
                          key={`term-${index}`}
                          onClick={() => handleTermClick(index)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:shadow-md cursor-pointer font-medium ${
                            isMatched
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-300 text-emerald-800'
                              : isIncorrect
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400 shadow-md scale-105 text-amber-900'
                                : isSelected
                                  ? 'bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-400 shadow-md scale-105 text-teal-800'
                                  : 'bg-white border-teal-200 hover:border-teal-300 hover:scale-102 text-gray-800'
                          }`}
                          style={{fontFamily: "'Nunito', sans-serif"}}
                        >
                          {term}
                          {isMatched && (
                            <span className="ml-2 text-emerald-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Definitions</h3>
                  <div className="space-y-3">
                    {shuffledDefinitions.map((definition: string, index: number) => {
                      // Check if this definition has been matched
                      const isMatched = Object.values(matchedPairs).includes(index);
                      const isSelected = selectedDefinition === index;
                      const isIncorrect = isSelected && incorrectMatch;
                      
                      return (
                        <div 
                          key={`def-${index}`}
                          onClick={() => handleDefinitionClick(index)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:shadow-md cursor-pointer font-medium ${
                            isMatched
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-300 text-emerald-800'
                              : isIncorrect
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400 shadow-md scale-105 text-amber-900'
                                : isSelected
                                  ? 'bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-400 shadow-md scale-105 text-teal-800'
                                  : 'bg-white border-blue-200 hover:border-blue-300 hover:scale-102 text-gray-800'
                          }`}
                          style={{fontFamily: "'Nunito', sans-serif"}}
                        >
                          {definition}
                          {isMatched && (
                            <span className="ml-2 text-emerald-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {quizData.terms && Object.keys(matchedPairs).length === quizData.terms.length && (
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-center animate-pulse">
                  <h3 className="text-xl font-bold" style={{fontFamily: "'Montserrat', sans-serif", color: titleColor}}>Congratulations! 🎉</h3>
                  <p className="text-emerald-600 mt-2 font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>You've matched all pairs correctly!</p>
                </div>
              )}
            </div>
          ) : format === 'matching' ? (
            <div className="text-center py-12 bg-indigo-50 rounded-xl font-medium" style={{fontFamily: "'Nunito', sans-serif"}}>
              <p className="text-gray-600">No matching game data available. Try generating again or selecting a different file.</p>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Custom styling for the flip animation and font imports */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}