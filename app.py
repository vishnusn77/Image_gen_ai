from flask import Flask, request, jsonify, render_template, send_file, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import openai
import os
import requests
from io import BytesIO
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# Limiter using anon_id or IP fallback
def get_user_key():
    return request.cookies.get("anon_id") or get_remote_address()

limiter = Limiter(
    app=app,
    key_func=get_user_key,
    default_limits=[]  # use per-route limit
)

openai.api_key = os.getenv("OPEN_AI_API_KEY")

# Set anon_id cookie ALWAYS on any request
@app.before_request
def ensure_anon_id_cookie():
    if not request.cookies.get("anon_id"):
        request.anon_id = str(uuid4())
    else:
        request.anon_id = request.cookies.get("anon_id")

@app.after_request
def set_cookie_if_needed(response):
    if hasattr(request, "anon_id") and not request.cookies.get("anon_id"):
        response.set_cookie(
            "anon_id",
            request.anon_id,
            max_age=60 * 60 * 24 * 7,
            httponly=True,
            samesite="Lax",
            secure=False  # True only if HTTPS
        )
    return response

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
@limiter.limit("2 per day")
def generate_image():
    try:
        data = request.json
        prompt = data.get("prompt", "A beautiful sunset over the ocean")

        response = openai.Image.create(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
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

if __name__ == "__main__":
    app.run(debug=True)
