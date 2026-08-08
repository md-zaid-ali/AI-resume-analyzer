/**
 * AI Scoring & Skill Analysis Engine for AI Resume Analyzer
 * Evaluates ATS compatibility, skill coverage, impact metrics, missing skills, and generates actionable improvements.
 */

window.ResumeAnalyzer = {
  /**
   * Run full analysis on parsed resume text against selected target role and optional custom job description.
   */
  analyze(resumeText, targetRoleKey = "software_engineer", customJobDescription = "") {
    const db = window.SKILL_DATABASE;
    const roleProfile = db.roleProfiles[targetRoleKey] || db.roleProfiles["software_engineer"];
    const contactInfo = window.ResumeParser.extractContactDetails(resumeText);
    const sections = window.ResumeParser.extractSections(resumeText);
    const metricsData = window.ResumeParser.extractMetricsAndBullets(resumeText);
    
    // 1. Skill Extraction
    const extractedSkills = this.extractSkills(resumeText);
    
    // 2. Custom Job Description skill extraction if provided
    let jdSkills = [];
    if (customJobDescription.trim().length > 20) {
      jdSkills = this.extractSkills(customJobDescription).allSkills;
    }

    // Target required skills list
    const targetRequired = jdSkills.length > 0 
      ? jdSkills 
      : [...roleProfile.requiredSkills, ...roleProfile.popularSkills];

    // 3. Gap Analysis (Missing Skills)
    const missingSkillsData = this.computeMissingSkills(extractedSkills.allSkills, targetRequired, roleProfile);

    // 4. Phrasing & Verb Analysis
    const verbAnalysis = this.analyzeActionVerbs(resumeText);

    // 5. Score Calculation across 5 dimensions
    const scoreBreakdown = this.calculateScores({
      extractedSkills,
      targetRequired,
      metricsData,
      contactInfo,
      sections,
      resumeText,
      verbAnalysis,
      roleProfile
    });

    // 6. Generate Recommendations & Rewritten Bullets
    const recommendations = this.generateRecommendations({
      scoreBreakdown,
      missingSkillsData,
      verbAnalysis,
      metricsData,
      contactInfo,
      sections,
      roleProfile
    });

    const rewrittenBullets = this.generateRewrittenBullets(metricsData.bullets, extractedSkills.allSkills);
    const generatedSummary = this.generateExecutiveSummary(extractedSkills.allSkills, roleProfile, contactInfo);

    return {
      overallScore: scoreBreakdown.overall,
      scoreBreakdown,
      extractedSkills,
      missingSkillsData,
      verbAnalysis,
      metricsData,
      contactInfo,
      sections,
      recommendations,
      rewrittenBullets,
      generatedSummary,
      roleProfile,
      wordCount: resumeText.split(/\s+/).filter(Boolean).length
    };
  },

  /**
   * Scan text for 500+ known skills in database
   */
  extractSkills(text) {
    const categories = window.SKILL_DATABASE.categories;
    const foundSkillsByCategory = {};
    const allSkills = new Set();
    const normalizedText = " " + text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ") + " ";

    for (const [catName, skillList] of Object.entries(categories)) {
      foundSkillsByCategory[catName] = [];
      for (const skill of skillList) {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match word boundary to avoid false positives (e.g., 'C' matching 'Cat')
        const regex = new RegExp(`(?:^|\\s|[.,\\/#!$%\\^&\\*;:{}=\\-_\`~()]))${escapedSkill}(?:$|\\s|[.,\\/#!$%\\^&\\*;:{}=\\-_\`~()])`, 'i');
        if (regex.test(normalizedText) || normalizedText.includes(" " + skill.toLowerCase() + " ")) {
          if (!foundSkillsByCategory[catName].includes(skill)) {
            foundSkillsByCategory[catName].push(skill);
            allSkills.add(skill);
          }
        }
      }
    }

    return {
      categorized: foundSkillsByCategory,
      allSkills: Array.from(allSkills),
      count: allSkills.size
    };
  },

  /**
   * Compare extracted skills against target role or JD to pinpoint missing skills
   */
  computeMissingSkills(foundSkills, targetRequired, roleProfile) {
    const lowerFound = new Set(foundSkills.map(s => s.toLowerCase()));
    
    const missingCritical = [];
    const missingBonus = [];
    const matched = [];

    for (const reqSkill of targetRequired) {
      if (lowerFound.has(reqSkill.toLowerCase())) {
        matched.push(reqSkill);
      } else {
        if (roleProfile.requiredSkills.map(s => s.toLowerCase()).includes(reqSkill.toLowerCase())) {
          missingCritical.push(reqSkill);
        } else {
          missingBonus.push(reqSkill);
        }
      }
    }

    // Deduplicate lists
    return {
      matchedSkills: [...new Set(matched)],
      missingCritical: [...new Set(missingCritical)],
      missingBonus: [...new Set(missingBonus)],
      matchPercentage: targetRequired.length > 0 ? Math.round((matched.length / targetRequired.length) * 100) : 100
    };
  },

  /**
   * Analyze usage of action verbs and flag weak/passive phrasing
   */
  analyzeActionVerbs(text) {
    const db = window.SKILL_DATABASE;
    const lowerText = text.toLowerCase();
    const weakMatches = [];
    let powerVerbCount = 0;

    // Detect weak phrases
    for (const [weak, data] of Object.entries(db.weakPhrases)) {
      if (lowerText.includes(weak)) {
        weakMatches.push({
          phrase: weak,
          replacement: data.power,
          impactScore: data.scoreImpact
        });
      }
    }

    // Detect power verbs
    const allPowerVerbs = Object.values(db.powerVerbs).flat();
    for (const verb of allPowerVerbs) {
      const regex = new RegExp(`\\b${verb}\\b`, 'i');
      if (regex.test(text)) {
        powerVerbCount++;
      }
    }

    return {
      weakMatches,
      powerVerbCount,
      hasWeakPhrases: weakMatches.length > 0
    };
  },

  /**
   * Compute scores across 5 weighted dimensions (0-100 overall score)
   */
  calculateScores({ extractedSkills, targetRequired, metricsData, contactInfo, sections, resumeText, verbAnalysis, roleProfile }) {
    // 1. Skill Match Score (30%)
    const skillRatio = targetRequired.length > 0 ? (extractedSkills.allSkills.length / targetRequired.length) : 1;
    let skillScore = Math.min(100, Math.round(skillRatio * 85 + (extractedSkills.allSkills.length > 8 ? 15 : 5)));
    if (extractedSkills.allSkills.length < 4) skillScore = 35;

    // 2. Impact & Metrics Score (25%)
    const metricRatio = metricsData.totalBullets > 0 ? (metricsData.metricBulletsCount / metricsData.totalBullets) : 0;
    let impactScore = Math.round(metricRatio * 70 + Math.min(30, metricsData.metricBulletsCount * 6));
    if (metricsData.metricBulletsCount === 0) impactScore = Math.min(impactScore, 40);

    // 3. ATS & Structure Score (20%)
    let structureScore = 100;
    if (!contactInfo.email) structureScore -= 20;
    if (!contactInfo.phone) structureScore -= 15;
    if (!contactInfo.linkedin && !contactInfo.github) structureScore -= 10;
    if (!sections.summary || sections.summary.length < 30) structureScore -= 15;
    if (!sections.experience || sections.experience.length < 50) structureScore -= 20;
    if (!sections.education) structureScore -= 10;
    if (!sections.skills) structureScore -= 10;
    structureScore = Math.max(30, structureScore);

    // 4. Experience & Phrasing Quality (15%)
    let qualityScore = 85;
    qualityScore += Math.min(15, verbAnalysis.powerVerbCount * 3);
    qualityScore -= (verbAnalysis.weakMatches.length * 6);
    if (metricsData.totalBullets < 4) qualityScore -= 15;
    qualityScore = Math.max(25, Math.min(100, qualityScore));

    // 5. Education & Certifications (10%)
    let eduScore = 70;
    if (sections.education && sections.education.length > 20) eduScore += 15;
    if (sections.certifications && sections.certifications.length > 10) eduScore += 15;
    eduScore = Math.min(100, eduScore);

    // Overall Weighted Calculation
    const overall = Math.round(
      (skillScore * 0.30) +
      (impactScore * 0.25) +
      (structureScore * 0.20) +
      (qualityScore * 0.15) +
      (eduScore * 0.10)
    );

    return {
      overall: Math.min(99, Math.max(15, overall)),
      skills: skillScore,
      impact: impactScore,
      structure: structureScore,
      quality: qualityScore,
      education: eduScore
    };
  },

  /**
   * Priority actionable recommendations
   */
  generateRecommendations({ scoreBreakdown, missingSkillsData, verbAnalysis, metricsData, contactInfo, sections, roleProfile }) {
    const recs = [];

    // Critical Missing Skills
    if (missingSkillsData.missingCritical.length > 0) {
      recs.push({
        type: "critical",
        title: "Add Missing Core Skills",
        description: `Your resume is missing key expected skills for ${roleProfile.title}: **${missingSkillsData.missingCritical.slice(0, 5).join(", ")}**. Add these in your Skills section or experience bullet points.`,
        icon: "alert-triangle"
      });
    }

    // Lack of Quantifiable Metrics
    if (metricsData.metricBulletsCount < roleProfile.minRecommendedMetrics) {
      recs.push({
        type: "high",
        title: "Incorporate Quantifiable Results (X-Y-Z Formula)",
        description: `Only ${metricsData.metricBulletsCount} out of ${metricsData.totalBullets} bullet points contain numbers/percentages. Add measurable outcomes like "% increase in performance", "$ saved", or "users scaled".`,
        icon: "trending-up"
      });
    }

    // Weak Phrasing
    if (verbAnalysis.weakMatches.length > 0) {
      const weakList = verbAnalysis.weakMatches.slice(0, 3).map(w => `"${w.phrase}"`).join(", ");
      recs.push({
        type: "medium",
        title: "Replace Passive / Weak Phrasing",
        description: `Found weak phrases like ${weakList}. Upgrade to power action verbs like "Spearheaded", "Engineered", "Orchestrated", or "Automated".`,
        icon: "zap"
      });
    }

    // Contact Details Missing
    if (!contactInfo.linkedin || !contactInfo.github) {
      recs.push({
        type: "low",
        title: "Add Online Professional Links",
        description: `Adding your LinkedIn profile ${!contactInfo.github ? "and GitHub repository link" : ""} boosts recruiters' trust and ATS ranking.`,
        icon: "link"
      });
    }

    // Summary Section
    if (!sections.summary || sections.summary.length < 40) {
      recs.push({
        type: "medium",
        title: "Craft a Powerful Professional Summary",
        description: "Your resume lacks a concise 3-line elevator summary. A strong header summary immediately hooks hiring managers.",
        icon: "file-text"
      });
    }

    return recs;
  },

  /**
   * Auto-rewrite weak bullet points into high-impact XYZ formula bullets
   */
  generateRewrittenBullets(bullets, foundSkills) {
    const db = window.SKILL_DATABASE;
    const topSkills = foundSkills.slice(0, 4).join(", ") || "modern tech stack";
    const rewrites = [];

    for (const bullet of bullets) {
      let isWeak = false;
      let matchedWeakPhrase = null;

      for (const [weak, data] of Object.entries(db.weakPhrases)) {
        if (bullet.toLowerCase().includes(weak)) {
          isWeak = true;
          matchedWeakPhrase = weak;
          break;
        }
      }

      const hasNumber = /(\d+|%|\$)/.test(bullet);

      if (isWeak || !hasNumber) {
        let enhanced = bullet;
        if (matchedWeakPhrase) {
          const powerVerbs = db.powerVerbs.leadership.concat(db.powerVerbs.technical);
          const replacement = powerVerbs[Math.floor(Math.random() * powerVerbs.length)];
          enhanced = enhanced.replace(new RegExp(matchedWeakPhrase, 'gi'), replacement);
        } else {
          // Capitalize first letter and prepend power verb if needed
          enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
        }

        if (!hasNumber) {
          enhanced += ` — resulting in a **25% boost in efficiency** and reducing processing latency by **40%**.`;
        }

        rewrites.push({
          original: bullet,
          improved: enhanced,
          reason: !hasNumber ? "Added quantifiable impact metrics" : `Replaced weak phrase "${matchedWeakPhrase}" with strong action verb`
        });
      }

      if (rewrites.length >= 4) break;
    }

    return rewrites;
  },

  /**
   * Generate an executive 3-line summary tailored to candidate skills & role
   */
  generateExecutiveSummary(foundSkills, roleProfile, contactInfo) {
    const primarySkills = foundSkills.slice(0, 5).join(", ") || "software development and problem-solving";
    return `Results-driven ${roleProfile.title} with hands-on expertise in ${primarySkills}. Proven track record of architecting scalable systems, optimizing application performance, and delivering robust software solutions. Passionate about leveraging cutting-edge technology to drive measurable business growth and team collaboration.`;
  }
};
