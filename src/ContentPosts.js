import React, { useEffect, useState } from 'react';
import Post from './Post';
import '/src/styles/Post.scss';

function ContentPosts({ stackId, contentId, contents }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        // Filtrar o array de conteúdos que corresponde ao contentId
        const selectedContent = contents.find(content => content.conceptId === contentId);
        if (selectedContent) {
            setPosts(selectedContent.posts || []);
        } else {
            setPosts([]);
        }
    }, [contentId, contents]);

    return (
        <div className="content-posts">
            <h2>{contentId.charAt(0).toUpperCase() + contentId.slice(1)}</h2>
            {posts.length > 0 ? (
                posts.map(post => (
                    <Post key={post.id} title={post.title} content={post.content} />
                ))
            ) : (
                <p>Nenhum conteúdo disponível para este conceito.</p>
            )}
        </div>
    );
}

export default ContentPosts;