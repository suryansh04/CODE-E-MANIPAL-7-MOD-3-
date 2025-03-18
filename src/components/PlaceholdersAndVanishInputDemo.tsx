import type React from "react";
import { PlaceholdersAndVanishInput } from "./PlaceholdersAndVanishInput";
import { SparklesCore } from "../ui/sparkles";
export default function PlaceholdersAndVanishInputDemo() {
  const placeholders = [
    'I am "audience" teach me this "topic"?',
    "Explain the Pythagorean Theorem with animation",
    'I am "audience"  teach me this "topic"?',
    "Show me how derivatives work with graphs",
    "Give a visual explanation of linear transformations in 3D",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  return (
    // <div className="h-screen flex flex-col justify-center items-center px-4 bg-black">
    //   <div className="w-full absolute inset-0 h-screen">
    //     <SparklesCore
    //       id="tsparticlesfullpage"
    //       background="transparent"
    //       minSize={0.6}
    //       maxSize={1.4}
    //       particleDensity={100}
    //       className="w-full h-full"
    //       particleColor="#FFFFFF"
    //     />
    //   </div>
    // <h2 className="mb-10  text-xl text-center sm:text-5xl text-white ">
    //   Ask Me Anything
    // </h2>
    // <PlaceholdersAndVanishInput
    //   placeholders={placeholders}
    //   onChange={handleChange}
    //   onSubmit={onSubmit}
    // />
    // </div>
    <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <h2 className="mb-10  text-xl text-center sm:text-5xl text-white ">
        Ask Me Anything
      </h2>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
