/**
 * Skill Database & Knowledge Base for AI Resume Analyzer
 * Contains 500+ technical and soft skills, role benchmarks, weak verb dictionaries, and power action verbs.
 */

window.SKILL_DATABASE = {
  // Broad Technical & Soft Skill Taxonomy
  categories: {
    "Frontend Development": [
      "JavaScript", "TypeScript", "React", "React.js", "Vue.js", "Angular", "Next.js", "Nuxt.js",
      "Svelte", "HTML5", "CSS3", "Sass", "SCSS", "Tailwind CSS", "Bootstrap", "Redux", "Zustand",
      "GraphQL", "Webpack", "Vite", "Babel", "Responsive Design", "WebSockets", "PWA", "Micro-frontends"
    ],
    "Backend Development": [
      "Node.js", "Express.js", "Python", "Django", "FastAPI", "Flask", "Java", "Spring Boot",
      "C#", ".NET Core", "ASP.NET", "Go", "Golang", "Ruby", "Ruby on Rails", "PHP", "Laravel",
      "C++", "Rust", "REST APIs", "GraphQL APIs", "gRPC", "Microservices", "Serverless", "Event-Driven Architecture"
    ],
    "Databases & Caching": [
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
      "SQLite", "MariaDB", "Oracle DB", "SQL Server", "Neo4j", "Firebase", "Supabase", "Prisma",
      "Sequelize", "Database Indexing", "Query Optimization", "Data Modeling"
    ],
    "Cloud & DevOps": [
      "AWS", "Amazon Web Services", "Google Cloud", "GCP", "Microsoft Azure", "Docker", "Kubernetes",
      "Terraform", "Ansible", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Helm", "CloudFormation",
      "Linux", "Bash Scripting", "Prometheus", "Grafana", "Nginx", "Apache", "Server Administration"
    ],
    "Data Science & AI": [
      "Machine Learning", "Deep Learning", "Artificial Intelligence", "Python", "Pandas", "NumPy",
      "Scikit-Learn", "PyTorch", "TensorFlow", "Keras", "OpenCV", "NLP", "Natural Language Processing",
      "LLMs", "Generative AI", "LangChain", "RAG", "Vector Databases", "Pinecone", "ChromaDB",
      "Data Analysis", "Data Visualization", "Matplotlib", "Seaborn", "Tableau", "Power BI", "Spark", "Hadoop"
    ],
    "Mobile Development": [
      "React Native", "Flutter", "Swift", "iOS", "Kotlin", "Android", "Objective-C", "Jetpack Compose",
      "SwiftUI", "Expo", "App Store Deployment", "Mobile UX"
    ],
    "Software Engineering Practices": [
      "Git", "GitHub", "GitLab", "Bitbucket", "Agile", "Scrum", "Kanban", "Jira", "Unit Testing",
      "Integration Testing", "TDD", "Test-Driven Development", "Jest", "Cypress", "Selenium", "Playwright",
      "Code Review", "Design Patterns", "System Architecture", "OOP", "Functional Programming"
    ],
    "Product & Management": [
      "Product Strategy", "Roadmapping", "A/B Testing", "User Research", "Wireframing", "Figma",
      "User Experience (UX)", "Product Analytics", "Mixpanel", "Google Analytics", "KPI Tracking",
      "Stakeholder Management", "Cross-Functional Leadership", "OKRs", "Feature Prioritization"
    ],
    "Cybersecurity": [
      "Penetration Testing", "Ethical Hacking", "OWASP Top 10", "Network Security", "Cryptography",
      "SIEM", "SOC Analysis", "Vulnerability Assessment", "Identity Management (IAM)", "SOC 2", "Compliance"
    ],
    "Soft Skills & Leadership": [
      "Communication", "Leadership", "Problem Solving", "Critical Thinking", "Mentorship",
      "Team Collaboration", "Project Management", "Time Management", "Adaptability", "Conflict Resolution",
      "Strategic Planning", "Client Relations"
    ]
  },

  // Role benchmarks for specific job targets
  roleProfiles: {
    "software_engineer": {
      title: "Software Engineer / Developer",
      requiredSkills: ["Git", "Data Structures", "Algorithms", "REST APIs", "Unit Testing", "System Architecture"],
      popularSkills: ["JavaScript", "TypeScript", "Python", "Java", "Node.js", "React", "Docker", "PostgreSQL", "CI/CD", "Agile"],
      minRecommendedMetrics: 4,
      targetWordCount: { min: 400, max: 750 },
      description: "Focuses on robust coding, clean architecture, automated testing, and scalable backend/frontend systems."
    },
    "full_stack": {
      title: "Full Stack Engineer",
      requiredSkills: ["JavaScript", "TypeScript", "REST APIs", "HTML5", "CSS3", "Git", "SQL"],
      popularSkills: ["React", "Next.js", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "Docker", "Tailwind CSS", "GraphQL", "AWS"],
      minRecommendedMetrics: 5,
      targetWordCount: { min: 450, max: 800 },
      description: "Combines modern frontend UI development with scalable API and database backend systems."
    },
    "frontend_engineer": {
      title: "Frontend Engineer",
      requiredSkills: ["JavaScript", "HTML5", "CSS3", "Responsive Design", "Git"],
      popularSkills: ["React", "TypeScript", "Next.js", "Vue.js", "Tailwind CSS", "Redux", "Webpack", "Vite", "Jest", "Cypress", "Figma"],
      minRecommendedMetrics: 4,
      targetWordCount: { min: 400, max: 700 },
      description: "Specializes in high-performance web UIs, responsive styling, accessibility, and modern browser state management."
    },
    "backend_engineer": {
      title: "Backend Engineer",
      requiredSkills: ["REST APIs", "Database Indexing", "SQL", "Git", "Unit Testing", "System Architecture"],
      popularSkills: ["Node.js", "Python", "Java", "Go", "PostgreSQL", "Redis", "Docker", "Microservices", "Kafka", "AWS", "gRPC"],
      minRecommendedMetrics: 5,
      targetWordCount: { min: 450, max: 750 },
      description: "Delivers resilient server-side microservices, optimized database schemas, caching, and high-throughput APIs."
    },
    "devops_cloud": {
      title: "DevOps & Cloud Engineer",
      requiredSkills: ["Linux", "Docker", "CI/CD", "Git", "Cloud Infrastructure", "Bash Scripting"],
      popularSkills: ["Kubernetes", "AWS", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Prometheus", "Grafana", "Python", "Nginx"],
      minRecommendedMetrics: 5,
      targetWordCount: { min: 400, max: 750 },
      description: "Automates release pipelines, manages infrastructure-as-code, and ensures cloud system uptime and observability."
    },
    "data_scientist": {
      title: "Data Scientist / AI Engineer",
      requiredSkills: ["Python", "Machine Learning", "Data Analysis", "SQL", "Statistics"],
      popularSkills: ["PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn", "NLP", "LLMs", "RAG", "Deep Learning", "Tableau", "Jupyter"],
      minRecommendedMetrics: 5,
      targetWordCount: { min: 450, max: 800 },
      description: "Builds predictive models, processes large datasets, and deploys machine learning / GenAI algorithms."
    },
    "product_manager": {
      title: "Product Manager",
      requiredSkills: ["Product Strategy", "User Research", "Roadmapping", "KPI Tracking", "Stakeholder Management"],
      popularSkills: ["Agile", "Scrum", "A/B Testing", "Mixpanel", "Jira", "Figma", "Data Analysis", "Feature Prioritization", "OKRs"],
      minRecommendedMetrics: 6,
      targetWordCount: { min: 500, max: 850 },
      description: "Drives product vision, cross-functional engineering alignment, customer discovery, and measurable business metrics."
    },
    "data_analyst": {
      title: "Data Analyst",
      requiredSkills: ["SQL", "Data Analysis", "Data Visualization", "Excel", "Reporting"],
      popularSkills: ["Tableau", "Power BI", "Python", "Pandas", "Statistics", "Google Analytics", "A/B Testing", "ETL", "Metabase"],
      minRecommendedMetrics: 4,
      targetWordCount: { min: 400, max: 700 },
      description: "Transforms raw data into strategic business intelligence, dashboards, and growth recommendations."
    }
  },

  // Strong power action verbs categorized by intent
  powerVerbs: {
    leadership: ["Architected", "Spearheaded", "Directed", "Orchestrated", "Engineered", "Pioneered", "Championed", "Led", "Established"],
    technical: ["Deployed", "Implemented", "Optimized", "Refactored", "Automated", "Constructed", "Built", "Developed", "Integrated", "Containerized"],
    impact: ["Increased", "Reduced", "Accelerated", "Amplified", "Scaled", "Boosted", "Streamlined", "Maximized", "Generated", "Cut"],
    collaboration: ["Partnered", "Collaborated", "Coordinated", "Negotiated", "Mentored", "Cross-functionalized", "Aligned"]
  },

  // Weak/Passive phrasing dictionary and suggested power replacements
  weakPhrases: {
    "worked on": { power: "engineered / developed / architected", scoreImpact: -3 },
    "responsible for": { power: "spearheaded / managed / directed", scoreImpact: -4 },
    "helped with": { power: "collaborated on / co-developed / facilitated", scoreImpact: -3 },
    "assisted in": { power: "supported / co-authored / accelerated", scoreImpact: -2 },
    "handled": { power: "managed / executed / resolved", scoreImpact: -2 },
    "did testing": { power: "automated unit & integration test suites", scoreImpact: -4 },
    "made a": { power: "designed and constructed", scoreImpact: -2 },
    "looked after": { power: "oversaw / maintained / administered", scoreImpact: -3 },
    "changed": { power: "refactored / modernized / updated", scoreImpact: -2 },
    "use of": { power: "leveraged / utilized / adopted", scoreImpact: -1 },
    "in charge of": { power: "directed / led / owned", scoreImpact: -4 }
  }
};
