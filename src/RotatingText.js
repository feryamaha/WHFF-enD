"use client";

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import "./styles/RotatingText.scss";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

const RotatingText = forwardRef((props, ref) => {
    const {
        texts,
        transition = { type: "spring", damping: 25, stiffness: 300 },
        initial = { y: "100%", opacity: 0 },
        animate = { y: 0, opacity: 1 },
        exit = { y: "-120%", opacity: 0 },
        animatePresenceMode = "wait",
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = "first",
        loop = true,
        auto = true,
        splitBy = "characters",
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const splitIntoCharacters = (text) => {
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
            return Array.from(segmenter.segment(text), (segment) => segment.segment);
        }
        return Array.from(text);
    };

    const elements = useMemo(() => {
        const currentText = texts[currentTextIndex];
        if (splitBy === "characters") {
            const words = currentText.split(" ");
            return words.map((word, i) => ({
                characters: splitIntoCharacters(word),
                needsSpace: i !== words.length - 1,
            }));
        }
        if (splitBy === "words") {
            return currentText.split(" ").map((word, i, arr) => ({
                characters: [word],
                needsSpace: i !== arr.length - 1,
            }));
        }
        if (splitBy === "lines") {
            return currentText.split("\n").map((line, i, arr) => ({
                characters: [line],
                needsSpace: i !== arr.length - 1,
            }));
        }
        // For a custom separator
        return currentText.split(splitBy).map((part, i, arr) => ({
            characters: [part],
            needsSpace: i !== arr.length - 1,
        }));
    }, [texts, currentTextIndex, splitBy]);

    const getStaggerDelay = useCallback(
        (index, totalChars) => {
            const total = totalChars;
            if (staggerFrom === "first") return index * staggerDuration;
            if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
            if (staggerFrom === "center") {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === "random") {
                const randomIndex = Math.floor(Math.random() * total);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs(staggerFrom - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
        (newIndex) => {
            setCurrentTextIndex(newIndex);
            if (onNext) onNext(newIndex);
        },
        [onNext]
    );

    useEffect(() => {
        if (!auto) return;
        const interval = setInterval(() => {
            const nextIndex = (currentTextIndex + 1) % texts.length;
            if (nextIndex === 0 && !loop) {
                clearInterval(interval);
                return;
            }
            handleIndexChange(nextIndex);
        }, rotationInterval);
        return () => clearInterval(interval);
    }, [auto, currentTextIndex, handleIndexChange, loop, rotationInterval, texts.length]);

    useImperativeHandle(ref, () => ({
        next: () => handleIndexChange((currentTextIndex + 1) % texts.length),
        previous: () =>
            handleIndexChange((currentTextIndex - 1 + texts.length) % texts.length),
        setIndex: (index) => handleIndexChange(index),
        getIndex: () => currentTextIndex,
    }));

    return (
        <div className={cn("rotating-text", mainClassName)} {...rest}>
            <AnimatePresence
                mode={animatePresenceMode}
                initial={animatePresenceInitial}
            >
                <motion.div
                    key={currentTextIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={transition}
                    className={cn("text-rotate", splitLevelClassName)}
                >
                    {elements.map(({ characters, needsSpace }, wordIndex) => (
                        <div
                            key={wordIndex}
                            className={cn("text-rotate-word", elementLevelClassName)}
                        >
                            {characters.map((char, charIndex) => (
                                <motion.span
                                    key={charIndex}
                                    className="text-rotate-element"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: getStaggerDelay(
                                            charIndex,
                                            characters.length
                                        ),
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                            {needsSpace && (
                                <span className="text-rotate-space">&nbsp;</span>
                            )}
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
});

RotatingText.displayName = "RotatingText";

export default RotatingText;
