export const API_BASE_URL = 'https://api.scaneats.app';

export const googleLogin = async (idToken: string) => {
  if (!idToken) {
    throw new Error('Google ID token is missing.');
  }

  const response = await fetch(`${API_BASE_URL}/api/googleauth/onetap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    let errorMsg = 'Google One Tap login failed.';
    try {
        const errorData = await response.json();
        if (errorData.error) {
            errorMsg = errorData.error;
        } else if (errorData.details) {
            errorMsg = errorData.details.map((d: any) => d.description).join(', ');
        }
    } catch {
        // Keep generic message
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data.token || !data.user || !data.user.id || !data.user.email) {
    throw new Error('Invalid response received from server.');
  }
  
  return {
    token: data.token,
    userId: data.user.id,
    userEmail: data.user.email,
  };
};
