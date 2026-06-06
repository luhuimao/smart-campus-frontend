// Server Component — reads session cookie, passes raw value to client
// (raw base64 avoids btoa Chinese-character crash in Next.js SSR serialization)
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
  // Dev mode: encode dev user and pass as sessionValue (avoids RSC boundary issue)
  const devUser = getDevUser();
  if (devUser) {
    return <HomeClient sessionValue={encodeSession(devUser)} />;
  }

  const jar = await cookies();
  const sessionValue = jar.get(SESSION_COOKIE)?.value ?? null;
  return <HomeClient sessionValue={sessionValue} />;
}
