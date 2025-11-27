import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function joinRoom() {
    if (!roomCode || !name) {
      alert("Please enter room code and name");
      return;
    }

    const upperCode = roomCode.toUpperCase();

    // Check if room exists and is waiting
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (roomError || !room) {
      alert("Room not found");
      return;
    }

    if (room.status !== "waiting") {
      alert("Game already started or finished");
      return;
    }

    // Check player count
    const { count, error: countError } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("room_code", upperCode);

    if (count >= 5) {
      alert("Room is full");
      return;
    }

    const { data: playerData, error: joinError } = await supabase
      .from("players")
      .insert({
        room_code: upperCode,
        name,
        status: "joined"
      })
      .select()
      .single();

    if (joinError) {
      console.error("Error joining room:", joinError);
      alert("Failed to join room");
      return;
    }

    localStorage.setItem("quiz_player_id", playerData.id);

    // navigate to lobby page
    navigate(`/lobby/${upperCode}`);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white">Join a Room</h2>
      <input 
        placeholder="Room Code" 
        value={roomCode}
        onChange={e => setRoomCode(e.target.value)} 
        className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
      />
      <input 
        placeholder="Your Name" 
        value={name}
        onChange={e => setName(e.target.value)} 
        className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
      />
      <button 
        onClick={joinRoom}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-all transform hover:scale-105"
      >
        Join Game
      </button>
    </div>
  );
}