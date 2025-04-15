"use client";

import TXTintroRotate from './TXTintroRotate';

const IntroSection = () => {
    return (
        <div className="intro-section">
            <TXTintroRotate
                texts={['React', 'Bits', 'Is', 'Cool!']}
                mainClassName="intro-rotate-text"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="intro-rotate-word"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
            />
        </div>
    );
};

export default IntroSection;