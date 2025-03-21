import React from "react";
import { WavyBackground } from "../ui/wavy-background";
import { ContainerScroll } from "../ui/container-scroll-animation";

const LandingPage = () => {
  return (
    <div>
      <WavyBackground className="max-w-4xl mx-auto pb-40">
        <p className="text-5xl text-white font-bold inter-var text-center">
          Your AI Tutor, Anytime, Anywhere
        </p>
        <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
          Adaptive lessons, intelligent recommendations, and seamless learning
          at your fingertips.
        </p>
      </WavyBackground>
      <div className="flex flex-col overflow-hidden bg-black">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white dark:text-white">
                Learn Smarter with Interactive AI <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  Try Lerno.ai Now{" "}
                </span>
              </h1>
            </>
          }
        >
          <img
            src="../src/assets/lerno01.png"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            alt=""
          />
        </ContainerScroll>
      </div>
    </div>
  );
};

export default LandingPage;
