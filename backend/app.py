from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import requests
import os

# ==========================
# FLASK SETUP
# ==========================

app = Flask(__name__)
CORS(app)

# ==========================
# MODEL PATH
# ==========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# ==========================
# LOAD EMOTION MODEL
# ==========================
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

EMOTION_MAP = {
    "LABEL_0": "joy",
    "LABEL_1": "sadness",
    "LABEL_2": "anger",
    "LABEL_3": "fear",
    "LABEL_4": "love",
    "LABEL_5": "surprise"
}

# ==========================
# WELLNESS RESPONSES
# ==========================

WELLNESS_RESPONSES = {
    "fear": "I can sense worry. Take a breath — you're safe here. Want to talk?",
    "sadness": "I'm sorry you're feeling this way. I'm here for you.",
    "anger": "That sounds frustrating. Tell me what happened.",
    "joy": "That's wonderful! 😊 Tell me more!",
    "love": "That sounds meaningful 💛",
    "surprise": "That sounds unexpected! 😮"
}

# ==========================
# WELLNESS CHECK
# ==========================

def is_wellness_message(text):
    text = text.lower()

    keywords = [
        "sad", "depressed", "stress", "anxious", "panic",
        "lonely", "hopeless", "crying", "overwhelmed"
    ]

    return any(k in text for k in keywords)

# ==========================
# OLLAMA FUNCTION (FIXED)
# ==========================

def generate_response(user_message, history):
    try:
        messages = [
            {
                "role": "system",
                "content": "You are Auracare AI. Be helpful, friendly, and concise."
            }
        ]

        for msg in history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        messages.append({
            "role": "user",
            "content": user_message
        })

        # ✅ FIX: HTTP API instead of import ollama
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",
                "messages": messages,
                "stream": False
            }
        )

        return response.json()["message"]["content"]

    except Exception as e:
        print("OLLAMA ERROR:", str(e))
        return f"Ollama Error: {str(e)}"

# ==========================
# ROUTES
# ==========================

@app.route("/")
def home():
    return "Auracare Backend Running Successfully"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        user_message = data.get("message", "").strip()
        history = data.get("history", [])

        if not user_message:
            return jsonify({
                "emotion": "unknown",
                "response": "Please enter a message."
            })

        # Emotion detection
        result = classifier(user_message)

        raw_label = result[0]["label"]
        emotion = EMOTION_MAP.get(raw_label, "unknown")

        print("Emotion:", emotion)

        # Response logic
        if is_wellness_message(user_message):
            ai_response = WELLNESS_RESPONSES.get(
                emotion,
                "I'm here to listen. Tell me more."
            )
        else:
            ai_response = generate_response(user_message, history)

        return jsonify({
            "emotion": emotion,
            "response": ai_response
        })

    except Exception as e:
        print("BACKEND ERROR:", str(e))

        return jsonify({
            "emotion": "unknown",
            "response": f"Backend Error: {str(e)}"
        })

# ==========================
# RUN SERVER
# ==========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )