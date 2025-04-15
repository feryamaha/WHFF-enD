"use client";

import React, { useState, useEffect, Component } from 'react';
import './styles/IntroSection.scss';
import RotatingText from './RotatingText';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught in IntroSection:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-message">
                    <h2>Algo deu errado!</h2>
                    <p>O componente de texto rotativo não pôde ser carregado.</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        Tentar novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function IntroSection({ language }) {
    const [stacks, setStacks] = useState([]);

    useEffect(() => {
        console.log('Iniciando fetch para stacks.json no IntroSection...');
        fetch('./data/stacks.json')
            .then(response => {
                console.log('Resposta do fetch no IntroSection:', response);
                if (!response.ok) {
                    throw new Error(`Erro ao carregar stacks.json: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Stacks carregados com sucesso no IntroSection:', data);
                setStacks(data);
            })
            .catch(error => {
                console.error('Erro ao carregar stacks no IntroSection:', error);
                setStacks([]);
            });
    }, []);

    return (
        <div className="intro-section">
            <ErrorBoundary>
                <RotatingText
                    texts={['React', 'Bits', 'Is', 'Cool!']}
                    mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                />
            </ErrorBoundary>
        </div>
    );
}

export default IntroSection;