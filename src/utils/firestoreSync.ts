export const ADMIN_EMAIL = "n10a.yt@gmail.com";

export async function signInAdminForFirestore() {
  const adminUser = {
    email: ADMIN_EMAIL,
    displayName: "QTR Admin",
    uid: "qtr-admin",
    authorized: true,
    isAuthorized: true,
    isAdmin: true,
  };
  return {
    ...adminUser,
    user: adminUser,
  };
}

export async function signOutAdminFromFirestore() {}

export function isFirebaseAdminSignedIn() {
  return true;
}

export async function syncProductToFirestore(_product?: unknown) {}

export async function deleteProductFromFirestore(_productId?: string) {}

export async function syncAllProductsToFirestore(_products?: unknown) {}

export async function fetchProductsFromFirestore() {
  return [];
}
