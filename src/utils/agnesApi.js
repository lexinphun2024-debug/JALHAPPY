const AGNES_BASE_URL = '/api/agnes/v1';
const TEXT_MODEL = 'agnes-2.0-flash';
const IMAGE_MODEL = 'agnes-image-2.1-flash';
const VIDEO_MODEL = 'agnes-video-v2.0';

function getApiKey() {
  const apiKey = import.meta.env.VITE_AGNES_API_KEY;
  if (!apiKey || apiKey === 'your_agnes_api_key_here') {
    throw new Error('API key not configured. Please set VITE_AGNES_API_KEY in .env file.');
  }
  return apiKey;
}

export async function callAgnesLLM(prompt) {
  const apiKey = getApiKey();
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Agnes API error (${response.status}): ${err}`);
  }
  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  if (!rawText) throw new Error('Agnes AI returned empty response.');
  const cleanText = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanText);
}

export async function generateClaimImage(prompt) {
  const apiKey = getApiKey();
  try {
    const response = await fetch(`${AGNES_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });
    if (!response.ok) throw new Error(`${response.status}`);
    const data = await response.json();
    const item = data.data?.[0];
    const url = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
    if (!url) throw new Error('No image URL in response');
    return { url, status: 'success' };
  } catch (error) {
    return { url: null, status: 'error', message: error.message };
  }
}

export async function generateClaimVideo(prompt) {
  const apiKey = getApiKey();
  try {
    // Step 1: Create video task with minimum settings for speed
    const createResponse = await fetch(`${AGNES_BASE_URL}/video/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VIDEO_MODEL,
        prompt: prompt,
        size: '854x480',  // smallest size for fastest generation
        duration: 3,       // 3 seconds minimum
        num_frames: 25,    // minimum frames (must satisfy 8n+1: 8*3+1=25)
      }),
    });

    if (!createResponse.ok) {
      const err = await createResponse.text();
      throw new Error(`Task creation failed (${createResponse.status}): ${err}`);
    }

    const createData = await createResponse.json();
    console.log('[Agnes Video] Task created:', createData);

    const taskId = createData.id || createData.task_id || createData.data?.id;
    if (!taskId) throw new Error('No task ID returned from Agnes AI');

    console.log('[Agnes Video] Polling task ID:', taskId);

    // Step 2: Poll every 5 seconds, max 5 minutes (60 attempts)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));

      const poll = await fetch(`${AGNES_BASE_URL}/videos/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!poll.ok) {
        console.log(`[Agnes Video] Poll ${i + 1} returned ${poll.status}, retrying...`);
        continue;
      }

      const pollData = await poll.json();
      console.log(`[Agnes Video] Poll ${i + 1}:`, pollData);

      const status = pollData.status || pollData.data?.status;
      const videoUrl = pollData.video_url ||
                       pollData.data?.video_url ||
                       pollData.url ||
                       pollData.data?.url;

      if (videoUrl) {
        return { url: videoUrl, status: 'success' };
      }

      if (status === 'completed' || status === 'succeeded') {
        return { url: videoUrl, status: 'success' };
      }

      if (status === 'failed' || status === 'error') {
        throw new Error('Video generation failed on Agnes AI side');
      }

      console.log(`[Agnes Video] Status: ${status || 'pending'}, poll ${i + 1}/60...`);
    }

    throw new Error('Video timed out — Agnes AI video queue is busy. Try again later.');

  } catch (error) {
    console.error('[Agnes Video] Error:', error);
    return { url: null, status: 'error', message: error.message };
  }
}