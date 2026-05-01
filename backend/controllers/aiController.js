require('dotenv').config();

const askAI = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body;

    console.log("-----------------------------------------");
    console.log("🚀 Incoming Request...");
    console.log("🔑 API Key Status:", process.env.GEMINI_API_KEY ? "✅ LOADED" : "❌ MISSING");

    const productKnowledge = `
    You are the "Mehera AI Expert" for INGLOT Sri Lanka. 
    PRICING: 
    - HD Perfect Coverup Foundation: Rs. 16,690.00
    - All Covered Under Eye Concealer: Rs. 7,790.00
    - AMC Eyeliner Gel: Rs. 5,590.00
    - HD Lip Tint Matte: Rs. 8,790.00
    
    SHADE GUIDE: 
    - Fair: 72, 74 | Medium: 76, 78, 80, 81 | Dark: 83, 85, 86
    
    If an image is provided, identify the user's skin tone or product and provide professional beauty advice.
    `;

    let contentParts = [];

    contentParts.push({
      text: `${productKnowledge}\n\nUser Question: ${prompt || "Analyze this image and provide beauty advice."}`,
    });

    if (imageBase64) {
      console.log("📸 Image detected, processing...");
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      contentParts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    console.log("📡 Sending to Gemini 1.5 Flash-8B...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: contentParts,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("✅ Response received from AI.");
    res.status(200).json({ success: true, answer: text });

  } catch (error) {
    console.error("❌ Gemini Error Detail:", error);

    if (error.message.includes("404")) {
      return res.status(500).json({
        success: false,
        message: "Model not found (404). Trying to fix connection...",
        error: "Try changing model to gemini-1.5-flash-latest",
      });
    }

    res.status(500).json({
      success: false,
      message: "AI Expert is currently busy. Please try again.",
      error: error.message,
    });
  }
};

module.exports = { askAI };