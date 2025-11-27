import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function MultiplayerGame() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (roomCode) {
      loadGame();
    }
  }, [roomCode]);

  async function loadGame() {
    const { data: room, error } = await supabase
      .from("rooms")
      .select("questions")
      .eq("code", roomCode)
      .single();

    if (error || !room) {
      alert("Error loading game");
      return;
    }

    // Randomize questions locally
    const shuffled = [...room.questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setStartTime(Date.now());
    setLoading(false);
  }

  async function handleAnswer(answer) {
    if (selectedAnswer) return; // Prevent double clicks
    setSelectedAnswer(answer);

    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(s => s + 1);
    }

    // Wait a bit before next question
    setTimeout(async () => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
      } else {
        await finishGame(score + (isCorrect ? 1 : 0));
      }
    }, 1000);
  }

  async function finishGame(finalScore) {
    const timeTaken = Date.now() - startTime;
    
    // Get player ID (we need to know who we are)
    // Since we didn't store player ID in local state/context, we might need to find by name/room or store ID in localStorage
    // For now, let's assume we can find the player by room_code and maybe we stored player ID in localStorage or session
    // Or we can just update based on room_code and some other identifier. 
    // Actually, JoinRoom didn't save player ID. Let's fix that assumption.
    // Ideally we should have stored the player ID in localStorage when joining/creating.
    
    // Let's assume for this hackathon scope we can identify by something or just update the row that has status 'joined' and matching room_code? 
    // No, that would update everyone.
    
    // FIX: We need to store player ID. 
    // I will update JoinRoom and CreateRoom to store player ID in localStorage.
    // For now, I'll write this code assuming I have the ID.
    
    const playerId = localStorage.getItem("quiz_player_id");

    if (playerId) {
        await supabase
          .from("players")
          .update({ 
              score: finalScore, 
              time_taken: timeTaken, 
              status: "finished" 
          })
          .eq("id", playerId);
    }

    navigate(`/leaderboard/${roomCode}`);
  }

  if (loading) return <div className="text-white text-center mt-20">Loading game...</div>;

  const question = questions[currentIndex];
  const options = [...question.options].sort(() => Math.random() - 0.5); // Randomize options too if needed, or assume they come randomized

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-blue-400">Question {currentIndex + 1}/{questions.length}</span>
            <span className="text-xl font-mono text-yellow-400">Score: {score}</span>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl mb-8">
            <h2 className="text-2xl font-semibold mb-6">{question.question}</h2>
            
            <div className="grid grid-cols-1 gap-4">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedAnswer !== null}
                        className={`p-4 rounded-lg text-left transition-all transform hover:scale-102 ${
                            selectedAnswer === opt 
                                ? opt === question.correctAnswer 
                                    ? "bg-green-600 border-2 border-green-400" 
                                    : "bg-red-600 border-2 border-red-400"
                                : selectedAnswer !== null && opt === question.correctAnswer
                                    ? "bg-green-600 border-2 border-green-400 opacity-70"
                                    : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
