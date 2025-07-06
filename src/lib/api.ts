export const API_BASE_URL = 'https://localhost:7066';

export const googleLogin = async (idToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/googleauth/onetap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to login with Google.');
  }

  return response.json();
};
