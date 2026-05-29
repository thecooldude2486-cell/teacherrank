// Mock data for the Primary School Ratings section.
// All ratings are 1-5. "school_reviews" simulates the backend table.

export const LEARNING_KEYS = [
  "teaching_quality",
  "academic_support",
  "homework_load",
  "student_wellbeing",
  "safety_behaviour",
] as const;

export const ENVIRONMENT_KEYS = [
  "cleanliness",
  "school_space",
  "playground",
  "facilities",
  "toilets_hygiene",
  "canteen",
  "sports_facilities",
  "library_resources",
] as const;

export const LOCATION_KEYS = [
  "location_convenience",
  "parking",
  "public_transport",
  "dropoff_pickup",
  "walking_biking",
  "traffic_safety",
  "nearby_facilities",
] as const;

export const COMMUNITY_KEYS = [
  "communication_parents",
  "extracurricular",
  "inclusiveness",
  "parent_community",
  "school_culture",
] as const;

export const ALL_RATING_KEYS = [
  ...LEARNING_KEYS,
  ...ENVIRONMENT_KEYS,
  ...LOCATION_KEYS,
  ...COMMUNITY_KEYS,
] as const;

export type RatingKey = (typeof ALL_RATING_KEYS)[number];
export type Ratings = Record<RatingKey, number>;

export const RATING_LABELS: Record<RatingKey, string> = {
  teaching_quality: "Teaching quality",
  academic_support: "Academic support",
  homework_load: "Homework / load reasonableness",
  student_wellbeing: "Student wellbeing",
  safety_behaviour: "Safety & behaviour management",
  cleanliness: "Cleanliness of classrooms & common areas",
  school_space: "School size & space",
  playground: "Playground quality",
  facilities: "Facilities quality",
  toilets_hygiene: "Toilets & hygiene",
  canteen: "Canteen quality",
  sports_facilities: "Sports facilities",
  library_resources: "Library & learning resources",
  location_convenience: "Location convenience",
  parking: "Parking availability",
  public_transport: "Public transport access",
  dropoff_pickup: "Drop-off & pick-up convenience",
  walking_biking: "Walking / biking friendliness",
  traffic_safety: "Traffic safety around the school",
  nearby_facilities: "Nearby community facilities",
  communication_parents: "Communication with parents",
  extracurricular: "Extracurricular activities",
  inclusiveness: "Inclusiveness & diversity",
  parent_community: "Parent community",
  school_culture: "Overall school culture",
};

export type SchoolType = "Public" | "Private" | "Catholic" | "Independent";

import ps1Img from "@/assets/schools/ps1.jpg";
import ps2Img from "@/assets/schools/ps2.jpg";
import ps3Img from "@/assets/schools/ps3.jpg";
import ps4Img from "@/assets/schools/ps4.jpg";
import ps5Img from "@/assets/schools/ps5.jpg";
import ps6Img from "@/assets/schools/ps6.jpg";

export type PrimarySchool = {
  id: string;
  name: string;
  suburb: string;
  state: string;
  school_type: SchoolType;
  blurb: string;
  cover_color: string;
  cover_image: string;
};

export type SchoolReview = {
  id: string;
  school_id: string;
  parent_name: string;
  ratings: Ratings;
  written_feedback: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reported?: boolean;
};

export const primarySchools: PrimarySchool[] = [
  { id: "ps1", name: "Sunnybrook Primary", suburb: "Hawthorn", state: "VIC", school_type: "Public",
    blurb: "A welcoming neighbourhood school with strong literacy and a vibrant arts program.",
    cover_color: "#5ab3a8", cover_image: ps1Img },
  { id: "ps2", name: "Greenfield Public School", suburb: "Chatswood", state: "NSW", school_type: "Public",
    blurb: "Established public school known for inclusive classrooms and active parent community.",
    cover_color: "#f0a78a", cover_image: ps2Img },
  { id: "ps3", name: "Riverside Catholic Primary", suburb: "New Farm", state: "QLD", school_type: "Catholic",
    blurb: "Faith-based primary school with a focus on wellbeing and character education.",
    cover_color: "#f5c869", cover_image: ps3Img },
  { id: "ps4", name: "Maplewood Independent", suburb: "Subiaco", state: "WA", school_type: "Independent",
    blurb: "Independent school with small class sizes and excellent facilities.",
    cover_color: "#a4c4a0", cover_image: ps4Img },
  { id: "ps5", name: "Hillcrest State School", suburb: "Norwood", state: "SA", school_type: "Public",
    blurb: "Long-standing state school with strong sports and music traditions.",
    cover_color: "#c9a0dc", cover_image: ps5Img },
  { id: "ps6", name: "Bayside Primary College", suburb: "Brighton", state: "VIC", school_type: "Private",
    blurb: "Coastal primary college with bright modern classrooms and a focus on STEM.",
    cover_color: "#7fb3d5", cover_image: ps6Img },
];

const r = (vals: number[]): Ratings => {
  const o = {} as Ratings;
  ALL_RATING_KEYS.forEach((k, i) => { o[k] = vals[i % vals.length]; });
  return o;
};

// Helper to make varied reviews quickly
const mkReview = (
  id: string, school_id: string, parent: string, baseVals: number[],
  text: string, status: SchoolReview["status"] = "approved", reported = false,
): SchoolReview => ({
  id, school_id, parent_name: parent, ratings: r(baseVals), written_feedback: text,
  status, created_at: "2025-04-20", reported,
});

export let schoolReviews: SchoolReview[] = [
  mkReview("sr1", "ps1", "A parent", [5,5,4,5,5,5,4,5,4,5,4,4,5,4,3,4,5,4,3,4,5,5,5,4,5],
    "Friendly, communicative staff and a calm playground environment. The library is a real highlight."),
  mkReview("sr2", "ps1", "A parent", [4,4,4,5,5,4,4,4,4,4,3,4,4,3,2,3,4,3,2,3,4,4,4,4,5],
    "Strong academic foundations. Parking at drop-off is the main challenge."),
  mkReview("sr3", "ps2", "A parent", [5,4,4,5,5,5,5,5,5,4,4,5,4,4,3,4,5,4,4,4,4,5,5,5,5],
    "Lovely inclusive community. The school communicates clearly through the parent app."),
  mkReview("sr4", "ps3", "A parent", [4,5,4,5,5,4,3,4,4,4,4,3,4,3,3,4,4,3,3,3,5,4,5,4,5],
    "Caring teachers and a strong sense of community. Facilities are older but well maintained."),
  mkReview("sr5", "ps4", "A parent", [5,5,4,5,5,5,5,5,5,5,5,5,5,4,3,4,4,4,3,4,5,5,4,5,5],
    "Outstanding facilities and small classes. Public transport access is limited."),
  mkReview("sr6", "ps5", "A parent", [4,4,3,4,4,4,4,5,4,3,3,4,5,4,4,4,5,5,5,5,4,5,4,4,4],
    "Great sports program and active parent volunteers. The canteen menu could be healthier."),
  mkReview("sr7", "ps6", "A parent", [5,5,4,5,4,5,4,5,5,5,4,5,5,3,2,3,4,3,2,3,5,5,5,4,5],
    "Bright modern classrooms and engaging STEM lessons. Traffic at pick-up needs improvement."),
  mkReview("sr8", "ps2", "A parent", [4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "Solid all-rounder. Would love more extracurricular options.", "pending"),
];

export const schoolStats = (schoolId: string) => {
  const approved = schoolReviews.filter(r => r.school_id === schoolId && r.status === "approved");
  if (approved.length === 0) {
    return { overall: 0, count: 0, breakdown: null as Ratings | null,
      learning: 0, environment: 0, location: 0, community: 0 };
  }
  const n = approved.length;
  const sum = ALL_RATING_KEYS.reduce((acc, k) => {
    acc[k] = approved.reduce((s, r) => s + r.ratings[k], 0);
    return acc;
  }, {} as Ratings);
  const breakdown = {} as Ratings;
  ALL_RATING_KEYS.forEach(k => { breakdown[k] = +(sum[k] / n).toFixed(1); });
  const avgOf = (keys: readonly RatingKey[]) =>
    +(keys.reduce((s, k) => s + breakdown[k], 0) / keys.length).toFixed(1);
  return {
    overall: avgOf(ALL_RATING_KEYS),
    count: n,
    breakdown,
    learning: avgOf(LEARNING_KEYS),
    environment: avgOf(ENVIRONMENT_KEYS),
    location: avgOf(LOCATION_KEYS),
    community: avgOf(COMMUNITY_KEYS),
  };
};

import { shouldFlagReview } from "./moderation";
export const addSchoolReview = (rev: Omit<SchoolReview, "id" | "status" | "created_at">) => {
  const flag = shouldFlagReview(rev.written_feedback);
  const status: SchoolReview["status"] = flag.flagged ? "pending" : "approved";
  schoolReviews = [
    ...schoolReviews,
    { ...rev, id: `sr${Date.now()}`, status,
      created_at: new Date().toISOString().slice(0, 10),
      reported: flag.flagged || rev.reported },
  ];
  return { status, flagged: flag.flagged, reason: flag.reason };
};

export const findSchool = (id: string) => primarySchools.find(s => s.id === id);

export const RATING_GROUPS = [
  { id: "learning", label: "Learning & Teaching", keys: LEARNING_KEYS },
  { id: "environment", label: "School Environment", keys: ENVIRONMENT_KEYS },
  { id: "location", label: "Location & Convenience", keys: LOCATION_KEYS },
  { id: "community", label: "School Community", keys: COMMUNITY_KEYS },
] as const;
