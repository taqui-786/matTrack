import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function handler(event: any) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { companyId, summary } = JSON.parse(event.body);

  try {


    if (!summary) {
      throw new Error("Summary data is missing");
    }

    // Generate AI insights based on the data
    const result = await generateText({
      model: groq("openai/gpt-oss-20b"),
      system: `
You are an expert Construction Supply Chain Risk Analyst.
Your goal is to provide a strategic, actionable assessment of procurement health based on material request data.
Focus on operational efficiency, potential bottlenecks, and financial implications.

RESPONSE FORMATTING RULES:
- Use strictly MARKDOWN format.
- DO NOT use tables, graphs, or code blocks.
- Use h3 (###) for section headers.
- Use bold text (**text**) for key metrics and emphasis.
- Use bullet points for lists.
- Keep the tone professional, direct, and insight-driven.

STRUCTURE YOUR RESPONSE AS FOLLOWS:

### Executive Summary
A 2-sentence high-level overview of the current procurement status.

### Key Metrics
List the core numbers using bullet points with bold values (e.g., - **Total Requests:** 15).

### Critical Risk Assessment
Identify 2-3 specific risks. For each, provide a brief explanation of why it matters. 
Example:
- **High Pending Volume:** 40% of requests are pending, which may delay project timelines.

### Strategic Recommendations
Provide 2-3 actionable steps to improve the workflow immediately.
`,
      prompt: `
Analyze the following material request data for company ${companyId}:

- Total Requests: ${summary.totalRequests}
- Pending Requests: ${summary.pendingCount}
- Urgent Pending Requests: ${summary.urgentPendingCount}
- Approved Requests: ${summary.approvedCount}
- Fulfilled Requests: ${summary.fulfilledCount}

Provide a comprehensive risk analysis following the defined structure.
`,
    });



    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: result.text,
    };
  } catch (error) {
    console.error("Error in risk-insight function:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to generate insights",
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}
