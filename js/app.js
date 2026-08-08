/**
 * Application Entry Point for AI Resume Analyzer
 * Connects file dropzone, text input, target job description, sample loaders, live re-scoring, and PDF report export.
 */

window.ResumeApp = {
  currentRawText: "",
  selectedFile: null,

  init() {
    window.ResumeUI.init();
    this.bindDropzone();
    this.bindSampleLoaders();
    this.bindAnalyzeButtons();
    this.bindLiveEditor();
    this.bindExportButtons();

    // Auto-load default sample resume on start so user sees instant capabilities
    this.loadSampleResume("software_engineer");
    
    // Auto-activate tab based on URL hash if present
    window.ResumeUI.checkUrlHash();
  },

  /**
   * Drag and drop file uploader handler
   */
  bindDropzone() {
    const dropzone = document.getElementById("fileDropzone");
    const fileInput = document.getElementById("fileInput");

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        await this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      if (e.target.files.length > 0) {
        await this.handleFileUpload(e.target.files[0]);
      }
    });
  },

  /**
   * Process uploaded PDF/DOCX/TXT file
   */
  async handleFileUpload(file) {
    const statusEl = document.getElementById("uploadStatus");
    if (statusEl) statusEl.textContent = `Parsing ${file.name}...`;

    try {
      const parsed = await window.ResumeParser.parseFile(file);
      this.currentRawText = parsed.text;
      
      const textInput = document.getElementById("resumeTextInput");
      if (textInput) textInput.value = parsed.text;

      if (statusEl) statusEl.textContent = `Successfully loaded ${file.name}`;
      
      // Auto trigger analysis
      this.runAnalysis();
    } catch (err) {
      console.error("File upload error:", err);
      if (statusEl) statusEl.textContent = "Error parsing file. Please copy/paste text below.";
    }
  },

  /**
   * Sample Resume 1-Click Loaders
   */
  bindSampleLoaders() {
    const chips = document.querySelectorAll(".sample-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const sampleKey = chip.getAttribute("data-sample");
        this.loadSampleResume(sampleKey);
      });
    });
  },

  loadSampleResume(key) {
    const sample = window.SAMPLE_RESUMES[key];
    if (!sample) return;

    this.currentRawText = sample.text;
    
    const textInput = document.getElementById("resumeTextInput");
    if (textInput) textInput.value = sample.text;

    const roleSelect = document.getElementById("targetRoleSelect");
    if (roleSelect && sample.targetRole) {
      roleSelect.value = sample.targetRole;
    }

    const statusEl = document.getElementById("uploadStatus");
    if (statusEl) statusEl.textContent = `Loaded Sample: ${sample.title}`;

    this.runAnalysis();
  },

  /**
   * Bind Analyze Buttons
   */
  bindAnalyzeButtons() {
    const btn = document.getElementById("btnAnalyze");
    if (btn) {
      btn.addEventListener("click", () => {
        const textInput = document.getElementById("resumeTextInput");
        if (textInput && textInput.value.trim().length > 10) {
          this.currentRawText = textInput.value;
        }
        this.runAnalysis();
      });
    }
  },

  /**
   * Execute full AI Analysis pipeline
   */
  runAnalysis() {
    const resumeText = this.currentRawText || document.getElementById("resumeTextInput")?.value || "";
    if (!resumeText.trim()) {
      alert("Please upload a resume or paste text to analyze.");
      return;
    }

    const targetRole = document.getElementById("targetRoleSelect")?.value || "software_engineer";
    const customJD = document.getElementById("customJdInput")?.value || "";

    // Run scoring & skill analysis engine
    const results = window.ResumeAnalyzer.analyze(resumeText, targetRole, customJD);

    // Render results to UI
    window.ResumeUI.renderAnalysis(results);
  },

  /**
   * Live Editor Real-Time Re-Scoring
   */
  bindLiveEditor() {
    const editor = document.getElementById("liveResumeEditor");
    const reScoreBtn = document.getElementById("btnRescoreLive");

    if (editor) {
      editor.addEventListener("input", () => {
        editor.dataset.userEdited = "true";
      });
    }

    if (reScoreBtn) {
      reScoreBtn.addEventListener("click", () => {
        if (editor && editor.value.trim()) {
          this.currentRawText = editor.value;
          this.runAnalysis();
        }
      });
    }
  },

  /**
   * Export PDF / JSON analysis report
   */
  bindExportButtons() {
    const btnPrint = document.getElementById("btnPrintReport");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        window.print();
      });
    }

    const btnExportJson = document.getElementById("btnExportJson");
    if (btnExportJson) {
      btnExportJson.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.ResumeUI.currentAnalysis, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "resume_analysis_report.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }
  }
};

// Initialize when DOM content is ready
document.addEventListener("DOMContentLoaded", () => {
  window.ResumeApp.init();
});
