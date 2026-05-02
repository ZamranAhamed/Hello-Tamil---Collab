const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const feedbackEngine =
  require("./spatial.feedback");


/* ==========================================
   Activity 1: Analyze Image (from upload)
   ========================================== */

exports.evaluateWriting = async (imageData)=>{

  return new Promise((resolve,reject)=>{

    const python = spawn("python",[
      "python/spatial_analysis.py",
      imageData
    ]);

    let data="";

    python.stdout.on("data",(chunk)=>{
      data += chunk.toString();
    });

    python.stderr.on("data",(err)=>{
      console.error(err.toString());
    });

    python.on("close",()=>{

      try{

        const result = JSON.parse(data);

        const feedback =
          feedbackEngine.generateFeedback(
            result.spacingScore,
            result.baselineScore,
            result.letterConsistencyScore
          );

        const practice =
          feedbackEngine.practiceSuggestions(
            result.spacingScore,
            result.baselineScore,
            result.letterConsistencyScore
          );

        resolve({

          ...result,

          feedback,
          recommendedExercises: practice

        });

      }
      catch(error){

        reject("Python analysis failed");

      }

    });

  });

};


/* ==========================================
   Activity 2: Analyze Drawing (canvas)
   Flow: base64 → PNG file → Python → JSON
   ========================================== */

exports.evaluateDrawing = async (base64Image) => {

  try {

    // Step 1: Validate input
    if (!base64Image) {
      throw new Error("No drawing data provided");
    }

    // Step 2: Ensure temp directory exists
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log("[Drawing Service] Created temp directory:", tempDir);
    }

    // Step 3: Remove data URI prefix if present
    let cleanBase64 = base64Image;
    if (base64Image.startsWith("data:image/png;base64,")) {
      cleanBase64 = base64Image.replace("data:image/png;base64,", "");
    }

    // Step 4: Create temporary PNG file
    const timestamp = Date.now();
    const fileName = `drawing_${timestamp}.png`;
    const filePath = path.join(tempDir, fileName);

    const buffer = Buffer.from(cleanBase64, "base64");
    fs.writeFileSync(filePath, buffer);

    console.log("[Drawing Service] Saved drawing to:", filePath);

    // Step 5: Spawn Python process with file path
    return new Promise((resolve, reject) => {

      const python = spawn("python", [
        "python/analyze_drawing.py",
        filePath
      ]);

      let stdout = "";
      let stderr = "";

      python.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      python.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      python.on("close", (code) => {

        // Step 6: Clean up temporary file
        try {
          fs.unlinkSync(filePath);
          console.log("[Drawing Service] Cleaned up temp file:", filePath);
        } catch (cleanupErr) {
          console.error("[Drawing Service] Failed to clean up file:", cleanupErr.message);
        }

        // Step 7: Parse and return result
        if (code !== 0) {
          console.error("[Drawing Service] Python stderr:", stderr);
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          console.log("[Drawing Service] Analysis result:", result);
          resolve(result);
        } catch (parseErr) {
          console.error("[Drawing Service] Failed to parse Python output:", stdout);
          reject(new Error(`Failed to parse analysis result: ${parseErr.message}`));
        }

      });

      python.on("error", (err) => {
        console.error("[Drawing Service] Python process error:", err.message);
        reject(new Error(`Python process error: ${err.message}`));
      });

    });

  } catch (error) {

    console.error("[Drawing Service] Error:", error.message);
    throw error;

  }

};