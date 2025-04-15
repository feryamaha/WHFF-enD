import React, { useState } from 'react';
import '/src/styles/Sidebar.scss';

function Sidebar({ stackId, stackContents, selectedContent, onSelectContent }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleContentClick = (contentId) => {
        onSelectContent(contentId);
        setIsMenuOpen(false);
    };

    return (
        <>
            <button
                className={`sidebar-toggle ${isMenuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle sidebar menu"
            >
                <span></span>
            </button>

            <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
                <h2>{stackId.charAt(0).toUpperCase() + stackId.slice(1)}</h2>
                <ul>
                    {stackContents.length > 0 ? (
                        stackContents.map(content => {
                            const isActive = selectedContent === content.id;
                            const contentId = content.id;
                            return (
                                <li
                                    key={contentId}
                                    className={isActive ? 'active' : ''}
                                    onClick={() => handleContentClick(contentId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {content.title}
                                </li>
                            );
                        })
                    ) : (
                        <li>Problema ao carregar os conceitos...</li>
                    )}
                </ul>
            </aside>
        </>
    );
}

export default Sidebar;