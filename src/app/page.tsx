// Server Component — reads session cookie, passes raw value to client shell
import { cookies } from "next/headers";
import { getDevUser, encodeSession, SESSION_COOKIE } from "@/lib/wecom-auth";
import { HomeClient } from "./HomeClient";

export type PageKey =
  | "research-dashboard" | "student-home" | "student-dashboard"
  | "teacher-cert" | "title-info" | "honor-title" | "award-record"
  | "paper" | "project" | "works" | "teacher-training" | "work-history"
  | "education" | "part-time" | "class-rank" | "civilized-class"
  | "civilized-dorm" | "science-fest-dashboard" | "science-fest-form"
  | "lesson-prep-record" | "learning-analysis-table" | "lesson-prep-analysis"
  | "research-activity-analysis" | "research-activity-record"
  | "student-roster" | "talk-record" | "student-award" | "good-deeds"
  | "physical-test" | "student-cadree" | "return-register"
  | "withdrawal-form" | "class-transfer" | "dorm-attendance"
  | "learning-analysis-stats" | "student-score" | "subject-config"
  | "elective-subject" | "semester-config" | "grade-config";

export default async function Home() {
  const jar = await cookies();
  let sessionValue = jar.get(SESSION_COOKIE)?.value ?? null;

  // Dev mode: override with encoded dev user
  const devUser = getDevUser();
  if (devUser) sessionValue = encodeSession(devUser);

  return <HomeClient sessionValue={sessionValue} />;
}
