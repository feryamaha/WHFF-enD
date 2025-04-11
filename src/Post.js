import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import PostHeader from './PostHeader';
import { ThemeContext } from './App';
import './styles/Post.scss';

export default function Post(props) {
    const { themeColors } = useContext(ThemeContext);

    return (
        <article className={`post ${themeColors.theme}`}>
            <h1 className={themeColors.theme}>{props.post.name}</h1>
            <p className={themeColors.theme}>{props.post.subtitle}</p>
            <p className={`likes ${themeColors.theme}`}>Média: {props.post.likes}</p>
            <PostHeader
                post={{
                    id: props.post.id,
                    title: props.post.name,
                    read: props.post.read,
                }}
            />
        </article>
    );
}

Post.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        subtitle: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
        read: PropTypes.bool.isRequired,
    }).isRequired,
};

