from flask import Flask, request, jsonify, render_template, send_file
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import openai
import os
from dotenv import load_dotenv
import requests
from io import BytesIO

load_dotenv()

app = Flask(__name__)

limiter = Limiter(
    get_remote_address, 
    app=app,
    default_limits=["3 per day"], 
)

openai.api_key = os.getenv("OPEN_AI_API_KEY")

@app.route("/")
def index():
    """Always render the homepage, no rate limit applied"""
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
@limiter.limit("3 per day") 
def generate_image():
    """Generate an image using OpenAI API"""
    try:
        data = request.json
        prompt = data.get("prompt", "A beautiful sunset over the ocean")

        response = openai.Image.create(
            model="dall-e-2",
            prompt=prompt,
            size="512x512",
            quality="standard",
            n=1,
        )
        image_url = response["data"][0]["url"]
        return jsonify({"image_url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-image", methods=["GET"])
def download_image():
    """Serve the image as a downloadable file"""
    try:
        image_url = request.args.get("image_url")
        if not image_url:
            return jsonify({"error": "No image URL provided"}), 400

        response = requests.get(image_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch the image"}), 500

        return send_file(
            BytesIO(response.content),
            mimetype="image/png",
            as_attachment=True,
            download_name="generated_image.png"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.errorhandler(429)
def ratelimit_error(e):
    """Handle rate limit errors"""
    return jsonify({
        "error": "Your daily limit has exceeded, please try again tomorrow."
    }), 429

if __name__ == "__main__":
    app.run(debug=True)
