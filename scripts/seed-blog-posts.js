require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { connectDB } = require("../src/config/db");

const now = Date.now();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

const posts = [
  {
    title: "How to Write a Job Posting That Attracts the Right Candidates",
    slug: "write-job-posting-that-attracts-right-candidates",
    excerpt:
      "The difference between a flood of unqualified applicants and a shortlist of strong ones often comes down to five lines in your posting.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop",
    content:
      "Most job postings fail before a single candidate reads them, because they lead with internal jargon instead of what the role actually involves day to day. Start with the problem the hire will solve, not a list of responsibilities lifted from the last posting.\n\nBe specific about the salary range, the experience level you actually need, and whether the role is remote, hybrid, or on-site. Vague postings attract vague applicants — precise ones attract candidates who have already decided they're a fit before they click apply.\n\nFinally, keep the full description scannable: a short paragraph on the team and mission, a bulleted list of what you'll do, and a bulleted list of what you're looking for. Recruiters on Elevora who follow this structure consistently see higher-quality applications with less back-and-forth screening.",
    author: "Elevora Team",
    category: "Hiring",
    publishedAt: daysAgo(3),
  },
  {
    title: "Five Questions to Ask Before Accepting a Job Offer",
    slug: "questions-to-ask-before-accepting-job-offer",
    excerpt:
      "An offer letter tells you the salary. It rarely tells you what the first six months will actually feel like.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=630&fit=crop",
    content:
      "Compensation is the easiest number to compare between offers, which is exactly why it shouldn't be the only thing you weigh. Ask who you'll report to and what their management style looks like day to day — a great team under a disengaged manager rarely stays great for long.\n\nAsk how the team measures success in the first 90 days. If the answer is vague, that's a signal the role itself might still be undefined. Ask about the last person in this role: did they get promoted, or did they leave, and why?\n\nFinally, ask what happens if priorities shift. Companies that can answer this clearly usually have healthier planning processes — and that predictability matters more to long-term job satisfaction than most candidates expect going in.",
    author: "Elevora Team",
    category: "Career Advice",
    publishedAt: daysAgo(6),
  },
  {
    title: "Remote Interviews Are Different — Here's How to Prepare",
    slug: "how-to-prepare-for-remote-interviews",
    excerpt:
      "The rules of a great in-person interview don't map cleanly onto a video call. A few adjustments make a real difference.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1200&h=630&fit=crop",
    content:
      "On video, pauses read as hesitation even when you're just thinking. Practice answering common questions out loud beforehand so your responses come more naturally under the slight lag of a video call.\n\nLighting and framing matter more than people expect: sit facing a window or lamp, keep the camera at eye level, and mute notifications on every device in the room. These small things signal preparation before you've said a word.\n\nHave your questions for the interviewer ready in a visible note, not memorized — remote interviewers can't see you glance at a notepad the way they would in person, so use that to your advantage. Close by asking about next steps directly; remote hiring processes move faster when candidates ask for a timeline instead of waiting to hear back.",
    author: "Elevora Team",
    category: "Career Advice",
    publishedAt: daysAgo(9),
  },
  {
    title: "What Recruiters Get Wrong About Screening Calls",
    slug: "what-recruiters-get-wrong-about-screening-calls",
    excerpt:
      "A 20-minute screen is supposed to filter for fit. Too often it just filters for who interviews well under pressure.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=630&fit=crop",
    content:
      "The most common mistake in a screening call is asking questions the resume already answers. Use the time instead to probe for things a resume can't show: how a candidate handled a project that went sideways, or how they prioritize when everything feels urgent.\n\nSend the candidate a short agenda beforehand. Candidates who know what's coming perform closer to their actual ability, which means you're screening for the job, not for improv skills.\n\nLeave five minutes at the end for the candidate's questions and actually listen to what they ask — the quality of a candidate's questions is one of the strongest signals of genuine interest versus a candidate applying broadly. On Elevora, recruiters who structure screens this way report fewer late-stage surprises and faster time-to-offer.",
    author: "Elevora Team",
    category: "Hiring",
    publishedAt: daysAgo(13),
  },
  {
    title: "Negotiating Salary Without Burning the Relationship",
    slug: "negotiating-salary-without-burning-relationship",
    excerpt:
      "Negotiation feels adversarial. Done well, it's the opposite — it's the first real conversation about how the company values you.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
    content:
      "Anchor your ask to market data, not personal need. \"Based on similar roles in this market, I was expecting a range closer to X\" lands very differently than a number pulled from your monthly expenses.\n\nNegotiate the whole package, not just base salary — signing bonus, review timeline, remote flexibility, and start date are all frequently movable even when base salary is fixed by a band.\n\nAnd don't treat the first offer as final unless the recruiter says explicitly that it is. Most initial offers on Elevora leave some room, and a calm, specific counter rarely damages the relationship — it usually earns respect from a hiring team that wants someone who can advocate for themselves.",
    author: "Elevora Team",
    category: "Career Advice",
    publishedAt: daysAgo(18),
  },
  {
    title: "Building a Job Description Your Team Will Actually Use",
    slug: "building-job-description-your-team-will-actually-use",
    excerpt:
      "A job description shouldn't just get you a hire — it should still be useful on day 90 as a reference for what success looks like.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop",
    content:
      "Most job descriptions are written once, used for a single hiring cycle, and never opened again. Write yours so it survives past the offer letter: include the outcomes the role owns, not just the tasks it performs.\n\nInvolve the hiring manager and at least one future teammate in drafting it — descriptions written solely by a recruiter tend to drift from what the team actually needs six months in.\n\nRevisit the description at the new hire's 90-day check-in. If it no longer matches what they're doing, that's useful signal for the next posting, and it keeps your job descriptions honest instead of aspirational.",
    author: "Elevora Team",
    category: "Hiring",
    publishedAt: daysAgo(22),
  },
];

async function seed() {
  const db = await connectDB();
  const collection = db.collection("blogPosts");
  await collection.deleteMany({});
  const result = await collection.insertMany(posts);
  console.log(`Inserted ${result.insertedCount} blog posts.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
