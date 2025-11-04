import React, { useState } from 'react';
import Header from '../components/Header';
import { useUserProgress } from '../context/UserProgressContext';
import { MOCK_LEAGUE_MEMBERS, LEAGUE_TIERS } from '../constants';

const LeaderboardScreen: React.FC = () => {
    const { progress } = useUserProgress();
    const [activeTab, setActiveTab] = useState<'league' | 'friends'>('league');

    const leagueData = [
        ...MOCK_LEAGUE_MEMBERS.map(m => ({ ...m, isCurrentUser: false })),
        { name: progress.nickname, xp: progress.league.xp, avatar: progress.avatar, isCurrentUser: true },
    ].sort((a, b) => b.xp - a.xp);

    const friendsData = [
        ...progress.friends,
        { id: 'you', name: progress.nickname, xp: progress.xp, avatar: progress.avatar },
    ].sort((a, b) => b.xp - a.xp);
    
    const leagueInfo = LEAGUE_TIERS[progress.league.tier];

    const renderLeagueList = () => (
        <div className="space-y-3">
            <div className="text-center my-4 p-3 bg-slate-800 rounded-lg">
                <h3 className={`text-2xl font-bold ${leagueInfo.color}`}>{leagueInfo.icon} {leagueInfo.name}</h3>
                <p className="text-slate-400">Top 3 promote, bottom 3 relegate. Ends Monday.</p>
            </div>

            {leagueData.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = user.isCurrentUser;
                let rankZoneClass = 'bg-slate-800';
                if (rank <= 3) rankZoneClass = 'bg-green-500/20'; // Promotion Zone
                if (rank > leagueData.length - 3) rankZoneClass = 'bg-red-500/20'; // Demotion Zone
                if (isCurrentUser) rankZoneClass = 'bg-green-500/30 border-2 border-green-500';

                return (
                    <div key={index} className={`flex items-center p-3 rounded-lg ${rankZoneClass}`}>
                        <div className="flex items-center w-12 font-bold text-lg">
                            <span className="text-slate-400">{rank}</span>
                            <span className="ml-2 text-2xl">{user.avatar}</span>
                        </div>
                        <div className="flex-grow mx-4">
                            <p className={`font-bold ${isCurrentUser ? 'text-green-300' : 'text-slate-200'}`}>{user.name}</p>
                        </div>
                        <div className="font-bold text-yellow-400">{user.xp} XP</div>
                    </div>
                );
            })}
        </div>
    );

    const renderFriendsList = () => (
        <div className="space-y-3">
             {friendsData.map((user, index) => {
                const isCurrentUser = user.id === 'you';
                return (
                    <div key={user.id} className={`flex items-center p-3 rounded-lg ${isCurrentUser ? 'bg-green-500/30 border-2 border-green-500' : 'bg-slate-800'}`}>
                        <div className="flex items-center w-12 font-bold text-lg">
                            <span className="text-slate-400">{index + 1}</span>
                            <span className="ml-2 text-2xl">{user.avatar}</span>
                        </div>
                        <div className="flex-grow mx-4">
                            <p className={`font-bold ${isCurrentUser ? 'text-green-300' : 'text-slate-200'}`}>{user.name}</p>
                        </div>
                        <div className="font-bold text-yellow-400">{user.xp} XP</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col h-full text-white">
            <Header />
            <div className="flex-grow overflow-y-auto p-6">
                <h2 className="text-3xl font-extrabold text-center mb-6 text-yellow-400">Leaderboards</h2>
                
                <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
                    <button onClick={() => setActiveTab('league')} className={`w-1/2 p-2 rounded font-bold ${activeTab === 'league' ? 'bg-green-500 text-white' : 'text-slate-400'}`}>Leagues</button>
                    <button onClick={() => setActiveTab('friends')} className={`w-1/2 p-2 rounded font-bold ${activeTab === 'friends' ? 'bg-green-500 text-white' : 'text-slate-400'}`}>Friends</button>
                </div>

                {activeTab === 'league' ? renderLeagueList() : renderFriendsList()}
            </div>
        </div>
    );
};

export default LeaderboardScreen;