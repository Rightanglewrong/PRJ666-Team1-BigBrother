// src/utils/emailAPI

const BACKEND_URL = 'https://big-brother-be-3d6ad173758c.herokuapp.com/smail';

// Function to send emails based on account type and locationID
export const sendEmailsToUsers = async (token, accountType, locationID, subject, message) => {
  try {
    const response = await fetch(`${BACKEND_URL}/sendEmails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accountType, locationID, subject, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send emails');
    }

    return await response.json();
  } catch (error) {
    //console.error("Error sending emails:", error);
    throw error;
  }
};
