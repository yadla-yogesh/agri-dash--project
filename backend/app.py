# Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import json
from PIL import Image
import torch
import torchvision.transforms as transforms
from transformers import ViTForImageClassification 
from ultralytics import YOLO
import google.generativeai as genai
import os
from dotenv import load_dotenv

# --- 1. CONFIGURE GEMINI API ---
# LEAVE THIS AS "" - THE PLATFORM WILL PROVIDE A 
load_dotenv() 

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
#GEMINI_API_KEY = "AIzaSyDhYfnROut0UgLh_YGh5rTfvRzVdWSIq5I" 

try:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini model configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    gemini_model = None


# --- 2. INITIALIZE MODELS AND CLASSES ---

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

try:
    yolo_model = YOLO('best.pt')
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    yolo_model = None

try:
    with open('class_names.json', 'r') as f:
        class_names = json.load(f)
    print("Class names loaded successfully.")
    num_classes = len(class_names)

    vit_model = ViTForImageClassification.from_pretrained(
        'google/vit-base-patch16-224-in21k',
        num_labels=num_classes,
        ignore_mismatched_sizes=True
    )
    vit_model.load_state_dict(torch.load('vit_model.pth', map_location=device))
    vit_model.to(device)
    vit_model.eval()
    print("ViT model loaded and configured successfully.")

except Exception as e:
    print(f"Error loading ViT model or class names: {e}")
    vit_model = None

vit_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# --- 3. DEFINE API ENDPOINTS ---

@app.route('/diagnose', methods=['POST'])
def diagnose():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    lang_code = request.form.get('language', 'en')
    language_map = {'en': 'English', 'hi': 'Hindi', 'te': 'Telugu'}
    language_name = language_map.get(lang_code, 'English')
    print(f"Request received for language: {language_name}")

    if file and yolo_model and vit_model:
        try:
            image_bytes = file.read()
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

            results = yolo_model(image)
            if len(results[0].boxes) == 0:
                cropped_image = image
            else:
                box = results[0].boxes[0].xyxy[0].tolist()
                cropped_image = image.crop(box)
            
            input_tensor = vit_transforms(cropped_image).unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = vit_model(input_tensor).logits
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_class_idx = torch.max(probabilities, 1)

            disease_name = class_names[predicted_class_idx.item()]
            confidence_score = confidence.item()

            print(f"Diagnosis: {disease_name} with confidence {confidence_score:.4f}")

            recommendation_text = "Could not get a recommendation."
            if gemini_model:
                try:
                    clean_disease_name = disease_name.replace("___", " ").replace("_", " ")
                    prompt = (f"The plant disease is '{clean_disease_name}'. "
                              f"What is the common name for this disease in the {language_name} language? "
                              f"Also, what are some simple, effective organic treatments or fertilizers a farmer in India can use to cure this? "
                              f"Provide the entire response in the {language_name} language, starting with the disease name.")
                    response = gemini_model.generate_content(prompt)
                    recommendation_text = response.text
                    print(f"Successfully received recommendation from Gemini in {language_name}.")
                except Exception as e:
                    print(f"Gemini API call failed: {e}")
                    recommendation_text = "Failed to generate a recommendation due to an API error."

            return jsonify({
                'disease': disease_name,
                'confidence': confidence_score,
                'recommendation': recommendation_text
            })
        except Exception as e:
            print(f"An error occurred during diagnosis: {e}")
            return jsonify({'error': 'Failed to process the image.'}), 500
            
    return jsonify({'error': 'A model is not loaded, check server logs.'}), 500


# +++ NEW ENDPOINT FOR AGRI-BOT +++
@app.route('/ask-bot', methods=['POST'])
def ask_bot():
    """
    Receives a question and language, gets an answer from Gemini, and returns it.
    """
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400
    
    question = data['question']
    lang_code = data.get('language', 'en')
    language_map = {'en': 'English', 'hi': 'Hindi', 'te': 'Telugu'}
    language_name = language_map.get(lang_code, 'English')

    print(f"Received question for Agri-Bot in {language_name}: {question}")

    if gemini_model:
        try:
            # A more detailed prompt for the chatbot
            prompt = (f"You are Agri-Bot, a helpful AI assistant for farmers in India. "
                      f"Answer the following question concisely and in simple terms. "
                      f"Provide the entire response in the {language_name} language. "
                      f"Question: {question}")
            
            response = gemini_model.generate_content(prompt)
            answer_text = response.text
            print("Successfully received answer from Gemini for Agri-Bot.")
            return jsonify({'answer': answer_text})

        except Exception as e:
            print(f"Gemini API call for Agri-Bot failed: {e}")
            return jsonify({'error': 'Failed to get an answer from the AI assistant.'}), 500
            
    return jsonify({'error': 'Gemini model not loaded.'}), 500


# --- 4. RUN THE FLASK APP ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)
