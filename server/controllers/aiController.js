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

Use EXACTLY these enum values (no variations):
- category: General, OBC, SC, ST, EWS
- education: Below 10th, 10th Pass, 12th Pass, Graduate, Post Graduate, Doctorate (use "Doctorate" not "PhD")
- gender: Male, Female, Other
- marital_status: Single, Married, Widowed, Divorced, Separated
- disability: true or false (true = Person with Disability; false = not disabled). Use boolean only.
- state: Use full Indian state names (e.g. Bihar, Uttar Pradesh, Maharashtra)
- For age and income: use numbers, not strings (e.g. 25 not "25")
- For "in" or "not in" operators: value MUST be an array, e.g. ["General","OBC"] or [25,30,40]
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

    // Normalize AI output to match schema (fix common mismatches)
    const normalizedRules = output.rules.map((rule) => {
      const r = { ...rule };
      // education: PhD → Doctorate
      if (r.field === 'education') {
        if (r.value === 'PhD') r.value = 'Doctorate';
        else if (Array.isArray(r.value)) {
          r.value = r.value.map((v) => (v === 'PhD' ? 'Doctorate' : v));
        }
      }
      // age/income: ensure numbers
      if ((r.field === 'age' || r.field === 'income') && typeof r.value === 'string') {
        const n = Number(r.value);
        if (!Number.isNaN(n)) r.value = n;
      }
      if ((r.field === 'age' || r.field === 'income') && Array.isArray(r.value)) {
        r.value = r.value.map((v) => (typeof v === 'string' ? Number(v) : v)).filter((v) => !Number.isNaN(v));
      }
      return r;
    });

    res.json({
      success: true,
      data: { ...output, rules: normalizedRules },
    });
  } catch (error) {
    console.error('AI generate scheme error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate scheme',
    });
  }
};
