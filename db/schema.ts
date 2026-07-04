

import { Description } from "@radix-ui/react-dialog";
import { relations } from "drizzle-orm";
import { boolean,pgEnum,integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// The passage/story for the exam
export const examPassages = pgTable("exam_passages", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(), // full text with [BLANK_1] markers
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    timeLimit: integer("time_limit").notNull().default(30), // minutes
    order: integer("order").notNull().default(0),
});

// Cloze answers (the blanks)
export const examBlanks = pgTable("exam_blanks", {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id").references(() => examPassages.id, { onDelete: "cascade" }).notNull(),
    blankNumber: integer("blank_number").notNull(), // matches [BLANK_1], [BLANK_2] etc
    correctAnswer: text("correct_answer").notNull(),
    acceptedAnswers: text("accepted_answers"), // pipe-separated alternatives e.g. "ran|run|running"
});

// Open ended comprehension questions
export const examQuestions = pgTable("exam_questions", {
    id: serial("id").primaryKey(),
    passageId: integer("passage_id").references(() => examPassages.id, { onDelete: "cascade" }).notNull(),
    question: text("question").notNull(),
    sampleAnswer: text("sample_answer").notNull().default(""),
    markScheme: text("mark_scheme").notNull(), // what Claude uses to evaluate
    maxMarks: integer("max_marks").notNull().default(3),
    order: integer("order").notNull().default(0),
});

// Store user exam attempts
export const examAttempts = pgTable("exam_attempts", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    passageId: integer("passage_id").references(() => examPassages.id, { onDelete: "cascade" }).notNull(),
    blankScore: integer("blank_score").notNull().default(0),
    comprehensionScore: integer("comprehension_score").notNull().default(0),
    totalScore: integer("total_score").notNull().default(0),
    timeTaken: integer("time_taken").notNull(), // seconds
    completedAt: timestamp("completed_at").notNull().defaultNow(),
});
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(), // auto increment
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) =>({
  userProgress: many(userProgress),
  units: many(units),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), //Unit 1
  description: text("description").notNull(), //Learn the basics of spanish
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade"}).notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({many, one}) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons), 
}));

export const lessons = pgTable("lessons",{
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  unitId: integer("unit_id").references(() => units.id, {onDelete:"cascade"}).notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many}) => ({
  unit:one(units,{
    fields:[lessons.unitId],
    references:[units.id]
  }),
  challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST", "TYPING", "SPEAKING", "LISTENING"]);

export const lessonCompletions = pgTable("lesson_completions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    heartsAtStart: integer("hearts_at_start").notNull(),
    heartsAtEnd: integer("hearts_at_end").notNull(),
    xpEarned: integer("xp_earned").notNull(),
    timeSeconds: integer("time_seconds").notNull(),
    mistakeCount: integer("mistake_count").notNull().default(0),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const lessonCompletionRelations = relations(lessonCompletions, ({ one }) => ({
    lesson: one(lessons, {
        fields: [lessonCompletions.lessonId],
        references: [lessons.id],
    }),
}));
export const challengeAttempts = pgTable("challenge_attempts", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    correct: boolean("correct").notNull(),
    attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const challengeAttemptRelations = relations(challengeAttempts, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeAttempts.challengeId],
        references: [challenges.id],
    }),
    lesson: one(lessons, {
        fields: [challengeAttempts.lessonId],
        references: [lessons.id],
    }),
}));

export const challenges = pgTable("challenges",{
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, {onDelete:"cascade"}).notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

export const challengesRelations = relations(challenges, ({ one, many}) => 
({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options",{
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id, {onDelete:"cascade"}).notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => 
({
  challenge: one(challenges, {
    fields: [challengeOptions.challengeId],
    references: [challenges.id],
  })
}));

export const challengeProgress = pgTable("challenge_progress",{
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id, {onDelete:"cascade"}).notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => 
({
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));


export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName:text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, { onDelete: "cascade" }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0), 
  darkMode: boolean("dark_mode").notNull().default(false),
});

export const userProgressRelations = relations(userProgress, ({ one }) => 
  ({
    activeCourse: one(courses, {
      fields: [userProgress.activeCourseId],
      references:[courses.id],
    }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull().unique(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
  isActive: boolean("isActive").default(false),
});
