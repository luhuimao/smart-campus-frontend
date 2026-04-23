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

export type PageKey = "research-dashboard" | "student-dashboard" | "teacher-cert" | "title-info" | "honor-title" | "award-record" | "paper" | "project" | "works" | "teacher-training" | "work-history" | "education" | "part-time" | "science-fest-dashboard" | "science-fest-form" | "lesson-prep-record" | "learning-analysis-table";

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("research-dashboard");

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
      <Sidebar onNavigate={setActivePage} activePage={activePage} />

      <div style={{ flex: 1, height: "100vh", overflow: "hidden" }}>
        {activePage === "student-dashboard" && <StudentDashboard />}
        {activePage === "research-dashboard" && <ResearchDashboard />}
        {activePage === "teacher-cert" && <TeacherCertPage />}
        {activePage === "title-info" && <TitleInfoPage />}
        {activePage === "honor-title" && <HonorTitlePage />}
        {activePage === "award-record" && <AwardRecordPage />}
        {activePage === "paper" && <PaperPage />}
        {activePage === "project" && <ProjectPage />}
        {activePage === "works" && <WorksPage />}
        {activePage === "teacher-training" && <TeacherTrainingPage />}
        {activePage === "work-history" && <WorkHistoryPage />}
        {activePage === "education" && <EducationPage />}
        {activePage === "part-time" && <PartTimePage />}
        {activePage === "science-fest-dashboard" && <ScienceFestDashboard />}
        {activePage === "science-fest-form" && <ScienceFestFormPage />}
        {activePage === "lesson-prep-record" && <LessonPrepRecordPage />}
        {activePage === "learning-analysis-table" && <LearningAnalysisTablePage />}
      </div>
    </div>
  );
}
