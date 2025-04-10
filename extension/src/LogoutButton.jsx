import React from 'react';
import { logout } from './firebase'; // Adjust path if necessary

const LogoutButton = () => {
    return (
        <button onClick={logout}>
            Logout
        </button>
    );
};

export default LogoutButton
