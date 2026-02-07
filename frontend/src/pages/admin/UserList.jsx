import React from 'react';
import axios from 'axios';

const UserList = () => {
    // ලොග් වී සිටින ඇඩ්මින්ගේ ID එක (සාමාන්‍යයෙන් මෙය localStorage හෝ Context එකක ඇත)
    const loggedInAdminId = localStorage.getItem('user_id'); 

    // මෙන්න මෙතැනට ඔයාගේ කේතය ඇතුළත් කරන්න
    const handleResetPassword = async (user) => {
        const confirmReset = window.confirm(`${user.full_name} ගේ මුරපදය Reset කිරීමට අවශ්‍යද?`);
        
        if (confirmReset) {
            const adminPass = prompt("තහවුරු කිරීමට ඔබේ (Admin) මුරපදය ඇතුළත් කරන්න:");
            
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
                    alert(error.response.data.message || "ප්‍රශ්නයක් ඇති වුණා!");
                }
            }
        }
    };

    return (
        <div>
            {/* පරිශීලක ලැයිස්තුව පෙන්වන තැන බටන් එකක් මෙන්න මේ වගේ දාන්න */}
            <button onClick={() => handleResetPassword(user)}>Reset Password</button>
        </div>
    );
};

export default UserList;