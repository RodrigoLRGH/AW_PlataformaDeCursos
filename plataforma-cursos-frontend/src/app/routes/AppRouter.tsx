import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import StudentDashboard from "../../features/auth/pages/StudentDashboard";
import CreatorDashboard from "../../features/auth/pages/CreatorDashboard";
import ProtectedRoute from "./ProtectedRoute";
import CourseCatalog from "../../features/courses/pages/CourseCatalog";
import { CreateCoursePage } from "../../features/courses/pages/CreateCoursePage";
import EditCoursePage from "../../features/courses/pages/EditCoursePage";
import LessonPage from "../../features/courses/pages/LessonPage";
import CourseDetailPage from "../../features/courses/pages/CourseDetailPage";
import CreateExamPage from "../../features/exams/pages/CreateExamePage";
import ExamPage from "@/features/exams/pages/ExamPage";
import LessonDetailPage from "@/features/courses/pages/LessonDetailPage";
import CertificatePage from "@/features/courses/pages/CertificatePage";
import ForumPage from "@/features/forums/pages/ForumPage";
import ThreadDetailPage from "@/features/forums/pages/ThreadDetailPage";
import EditExamPage from "@/features/exams/pages/EditExamPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/unauthorized"
          element={<h1>No tienes permiso de acceder a esta pagina</h1>}
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator-dashboard"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <CreatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CourseCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/courses/new"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/courses/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <EditCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/courses/:courseId/lessons"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/courses/:courseId/exam/new"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <CreateExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/exam"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/lessons"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <LessonDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={["student", "creator"]}>
              <CertificatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forums/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ForumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forums/:courseId/threads/:threadId"
          element={
            <ProtectedRoute allowedRoles={["student", "creator"]}>
              <ThreadDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/courses/:courseId/exam/edit/:examId"
          element={
            <ProtectedRoute allowedRoles={["creator"]}>
              <EditExamPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
