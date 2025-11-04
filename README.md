# 🌿 Plant Disease Diagnosis API

This project is an AI-powered backend application built with **NestJS** that analyzes plant images to detect diseases using **Google Gemini AI**. It returns structured results in Arabic, including the disease name, severity, treatment advice, and confidence score.

---

## 🚀 Features

* Upload a plant image (JPEG/PNG/GIF).
* AI-based analysis using Google Gemini (`gemini-2.5-flash` model).
* Returns structured JSON response with the following fields:

  * `diseaseName` (in Arabic)
  * `severity` (Low / Medium / High / None)
  * `treatmentAdvice` (in Arabic)
  * `confidenceScore` (0.0 - 1.0)
* Validates file type and size (max 4MB).
* Ready-to-use frontend HTML page for uploading and displaying results.

---

## 🧠 Tech Stack

* **Backend:** NestJS (TypeScript)
* **AI Integration:** Google Generative AI SDK
* **Frontend:** HTML + CSS + JavaScript (simple uploader)

---

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/plant-diagnosis-ai.git
   cd plant-diagnosis-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Run the server:**

   ```bash
   npm run start:dev
   ```

   The API will start on `http://localhost:3000`

---

## 📸 API Endpoints

### `GET /`

Returns a simple health check message.

**Response:**

```json
{
  "message": "Hello World!"
}
```

### `POST /diagnose`

Uploads and analyzes a plant image.

**Request:**

* **Form field:** `image`
* **Type:** multipart/form-data

**Response Example:**

```json
{
  "diseaseName": "عفن الجذور",
  "severity": "High",
  "treatmentAdvice": "قم بإزالة الأجزاء المصابة وتقليل الري وتحسين تصريف التربة.",
  "confidenceScore": 0.93
}
```

---

## 💻 Frontend Page

A simple HTML file (`index.html`) is included to interact with the API:

* Choose and preview an image.
* Send it to the API.
* Display the diagnosis result beautifully.

To use it:

1. Run the backend.
2. Open `index.html` in your browser.
3. Upload a plant image and view the results.

---

## ⚠️ Notes

* Maximum file size: 4MB.
* Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`.
* Requires a valid Google Gemini API key.
* Free tier usage is limited; exceeding quota may result in errors or charges.

---

## 🧾 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Mohamed Osama**
[GitHub](https://github.com/mohamed-osamaaa)
