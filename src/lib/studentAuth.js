/**
 * studentAuth.js
 * Student portal authentication system.
 * Uses Firestore collection 'studentPasswords' to store hashed passwords.
 * Default password: firstName + "123"  (e.g., "أوس غياضة" → "أوس123")
 *
 * NOTE: No real cryptography needed here — this is an educational app
 * with no sensitive data. We use a simple reversible encoding sufficient
 * to prevent casual snooping in Firestore.
 */

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ─── Session helpers ──────────────────────────────────────────────────────────
const SESSION_KEY = 'student_session';

/** Save the logged-in student id to sessionStorage */
export function saveSession(studentId) {
  sessionStorage.setItem(SESSION_KEY, studentId);
}

/** Get the current logged-in student id (or null) */
export function getSession() {
  return sessionStorage.getItem(SESSION_KEY);
}

/** Clear the student session */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Password encoding (simple, non-secure — educational use only) ─────────
function encode(plain) {
  // btoa with Unicode support
  return btoa(unescape(encodeURIComponent(plain)));
}

function decode(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return null;
  }
}

// ─── Default password logic ────────────────────────────────────────────────
/**
 * Generate the default password for a student.
 * Takes the first word of the name + "123".
 * e.g., "أوس غياضة" → "أوس123"
 */
export function defaultPassword(fullName) {
  const firstName = (fullName || '').trim().split(/\s+/)[0] || 'student';
  return firstName + '123';
}

// ─── Firestore password document ──────────────────────────────────────────────
function pwDocRef(studentId) {
  return doc(db, 'studentPasswords', studentId);
}

/**
 * Get the stored encoded password for a student.
 * If none stored, returns the default encoded password.
 */
async function getStoredPassword(studentId, studentName) {
  try {
    const snap = await getDoc(pwDocRef(studentId));
    if (snap.exists() && snap.data().pw) {
      return snap.data().pw;
    }
  } catch (e) {
    console.warn('studentAuth: Firestore read failed, using default', e);
  }
  // Fall back to default
  return encode(defaultPassword(studentName));
}

/**
 * Attempt login.
 * @returns {{ success: boolean, error?: string }}
 */
export async function loginStudent(studentId, studentName, enteredPassword) {
  try {
    const storedEncoded = await getStoredPassword(studentId, studentName);
    const enteredEncoded = encode(enteredPassword);
    if (storedEncoded === enteredEncoded) {
      saveSession(studentId);
      return { success: true };
    }
    return { success: false, error: 'كلمة المرور غير صحيحة' };
  } catch (e) {
    return { success: false, error: 'حدث خطأ، حاول مرة أخرى' };
  }
}

/**
 * Change a student's password.
 * Requires the old password for verification.
 * @returns {{ success: boolean, error?: string }}
 */
export async function changePassword(studentId, studentName, oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' };
  }
  try {
    const storedEncoded = await getStoredPassword(studentId, studentName);
    if (encode(oldPassword) !== storedEncoded) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    await setDoc(pwDocRef(studentId), { pw: encode(newPassword), updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (e) {
    return { success: false, error: 'فشل الحفظ، تحقق من الاتصال بالإنترنت' };
  }
}
