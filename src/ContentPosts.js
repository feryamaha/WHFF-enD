import React, { useEffect, useState } from 'react';
import Post from './Post';
import '/src/styles/Post.scss';

function ContentPosts({ stackId, contentId }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (stackId && contentId) {
            fetch(`/WHFF-enD/data/${stackId}-${contentId}.json`)
                .then(response => response.json())
                .then(data => setPosts(data))
                .catch(error => console.error('Erro ao carregar posts:', error));
        }
    }, [stackId, contentId]);

    return (
        <div className="content-posts">
            <h2>{contentId.charAt(0).toUpperCase() + contentId.slice(1)}</h2>
            {posts.map(post => (
                <Post key={post.id} title={post.title} content={post.content} />
            ))}
        </div>
    );
}

export default ContentPosts;