import React from 'react';
import './styles/IntroSection.scss'; // Importa o IntroSection.scss

function IntroSection({ language, stacks }) {
    return (
        <div className="intro-section">
            <div className="intro-content">
                <div className="stack-grid-left">
                    {stacks.map(stack => (
                        <div key={stack.id} className="stack-item">
                            {stack.title}
                        </div>
                    ))}
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