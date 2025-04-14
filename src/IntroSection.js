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
                <div className="stack-grid-left">
                    {stacks.length > 0 ? (
                        stacks.map(stack => (
                            <div key={stack.id} className="stack-item">
                                {stack.title}
                            </div>
                        ))
                    ) : (
                        <div className="stack-item">Carregando...</div>
                    )}
                    <div className="label">
                        {language === 'pt-br' ? '' : language === 'en' ? 'Stacks with Dependencies' : 'Stacks con Dependencias'}
                    </div>
                </div>

                <div className="stack-grid-right">
                    <div className="stack-item">Posts</div>
                    <div className="stack-item">Conteúdos</div>
                    <div className="stack-item">Depedências</div>
                    <div className="label">
                        {language === 'pt-br' ? '' : language === 'en' ? 'Static Assets' : 'Activos Estáticos'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IntroSection;