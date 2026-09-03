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
  "You are a dermatology AI assistant. Analyze the following skin lesion data and predict whether it is consistent with eczema (atopic dermatitis) or a visually similar condition.\n\n" +
  "Lesion Data:\n" +
  "- Age: {age}\n" +
  "- Sex: {sex}\n" +
  "- Lesion Location: {lesionLocation}\n" +
  "- Duration of Symptoms: {duration}\n" +
  "- Itching Severity: {itchingSeverity}\n" +
  "- Skin Appearance: {skinAppearance}\n" +
  "- Redness Level: {rednessLevel}\n" +
  "- Dryness/Scaling: {drynessScaling}\n" +
  "- History of Allergies/Asthma: {allergyHistory}\n" +
  "- Family History of Eczema: {familyHistory}\n" +
  "- Known Triggers Exposure: {triggerExposure}\n" +
  "- Symptom Description: {description}\n\n" +
  "Respond with a JSON object containing exactly these three fields:\n" +
  "condition: must be ECZEMA or CONTACT_DERMATITIS or PSORIASIS or FUNGAL_INFECTION or OTHER\n" +
  "confidenceScore: a decimal number between 0 and 1\n" +
  "explanation: a detailed clinical explanation for the classification in PLAIN TEXT ONLY. DO NOT USE: asterisks (*), bold, italics, markdown formatting, bullet points with asterisks, or any special characters for formatting. Write as normal sentences separated by periods.\n\n" +
  "Guidelines:\n" +
  "- ECZEMA: Consistent with atopic dermatitis - itchy, dry, inflamed skin, often with personal or family history of allergies/asthma\n" +
  "- CONTACT_DERMATITIS: Localized reaction linked to a specific trigger or exposure\n" +
  "- PSORIASIS: Well-defined, thick, scaly plaques, often less itchy than eczema\n" +
  "- FUNGAL_INFECTION: Ring-shaped, well-demarcated lesion, possibly with central clearing\n" +
  "- OTHER: Does not clearly match the above patterns\n" +
  "- confidenceScore should reflect your certainty\n" +
  "- explanation should be detailed, citing specific values from the lesion data\n" +
  "- ALWAYS include a note that this is not a medical diagnosis and a dermatologist should be consulted\n" +
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

export async function predictEczemaCondition(input: {
  age: number;
  sex: string;
  lesionLocation: string;
  duration: string;
  itchingSeverity: string;
  skinAppearance: string;
  rednessLevel: string;
  drynessScaling: string;
  allergyHistory: boolean;
  familyHistory: boolean;
  triggerExposure: string;
  description?: string;
}) {
  let result = await predictionChain.invoke({
    ...input,
    allergyHistory: input.allergyHistory ? "Yes" : "No",
    familyHistory: input.familyHistory ? "Yes" : "No",
    description: input.description || "None provided",
  });

  // Strip code fences if model returns JSON wrapped in markdown
  if (result.startsWith("```")) {
    result = result
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(result);
    if (
      ![
        "ECZEMA",
        "CONTACT_DERMATITIS",
        "PSORIASIS",
        "FUNGAL_INFECTION",
        "OTHER",
      ].includes(parsed.condition) ||
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
      .replace(/\*/g, "") // Remove asterisks
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/`([^`]+)`/g, "$1") // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet points
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();
    console.log("=== CLEAN EXPLANATION ===");
    console.log(cleanExplanation);
    return {
      condition: parsed.condition as
        | "ECZEMA"
        | "CONTACT_DERMATITIS"
        | "PSORIASIS"
        | "FUNGAL_INFECTION"
        | "OTHER",
      confidenceScore: Math.max(0, Math.min(1, parsed.confidenceScore)),
      explanation: cleanExplanation,
    };
  } catch (error) {
    console.error("Failed to parse Groq response:", result, error);
    return {
      condition: "OTHER" as const,
      confidenceScore: 0.5,
      explanation:
        "Unable to parse AI response. Please consult a dermatologist for proper evaluation.",
    };
  }
}

export { MODEL };
