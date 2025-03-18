import React from "react";
import { TitleBox } from "../ui/moving-border";
import { HoverBorderGradient } from "@/ui/hover-border-gradient";
import { AnimatedShinyText } from "@/ui/animated-shiny-text";
import { cn } from "@/lib/utils"; // Add this import statement
import TitleComponent from "./TitleComponent";
const info = [
  {
    title: "Vector",
  },
];

const LearningPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
      <TitleComponent title="Vector Algebra" />
    </div>
  );
};

export default LearningPage;
