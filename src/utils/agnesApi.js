/**
 * Agnes AI API Integration
 * Uses Anthropic Messages API format
 * Model: claude-sonnet-4-6
 * Endpoint: https://api.agnesai.co/v1/messages
 */

const AGNES_API_URL = 'https://api.agnesai.co/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;

/**
 * Call Agnes AI LLM with a prompt
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {Promise<object>} Parsed JSON response from the LLM
 */
export async function callAgnesLLM(prompt) {
  const apiKey = import.meta.env.VITE_AGNES_API_KEY;

  if (!apiKey || apiKey === 'your_agnes_api_key_here') {
    throw new Error('API key not configured. Please set VITE_AGNES_API_KEY in .env file.');
  }

  try {
    console.log('[Agnes API] Calling:', AGNES_API_URL);

    const response = await fetch(AGNES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    console.log('[Agnes API] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Agnes API] Error response:', errorData);
      throw new Error(`Agnes API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    console.log('[Agnes API] Response data:', data);

    // Extract text and strip markdown backticks before parsing JSON
    const rawText = data.content?.[0]?.text || '';
    if (!rawText) {
      console.error('[Agnes API] Unexpected response structure:', data);
      throw new Error('API returned unexpected response format. Check browser console for details.');
    }
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanText);

    return result;
  } catch (error) {
    console.error('Agnes API call failed:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Agnes AI error: Cannot connect to the API. Please check your internet connection and API endpoint URL.');
    }
    throw new Error(`Agnes AI error: ${error.message}. Please check your API key and try again.`);
  }
}

/**
 * Generate a visual claim card image using Agnes Image Gen
 * NOTE: Image generation endpoint URL is TBD. This is a mock implementation.
 * @param {string} prompt - Description of the image to generate
 * @returns {Promise<{url: string, prompt: string}>} Placeholder result
 */
export async function generateClaimImage(prompt) {
  // TODO: Replace with actual Agnes Image Generation endpoint when available
  // Expected endpoint format: POST https://api.agnesai.co/v1/images/generations
  console.log('[TODO: Image Generation] Prompt:', prompt);

  return {
    url: 'https://placehold.co/600x400/1B2B5E/FFFFFF?text=Claim+Card+%0AComing+Soon%0APowered+by+Agnes+AI',
    prompt: prompt,
    status: 'placeholder',
    message: 'Image generation coming soon. This is a placeholder.',
  };
}

/**
 * Generate a video summary using Agnes Video Gen
 * NOTE: Video generation endpoint URL is TBD. This is a mock implementation.
 * @param {string} prompt - Description of the video to generate
 * @returns {Promise<{url: string, prompt: string}>} Placeholder result
 */
export async function generateClaimVideo(prompt) {
  // TODO: Replace with actual Agnes Video Generation endpoint when available
  // Expected endpoint format: POST https://api.agnesai.co/v1/videos/generations
  console.log('[TODO: Video Generation] Prompt:', prompt);

  return {
    url: 'https://placehold.co/600x400/1B2B5E/FFFFFF?text=Video+Summary+%0AComing+Soon%0APowered+by+Agnes+AI',
    prompt: prompt,
    status: 'placeholder',
    message: 'Video generation coming soon. This is a placeholder.',
  };
}