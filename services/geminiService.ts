import { GoogleGenAI, Type } from "@google/genai";
import { Coordinates, Weather, MoodLog, Prediction, Context, Emotion, GroundingChunk, PredictionLog } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWeatherForLocation = async (coords: Coordinates): Promise<Weather> => {
  try {
    const prompt = `What is the current weather at latitude ${coords.latitude} and longitude ${coords.longitude}? Respond ONLY with a valid JSON object in the format {"temperature": number_in_celsius, "condition": "string_description"}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  temperature: { type: Type.NUMBER },
                  condition: { type: Type.STRING }
              },
              required: ["temperature", "condition"]
          }
      }
    });

    const weatherData = JSON.parse(response.text);
    return weatherData as Weather;

  } catch (error) {
    console.error("Error fetching weather from Gemini:", error);
    // Return a default/fallback weather if Gemini fails
    return { temperature: 20, condition: "Partly Cloudy (Default)" };
  }
};


export const getCopingSuggestion = async (emotion: Emotion, context: Context, feedbackHistory?: PredictionLog[]): Promise<{ suggestion: string; grounding?: GroundingChunk[] }> => {
    let feedbackString = '';
    if (feedbackHistory && feedbackHistory.length > 0) {
        const relevantFeedback = feedbackHistory
            .filter(log => log.prediction.feedback?.suggestion)
            .slice(0, 5) // Limit to recent 5 feedback points
            .map(log => `- Emotion: ${log.prediction.predictedEmotion}, Suggestion: "${log.prediction.suggestion}", User Feedback: ${log.prediction.feedback!.suggestion}`)
            .join('\n');
        
        if (relevantFeedback) {
            feedbackString = `
                Here is some feedback from the user on previous suggestions. Use this to tailor your response. Avoid suggestions the user found "not_helpful".
                ${relevantFeedback}
            `;
        }
    }
    
    const prompt = `
        A user is predicted to feel '${emotion}'. Their current context is:
        - Time: ${context.timeOfDay} on a ${context.dayOfWeek}
        - Weather: ${context.weather.condition}
        ${feedbackString}
        Provide a single, simple, and actionable coping mechanism.
        If relevant for the emotion '${emotion}', also suggest a type of quiet public place the user could go to, like a park, library, or cafe.
        Keep the response to one or two sentences. Do not be conversational.
        Example: "Take a walk to a nearby park to get some fresh air. Focusing on your steps can be a grounding experience."
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              tools: [{googleMaps: {}}],
              toolConfig: {
                retrievalConfig: {
                  latLng: {
                    latitude: context.coordinates.latitude,
                    longitude: context.coordinates.longitude
                  }
                }
              }
            }
        });

        const suggestion = response.text.trim();
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

        return { suggestion, grounding };
    } catch (error) {
        console.error("Error fetching coping suggestion:", error);
        return { suggestion: "Take a moment to breathe deeply." }; // Fallback suggestion
    }
};

export const getEmotionPrediction = async (currentContext: Context, history: MoodLog[], feedbackHistory?: PredictionLog[]): Promise<Prediction> => {
    const historyString = JSON.stringify(history.slice(0, 20).map(log => ({ // Limit history size
        emotion: log.emotion,
        note: log.note,
        day: log.dayOfWeek,
        time: log.timeOfDay,
        weather: log.weather.condition,
        lat: log.coordinates.latitude.toFixed(3),
        lon: log.coordinates.longitude.toFixed(3)
    })));

    const contextString = JSON.stringify({
        day: currentContext.dayOfWeek,
        time: currentContext.timeOfDay,
        weather: currentContext.weather.condition,
        lat: currentContext.coordinates.latitude.toFixed(3),
        lon: currentContext.coordinates.longitude.toFixed(3)
    });

    let feedbackString = '';
    if (feedbackHistory && feedbackHistory.length > 0) {
        const relevantFeedback = feedbackHistory
            .filter(log => log.prediction.feedback?.emotion)
            .slice(0, 5) // Limit to recent 5 feedback points
            .map(log => `- For a prediction of '${log.prediction.predictedEmotion}', the user feedback was: '${log.prediction.feedback!.emotion}'.`)
            .join('\n');
        
        if (relevantFeedback) {
            feedbackString = `
                User Feedback on Past Predictions:
                ${relevantFeedback}
                Use this feedback to improve your prediction. If the user consistently marks predictions in a certain context as 'inaccurate', adjust your analysis.
            `;
        }
    }

    const prompt = `
      You are a digital phenotyping expert. Your task is to predict a user's likely emotional state based on their historical mood logs and their current context.

      Analyze the provided mood history and the current context to identify patterns. Pay close attention to the 'note' field in the history, as it provides crucial context.
      ${feedbackString}
      User's Mood History (most recent logs first):
      ${historyString}

      User's Current Context:
      ${contextString}

      Based on this data, predict the most likely emotion from the following list: ${Object.values(Emotion).join(', ')}.

      Respond ONLY with a single, valid JSON object following this exact schema:
      {
        "predictedEmotion": "The single most likely emotion from the list",
        "probability": A number between 0 and 1 representing your confidence in this prediction,
        "reasoning": "A brief, one-sentence explanation for your prediction based on the patterns you found, referencing the note and user feedback if they were key factors."
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        predictedEmotion: { type: Type.STRING, enum: Object.values(Emotion) },
                        probability: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["predictedEmotion", "probability", "reasoning"]
                }
            }
        });

        const predictionData = JSON.parse(response.text) as Prediction;

        const challengingEmotions = [Emotion.Stressed, Emotion.Anxious, Emotion.Sad];
        if (challengingEmotions.includes(predictionData.predictedEmotion)) {
            const { suggestion, grounding } = await getCopingSuggestion(predictionData.predictedEmotion, currentContext, feedbackHistory);
            predictionData.suggestion = suggestion;
            predictionData.grounding = grounding;
        }

        return predictionData;
    } catch (error) {
        console.error("Error fetching prediction from Gemini:", error);
        throw new Error("Could not get an emotion prediction at this time.");
    }
};