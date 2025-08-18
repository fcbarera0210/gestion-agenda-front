import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const getClientByEmail = functions.https.onCall(async (data) => {
  const email = (data.email as string | undefined)?.trim().toLowerCase();
  if (!email) {
    return { name: '', phone: '' };
  }

  const snapshot = await admin
    .firestore()
    .collection('clients')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { name: '', phone: '' };
  }

  const client = snapshot.docs[0].data() as { name?: string; phone?: string };
  return {
    name: client.name || '',
    phone: client.phone || '',
  };
});
