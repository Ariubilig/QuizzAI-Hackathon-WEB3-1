import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { generateRoomCode } from "../../utils/generateRoomCode";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const [roomCode, setRoomCode] = useState(null);
  const navigate = useNavigate();

  async function createRoom() {
    const code = generateRoomCode();
    const hostId = crypto.randomUUID();

    const { error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: hostId,
        status: "waiting",
        category: "mix", // Default for now, could be selectable
        difficulty: "easy" // Default for now
      });

    if (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
      return;
    }

    // Also add host as a player? Or just host?
    // Let's add host as a player for simplicity so they show up in lobby
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert({
        room_code: code,
        name: "Host", // Could prompt for name
        status: "joined"
      })
      .select()
      .single();
      
    if (playerError) {
        console.error("Error joining as host:", playerError);
    } else {
        localStorage.setItem("quiz_player_id", playerData.id);
    }

    setRoomCode(code);
    navigate(`/lobby/${code}`);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white">Create a Room</h2>
      <button 
        onClick={createRoom}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all transform hover:scale-105"
      >
        Create New Room
      </button>
      {roomCode && <p className="text-gray-300">Your room code: <span className="font-mono font-bold text-yellow-400">{roomCode}</span></p>}
    </div>
  );
}