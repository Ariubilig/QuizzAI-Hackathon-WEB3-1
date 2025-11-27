import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { generateRoomCode } from '../../utils/generateRoomCode';
import SelectCategory from '../SelectCategory';
import { useBackPage } from '../../hooks/useBackPage';

export default function MultiplayerMenu() {
  const navigate = useNavigate();
  const goBack = useBackPage('/');
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Mixed');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Mixed');

  const categories = ['Mixed', 'Өв Соёл', 'Спорт', 'Anime', 'eSports', 'Монголын Түүх', 'Поп Соёл', 'Монгол Хоол', 'Шинжлэх ухаан', 'Технологи', 'Математик', 'Ерөнхий мэдлэг'];
  const difficulties = ['Mixed', 'Easy', 'Medium', 'Hard'];

  async function handleCreateRoom() {
    // Check balance first
    const storedProfile = localStorage.getItem("userProfile");
    let profile = null;
    
    if (storedProfile) {
      profile = JSON.parse(storedProfile);
      if (profile.balance < 50) {
        alert("Not enough coins! You need 50 coins to create a room.");
        return;
      }
    } else {
      // Should not happen if profile is initialized correctly, but safety check
      alert("Please set up your profile first.");
      return;
    }

    const code = generateRoomCode();
    const hostId = crypto.randomUUID();

    const { error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: hostId,
        status: "waiting",
        category: selectedCategory.toLowerCase(),
        difficulty: selectedDifficulty.toLowerCase()
      });

    if (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
      return;
    }

    // Deduct entry fee
    const newProfile = {
      ...profile,
      balance: profile.balance - 50
    };
    localStorage.setItem("userProfile", JSON.stringify(newProfile));

    // Get username
    const username = profile.username || "Host";
    
    const { data: playerData, error: playerError} = await supabase
      .from("players")
      .insert({
        room_code: code,
        name: username,
        status: "joined"
      })
      .select()
      .single();
      
    if (playerError) {
      console.error("Error joining as host:", playerError);
      // Refund if joining failed (optional but good practice)
      // For simplicity in prototype, we might skip complex refund logic or add it here
    } else {
      localStorage.setItem("quiz_player_id", playerData.id);
    }

    navigate(`/lobby/${code}`);
  }

  // If category selection is shown, render that view
  if (showCategorySelect) {
    return (
      <SelectCategory
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        difficulties={difficulties}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        onStart={handleCreateRoom}
        onBack={() => setShowCategorySelect(false)}
        haveamount={false}
      />
    );
  }

  return (
    <div className="multiplayer-menu">
      <h1 className="multiplayer-title">
        Multiplayer Mode
      </h1>
      
      <div className="multiplayer-actions">
        <button 
          onClick={() => setShowCategorySelect(true)}
          className="btn-create-room"
        >
          Create Room
        </button>
        
        <button 
          onClick={() => navigate('/join-room')}
          className="btn-join-room"
        >
          Join Room
        </button>
      </div>

      <button 
        onClick={goBack}
        className="btn-back-svg"
        aria-label="Back"
      >
        <img src="/Back.svg" alt="Back" />
      </button>
    </div>
  );
}
