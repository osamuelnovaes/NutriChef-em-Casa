const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a recipe based on user inputs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateRecipe = async (req, res) => {
  try {
    // Validate request body
    const { ingredients, cuisineType, dietaryRestrictions, servings, cookingTime } = req.body;

    // Input validation
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients array is required and must not be empty',
      });
    }

    if (ingredients.some(ingredient => typeof ingredient !== 'string' || ingredient.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'All ingredients must be non-empty strings',
      });
    }

    // Validate optional fields if provided
    if (cuisineType && typeof cuisineType !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Cuisine type must be a string',
      });
    }

    if (dietaryRestrictions && !Array.isArray(dietaryRestrictions)) {
      return res.status(400).json({
        success: false,
        message: 'Dietary restrictions must be an array',
      });
    }

    if (servings && (typeof servings !== 'number' || servings < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Servings must be a positive number',
      });
    }

    if (cookingTime && (typeof cookingTime !== 'number' || cookingTime < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cooking time must be a non-negative number',
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured',
      });
    }

    // Build the prompt
    let prompt = `Generate a detailed recipe using these ingredients: ${ingredients.join(', ')}.`;

    if (cuisineType) {
      prompt += ` The cuisine type should be ${cuisineType}.`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += ` Please consider these dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
    }

    if (servings) {
      prompt += ` The recipe should serve ${servings} people.`;
    }

    if (cookingTime) {
      prompt += ` The cooking time should be approximately ${cookingTime} minutes.`;
    }

    prompt += ` Please provide the recipe in the following format:
1. Recipe Name
2. Ingredients (with quantities)
3. Instructions (step by step)
4. Nutritional Information (per serving)
5. Cooking Tips
6. Estimated Preparation Time
7. Difficulty Level`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const recipeText = response.text();

    if (!recipeText) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate recipe from Gemini API',
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        recipe: recipeText,
        generatedAt: new Date().toISOString(),
        input: {
          ingredients,
          cuisineType: cuisineType || null,
          dietaryRestrictions: dietaryRestrictions || [],
          servings: servings || null,
          cookingTime: cookingTime || null,
        },
      },
    });
  } catch (error) {
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Gemini API key',
        error: 'Authentication failed',
      });
    }

    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'API quota exceeded. Please try again later',
        error: 'Rate limit exceeded',
      });
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later',
        error: 'Connection error',
      });
    }

    // Generic error handling
    console.error('Error generating recipe:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating the recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  generateRecipe,
};
