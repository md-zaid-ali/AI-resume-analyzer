/**
 * UI Controller for AI Resume Analyzer
 * Handles DOM rendering, tab switching, score gauge animations, theme toggling, and export actions.
 */

window.ResumeUI = {
  currentAnalysis: null,

  /**
   * Initialize UI listeners and controls
   */
  init() {
    this.bindThemeToggle();
    this.bindTabNavigation();
  },

  /**
   * Theme switcher (Dark / Light mode)
   */
  bindThemeToggle() {
    const themeBtn = document.getElementById("themeToggle");
    if (!themeBtn) return;

    const setInitialIcon = () => {
      const isLight = (document.documentElement.getAttribute("data-theme") || "light") === "light";
      themeBtn.innerHTML = isLight
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    };
    setInitialIcon();

    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      document.body.setAttribute("data-theme", newTheme);
      setInitialIcon();
    });
  },

  /**
   * Main dashboard tab switcher
   */
  bindTabNavigation() {
    const tabs = document.querySelectorAll(".dash-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetPanel = tab.getAttribute("data-tab");
        
        tabs.forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const panelEl = document.getElementById(`panel-${targetPanel}`);
        if (panelEl) panelEl.classList.add("active");
      });
    });

    this.checkUrlHash();
    window.addEventListener("hashchange", () => this.checkUrlHash());
  },

  activateTab(tabName) {
    const targetTab = document.querySelector(`.dash-tab[data-tab="${tabName}"]`);
    if (targetTab) {
      targetTab.click();
    }
  },

  checkUrlHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'score' || hash === 'dashboard') {
      const dash = document.getElementById('dashboard');
      if (dash) dash.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else if (hash) {
      this.activateTab(hash);
      const panelEl = document.getElementById(`panel-${hash}`);
      if (panelEl) panelEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  },

  /**
   * Render complete analysis data onto dashboard
   */
  renderAnalysis(analysis) {
    this.currentAnalysis = analysis;
    const dash = document.getElementById("dashboard");
    if (dash) dash.classList.add("visible");

    // Scroll to dashboard smoothly (instant if direct hash URL)
    const scrollBehavior = window.location.hash ? 'instant' : 'smooth';
    dash.scrollIntoView({ behavior: scrollBehavior, block: 'start' });

    // Render 1. Circular Score Gauge
    this.renderGauge(analysis.overallScore);

    // Render 2. Score Breakdown Bars
    this.renderBreakdownBars(analysis.scoreBreakdown);

    // Render 3. Overview Tab
    this.renderOverviewTab(analysis);

    // Render 4. Skills Matrix Tab
    this.renderSkillsTab(analysis);

    // Render 5. Missing Skills & Gap Tab
    this.renderGapAnalysisTab(analysis);

    // Render 6. Recommendations Tab
    this.renderRecommendationsTab(analysis);

    // Render 7. Bullet Rewriter & Live Editor
    this.renderBulletRewriter(analysis);
    this.syncLiveEditor(analysis);
  },

  /**
   * Animate SVG Circular Score Gauge
   */
  renderGauge(score) {
    const fillEl = document.getElementById("gaugeFill");
    const numEl = document.getElementById("gaugeNumber");
    const verdictEl = document.getElementById("gaugeVerdict");

    // Circumference = 2 * PI * 70 ≈ 440
    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    
    if (fillEl) fillEl.style.strokeDashoffset = offset;
    if (numEl) numEl.textContent = score;

    let verdict = "Excellent ATS Match";
    if (score < 50) verdict = "Needs Urgent Optimization";
    else if (score < 75) verdict = "Moderate ATS Match";
    else if (score < 88) verdict = "Strong Candidate Profile";

    if (verdictEl) verdictEl.textContent = verdict;
  },

  /**
   * Animate progress breakdown bars
   */
  renderBreakdownBars(breakdown) {
    const items = [
      { id: "barSkills", numId: "valSkills", val: breakdown.skills },
      { id: "barImpact", numId: "valImpact", val: breakdown.impact },
      { id: "barStructure", numId: "valStructure", val: breakdown.structure },
      { id: "barQuality", numId: "valQuality", val: breakdown.quality },
      { id: "barEdu", numId: "valEdu", val: breakdown.education }
    ];

    items.forEach(item => {
      const bar = document.getElementById(item.id);
      const valText = document.getElementById(item.numId);
      if (bar) bar.style.width = `${item.val}%`;
      if (valText) valText.textContent = `${item.val}/100`;
    });
  },

  /**
   * Render Executive Overview & Quick Stats
   */
  renderOverviewTab(analysis) {
    const summaryText = document.getElementById("generatedSummary");
    if (summaryText) summaryText.textContent = analysis.generatedSummary;

    const statsGrid = document.getElementById("quickStatsGrid");
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="card" style="padding:16px; text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Extracted Skills</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--accent-primary);">${analysis.extractedSkills.count}</div>
        </div>
        <div class="card" style="padding:16px; text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Metric Bullets</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--accent-emerald);">${analysis.metricsData.metricBulletsCount} / ${analysis.metricsData.totalBullets}</div>
        </div>
        <div class="card" style="padding:16px; text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Word Count</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--accent-cyan);">${analysis.wordCount}</div>
        </div>
        <div class="card" style="padding:16px; text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Target Role Match</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--accent-amber);">${analysis.missingSkillsData.matchPercentage}%</div>
        </div>
      `;
    }
  },

  /**
   * Render Categorized Skills Matrix
   */
  renderSkillsTab(analysis) {
    const container = document.getElementById("skillsMatrixContainer");
    if (!container) return;

    let html = "";
    for (const [catName, skillList] of Object.entries(analysis.extractedSkills.categorized)) {
      if (skillList.length > 0) {
        html += `
          <div class="skill-group">
            <div class="skill-group-title">${catName} (${skillList.length})</div>
            <div class="skill-tags">
              ${skillList.map(s => `<span class="skill-tag">✓ ${s}</span>`).join('')}
            </div>
          </div>
        `;
      }
    }

    if (!html) html = `<p style="color:var(--text-muted);">No major categorized technical skills detected. Consider adding a dedicated Skills section.</p>`;
    container.innerHTML = html;
  },

  /**
   * Render Missing Skills & Gap Analysis
   */
  renderGapAnalysisTab(analysis) {
    const gapContainer = document.getElementById("gapAnalysisContainer");
    if (!gapContainer) return;

    const missingCrit = analysis.missingSkillsData.missingCritical;
    const missingBonus = analysis.missingSkillsData.missingBonus;

    let html = `
      <div style="margin-bottom:20px;">
        <h4 style="font-size:1.1rem; margin-bottom:6px;">Target Role: ${analysis.roleProfile.title}</h4>
        <p style="font-size:0.9rem; color:var(--text-secondary);">${analysis.roleProfile.description}</p>
      </div>
    `;

    if (missingCrit.length > 0) {
      html += `
        <div style="margin-bottom:24px;">
          <div style="font-weight:700; color:var(--accent-rose); margin-bottom:10px;">⚠️ Critical Missing Skills (${missingCrit.length}):</div>
          <div class="skill-tags">
            ${missingCrit.map(s => `<span class="skill-tag missing">+ ${s}</span>`).join('')}
          </div>
        </div>
      `;
    } else {
      html += `<div style="padding:12px; background:rgba(16,185,129,0.1); border-radius:8px; color:var(--accent-emerald); font-weight:600; margin-bottom:20px;">🎉 Great news! You cover all core required skills for this role.</div>`;
    }

    if (missingBonus.length > 0) {
      html += `
        <div>
          <div style="font-weight:700; color:var(--accent-amber); margin-bottom:10px;">💡 Recommended Bonus Skills to Stand Out:</div>
          <div class="skill-tags">
            ${missingBonus.map(s => `<span class="skill-tag bonus">+ ${s}</span>`).join('')}
          </div>
        </div>
      `;
    }

    gapContainer.innerHTML = html;
  },

  /**
   * Render AI Actionable Recommendations
   */
  renderRecommendationsTab(analysis) {
    const recContainer = document.getElementById("recommendationsList");
    if (!recContainer) return;

    let html = "";
    analysis.recommendations.forEach(rec => {
      html += `
        <div class="rec-card ${rec.type}">
          <div class="rec-icon">${rec.type === 'critical' ? '🔴' : rec.type === 'high' ? '🟠' : '⚡'}</div>
          <div>
            <div class="rec-title">${rec.title}</div>
            <div class="rec-desc">${rec.description}</div>
          </div>
        </div>
      `;
    });

    recContainer.innerHTML = html;
  },

  /**
   * Render Weak Bullets vs AI Rewritten Bullets
   */
  renderBulletRewriter(analysis) {
    const container = document.getElementById("bulletRewriterContainer");
    if (!container) return;

    if (analysis.rewrittenBullets.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">Your bullet points are already strong with high-impact power verbs and quantitative metrics!</p>`;
      return;
    }

    let html = `<div class="bullet-comparison">`;
    analysis.rewrittenBullets.forEach(item => {
      html += `
        <div class="comp-box">
          <div class="comp-original">
            <div class="comp-tag">Original Bullet Point</div>
            <div>${item.original}</div>
          </div>
          <div class="comp-improved">
            <div class="comp-tag">✨ AI Enhanced Bullet Point (XYZ Formula)</div>
            <div>${item.improved}</div>
            <div style="font-size:0.78rem; color:var(--accent-emerald); margin-top:6px; font-weight:600;">Reason: ${item.reason}</div>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    container.innerHTML = html;
  },

  /**
   * Populate Live Resume Editor for real-time re-scoring
   */
  syncLiveEditor(analysis) {
    const textarea = document.getElementById("liveResumeEditor");
    if (textarea && !textarea.dataset.userEdited) {
      textarea.value = analysis.sections.summary ? 
        `${analysis.sections.summary}\n${analysis.sections.experience}\n${analysis.sections.skills}` : 
        window.ResumeApp.currentRawText;
    }
  }
};
