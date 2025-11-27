import React, { useState } from 'react';
import { useBackPage } from '../hooks/useBackPage';

const Profile = ({ onBack, history, balance, stats, username, onUsernameChange }) => {
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [tempUsername, setTempUsername] = useState(username);

    // Determine if onBack is a path string or undefined
    const backPath = typeof onBack === 'string' ? onBack : undefined;
    const goBack = useBackPage(backPath);

    const handleBack = () => {
        if (typeof onBack === 'function') {
            onBack();
        } else {
            goBack();
        }
    };

    const handleUsernameClick = () => {
        setIsEditingUsername(true);
        setTempUsername(username);
    };

    const handleUsernameSave = () => {
        if (tempUsername.trim()) {
            onUsernameChange(tempUsername.trim());
        }
        setIsEditingUsername(false);
    };

    const handleUsernameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUsernameSave();
        } else if (e.key === 'Escape') {
            setTempUsername(username);
            setIsEditingUsername(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                {isEditingUsername ? (
                    <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        onBlur={handleUsernameSave}
                        onKeyDown={handleUsernameKeyDown}
                        className="username-input"
                        autoFocus
                        maxLength={20}
                    />
                ) : (
                    <h2 onClick={handleUsernameClick} className="username-editable" title="Click to edit">
                        {username} ✏️
                    </h2>
                )}
                <div className="balance-card">
                    <span className="balance-label">Balance</span>
                    <span className="balance-amount">{balance} 🪙</span>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{stats.totalGames}</span>
                    <span className="stat-label">Total Games</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value win">{stats.wins}</span>
                    <span className="stat-label">Wins</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value loss">{stats.losses}</span>
                    <span className="stat-label">Losses</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{stats.winRate}%</span>
                    <span className="stat-label">Win Rate</span>
                </div>
            </div>

            <div className="history-section">
                <h3>Match History</h3>
                {history.length === 0 ? (
                    <p className="no-history">No games played yet.</p>
                ) : (
                    <div className="history-list">
                        {history.map((game, index) => (
                            <div key={game.id || index} className={`history-item ${game.result === 'Win' ? 'win-border' : 'loss-border'}`}>
                                <div className="history-main">
                                    <span className="history-category">{game.category}</span>
                                    <span className="history-date">{game.date}</span>
                                </div>
                                <div className="history-details">
                                    <span className="history-score">Score: {game.score}/{game.total}</span>
                                    <span className={`history-result ${game.result === 'Win' ? 'text-win' : 'text-loss'}`}>
                                        {game.result}
                                    </span>
                                    <span className={`history-coins ${game.coinChange > 0 ? 'text-win' : 'text-loss'}`}>
                                        {game.coinChange > 0 ? '+' : ''}{game.coinChange} 🪙
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={handleBack} className="btn-back-svg" aria-label="Back">
                <img src="/Back.svg" alt="Back" />
            </button>
        </div>
    );
};

export default Profile;
