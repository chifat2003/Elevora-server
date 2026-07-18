require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { connectDB } = require("../src/config/db");

const now = Date.now();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

const testimonials = [
  {
    name: "Priya Nandakumar",
    role: "VP of Engineering",
    company: "Northwind Labs",
    quote:
      "We filled a senior backend role in under three weeks. The filtering on Elevora meant every application we opened was actually worth reading.",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    createdAt: daysAgo(4),
  },
  {
    name: "Marcus Webb",
    role: "Head of Talent",
    company: "Brightline Studio",
    quote:
      "Managing postings used to mean three spreadsheets and a shared inbox. Now I post, track applicants, and close roles from one dashboard.",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    createdAt: daysAgo(9),
  },
  {
    name: "Elena Sorokin",
    role: "Software Engineer",
    company: "Hired via Elevora",
    quote:
      "The salary ranges are always upfront, which saved me from wasting time on roles that were never going to work out financially.",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    createdAt: daysAgo(12),
  },
  {
    name: "David Okafor",
    role: "Recruiting Manager",
    company: "Fieldstone Media",
    quote:
      "The applicant quality is noticeably higher than other boards we've tried. Fewer resumes, but far more of them are worth a callback.",
    avatarUrl: "https://randomuser.me/api/portraits/men/51.jpg",
    createdAt: daysAgo(16),
  },
  {
    name: "Sofia Reyes",
    role: "Product Designer",
    company: "Hired via Elevora",
    quote:
      "I saved three job postings and got a follow-up nudge when one of them was closing applications — small detail, but it kept me on track.",
    avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    createdAt: daysAgo(20),
  },
  {
    name: "James Kowalski",
    role: "Director of People",
    company: "Harborview Group",
    quote:
      "Posting a role takes minutes, not the half hour it used to on our old system, and candidates can tell we've made the process easier on their end too.",
    avatarUrl: "https://randomuser.me/api/portraits/men/76.jpg",
    createdAt: daysAgo(25),
  },
];

async function seed() {
  const db = await connectDB();
  const collection = db.collection("testimonials");
  await collection.deleteMany({});
  const result = await collection.insertMany(testimonials);
  console.log(`Inserted ${result.insertedCount} testimonials.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
