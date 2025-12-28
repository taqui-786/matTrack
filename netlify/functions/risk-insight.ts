import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export default async function (req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { companyId, summary, requests } = await req.json();

    if (!summary) {
      throw new Error("Summary data is missing");
    }

    // Format requests for the prompt
    const requestsList = requests
      ? requests
          .map(
            (r: any) =>
              `- ${r.material_name}: ${r.quantity} ${r.unit} (${r.status}, ${r.priority})`
          )
          .join("\n")
      : "No individual request data available.";

    // Generate AI insights based on the data
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a concise Construction Procurement Risk Analyst. Your responses must be SHORT and ACTIONABLE.

STRICT RULES:
- Maximum 150 words total.
- Use Markdown: ### for headers, **bold** for emphasis, bullet points for lists.
- NO tables, code blocks, or lengthy explanations.
- Be direct. No filler phrases.

STRUCTURE (keep each section to 1-2 bullet points max):
### Summary
One sentence on overall health.

### Risks
1-2 critical risks, naming specific materials.

### Actions
1-2 immediate next steps.`,
      prompt: `Analyze this procurement data briefly:

**Metrics:** ${summary.totalRequests} total, ${summary.pendingCount} pending (${summary.urgentPendingCount} urgent), ${summary.approvedCount} approved, ${summary.fulfilledCount} fulfilled.

**Materials:**
${requestsList}

Provide a SHORT risk analysis.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in risk-insight function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate insights",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
