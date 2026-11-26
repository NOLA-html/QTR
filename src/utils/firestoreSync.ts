import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase.ts';

export const ADMIN_EMAIL = 'n10a.yt@gmail.com';
const NORMALIZED_ADMIN_EMAIL = ADMIN_EMAIL.trim().toLowerCase();

/**
 * Signs in with a real Google/Firebase session.
 *
 * The server independently verifies the Firebase ID token, so this client-side
 * check is only an early access gate and is not the security boundary.
 */
export async function signInAdminForFirestore() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;
  const email = (user.email || '').trim().toLowerCase();
  const verified = user.emailVerified;

  // Do not leave an unauthorized account signed in on this browser.
  if (!verified || email !== NORMALIZED_ADMIN_EMAIL) {
    await signOut(auth);
  }

  return {
    email: user.email || '',
    verified,
    user,
  };
}

export async function signOutAdminFromFirestore(): Promise<void> {
  await signOut(auth);
}

export function isFirebaseAdminSignedIn(): boolean {
  const user = auth.currentUser;
  return Boolean(
    user &&
    user.emailVerified &&
    (user.email || '').trim().toLowerCase() === NORMALIZED_ADMIN_EMAIL
  );
}

// Product catalogue synchronisation is intentionally not implemented here.
// Keep these compatibility exports inert until a real Firestore product schema
// and security rules are defined; admin authentication must never be simulated.
export async function syncProductToFirestore(_product?: unknown): Promise<void> {}

export async function deleteProductFromFirestore(_productId?: string): Promise<void> {}

export async function syncAllProductsToFirestore(_products?: unknown): Promise<void> {}

export async function fetchProductsFromFirestore(): Promise<never[]> {
  return [];
}
