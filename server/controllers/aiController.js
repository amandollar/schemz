import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const ruleSchema = z.object({
  field: z.enum([
    'age', 'income', 'category', 'education', 'state', 'gender',
    'marital_status', 'disability', 'occupation'
  ]),
  operator: z.enum(['==', '!=', '<', '<=', '>', '>=', 'in', 'not in']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
  weight: z.number().min(1).max(100),
});

const schemeOutputSchema = z.object({
  name: z.string().describe('Scheme name'),
  description: z.string().describe('Detailed description of the scheme'),
  benefits: z.string().describe('Benefits offered (e.g. amount, services)'),
  ministry: z.string().describe('Ministry or department'),
  rules: z.array(ruleSchema).describe('Eligibility rules - at least 1 required'),
});

/**
 * Generate scheme draft using Gemini 2.5 Flash
 * POST /api/ai/generate-scheme
 * Body: { prompt: string }
 */
export const generateScheme = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
      });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to .env',
      });
    }

    const systemPrompt = `You are an expert in Indian government schemes. Generate a scheme draft based on the user's description.

Rules must use these exact field names: age, income, category, education, state, gender, marital_status, disability, occupation.
- category: General, OBC, SC, ST, EWS
- education: Below 10th, 10th Pass, 12th Pass, Graduate, Post Graduate, Doctorate
- gender: Male, Female, Other
- marital_status: Single, Married, Widowed, Divorced, Separated
- disability: true or false (for "Person with Disability")
- state: Use Indian state names (e.g. Bihar, Uttar Pradesh, Maharashtra)
- For "in" or "not in" operators, value must be an array
- Keep rules realistic and relevant to Indian government schemes`;

    const { output } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Create a government scheme based on: ${prompt}`,
      output: Output.object({
        name: 'SchemeDraft',
        description: 'A government scheme draft with eligibility rules',
        schema: schemeOutputSchema,
      }),
    });

    if (!output || output.rules.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI could not generate valid scheme. Try a more specific prompt.',
      });
    }

    res.json({
      success: true,
      data: output,
    });
  } catch (error) {
    console.error('AI generate scheme error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate scheme',
    });
  }
};
