import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function Lobby() {
  const { roomCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) return;

    // Load initial data
    loadRoom();
    loadPlayers();

    // Subscribe to players with unique channel name
    const playersChannel = supabase
      .channel(`room:${roomCode}:players`, {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "players", 
          filter: `room_code=eq.${roomCode}` 
        },
        (payload) => {
          console.log('Player change:', payload);
          loadPlayers();
        }
      )
      .subscribe((status) => {
        console.log('Players subscription status:', status);
      });

    // Subscribe to room status with unique channel name
    const roomChannel = supabase
      .channel(`room:${roomCode}:status`, {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "rooms", 
          filter: `code=eq.${roomCode}` 
        },
        (payload) => {
          console.log('Room change:', payload);
          if (payload.new.status === "playing") {
            navigate(`/game/${roomCode}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Room subscription status:', status);
      });

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomCode]);

  async function loadRoom() {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single();
    
    if (data) {
      setRoom(data);
      
      // Check if current user is the host
      const playerId = localStorage.getItem("quiz_player_id");
      const { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();
      
      if (playerData && playerData.room_code === roomCode) {
        // Check if this player was the first to join (the host)
        const { data: allPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("room_code", roomCode)
          .order("joined_at");
        
        setIsHost(allPlayers && allPlayers[0]?.id === playerId);
      }
      
      // If already playing, redirect
      if (data.status === 'playing') {
        navigate(`/game/${roomCode}`);
      }
    }
  }

  async function loadPlayers() {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("room_code", roomCode)
      .order("joined_at");

    console.log('Loaded players:', data);
    setPlayers(data || []);
  }

  async function hostStart() {
    if (!room) return;

    // Fetch questions from Server API
    try {
        const response = await fetch('http://localhost:3000/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                category: room.category, 
                difficulty: room.difficulty 
            })
        });
        
        if (!response.ok) throw new Error("Failed to fetch questions");
        
        const quizData = await response.json();
        
        // Update room with questions and status
        await supabase
          .from("rooms")
          .update({ 
              status: "playing", 
              questions: quizData.questions 
          })
          .eq("code", roomCode);
          
    } catch (error) {
        console.error("Error starting game:", error);
        alert("Failed to start game");
    }
  }

  async function handleCancel() {
    // Host cancels - delete the room (cascade will delete players)
    await supabase
      .from("rooms")
      .delete()
      .eq("code", roomCode);
    
    localStorage.removeItem("quiz_player_id");
    navigate("/multiplayer");
  }

  async function handleLeave() {
    // Joiner leaves - just remove their player entry
    const playerId = localStorage.getItem("quiz_player_id");
    
    await supabase
      .from("players")
      .delete()
      .eq("id", playerId);
    
    localStorage.removeItem("quiz_player_id");
    navigate("/multiplayer");
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-bold mb-4">Lobby</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <p className="text-xl mb-2">Room Code:</p>
        <p className="text-5xl font-mono font-bold text-yellow-400 tracking-widest mb-6">{roomCode}</p>
        
        <div className="space-y-2 mb-8">
            <h3 className="text-lg font-semibold text-gray-400 border-b border-gray-700 pb-2 mb-4">
              Players ({players.length}/5) {isHost && <span className="text-yellow-400 text-sm">• You are Host</span>}
            </h3>
            {players.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-center gap-2 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-lg">{p.name} {idx === 0 && <span className="text-yellow-400 text-sm">👑</span>}</p>
                </div>
            ))}
            {players.length === 0 && <p className="text-gray-500 italic">Waiting for players...</p>}
        </div>

        <div className="flex gap-3">
            {isHost ? (
              <>
                <button 
                    onClick={handleCancel}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-lg transition-all transform hover:scale-105"
                >
                    Cancel
                </button>
                <button 
                    onClick={hostStart}
                    disabled={players.length === 0}
                    className={`flex-1 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                        players.length > 0 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Start Game
                </button>
              </>
            ) : (
              <button 
                  onClick={handleLeave}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-full font-bold text-lg transition-all transform hover:scale-105"
              >
                  Leave Room
              </button>
            )}
        </div>
      </div>
    </div>
  );
}