import React from 'react';
import '/src/styles/Sidebar.scss';

function Sidebar({ stackId, stackContents, selectedContent, onSelectContent }) {
    return (
        <aside className="sidebar">
            <h2>{stackId.charAt(0).toUpperCase() + stackId.slice(1)}</h2>
            <ul>
                {stackContents.length > 0 ? (
                    stackContents.map(content => (
                        <li
                            key={content.id}
                            className={selectedContent === content.id ? 'active' : ''}
                            onClick={() => onSelectContent(content.id)}
                        >
                            {content.title}
                        </li>
                    ))
                ) : (
                    <li>Nenhum conceito disponível.</li>
                )}
            </ul>
        </aside>
    );
}

export default Sidebar;