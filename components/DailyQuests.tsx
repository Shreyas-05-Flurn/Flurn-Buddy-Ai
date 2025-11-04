import React from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { Quest } from '../types';
import { useSoundEffects } from '../audio/useSoundEffects';

const QuestItem: React.FC<{ quest: Quest }> = ({ quest }) => {
    const { claimQuestReward } = useUserProgress();
    const { playSuccess } = useSoundEffects();
    const isComplete = quest.progress >= quest.target;
    const progressPercentage = (quest.progress / quest.target) * 100;

    const handleClaim = () => {
        if (isComplete && !quest.isClaimed) {
            playSuccess();
            claimQuestReward(quest.id);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-200">{quest.description}</p>
                <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            <button
                onClick={handleClaim}
                disabled={!isComplete || quest.isClaimed}
                className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${
                    isComplete && !quest.isClaimed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : quest.isClaimed
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-slate-700 text-slate-400 cursor-default'
                }`}
            >
                {quest.isClaimed ? 'Claimed' : `💎 ${quest.reward.tokens}`}
            </button>
        </div>
    );
};


const DailyQuests: React.FC = () => {
    const { progress } = useUserProgress();
    const { quests } = progress.dailyQuests;

    if (!quests || quests.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-800 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-lg text-yellow-400 mb-3">Daily Quests</h3>
            <div className="space-y-3">
                {quests.map(quest => <QuestItem key={quest.id} quest={quest} />)}
            </div>
        </div>
    );
};

export default DailyQuests;
