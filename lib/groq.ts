import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: MODEL,
  temperature: 0.1,
});

const promptText = 
  "You are a cardiology AI assistant. Analyze the following patient data and predict heart disease risk level.\n\n" +
  "Patient Data:\n" +
  "- Age: {age}\n" +
  "- Sex: {sex}\n" +
  "- Chest Pain Type: {chestPainType}\n" +
  "- Resting Blood Pressure: {restingBP} mmHg\n" +
  "- Serum Cholesterol: {cholesterol} mg/dl\n" +
  "- Fasting Blood Sugar > 120 mg/dl: {fastingBS}\n" +
  "- Resting ECG: {restingECG}\n" +
  "- Maximum Heart Rate Achieved: {maxHR}\n" +
  "- Exercise Induced Angina: {exerciseAngina}\n" +
  "- Oldpeak (ST Depression): {oldpeak}\n" +
  "- ST Slope: {stSlope}\n" +
  "- Major Vessels (0-4): {majorVessels}\n" +
  "- Thalassemia: {thalassemia}\n" +
  "- Symptom Description: {description}\n\n" +
  "Respond with a JSON object containing exactly these three fields:\n" +
  "riskLevel: must be LOW or MODERATE or HIGH\n" +
  "confidenceScore: a decimal number between 0 and 1\n" +
  "explanation: a detailed medical explanation for the risk level in PLAIN TEXT ONLY. DO NOT USE: asterisks (*), bold, italics, markdown formatting, bullet points with asterisks, or any special characters for formatting. Write as normal sentences separated by periods.\n\n" +
  "Guidelines:\n" +
  "- LOW: Low probability of heart disease, routine monitoring recommended\n" +
  "- MODERATE: Moderate probability, lifestyle changes and follow-up recommended\n" +
  "- HIGH: High probability, immediate medical consultation strongly advised\n" +
  "- confidenceScore should reflect your certainty\n" +
  "- explanation should be detailed, citing specific values from the patient data\n" +
  "- IMPORTANT: The explanation field MUST be plain text only - no markdown, no bold, no italics, no asterisks, no special formatting characters";

console.log("=== PROMPT TEMPLATE DEBUG ===");
console.log(promptText);
console.log("=== END DEBUG ===");

const predictionPrompt = PromptTemplate.fromTemplate(promptText);

const predictionChain = RunnableSequence.from([
  predictionPrompt,
  llm,
  new StringOutputParser(),
]);

export async function predictHeartDiseaseRisk(input: {
  age: number;
  sex: string;
  chestPainType: string;
  restingBP: number;
  cholesterol: number;
  fastingBS: boolean;
  restingECG: string;
  maxHR: number;
  exerciseAngina: boolean;
  oldpeak: number;
  stSlope: string;
  majorVessels: number;
  thalassemia: string;
  description?: string;
}) {
  let result = await predictionChain.invoke({
    ...input,
    fastingBS: input.fastingBS ? "Yes" : "No",
    exerciseAngina: input.exerciseAngina ? "Yes" : "No",
    description: input.description || "None provided",
  });

  if (result.startsWith("```")) {
    result = result.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(result);
    if (
      !["LOW", "MODERATE", "HIGH"].includes(parsed.riskLevel) ||
      typeof parsed.confidenceScore !== "number" ||
      typeof parsed.explanation !== "string"
    ) {
      throw new Error("Invalid response format");
    }
    // Strip markdown formatting from explanation
    console.log("=== RAW EXPLANATION ===");
    console.log(parsed.explanation);
    const cleanExplanation = parsed.explanation
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\*/g, "")   // Remove asterisks
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/`([^`]+)`/g, "$1") // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet points
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();
    console.log("=== CLEAN EXPLANATION ===");
    console.log(cleanExplanation);
    return {
      riskLevel: parsed.riskLevel as "LOW" | "MODERATE" | "HIGH",
      confidenceScore: Math.max(0, Math.min(1, parsed.confidenceScore)),
      explanation: cleanExplanation,
    };
  } catch (error) {
    console.error("Failed to parse Groq response:", result, error);
    return {
      riskLevel: "MODERATE" as const,
      confidenceScore: 0.5,
      explanation: "Unable to parse AI response. Please consult a healthcare professional.",
    };
  }
}

export { MODEL };