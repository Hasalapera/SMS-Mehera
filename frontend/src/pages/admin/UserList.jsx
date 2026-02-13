import React from 'react';
import axios from 'axios';

const UserList = () => {
    

    
    const handleResetPassword = async (user) => {
        const confirmReset = window.confirm(`${user.full_name} Do you need to reset your password?`);
        
        if (confirmReset) {
            const adminPass = prompt("Enter your (Admin) password to confirm:");
            
            if (adminPass) {
                try {
                    const response = await axios.put('/api/users/reset-password', {
                        user_id: user.user_id,
                        role: user.role,
                        email: user.email,
                        full_name: user.full_name,
                        admin_id: loggedInAdminId, 
                        admin_password: adminPass
                    });
                    alert(response.data.message);
                } catch (error) {
                    alert(error.response.data.message || "There was a problem!");
                }
            }
        }
    };

    return (
        <div>
            
            <button onClick={() => handleResetPassword(user)}>Reset Password</button>
        </div>
    );
};

export default UserList;