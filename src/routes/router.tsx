import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/layout/AppLayout';
import LandingGate from '@/pages/landing/LandingGate';
import LoginPage from '@/pages/auth/LoginPage';
import RoleSelectPage from '@/pages/onboarding/RoleSelectPage';
import TermPage from '@/pages/onboarding/TermPage';
import PlanSelectPage from '@/pages/onboarding/PlanSelectPage';
import StudentProfileSetupPage from '@/pages/onboarding/student/StudentProfileSetupPage';
import TeacherProfileSetupPage from '@/pages/onboarding/teacher/TeacherProfileSetupPage';
import MainPage from '@/pages/main/MainPage';
import PracticePage from '@/pages/practice/PracticePage';
import PracticeCreatePage from '@/pages/practice/PracticeCreatePage';
import PracticeEditPage from '@/pages/practice/PracticeEditPage';
import PracticeDetailPage from '@/pages/practice/PracticeDetailPage';
import PracticePlayPage from '@/pages/practice/PracticePlayPage';
import PracticeSettingsPage from '@/pages/practice/PracticeSettingsPage';
import AnalysisSelectPage from '@/pages/practice/analysis/AnalysisSelectPage';
import AnalysisResultPage from '@/pages/practice/analysis/AnalysisResultPage';
import LearnPage from '@/pages/learn/LearnPage';
import TopicListPage from '@/pages/learn/TopicListPage';
import TopicDetailPage from '@/pages/learn/TopicDetailPage';
import StepLearningPage from '@/pages/learn/StepLearningPage';
import StepTheoryPage from '@/pages/learn/StepTheoryPage';
import StepLearningSettingsPage from '@/pages/learn/StepLearningSettingsPage';
import StepLearningPlayPage from '@/pages/learn/StepLearningPlayPage';
import ScorePage from '@/pages/learn/ScorePage';
import HistoryPage from '@/pages/history/HistoryPage';
import HistoryDetailPage from '@/pages/history/HistoryDetailPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import ProfileEditPage from '@/pages/profile/ProfileEditPage';
import LoadingPage from '@/pages/common/LoadingPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import StudentListPage from '@/pages/admin/student/StudentListPage';
import StudentDetailPage from '@/pages/admin/student/StudentDetailPage';
import TeacherListPage from '@/pages/admin/teacher/TeacherListPage';
import TrackListPage from '@/pages/admin/track/TrackListPage';
import TrackCreatePage from '@/pages/admin/track/TrackCreatePage';
import TrackDetailPage from '@/pages/admin/track/TrackDetailPage';
import TrackEditPage from '@/pages/admin/track/TrackEditPage';
import AdminMyPage from '@/pages/admin/mypage/AdminMyPage';
import AdminMyPageEditPage from '@/pages/admin/mypage/AdminMyPageEditPage';
import TeacherMyPageEditPage from '@/pages/admin/mypage/TeacherMyPageEditPage';
import LatencyCheckPage from '@/pages/latency/LatencyCheckPage';
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingGate />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/oauth/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/onboarding',
    children: [
      {
        path: 'terms',
        element: <TermPage />,
      },
      {
        path: 'role',
        element: <RoleSelectPage />,
      },
      {
        path: 'student',
        children: [
          {
            path: 'profile',
            element: <StudentProfileSetupPage />,
          },
          {
            path: 'plan',
            element: <PlanSelectPage />,
          },
        ],
      },
      {
        path: 'teacher',
        children: [
          {
            path: 'profile',
            element: <TeacherProfileSetupPage />,
          },
          {
            path: 'plan',
            element: <PlanSelectPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/main',
        element: <MainPage />,
      },
      {
        path: '/latency-check',
        element: <LatencyCheckPage />,
      },
      {
        path: '/practice',
        children: [
          {
            index: true,
            element: <PracticePage />,
          },
          {
            path: 'new',
            element: <PracticeCreatePage />,
          },
          {
            path: ':practiceId',
            element: <PracticeDetailPage />,
          },
          {
            path: ':practiceId/edit',
            element: <PracticeEditPage />,
          },
          {
            path: ':practiceId/play',
            element: <PracticePlayPage />,
          },
          {
            path: ':practiceId/settings',
            element: <PracticeSettingsPage />,
          },
          {
            path: ':practiceId/analysis',
            element: <AnalysisSelectPage />,
          },
          {
            path: ':practiceId/analysis/result',
            element: <AnalysisResultPage />,
          },
        ],
      },
      {
        path: '/learn',
        children: [
          {
            index: true,
            element: <LearnPage />,
          },
          {
            path: 'topics',
            children: [
              {
                index: true,
                element: <TopicListPage />,
              },
            ],
          },
          {
            path: 'curriculum',
            children: [
              {
                index: true,
                element: <TopicDetailPage />,
              },
              {
                path: ':curriculumId',
                element: <StepLearningPage />,
              },
              {
                path: ':curriculumId/steps/:stepId/theory',
                element: <StepTheoryPage />,
              },
              {
                path: ':curriculumId/steps/:stepId/settings',
                element: <StepLearningSettingsPage />,
              },
              {
                path: ':curriculumId/steps/:stepId/play',
                element: <StepLearningPlayPage />,
              },
              {
                path: ':curriculumId/steps/:stepId/score',
                element: <ScorePage />,
              },
            ],
          },
        ],
      },
      {
        path: '/history',
        children: [
          {
            index: true,
            element: <HistoryPage />,
          },
          {
            path: ':historyId',
            children: [
              {
                index: true,
                element: <HistoryDetailPage />,
              },
              {
                path: 'analysis/result',
                element: <AnalysisResultPage />,
              },
            ],
          },
        ],
      },
      {
        path: '/profile',
        children: [
          {
            index: true,
            element: <ProfilePage />,
          },
          {
            path: 'edit',
            element: <ProfileEditPage />,
          },
        ],
      },
      {
        path: '/loading',
        element: <LoadingPage />,
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'students',
        children: [
          {
            index: true,
            element: <StudentListPage />,
          },
          {
            path: ':studentId',
            element: <StudentDetailPage />,
          },
        ],
      },
      {
        path: 'teachers',
        element: <TeacherListPage />,
      },
      {
        path: 'tracks',
        children: [
          {
            index: true,
            element: <TrackListPage />,
          },
          {
            path: 'new',
            element: <TrackCreatePage />,
          },
          {
            path: ':trackId',
            element: <TrackDetailPage />,
          },
          {
            path: ':trackId/edit',
            element: <TrackEditPage />,
          },
        ],
      },
      {
        path: 'mypage',
        children: [
          {
            index: true,
            element: <AdminMyPage />,
          },
          {
            path: 'edit',
            element: <AdminMyPageEditPage />,
          },
          {
            path: 'teacher/edit',
            element: <TeacherMyPageEditPage />,
          },
        ],
      },
    ],
  },
]);
