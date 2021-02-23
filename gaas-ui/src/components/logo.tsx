import * as React from 'react';
import logo from './assets/logo.png';

export const Logo = () => {
    return (
        <img
            alt="Logo"
            src={logo}
            style={{
                display: 'block',
                justifyContent: 'space-around',
                width: '200px',
                marginLeft: 'auto',
                marginRight: 'auto',
            }}
        />
    );
};
