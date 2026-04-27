// Firebase App/Auth/Firestore を初期化してエクスポートする
// 設定値はクライアントSDKの公開前提のため直書きする（仕様書 §2）
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCsCsRjah82Ix4IYZ-PJyEsBvVSQszvwcg",
  authDomain: "task-app-6e764.firebaseapp.com",
  projectId: "task-app-6e764",
  storageBucket: "task-app-6e764.firebasestorage.app",
  messagingSenderId: "948489874503",
  appId: "1:948489874503:web:3629f0f546f5f1bd249562"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
// Firebase Storage — 画像添付機能（F-04）の前提（仕様書 Phase5 §1）
export const storage = getStorage(app);
