const Groq = require("groq-sdk");

// Groq Initialize කිරීම
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    // 📚 මෙතන තමයි ඔයා දුන්න INGLOT Data ටික තියෙන්නේ
    const productKnowledge = `
    You are the "Mehera AI Expert" for INGLOT Sri Lanka. 
    Use the following verified product details and pricing (2025/2026 update) to answer users:

    FACE PRODUCTS:
    - HD Perfect Coverup Foundation (35ml): Rs. 16,690.00
    - All Covered Under Eye Concealer (4.2ml): Rs. 7,790.00
    - Mattifying Under Makeup Base (20ml): Rs. 10,590.00
    - Smoothing Under Makeup Base (20ml): Rs. 8,890.00
    - Moonlight Illuminating Face Primer (25ml): Rs. 11,790.00
    - Perfect Finish Loose Powder (23g): Rs. 11,590.00
    - Smoothing Under Eye Powder: Rs. 8,790.00

    EYE PRODUCTS:
    - AMC Eyeliner Gel (5.5g): Rs. 5,590.00 (Shade 77 is the bestseller)
    - One Move Liquid Eyeliner: Rs. 6,590.00
    - Liquid Eyeliner: Rs. 5,290.00
    - Kohl Pencil: Rs. 5,590.00
    - AMC Pure Pigment Eye Shadow: Rs. 8,290.00

    LIP PRODUCTS:
    - HD Lip Tint Matte (5.5ml): Rs. 8,790.00
    - Lipstick Matte: Rs. 6,790.00

    SHADE SELECTION GUIDE (for HD Foundation):
    - Fair Skin: Suggest Shades 72, 74.
    - Medium Skin: Suggest Shades 76, 78, 80, 81.
    - Dark Skin: Suggest Shades 83, 85, 86.

    STRICT RULES:
    1. Always state prices in Sri Lankan Rupees (Rs. / LKR).
    2. Be polite and professional. Mention that these products are available through Mehera International.
    3. If you don't know a price of a specific product not listed here, tell the user to contact the Mehera Sales team at 0773104000.
    `;

    // Groq වෙත Request එක යැවීම
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: productKnowledge 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
      model: "llama-3.3-70b-versatile", // ලෝකයේ තියෙන වේගවත්ම සහ ස්මාර්ට්ම model එකක්
      temperature: 0.7, // උත්තර වඩාත් ස්වාභාවික වෙන්න
    });

    const aiText = chatCompletion.choices[0]?.message?.content || "";

    res.status(200).json({ 
      success: true, 
      answer: aiText 
    });

  } catch (error) {
    console.error("❌ Groq Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "AI Expert is currently updating. Please try again soon.",
      error: error.message 
    });
  }
};

module.exports = { askAI };