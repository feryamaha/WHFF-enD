import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from './App';
import './styles/Button.scss';

export default function Button(props) {
    const { theme } = useContext(ThemeContext);

    return (
        <button className={`button ${theme} ${props.className || ''}`} onClick={props.onClick}>
            {props.children}
        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

