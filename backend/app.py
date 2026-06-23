from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import ollama
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
    model=MODEL_DIR,
    tokenizer=MODEL_DIR
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
    "fear": (
        "I can sense that something may be worrying you right now. "
        "Take a slow breath and remember that you're not facing this alone. "
        "Would you like to talk about what's causing these feelings?"
    ),
    "sadness": (
        "I'm sorry you're feeling this way. "
        "It's okay to have difficult days. "
        "Would you like to share what's been on your mind?"
    ),
    "anger": (
        "That sounds frustrating. "
        "Would you like to tell me more about what happened?"
    ),
    "joy": (
        "That's wonderful to hear! 😊 "
        "Would you like to tell me more about it?"
    ),
    "love": (
        "That sounds meaningful. 💛 "
        "Relationships and connections can be an important source of happiness."
    ),
    "surprise": (
        "That sounds unexpected! 😮 "
        "How are you feeling about what happened?"
    )
}

# ==========================
# CHECK IF MESSAGE IS REALLY ABOUT WELLNESS
# ==========================

def is_wellness_message(text):
    text = text.lower()

    wellness_keywords = [
        "sad",
        "depressed",
        "depression",
        "stress",
        "stressed",
        "anxiety",
        "anxious",
        "panic",
        "worried",
        "fear",
        "afraid",
        "lonely",
        "mental health",
        "overwhelmed",
        "upset",
        "crying",
        "hopeless",
        "can't sleep",
        "sleep problem"
    ]

    return any(word in text for word in wellness_keywords)

# ==========================
# OLLAMA RESPONSE FUNCTION
# ==========================

def generate_response(user_message, history):
    try:
        messages = [
            {
                "role": "system",
                "content": """
You are Auracare AI.

You are:
- Friendly
- Helpful
- Intelligent
- Conversational

You can answer:
- General knowledge
- Programming questions
- Career guidance
- Study help
- Mental wellness
- Daily conversations

Respond naturally like ChatGPT.
Keep answers concise unless detailed explanation is requested.
"""
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

        response = ollama.chat(
            model="llama3",
            messages=messages
        )

        return response["message"]["content"]

    except Exception as e:
        print("OLLAMA ERROR:", str(e))
        return f"Ollama Error: {str(e)}"

# ==========================
# HOME ROUTE
# ==========================

@app.route("/")
def home():
    return "Auracare Backend Running Successfully"

# ==========================
# CHAT ROUTE
# ==========================

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

        # Use wellness response ONLY if actual wellness topic
        if is_wellness_message(user_message):
            ai_response = WELLNESS_RESPONSES.get(
                emotion,
                "I'm here to listen. Tell me more about how you're feeling."
            )
        else:
            ai_response = generate_response(
                user_message,
                history
            )

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