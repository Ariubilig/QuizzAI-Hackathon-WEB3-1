import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const { roomCode } = useParams();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomCode) {
      loadBoard();
      
      // Subscribe to updates so we see when others finish
      const channel = supabase
        .channel(`leaderboard-${roomCode}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` },
          loadBoard
        )
        .subscribe();
        
      return () => supabase.removeChannel(channel);
    }
  }, [roomCode]);

  async function loadBoard() {
    const { data } = await supabase
      .from("players")
      .select("name, score, time_taken, status")
      .eq("room_code", roomCode)
      .order("score", { ascending: false })
      .order("time_taken", { ascending: true });

    setBoard(data || []);
    setLoading(false);
  }

  async function handleRematch() {
      // Reset room status to waiting
      await supabase
        .from("rooms")
        .update({ status: "waiting", questions: null })
        .eq("code", roomCode);
        
      // Reset players status? Or create new room?
      // Simpler to create new room or just navigate back to lobby.
      // If we navigate to lobby, we need to make sure lobby handles the reset.
      // Let's just navigate to lobby for now.
      navigate(`/lobby/${roomCode}`);
  }

  if (loading) return <div className="text-white text-center mt-20">Loading results...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-8 text-yellow-500 tracking-wider uppercase">Match Results</h2>
      
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
        <div className="grid grid-cols-12 bg-gray-900 p-4 text-gray-400 font-bold text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center">Time</div>
        </div>
        
        {board.map((p, i) => (
            <div key={i} className={`grid grid-cols-12 p-4 border-b border-gray-700 items-center hover:bg-gray-750 transition-colors ${i === 0 ? 'bg-yellow-900/20' : ''}`}>
                <div className="col-span-1 text-center font-mono text-gray-500">{i + 1}</div>
                <div className="col-span-5 font-semibold text-lg flex items-center gap-3">
                    {i === 0 && <span className="text-yellow-400">👑</span>}
                    {p.name}
                </div>
                <div className="col-span-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        p.status === 'finished' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'
                    }`}>
                        {p.status === 'finished' ? 'Finished' : 'Playing'}
                    </span>
                </div>
                <div className="col-span-2 text-center font-mono text-xl text-blue-400">{p.score}</div>
                <div className="col-span-2 text-center font-mono text-gray-400">
                    {p.time_taken ? `${(p.time_taken / 1000).toFixed(1)}s` : '-'}
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
        >
            Main Menu
        </button>
        <button 
            onClick={handleRematch}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded font-semibold transition-colors"
        >
            Rematch
        </button>
      </div>
    </div>
  );
}