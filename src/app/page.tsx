"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ResearchDashboard } from "@/components/ResearchDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TeacherCertPage } from "@/components/TeacherCertPage";
import { TitleInfoPage } from "@/components/TitleInfoPage";
import { HonorTitlePage } from "@/components/HonorTitlePage";
import { AwardRecordPage } from "@/components/AwardRecordPage";
import { PaperPage } from "@/components/PaperPage";
import { ProjectPage } from "@/components/ProjectPage";
import { WorksPage } from "@/components/WorksPage";
import { TeacherTrainingPage } from "@/components/TeacherTrainingPage";
import { WorkHistoryPage } from "@/components/WorkHistoryPage";
import { EducationPage } from "@/components/EducationPage";
import { PartTimePage } from "@/components/PartTimePage";
import { ScienceFestDashboard } from "@/components/ScienceFestDashboard";
import { ScienceFestFormPage } from "@/components/ScienceFestFormPage";
import { LessonPrepRecordPage } from "@/components/LessonPrepRecordPage";
import { LearningAnalysisTablePage } from "@/components/LearningAnalysisTablePage";
import { LessonPrepAnalysisPage } from "@/components/LessonPrepAnalysisPage";
import { ResearchActivityAnalysisPage } from "@/components/ResearchActivityAnalysisPage";
import { ResearchActivityRecordPage } from "@/components/ResearchActivityRecordPage";
import { ClassRankPage } from "@/components/ClassRankPage";
import { CivilizedClassPage } from "@/components/CivilizedClassPage";
import { CivilizedDormPage } from "@/components/CivilizedDormPage";
import { StudentHomePage } from "@/components/StudentHomePage";
import { StudentRosterPage } from "@/components/StudentRosterPage";
import { TalkRecordPage } from "@/components/TalkRecordPage";

export type PageKey = "research-dashboard" | "student-home" | "student-dashboard" | "teacher-cert" | "title-info" | "honor-title" | "award-record" | "paper" | "project" | "works" | "teacher-training" | "work-history" | "education" | "part-time" | "class-rank" | "civilized-class" | "civilized-dorm" | "science-fest-dashboard" | "science-fest-form" | "lesson-prep-record" | "learning-analysis-table" | "lesson-prep-analysis" | "research-activity-analysis" | "research-activity-record" | "student-roster" | "talk-record";

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("research-dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const onMenuOpen = () => setMobileMenuOpen(true);

  return (
    <div
      className="flex"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        fontSize: "14px",
        color: "rgb(19, 29, 46)",
      }}
    >
      <Sidebar
        onNavigate={setActivePage}
        activePage={activePage}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, height: "100vh", overflow: "hidden" }}>
        {activePage === "student-home"             && <StudentHomePage onMenuOpen={onMenuOpen} onNavigate={setActivePage} />}
        {activePage === "student-dashboard"       && <StudentDashboard onMenuOpen={onMenuOpen} />}
        {activePage === "research-dashboard"      && <ResearchDashboard onMenuOpen={onMenuOpen} onNavigate={setActivePage} />}
        {activePage === "teacher-cert"            && <TeacherCertPage onMenuOpen={onMenuOpen} />}
        {activePage === "title-info"              && <TitleInfoPage onMenuOpen={onMenuOpen} />}
        {activePage === "honor-title"             && <HonorTitlePage onMenuOpen={onMenuOpen} />}
        {activePage === "award-record"            && <AwardRecordPage onMenuOpen={onMenuOpen} />}
        {activePage === "paper"                   && <PaperPage onMenuOpen={onMenuOpen} />}
        {activePage === "project"                 && <ProjectPage onMenuOpen={onMenuOpen} />}
        {activePage === "works"                   && <WorksPage onMenuOpen={onMenuOpen} />}
        {activePage === "teacher-training"        && <TeacherTrainingPage onMenuOpen={onMenuOpen} />}
        {activePage === "work-history"            && <WorkHistoryPage onMenuOpen={onMenuOpen} />}
        {activePage === "education"               && <EducationPage onMenuOpen={onMenuOpen} />}
        {activePage === "part-time"               && <PartTimePage onMenuOpen={onMenuOpen} />}
        {activePage === "class-rank"              && <ClassRankPage onMenuOpen={onMenuOpen} />}
        {activePage === "civilized-class"         && <CivilizedClassPage onMenuOpen={onMenuOpen} />}
        {activePage === "civilized-dorm"          && <CivilizedDormPage onMenuOpen={onMenuOpen} />}
        {activePage === "science-fest-dashboard"  && <ScienceFestDashboard onMenuOpen={onMenuOpen} />}
        {activePage === "science-fest-form"       && <ScienceFestFormPage onMenuOpen={onMenuOpen} />}
        {activePage === "lesson-prep-record"      && <LessonPrepRecordPage onMenuOpen={onMenuOpen} />}
        {activePage === "learning-analysis-table" && <LearningAnalysisTablePage onMenuOpen={onMenuOpen} />}
        {activePage === "lesson-prep-analysis"        && <LessonPrepAnalysisPage onMenuOpen={onMenuOpen} />}
        {activePage === "research-activity-analysis" && <ResearchActivityAnalysisPage onMenuOpen={onMenuOpen} />}
        {activePage === "research-activity-record"   && <ResearchActivityRecordPage onMenuOpen={onMenuOpen} />}
        {activePage === "student-roster"              && <StudentRosterPage onMenuOpen={onMenuOpen} />}
        {activePage === "talk-record"                 && <TalkRecordPage onMenuOpen={onMenuOpen} />}
      </div>
    </div>
  );
}
