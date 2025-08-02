
// This is a placeholder utility. In a real application, you would use
// a library like 'jsonwebtoken' to handle JWT verification.
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    nameid: string;
    // Add other properties from your token payload as needed
}

export function verifyJwt(token: string): { userId: string } | null {
  try {
    // Note: jwt-decode does not validate the signature.
    // In a real backend, you MUST validate the token signature using a secret key.
    const decoded = jwtDecode<DecodedToken>(token);
    return { userId: decoded.nameid };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
