from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import os

app = Flask(__name__)
CORS(app)

# MODEL PATH
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

# LOAD EMOTION MODEL
classifier = pipeline(
    "text-classification",
    model=MODEL_DIR,
    tokenizer=MODEL_DIR
)

# SMART RESPONSE FUNCTION
def generate_response(user_message, emotion):

    message = user_message.lower()

    # BREATHING EXERCISES
    if any(word in message for word in [
        "breathing",
        "panic",
        "anxiety",
        "anxious",
        "stress",
        "stressed"
    ]):
        return (
            "Try this breathing exercise 😊\n\n"
            "• Inhale slowly for 4 seconds\n"
            "• Hold for 4 seconds\n"
            "• Exhale slowly for 6 seconds\n"
            "• Repeat 5 times\n\n"
            "This can help calm your mind 💛"
        )

    # SLEEP ISSUES
    elif any(word in message for word in [
        "sleep",
        "insomnia",
        "can't sleep",
        "not sleeping",
        "trouble sleeping"
    ]):
        return (
            "I'm sorry you're struggling with sleep 😔\n\n"
            "Try this relaxing bedtime routine:\n"
            "• Avoid screens before bed\n"
            "• Dim the lights\n"
            "• Take slow deep breaths\n"
            "• Listen to calming music\n"
            "• Try sleeping at a fixed time\n\n"
            "Would you like a guided sleep meditation? 🌙"
        )

    # SADNESS
    elif emotion.lower() == "sadness":
        return (
            "I'm sorry you're feeling sad 💛\n\n"
            "Remember that difficult emotions are temporary.\n"
            "Try talking to someone you trust or doing something calming today."
        )

    # FEAR
    elif emotion.lower() == "fear":
        return (
            "You are safe 🤝\n\n"
            "Try grounding yourself by focusing on your breathing and surroundings."
        )

    # ANGER
    elif emotion.lower() == "anger":
        return (
            "I understand things may feel overwhelming 😌\n\n"
            "Take a few deep breaths and give yourself a short pause."
        )

    # JOY
    elif emotion.lower() == "joy":
        return (
            "I'm happy you're feeling positive today 😊"
        )

    # LOVE
    elif emotion.lower() == "love":
        return (
            "That sounds wonderful 💖"
        )

    # SURPRISE
    elif emotion.lower() == "surprise":
        return (
            "That sounds unexpected 😲"
        )

    # DEFAULT
    return (
        "Thank you for sharing your feelings 🙂\n\n"
        "I'm always here to support you 💛"
    )


@app.route("/")
def home():
    return "Auracare Backend Running Successfully"


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.json

        user_message = data.get("message", "")

        if not user_message:
            return jsonify({
                "response": "Please enter a message."
            })

        # EMOTION PREDICTION
        result = classifier(user_message)

        print(result)

        emotion = result[0]["label"]

        # SMART RESPONSE
        response = generate_response(user_message, emotion)

        return jsonify({
            "emotion": emotion,
            "response": response
        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "response": "Something went wrong."
        })


if __name__ == "__main__":
    app.run(debug=True, port=5000)