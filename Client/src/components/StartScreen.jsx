import React from 'react';

const StartScreen = ({ onStart, onProfile, history, balance, username }) => {
    return (
        <div className="start-screen">
            <div className="profile-btn-container" onClick={onProfile}>
                <span>👤 {username}</span>
                <span className="balance-badge">{balance} 🪙</span>
            </div>

            <div className="start-screen-main">
                <h1>Infinite Quiz AI</h1>
                <p>10 Questions. 45 Seconds. Prove your knowledge.</p>

                <div className="start-actions">
                    <button onClick={onStart} className="btn-primary">Take Quiz</button>
                </div>
            </div>

            {history && history.length > 0 && (
                <div className="history-section">
                    <h3>Recent History</h3>
                    <div className="history-list">
                        {history.map((item, index) => (
                            <div key={index} className="history-item">
                                <div className="history-info">
                                    <span className="history-date">{item.date}</span>
                                    <span className="history-cat">{item.category || 'Mixed'}</span>
                                </div>
                                <span className="history-score">{item.score}/{item.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartScreen;
