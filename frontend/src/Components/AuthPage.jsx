import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth, provider } from "../firebase";

import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthPage = ({ setIsLoggedIn, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const handleGoogleClick = async () => {
    try {
      await signInWithPopup(auth, provider);

      setPopupMessage("✅ Logged in successfully!");

      setTimeout(() => {
        setIsLoggedIn(true);
        onClose();
      }, 1000);

    } catch (error) {
      console.error(error);
      setPopupMessage("❌ Google sign-in failed.");
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setPopupMessage("⚠️ Please enter email and password.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setPopupMessage("✅ Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setPopupMessage(
          "🎉 Account created successfully!"
        );
      }

      setTimeout(() => {
        setIsLoggedIn(true);
        onClose();
      }, 1000);

    } catch (error) {
      console.error(error);
      setPopupMessage(
        "❌ Authentication failed. Try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative"
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border rounded-lg"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-500 text-white py-3 rounded-lg"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow" />
          <span className="mx-3">or</span>
          <hr className="flex-grow" />
        </div>

        <button
          onClick={handleGoogleClick}
          className="w-full border p-3 rounded-lg"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            className="ml-2 text-teal-600 font-semibold"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {popupMessage && (
          <p className="mt-4 text-center text-teal-600">
            {popupMessage}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;