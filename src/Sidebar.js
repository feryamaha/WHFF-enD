import React from 'react';
import '/src/styles/Sidebar.scss';

function Sidebar({ stackId, stackContents, selectedContent, onSelectContent }) {
    return (
        <aside className="sidebar">
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
                                onClick={() => onSelectContent(contentId)}
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
    );
}

export default Sidebar;