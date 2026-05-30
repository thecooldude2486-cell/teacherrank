// ===== Teacher rating taxonomy (grouped, like schools) =====
export const TEACHING_KEYS = [
  "teaching_clarity",
  "lesson_planning",
  "subject_knowledge",
  "homework_quality",
  "assessment_feedback",
] as const;

export const CLASSROOM_KEYS = [
  "classroom_management",
  "student_engagement",
  "motivation",
  "behaviour_handling",
] as const;

export const CARE_KEYS = [
  "student_wellbeing",
  "kindness_respect",
  "inclusiveness",
  "emotional_support",
] as const;

export const COMMUNICATION_KEYS = [
  "parent_communication",
  "responsiveness",
  "transparency",
  "parent_meetings",
] as const;

export const ALL_TEACHER_RATING_KEYS = [
  ...TEACHING_KEYS,
  ...CLASSROOM_KEYS,
  ...CARE_KEYS,
  ...COMMUNICATION_KEYS,
] as const;

export type TeacherRatingKey = (typeof ALL_TEACHER_RATING_KEYS)[number];
export type TeacherRatings = Record<TeacherRatingKey, number>;

export const TEACHER_RATING_LABELS: Record<TeacherRatingKey, string> = {
  teaching_clarity: "Teaching clarity",
  lesson_planning: "Lesson planning",
  subject_knowledge: "Subject knowledge",
  homework_quality: "Homework quality & load",
  assessment_feedback: "Assessment & feedback",
  classroom_management: "Classroom management",
  student_engagement: "Student engagement",
  motivation: "Motivation & encouragement",
  behaviour_handling: "Behaviour handling",
  student_wellbeing: "Student wellbeing",
  kindness_respect: "Kindness & respect",
  inclusiveness: "Inclusiveness",
  emotional_support: "Emotional support",
  parent_communication: "Communication with parents",
  responsiveness: "Responsiveness",
  transparency: "Transparency on progress",
  parent_meetings: "Parent-teacher meetings",
};

export const TEACHER_RATING_GROUPS = [
  { id: "teaching", label: "Teaching & Learning", keys: TEACHING_KEYS },
  { id: "classroom", label: "Classroom Management", keys: CLASSROOM_KEYS },
  { id: "care", label: "Care & Wellbeing", keys: CARE_KEYS },
  { id: "communication", label: "Communication", keys: COMMUNICATION_KEYS },
] as const;

export type Review = {
  id: string;
  teacher_id: string;
  parent_name: string;
  ratings: TeacherRatings;
  overall: number;
  written_feedback: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reported?: boolean;
  report_reason?: string;
};


import t1Img from "@/assets/teacher-1.jpg";
import t2Img from "@/assets/teacher-2.jpg";
import t3Img from "@/assets/teacher-3.jpg";
import t4Img from "@/assets/teacher-4.jpg";
import t5Img from "@/assets/teacher-5.jpg";
import t6Img from "@/assets/teacher-6.jpg";
import t7Img from "@/assets/teacher-7.jpg";
import t8Img from "@/assets/teacher-8.jpg";

export type Teacher = {
  id: string;
  name: string;
  school_id: string;
  year_level: string;
  year_levels?: string[];
  class_type: string;
  location: string;
  status: "pending" | "approved";
  created_at: string;
  avatar_color: string;
  photo?: string;
};

export const teacherGrades = (t: Teacher): string[] => {
  const list = (t.year_levels && t.year_levels.length > 0) ? t.year_levels : [t.year_level];
  return Array.from(new Set(list.filter(Boolean)));
};

export const addTeacherGrade = (teacherId: string, grade: string) => {
  teachers = teachers.map(t => {
    if (t.id !== teacherId) return t;
    const next = Array.from(new Set([...(t.year_levels ?? [t.year_level]), grade]));
    return { ...t, year_levels: next };
  });
};

export type School = { id: string; name: string; location: string };

export const schools: School[] = [
  { id: "s1", name: "Sunnybrook Primary", location: "Melbourne, VIC" },
  { id: "s2", name: "Greenfield Public School", location: "Sydney, NSW" },
  { id: "s3", name: "Riverside Elementary", location: "Brisbane, QLD" },
  { id: "s4", name: "Maplewood Primary", location: "Perth, WA" },
  { id: "s5", name: "Hillcrest State School", location: "Adelaide, SA" },
];

const colors = ["#5ab3a8", "#f0a78a", "#f5c869", "#a4c4a0", "#c9a0dc", "#7fb3d5"];

export let teachers: Teacher[] = [
  { id: "t1", name: "Ms. Eleanor Hayes", school_id: "s1", year_level: "Year 3", class_type: "General Classroom", location: "Melbourne, VIC", status: "approved", created_at: "2025-01-12", avatar_color: colors[0], photo: t1Img },
  { id: "t2", name: "Mr. James Whitaker", school_id: "s2", year_level: "Year 5", class_type: "Mathematics & Science", location: "Sydney, NSW", status: "approved", created_at: "2025-02-04", avatar_color: colors[1], photo: t2Img },
  { id: "t3", name: "Mrs. Priya Sharma", school_id: "s1", year_level: "Year 1", class_type: "Foundation Literacy", location: "Melbourne, VIC", status: "approved", created_at: "2025-01-22", avatar_color: colors[2], photo: t3Img },
  { id: "t4", name: "Mr. Daniel O'Connor", school_id: "s3", year_level: "Year 6", class_type: "General Classroom", location: "Brisbane, QLD", status: "approved", created_at: "2025-03-01", avatar_color: colors[3], photo: t4Img },
  { id: "t5", name: "Ms. Sofia Martinez", school_id: "s4", year_level: "Year 2", class_type: "Arts & Music", location: "Perth, WA", status: "approved", created_at: "2025-02-18", avatar_color: colors[4], photo: t5Img },
  { id: "t6", name: "Mrs. Aisha Bello", school_id: "s5", year_level: "Year 4", class_type: "General Classroom", location: "Adelaide, SA", status: "approved", created_at: "2025-03-10", avatar_color: colors[5], photo: t6Img },
  { id: "t7", name: "Mr. Thomas Reilly", school_id: "s2", year_level: "Year 3", class_type: "Physical Education", location: "Sydney, NSW", status: "approved", created_at: "2025-04-02", avatar_color: colors[0], photo: t7Img },
  { id: "t8", name: "Ms. Hana Tanaka", school_id: "s3", year_level: "Prep", class_type: "Foundation", location: "Brisbane, QLD", status: "pending", created_at: "2025-05-01", avatar_color: colors[1], photo: t8Img },
];

const spread = (vals: number[]): TeacherRatings => {
  const o = {} as TeacherRatings;
  ALL_TEACHER_RATING_KEYS.forEach((k, i) => { o[k] = vals[i % vals.length]; });
  return o;
};

const mkR = (id: string, tid: string, parent: string, vals: number[], text: string, status: Review["status"] = "approved", reported = false): Review => {
  const ratings = spread(vals);
  const overall = +(Object.values(ratings).reduce((a, b) => a + b, 0) / ALL_TEACHER_RATING_KEYS.length).toFixed(1);
  return {
    id, teacher_id: tid, parent_name: parent,
    ratings, overall,
    written_feedback: text, status, created_at: "2025-04-15", reported,
    report_reason: reported ? "Possible personal information mentioned" : undefined,
  };
};

export let reviews: Review[] = [
  mkR("r1", "t1", "A parent", [5, 5, 5, 4, 5, 4], "Ms. Hayes has been wonderful this year. Communication through the class app is consistent, and she truly seems to care about each child's wellbeing."),
  mkR("r2", "t1", "A parent", [4, 5, 5, 5, 5, 4], "Very engaging lessons. My child looks forward to school."),
  mkR("r3", "t2", "A parent", [4, 4, 5, 4, 4, 3], "Strong teacher with high standards. Homework is a little heavy some weeks but always purposeful."),
  mkR("r4", "t3", "A parent", [5, 5, 5, 5, 5, 5], "Outstanding foundation year. Calm, patient, and incredibly organised."),
  mkR("r5", "t4", "A parent", [4, 4, 4, 5, 4, 4], "Great preparation for high school. Encourages independence."),
  mkR("r6", "t5", "A parent", [5, 5, 4, 5, 5, 5], "Brings so much warmth and creativity to the classroom."),
  mkR("r7", "t6", "A parent", [4, 5, 4, 4, 5, 4], "Kind and consistent. Parent-teacher meetings are always thoughtful."),
  mkR("r8", "t2", "A parent", [3, 4, 4, 3, 4, 3], "Solid teaching, would appreciate more frequent updates between reports.", "pending"),
  mkR("r9", "t7", "A parent", [5, 4, 4, 5, 5, 4], "Encourages every child to participate. PE is now my kid's favourite."),
  mkR("r10", "t1", "A parent", [2, 3, 3, 2, 3, 4], "Some concerns this term — I'd like to discuss directly.", "pending", true),
];

export type Report = { id: string; review_id: string; reason: string; status: "open" | "resolved"; created_at: string };
export let reports: Report[] = [
  { id: "rep1", review_id: "r10", reason: "Possible personal information mentioned", status: "open", created_at: "2025-05-02" },
];

export const teacherStats = (teacherId: string) => {
  const approved = reviews.filter(r => r.teacher_id === teacherId && r.status === "approved");
  if (approved.length === 0) {
    return {
      overall: 0, count: 0, breakdown: null as TeacherRatings | null,
      teaching: 0, classroom: 0, care: 0, communication: 0,
    };
  }
  const n = approved.length;
  const breakdown = {} as TeacherRatings;
  ALL_TEACHER_RATING_KEYS.forEach(k => {
    breakdown[k] = +(approved.reduce((s, r) => s + (r.ratings[k] ?? 0), 0) / n).toFixed(1);
  });
  const avgOf = (keys: readonly TeacherRatingKey[]) =>
    +(keys.reduce((s, k) => s + breakdown[k], 0) / keys.length).toFixed(1);
  return {
    overall: avgOf(ALL_TEACHER_RATING_KEYS),
    count: n,
    breakdown,
    teaching: avgOf(TEACHING_KEYS),
    classroom: avgOf(CLASSROOM_KEYS),
    care: avgOf(CARE_KEYS),
    communication: avgOf(COMMUNICATION_KEYS),
  };
};

export const schoolName = (id: string) => schools.find(s => s.id === id)?.name ?? "Unknown School";

export const addTeacher = (t: Omit<Teacher, "id" | "status" | "created_at" | "avatar_color">) => {
  teachers = [...teachers, { ...t, id: `t${Date.now()}`, status: "pending", created_at: new Date().toISOString().slice(0,10), avatar_color: colors[Math.floor(Math.random()*colors.length)] }];
};

import { shouldFlagReview } from "./moderation";
export const addReview = (r: Omit<Review, "id" | "status" | "created_at" | "overall">) => {
  const vals = Object.values(r.ratings);
  const overall = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  const flag = shouldFlagReview(r.written_feedback);
  const status: Review["status"] = flag.flagged ? "pending" : "approved";
  const newReview: Review = {
    ...r,
    id: `r${Date.now()}`,
    status,
    created_at: new Date().toISOString().slice(0,10),
    overall,
    reported: flag.flagged || r.reported,
    report_reason: flag.reason ?? r.report_reason,
  };
  reviews = [...reviews, newReview];
  if (flag.flagged) {
    reports = [...reports, { id: `rep${Date.now()}`, review_id: newReview.id, reason: flag.reason || "Flagged by auto-moderation", status: "open", created_at: newReview.created_at }];
  }
  return { status, flagged: flag.flagged, reason: flag.reason };
};

export const updateTeacherStatus = (id: string, status: Teacher["status"]) => {
  teachers = teachers.map(t => t.id === id ? { ...t, status } : t);
};
export const removeTeacher = (id: string) => { teachers = teachers.filter(t => t.id !== id); };

export const updateReviewStatus = (id: string, status: Review["status"]) => {
  reviews = reviews.map(r => r.id === id ? { ...r, status } : r);
};
export const removeReview = (id: string) => { reviews = reviews.filter(r => r.id !== id); };
