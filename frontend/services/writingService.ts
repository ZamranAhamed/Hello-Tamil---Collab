import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";

/*
Change this if using real device
For LOCAL TESTING: http://localhost:3000
For REAL DEVICE: http://192.168.1.4:3000

Machine IP: 192.168.1.4 (from WiFi adapter)
*/

const API_URL = "http://10.225.125.116:3000";

/* Helper function to get better error messages */
const handleApiError = (error: any, operation: string) => {
  if (error.response) {
    // Server responded with error status
    console.error(`${operation} - Server Error:`, error.response.status, error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error(`${operation} - No Response:`, error.request);
    console.error("Check if backend server is running at:", API_URL);
    console.error("Check your network connection and firewall settings");
  } else {
    // Error in request setup
    console.error(`${operation} - Error:`, error.message);
  }
};

/* ============================= */
/* Activity 1 : Image Upload     */
/* ============================= */

export const analyzeImage = async (imageUri: string) => {

  try {

    if (!imageUri) {
      throw new Error("No image URI provided");
    }

    /* Ensure URI format */

    let fileUri = imageUri;

    if (!imageUri.startsWith("file://")) {
      fileUri = `file://${imageUri}`;
    }

    /* Check if file exists */

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      throw new Error("Image file not found");
    }

    /* Convert image to base64 */

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    console.log("Sending image to:", API_URL);
    console.log("Image size:", fileInfo.size, "bytes");

    /* Send to backend */

    const response = await axios.post(
      `${API_URL}/writing/analyze-image`,
      {
        image: base64,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;

  } catch (error) {

    console.error("Analyze Image Error:", error);
    handleApiError(error, "Analyze Image");

    throw error;
  }
};


/* ============================= */
/* Activity 2 : Canvas Drawing   */
/* ============================= */

export const analyzeDrawing = async (drawingBase64: string) => {

  try {

    if (!drawingBase64) {
      throw new Error("No drawing data provided");
    }

   const url = `${API_URL}/writing/analyze-drawing`;
    const body = { drawing: drawingBase64 };

    console.log("[analyzeDrawing] sending to URL:", url);
    console.log("[analyzeDrawing] payload length:", drawingBase64.length);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Request failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {

    console.error("Analyze Drawing Error:", error);
    handleApiError(error, "Analyze Drawing");

    throw error;

  }
};