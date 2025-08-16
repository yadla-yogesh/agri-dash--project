<div align="center">
<img src="https://placehold.co/600x300/8A2BE2/FFFFFF?text=Agri-Dash" alt="Agri-Dash Banner">
<h1 align="center">Agri-Dash: A Full-Stack Agricultural Platform</h1>
</div>

<p align="center">
<strong>Empowering Farmers, Connecting Communities</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Badge"/>
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Badge"/>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Badge"/>
<img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask Badge"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge"/>
</p>

Agri-Dash is a comprehensive, full-stack web application designed to empower farmers and connect them directly with consumers. The platform provides AI-driven tools for crop management, a direct-to-consumer marketplace, and a community hub, all managed through a role-based system with a dedicated admin panel.

✨ Core Features
🛡️ Role-Based Authentication: Secure login for three distinct user roles: Farmer, Consumer, and Admin.

🌿 AI Crop Doctor: Farmers can upload leaf images to get an instant AI-powered diagnosis of diseases and receive organic treatment advice.

🤖 AI Agri-Bot: A multi-lingual chatbot, powered by the Gemini API, provides real-time answers to a wide range of farming questions.

🛒 Direct-to-Consumer Marketplace: A platform for farmers to list produce and for consumers to buy fresh, local goods with a fully functional shopping cart.

💬 Community Hub: A social feed where users can create posts (with text and images), interact via likes, and manage their own content.

🇮🇳 Government Schemes Hub: An informative section detailing relevant government schemes to keep farmers updated.

⚙️ Full Admin Panel: An exclusive dashboard for administrators to manage the platform, view statistics, and moderate all users, products, and posts.

🌐 Multi-Language Support: The entire application is translated to support English, Hindi, and Telugu.

👥 Our Team
This project was brought to life by a dedicated team of developers.

[Your Name] - Project Lead & Full-Stack Developer - GitHub Profile

[Friend's Name] - Frontend Developer - GitHub Profile

[Friend's Name] - Backend & AI Integration - GitHub Profile

🛠️ Tech Stack
Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts

Backend: Python, Flask

Database & Auth: Firebase (Firestore, Firebase Authentication, Firebase Storage)

AI/ML: Google Gemini API, YOLOv8, Vision Transformer (ViT)

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Make sure you have the following installed on your system:

Node.js (which includes npm)

Python (version 3.8 or higher)

Git

Installation & Setup
1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/agri-dash--project.git
cd agri-hackathon

2. Backend Setup

Navigate to the backend folder:

cd backend

Create and activate a virtual environment:

# Create the environment
python -m venv venv

# Activate on Windows
.\venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate

Install Python dependencies:

pip install Flask Flask-Cors Pillow torch torchvision ultralytics "google-generativeai>=0.3.0" python-dotenv

Download ML Models:

You will need to download the best.pt (YOLO) and vit_model.pth (ViT) model files.

Place both of these files inside the backend folder.

Create Environment File:

Create a file named .env in the backend folder.

Add your Gemini API key to this file:

GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

Run the Backend Server:

python app.py

Keep this terminal running.

3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

cd frontend

Install npm dependencies:

npm install

Create Environment File:

Create a file named .env.local in the frontend folder.

Add your Firebase project configuration keys to this file:

VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"

Run the Frontend Server:

npm run dev

Your application should now be running on http://localhost:5173.

4. Firebase Project Setup

Create a new project in the Firebase Console.

Enable Services: In your new project, enable Authentication (with Email/Password), Firestore Database, and Storage.

Storage Rules: In the Storage section, go to the "Rules" tab and set the rules to allow reads and writes:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}

Create Admin User:

In Authentication, manually add a user with the email admin@123 and password admin@123.

In Firestore Database, go to the users collection, find the document for the admin user, and change the role field to "Admin".