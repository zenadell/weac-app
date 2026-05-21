const SUPABASE_URL = "https://wbxyakpfjwtoxwqefjap.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHlha3Bmand0b3h3cWVmamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTc1MTAsImV4cCI6MjA5NDM3MzUxMH0.9PkScP4sj8hLi0w3uDzdp8Z63dLan7mpUfaDGyDm1vI";

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function sbGet(table, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? "?" + query : ""}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

function parseOptions(opts) {
  if (!opts) return {};
  if (typeof opts === "object") return opts;
  try { return JSON.parse(opts); } catch { return {}; }
}

// Named export used by all new screens
export const API = {
  getSubjects: async () => {
    const rows = await sbGet("questions", { select: "subject", order: "subject.asc" });
    return [...new Set(rows.map((r) => r.subject))].sort();
  },

  getQuestions: async (subject, year, limit = 20) => {
    const params = {
      select: "id,subject,year,question_text,options,answer,topic_cluster",
      subject: `eq.${subject}`,
      order: "year.desc",
      limit,
    };
    if (year) params.year = `eq.${year}`;
    const rows = await sbGet("questions", params);
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      year: r.year,
      question_text: r.question_text,
      options: parseOptions(r.options),
      answer: r.answer,
      topic_cluster: r.topic_cluster,
    }));
  },

  getYears: async (subject) => {
    const rows = await sbGet("questions", {
      select: "year", subject: `eq.${subject}`, order: "year.desc",
    });
    return [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a);
  },

  predict: async (subject, year = 2026, top_n = 10) => {
    const rows = await sbGet("predictions", {
      select: "subject,year,topic,probability,topic_cluster,rank",
      subject: `eq.${subject}`,
      year: `eq.${year}`,
      order: "rank.asc",
      limit: top_n,
    });
    return rows.map((r) => ({
      topic: r.topic,
      probability: r.probability,
      cluster: r.topic_cluster,
      rank: r.rank,
    }));
  },

  getStats: async (subject) => {
    const params = { select: "subject,year" };
    if (subject) params.subject = `eq.${subject}`;
    const rows = await sbGet("questions", params);
    const subjects = [...new Set(rows.map((r) => r.subject))];
    return { total: rows.length, subjects: subjects.length };
  },
};

// Legacy export (for PracticeScreen, PredictScreen, QuestionScreen)
export const api = {
  getQuestions: async (subject, year, limit = 20, offset = 0) => {
    const params = {
      select: "id,subject,year,question_text,options,answer,topic_cluster",
      subject: `eq.${subject}`,
      order: "year.desc",
      limit,
      offset,
    };
    if (year) params.year = `eq.${year}`;
    const rows = await sbGet("questions", params);
    return {
      questions: rows.map((r) => ({
        id: r.id,
        subject: r.subject,
        year: r.year,
        question: r.question_text,
        options: parseOptions(r.options),
        answer: r.answer,
        topic_cluster: r.topic_cluster,
      })),
      count: rows.length,
    };
  },

  predict: async (subject, year = 2026, top_n = 10) => {
    const rows = await sbGet("predictions", {
      select: "subject,year,topic,probability,topic_cluster,rank",
      subject: `eq.${subject}`,
      year: `eq.${year}`,
      order: "rank.asc",
      limit: top_n,
    });
    return {
      subject, year,
      predictions: rows.map((r) => ({
        topic: r.topic,
        probability: r.probability,
        cluster: r.topic_cluster,
        rank: r.rank,
      })),
    };
  },

  getStats: async () => {
    const rows = await sbGet("questions", { select: "subject,year" });
    const bySubject = {};
    rows.forEach((r) => { bySubject[r.subject] = (bySubject[r.subject] || 0) + 1; });
    const years = rows.map((r) => r.year).filter(Boolean);
    return {
      total_questions: rows.length,
      year_range: { min: Math.min(...years), max: Math.max(...years) },
      by_subject: bySubject,
    };
  },
};
