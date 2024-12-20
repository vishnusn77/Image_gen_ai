import requests
from flask import Flask, request, jsonify, render_template, send_file
from io import BytesIO
import openai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Load OpenAI API key
openai.api_key = os.getenv("OPEN_AI_API_KEY")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_image():
    try:
        data = request.json
        prompt = data.get("prompt", "A beautiful sunset over the ocean")

        response = openai.Image.create(
            model="dall-e-2",
            prompt=prompt,
            size="512x512",
            quality="standard",
            n=1
        )
        print(response)  # Log the response to verify the image URL
        image_url = response["data"][0]["url"]
        return jsonify({"image_url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-image", methods=["GET"])
def download_image():
    try:
        image_url = request.args.get("image_url")
        if not image_url:
            return jsonify({"error": "No image URL provided"}), 400
        
        # Fetch the image from the external URL
        response = requests.get(image_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch the image"}), 500

        # Return the image as a downloadable file
        return send_file(
            BytesIO(response.content),
            mimetype="image/png",
            as_attachment=True,
            download_name="generated_image.png"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
