from flask import Flask, request, jsonify, render_template, send_file
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import openai
import os
from dotenv import load_dotenv
import requests
from io import BytesIO
from uuid import uuid4

load_dotenv()

app = Flask(__name__)

def get_anon_id():
    return request.cookies.get("anon_id") or request.remote_addr

limiter = Limiter(
    key_func=get_anon_id,
    app=app,
    default_limits=[]
)

openai.api_key = os.getenv("OPEN_AI_API_KEY")

@app.after_request
def set_anon_id_cookie(response):
    if request.endpoint == 'index' and not request.cookies.get("anon_id"):
        response.set_cookie(
            "anon_id",
            str(uuid4()),
            max_age=60 * 60 * 24 * 7,
            httponly=True,
            samesite='Lax',
            secure=False  # True only if you're using HTTPS
        )
    return response

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
@limiter.limit("3 per day")
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
