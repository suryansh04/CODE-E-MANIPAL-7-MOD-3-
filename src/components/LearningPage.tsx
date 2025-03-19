import React, { useState } from "react";
import { HoverBorderGradient } from "@/ui/hover-border-gradient";
import { AnimatedShinyText } from "@/ui/animated-shiny-text";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

const data = {
  title: "Vector Addition",
  video: "src/assets/ComponentwiseVectorAddition.mp4",
  question: "What is the primary purpose of vectors in computing?",
  answers: [
    "A. Data storage only",
    "B. Mathematical operations and graphics",
    "C. Text processing",
    "D. Audio manipulation",
  ],
  correctAnswerIndex: 1,
  narration:
    "Vectors are a fundamental concept in computing, especially in graphics programming and mathematical operations. They help represent directional quantities with both magnitude and direction, making them essential for simulations, animations, and 3D rendering.",
};

const LearningPage = () => {
  const location = useLocation();
  const query = location.state?.query || "Default Topic";
  const FetchData = location.state?.responseData || "No Response Data";
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  function handleAnswerClick(currIndex: number) {
    setSelectedAnswerIndex(currIndex);
    setHasAnswered(true);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-black p-4 md:p-8">
      <div className="z-10 flex mb-8">
        <div
          className={cn(
            "group rounded-full border border-black/5 bg-neutral-900 text-base transition-all ease-in hover:cursor-pointer hover:bg-neutral-800 shadow-lg"
          )}
        >
          <AnimatedShinyText className="inline-flex items-center justify-center px-6 py-2.5 font-medium text-lg transition ease-out">
            <span>{query}</span>
          </AnimatedShinyText>
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl">
        {/* Box 1: Video - Now spans full width on all screens */}
        <div className="relative group overflow-hidden rounded-xl border border-white/10 h-72 md:h-[400px] bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-zinc-900/70 col-span-1 md:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="h-full w-full flex items-center justify-center p-2">
            <div className="w-full h-full max-w-3xl mx-auto">
              <video
                src="src/assets/IntroductionToVector.mp4"
                autoPlay
                muted
                loop
                controls
                className="w-full h-full object-fit rounded-lg"
              ></video>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl"></div>
          <div className="absolute -inset-px bg-gradient-to-r from-purple-500/30 via-transparent to-cyan-500/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        </div>

        {/* Box 2: MCQ Question & Answers */}
        <div className="relative group overflow-hidden rounded-xl border border-white/10 p-4 min-h-[18rem] h-auto bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-zinc-900/70">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-xl font-medium text-white mb-3">Question</h3>
            <p className="text-white/70 mb-4">{data.question}</p>
            <div className="space-y-3 flex-grow">
              {data.answers.map((info, index) => (
                <button
                  className={`w-full text-left px-4 py-2.5 rounded-lg ${
                    selectedAnswerIndex === index &&
                    data.correctAnswerIndex === index
                      ? "bg-green-500/30 border-green-500/50 text-white"
                      : selectedAnswerIndex === index
                      ? "bg-red-500/30 border-red-500/50 text-white"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                  } transition-all duration-200 ${
                    hasAnswered && "cursor-default"
                  }`}
                  onClick={() => !hasAnswered && handleAnswerClick(index)}
                  key={index}
                  disabled={hasAnswered}
                >
                  {info}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute -inset-px bg-gradient-to-r from-blue-500/30 via-transparent to-purple-500/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        </div>

        {/* Box 3: Narration */}
        <div className="relative group overflow-hidden rounded-xl border border-white/10 p-6 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-zinc-900/70">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="relative z-10 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Narration</h3>
            </div>
            <div className="h-36 overflow-y-auto pr-2 text-white/70 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <p>{FetchData}</p>
            </div>
          </div>
          <div className="absolute -inset-px bg-gradient-to-r from-green-500/30 via-transparent to-emerald-500/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        </div>

        {/* Box 4: Next Button */}
        <div className="relative group overflow-hidden rounded-xl border border-white/10 p-6 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-zinc-900/70">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          <div className="h-full w-full flex items-center justify-center relative z-10">
            <HoverBorderGradient
              containerClassName={`rounded-full ${
                !hasAnswered && "opacity-50 pointer-events-none"
              }`}
              as="button"
              className="bg-black text-white flex items-center space-x-2 px-6 py-3"
            >
              <span>Next Lesson</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </HoverBorderGradient>
          </div>
          <div className="absolute -inset-px bg-gradient-to-r from-amber-500/30 via-transparent to-rose-500/30 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
