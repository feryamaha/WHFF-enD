import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './styles/Header.scss';

function Header({ onSelectStack, toggleTheme, changeLanguage, currentTheme, currentLanguage, onStacksLoaded, onReset }) {
    const [stacks, setStacks] = useState([]);

    useEffect(() => {
        fetch('/data/stacks.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao carregar stacks.json: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setStacks(data);
                if (typeof onStacksLoaded === 'function') {
                    onStacksLoaded(data);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar stacks:', error);
                setStacks([]);
            });
    }, [onStacksLoaded]);

    const handleReset = () => {
        onReset();
    };

    return (
        <header className="header">
            <Link to="/" onClick={handleReset}>
                <h1>WHFF-enD</h1>
            </Link>
            <nav>
                <ul>
                    {stacks.length > 0 ? (
                        stacks.map(stack => (
                            <li key={stack.id} onClick={() => onSelectStack(stack.id)}>
                                {stack.title}
                            </li>
                        ))
                    ) : (
                        <li>Carregando...</li>
                    )}
                </ul>
            </nav>
            <div className="header-controls">
                <Button onClick={toggleTheme} className="theme-toggle">
                    {currentTheme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
                        </svg>
                    )}
                </Button>
                <select onChange={(e) => changeLanguage(e.target.value)} value={currentLanguage}>
                    <option value="pt-br">🇧🇷 Português</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                </select>
            </div>
        </header>
    );
}

export default Header;