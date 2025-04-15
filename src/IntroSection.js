import React, { useState, useEffect } from 'react';
import './styles/IntroSection.scss';

function IntroSection({ language }) {
    const [stacks, setStacks] = useState([]); // Estado local para os stacks

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
            <div className="intro-content">
                { }
            </div>
        </div>
    );
}

export default IntroSection;