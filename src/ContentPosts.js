import React, { useEffect, useState } from 'react';
import '/src/styles/Post.scss';

function ContentPosts({ stackId, contentId, contents }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        console.log('ContentPosts - Props:', { stackId, contentId, contents });
        const selectedContent = contents.find(content => content.conceptId === contentId);
        console.log('ContentPosts - Conteúdo selecionado:', selectedContent);

        if (selectedContent) {
            setPosts(selectedContent.posts || []);
        } else {
            setPosts([]);
        }
    }, [contentId, contents, stackId]);

    return (
        <div className="content-posts">
            {posts.length > 0 ? (
                posts.map(post => (
                    <article key={post.id} className="post">
                        <h2>{post.title}</h2>
                        {/* Exibe os três campos de conteúdo em parágrafos separados */}
                        {post.content1 && <p>{post.content1}</p>}
                        {post.content2 && <p>{post.content2}</p>}
                        {post.content3 && <p>{post.content3}</p>}

                        {/* Link para documentação oficial */}
                        {post.docUrl && (
                            <p className="doc-link">
                                <a href={post.docUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#4a90e2' }}>
                                    Documentação oficial!
                                </a>
                            </p>
                        )}

                        {/* Renderiza os exemplos de código */}
                        {post.code && Array.isArray(post.code) && post.code.length > 0 && (
                            post.code.map((codeItem, index) => (
                                <div key={index} className="code-block">
                                    <p><strong>{codeItem.description}</strong></p>
                                    <pre>
                                        <code>{codeItem.javascript}</code>
                                    </pre>
                                </div>
                            ))
                        )}
                    </article>
                ))
            ) : (
                <p>Nenhum conteúdo disponível! Procurando por conteúdos...</p>
            )}
        </div>
    );
}

export default ContentPosts;