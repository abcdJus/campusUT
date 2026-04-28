export type BoardSlug =
  | "free"
  | "class"
  | "exam"
  | "job"
  | "club-utksa"
  | "club-utkos";

export type SortKey = "recent" | "hot";

export interface Board {
  slug: BoardSlug;
  name: string;
  description: string;
  icon: string;
  accent: "blue" | "green" | "rose" | "amber" | "violet" | "teal";
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  university?: string;
  major?: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  board: BoardSlug;
  title: string;
  content: string;
  author: UserSummary | null;
  anonymous: boolean;
  allowComments: boolean;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface CourseMeeting {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  start: string;
  end: string;
  campus: string;
  room: string;
  instructor: string;
}

export interface Course {
  code: string;
  title: string;
  dept: string;
  campus: string;
  term: "F" | "S" | "Y";
  delivery: "In-Person" | "Online" | "Hybrid";
  status: "Open" | "Waitlist" | "Full";
  desc: string;
  meetings: CourseMeeting[];
}

export interface MarketItem {
  id: string;
  title: string;
  category: "Textbooks" | "Electronics" | "Furniture" | "Other";
  priceCents: number;
  condition: "New" | "Like New" | "Good" | "Fair";
  campus: string;
  sellerName: string;
  createdAt: string;
}

export const boards: Board[] = [
  {
    slug: "free",
    name: "Free Board",
    description: "Daily questions, campus life, and quick updates.",
    icon: "MessageSquare",
    accent: "blue"
  },
  {
    slug: "class",
    name: "Class Info",
    description: "Course notes, assignment reminders, and study threads.",
    icon: "BookOpen",
    accent: "green"
  },
  {
    slug: "exam",
    name: "Exam Info",
    description: "Exam dates, review sessions, and prep resources.",
    icon: "CalendarCheck",
    accent: "rose"
  },
  {
    slug: "job",
    name: "Job Info",
    description: "Internships, hiring posts, and career events.",
    icon: "BriefcaseBusiness",
    accent: "amber"
  },
  {
    slug: "club-utksa",
    name: "UTKSA",
    description: "Korean student association events and announcements.",
    icon: "UsersRound",
    accent: "violet"
  },
  {
    slug: "club-utkos",
    name: "UTKOS",
    description: "Coding, algorithms, and project meetups.",
    icon: "Code2",
    accent: "teal"
  }
];

export const seedUser: UserSummary = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@campustalk.local",
  name: "CampusTalk Demo",
  university: "University of Toronto",
  major: "Computer Science"
};

export const seedPosts: Post[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    board: "free",
    title: "Best quiet study spaces near St. George?",
    content:
      "Looking for reliable spots after 6 PM. Robarts gets packed during midterms.",
    author: seedUser,
    anonymous: false,
    allowComments: true,
    likes: 18,
    comments: 6,
    createdAt: "2026-04-25T15:24:00.000Z"
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    board: "class",
    title: "CSC148 review notes for recursion and trees",
    content:
      "I organized examples from lecture and added a few practice prompts for tree traversal.",
    author: seedUser,
    anonymous: false,
    allowComments: true,
    likes: 32,
    comments: 11,
    createdAt: "2026-04-24T20:05:00.000Z"
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    board: "exam",
    title: "MAT135 final review room changed",
    content:
      "The review session moved from SS2108 to MP102. Same time, Friday at 9 AM.",
    author: null,
    anonymous: true,
    allowComments: true,
    likes: 12,
    comments: 3,
    createdAt: "2026-04-23T13:48:00.000Z"
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    board: "job",
    title: "Summer frontend internship referral thread",
    content:
      "Drop company names, deadlines, and whether referrals are still open.",
    author: seedUser,
    anonymous: false,
    allowComments: true,
    likes: 41,
    comments: 14,
    createdAt: "2026-04-22T17:31:00.000Z"
  }
];

export const seedCourses: Course[] = [
  {
    code: "CSC108H1",
    title: "Introduction to Computer Programming",
    dept: "Computer Science",
    campus: "St. George",
    term: "F",
    delivery: "In-Person",
    status: "Open",
    desc: "Python-based intro to programming.",
    meetings: [
      {
        day: "Mon",
        start: "10:00",
        end: "11:00",
        campus: "St. George",
        room: "BA1130",
        instructor: "Smith"
      },
      {
        day: "Wed",
        start: "10:00",
        end: "11:00",
        campus: "St. George",
        room: "BA1130",
        instructor: "Smith"
      }
    ]
  },
  {
    code: "MAT135H1",
    title: "Calculus I",
    dept: "Mathematics",
    campus: "St. George",
    term: "F",
    delivery: "In-Person",
    status: "Waitlist",
    desc: "Limits, derivatives, applications.",
    meetings: [
      {
        day: "Tue",
        start: "12:00",
        end: "13:00",
        campus: "St. George",
        room: "SS2108",
        instructor: "Lee"
      },
      {
        day: "Thu",
        start: "12:00",
        end: "13:00",
        campus: "St. George",
        room: "SS2108",
        instructor: "Lee"
      }
    ]
  },
  {
    code: "CSC148H1",
    title: "Introduction to Computer Science",
    dept: "Computer Science",
    campus: "St. George",
    term: "S",
    delivery: "Online",
    status: "Full",
    desc: "Abstract data types and algorithms in Python.",
    meetings: [
      {
        day: "Mon",
        start: "14:00",
        end: "15:00",
        campus: "St. George",
        room: "BA1210",
        instructor: "Ng"
      },
      {
        day: "Wed",
        start: "14:00",
        end: "15:00",
        campus: "St. George",
        room: "BA1210",
        instructor: "Ng"
      }
    ]
  },
  {
    code: "STA130H1",
    title: "An Introduction to Statistical Reasoning and Data Science",
    dept: "Statistics",
    campus: "St. George",
    term: "F",
    delivery: "Hybrid",
    status: "Open",
    desc: "Data science and statistical reasoning.",
    meetings: [
      {
        day: "Fri",
        start: "09:00",
        end: "10:00",
        campus: "St. George",
        room: "MP102",
        instructor: "Khan"
      }
    ]
  }
];

export const seedMarketItems: MarketItem[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    title: "MAT135 textbook, 9th edition",
    category: "Textbooks",
    priceCents: 4500,
    condition: "Good",
    campus: "St. George",
    sellerName: "Alex",
    createdAt: "2026-04-24T18:22:00.000Z"
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    title: "Portable monitor, USB-C",
    category: "Electronics",
    priceCents: 11000,
    condition: "Like New",
    campus: "Robarts Library",
    sellerName: "Mina",
    createdAt: "2026-04-21T14:10:00.000Z"
  }
];
