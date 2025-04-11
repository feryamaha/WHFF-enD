import React from 'react';
import PropTypes from 'prop-types';
import '/src/styles/Post.scss'; // Importando o arquivo de estilos SCSS

function Post({ title, content }) {
    return (
        <article className="post">
            <h3>{title}</h3>
            <p>{content}</p>
        </article>
    );
}

Post.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
};

export default Post;
