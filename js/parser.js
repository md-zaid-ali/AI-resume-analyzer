/**
 * Document Parser Engine for AI Resume Analyzer
 * Handles PDF text extraction (via PDF.js), DOCX parsing (via Mammoth.js), and plain text sectioning.
 */

window.ResumeParser = {
  /**
   * Parse uploaded file object
   * @param {File} file 
   * @returns {Promise<{text: string, fileName: string, fileType: string}>}
   */
  async parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    let text = "";

    try {
      if (extension === 'pdf') {
        text = await this.readPdfFile(file);
      } else if (extension === 'docx' || extension === 'doc') {
        text = await this.readDocxFile(file);
      } else {
        text = await this.readTextFile(file);
      }
    } catch (err) {
      console.warn("Primary file reader failed, falling back to raw text reader:", err);
      text = await this.readTextFile(file);
    }

    return {
      text: text.trim(),
      fileName: file.name,
      fileType: extension
    };
  },

  /**
   * Extract text from PDF file using PDF.js CDN if available, or FileReader text fallback
   */
  async readPdfFile(file) {
    if (window.pdfjsLib) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageStrings = content.items.map(item => item.str);
          fullText += pageStrings.join(" ") + "\n";
        }
        return fullText;
      } catch (err) {
        console.error("PDF.js extraction error:", err);
      }
    }
    // Fallback: read raw text
    return await this.readTextFile(file);
  },

  /**
   * Extract text from DOCX file using Mammoth.js
   */
  async readDocxFile(file) {
    if (window.mammoth) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value;
      } catch (err) {
        console.error("Mammoth DOCX parsing error:", err);
      }
    }
    return await this.readTextFile(file);
  },

  /**
   * Read file as UTF-8 text
   */
  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  /**
   * Extract contact information from text
   */
  extractContactDetails(text) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    const portfolioMatch = text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?/i);

    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      linkedin: linkedinMatch ? "https://" + linkedinMatch[0] : null,
      github: githubMatch ? "https://" + githubMatch[0] : null,
      portfolio: portfolioMatch ? portfolioMatch[0] : null
    };
  },

  /**
   * Break resume text into logical sections
   */
  extractSections(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const sections = {
      summary: "",
      experience: "",
      education: "",
      skills: "",
      projects: "",
      certifications: "",
      other: ""
    };

    let currentSection = "summary";

    const sectionHeaders = {
      summary: /summary|profile|about me|objective|statement/i,
      experience: /experience|work history|employment|work experience|professional background/i,
      education: /education|academic|qualifications|degrees/i,
      skills: /skills|technical skills|technologies|expertise|competencies/i,
      projects: /projects|portfolio|personal projects|key achievements/i,
      certifications: /certifications|certificates|licenses|courses/i
    };

    for (const line of lines) {
      let isHeader = false;
      for (const [secKey, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(line) && line.length < 40) {
          currentSection = secKey;
          isHeader = true;
          break;
        }
      }
      if (!isHeader) {
        sections[currentSection] += line + "\n";
      }
    }

    return sections;
  },

  /**
   * Extract bullet points and quantifiable metrics
   */
  extractMetricsAndBullets(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const bulletPoints = [];
    const metricBullets = [];

    // Regex for numbers, percentages, dollar values, multipliers (e.g. 50%, $100k, 10x, 500+ users)
    const metricRegex = /(\d+%\b|\$\d+[\d,.]*[kMbB]?|\b\d+x\b|\b\d+\+\b|\b\d{2,}\b|\b(increased|reduced|saved|improved|grew|boosted|cut|generated)\b.*?\b\d+)/i;

    for (const line of lines) {
      if (line.length > 25 && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^[A-Z]/.test(line))) {
        const cleanBullet = line.replace(/^[•\-\*\s]+/, '').trim();
        bulletPoints.push(cleanBullet);
        if (metricRegex.test(cleanBullet)) {
          metricBullets.push(cleanBullet);
        }
      }
    }

    return {
      totalBullets: bulletPoints.length,
      metricBulletsCount: metricBullets.length,
      bullets: bulletPoints,
      metricBullets: metricBullets
    };
  }
};
