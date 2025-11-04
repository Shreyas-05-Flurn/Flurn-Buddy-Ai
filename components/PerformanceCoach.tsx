import React, { useRef, useEffect, useState } from 'react';

interface PerformanceCoachProps {
    onExit: () => void;
}

const PerformanceCoach: React.FC<PerformanceCoachProps> = ({ onExit }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [feedback, setFeedback] = useState<string>("Initializing camera...");
    
    useEffect(() => {
        let isMounted = true;
        let mediaStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (isMounted) {
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    setFeedback("Position your hands on the keyboard and press 'Analyze'");
                }
            } catch (err) {
                console.error("Camera error:", err);
                if (isMounted) {
                    setFeedback("Could not access camera. Please check permissions.");
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleAnalyze = () => {
        setFeedback("Analyzing...");
        setTimeout(() => {
            // This is a simulation of AI feedback
            const feedbacks = [
                "Great hand posture! Your fingers are nicely curved.",
                "Try to keep your wrists a bit higher to avoid strain.",
                "Your thumb position is perfect for this scale!",
                "Looks good! Make sure your shoulders are relaxed."
            ];
            const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
            setFeedback(randomFeedback);
        }, 2000);
    };

    return (
        <div className="p-4 flex flex-col items-center h-full">
            <div className="w-full flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-slate-400 font-bold hover:text-white">&larr; Back to Buddy Hub</button>
                <h2 className="text-2xl font-bold text-sky-400">Performance Coach</h2>
                <div className="w-24"></div>
            </div>

            <div className="relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden mt-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            </div>
            
            <div className="text-center my-4 p-3 bg-slate-800 rounded-lg w-full">
                <p className="text-lg font-semibold text-yellow-400">{feedback}</p>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={!videoRef.current?.srcObject}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-lg disabled:bg-slate-600"
            >
                Analyze My Posture
            </button>
        </div>
    );
};

export default PerformanceCoach;