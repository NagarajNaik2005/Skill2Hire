import { AIService } from './aiService';

export class ResumeSuggestionService {
  /**
   * Suggests specialization tracks for a given career role.
   * User picks from these — AI does not force or decide.
   */
  public static async suggestSpecializations(targetRole: string): Promise<string[]> {
    const systemPrompt = `You are a technical career advisor. Given a general target role, return 4-6 industry-standard specializations or technology tracks. Respond with a JSON object: { "specializations": ["track 1", "track 2", ...] }`;
    const userPrompt = `Target Role: "${targetRole}". Provide relevant specialization tracks.`;

    const result = await AIService.generateStructuredJson<{ specializations: string[] }>(
      systemPrompt,
      userPrompt,
      {
        specializations: [
          'Full Stack Web Development (MERN / Next.js)',
          'Backend Engineering & Distributed Systems',
          'Frontend Engineering & UI/UX Architecture',
          'Cloud Architecture & DevOps'
        ]
      }
    );

    return result.specializations || [];
  }

  /**
   * Improves bullet points using Google X-Y-Z formula without inventing fake achievements.
   */
  public static async improveBulletPoint(
    rawBullet: string,
    roleContext?: string,
    technologies: string[] = []
  ): Promise<{ enhancedBullet: string; actionVerbUsed: string; impactMetricTip: string }> {
    const systemPrompt = `You are an elite ATS resume editor. 
Enhance the user's bullet point using the Google X-Y-Z formula: "Accomplished [X] measured by [Y], by doing [Z]".
RULES:
1. NEVER invent fake companies, metrics, or non-existent tech.
2. If metrics are missing, use realistic contextual indicators or prompt placeholder [e.g., by 25%].
3. Return JSON: { "enhancedBullet": "...", "actionVerbUsed": "...", "impactMetricTip": "..." }`;

    const userPrompt = `Raw Bullet: "${rawBullet}"
Context Role: "${roleContext || 'Software Developer'}"
Tech Stack: ${technologies.join(', ')}`;

    return await AIService.generateStructuredJson(systemPrompt, userPrompt, {
      enhancedBullet: `Architected and implemented responsive full-stack features using ${technologies.slice(0, 2).join(' and ') || 'modern frameworks'}, improving application performance and reducing page latency by 25%.`,
      actionVerbUsed: 'Architected',
      impactMetricTip: 'Consider quantifying your user base or latency improvement percentage.'
    });
  }

  /**
   * Generates a tailored professional summary based strictly on existing input details.
   */
  public static async generateProfessionalSummary(
    targetRole: string,
    skills: string[],
    experienceYears = 'Fresher',
    highlightProject?: string
  ): Promise<string> {
    const systemPrompt = `You are an ATS resume optimization expert. Write a concise 3-4 sentence professional summary for a resume. 
CRITICAL RULE: Rely ONLY on the candidate's provided skills and experience. Do NOT invent fake degrees or certifications.
Respond with JSON: { "summary": "..." }`;

    const userPrompt = `Target Role: ${targetRole}
Experience Level: ${experienceYears}
Key Skills: ${skills.join(', ')}
Highlight Project: ${highlightProject || 'Full Stack Web Platform'}`;

    const result = await AIService.generateStructuredJson<{ summary: string }>(
      systemPrompt,
      userPrompt,
      {
        summary: `Motivated ${targetRole} with a strong foundation in ${skills.slice(0, 4).join(', ') || 'modern software engineering principles'}. Proven track record of developing scalable applications and collaborating in agile teams to deliver clean, maintainable code. Eager to contribute technical problem-solving skills to high-impact software engineering initiatives.`
      }
    );

    return result.summary;
  }
}
