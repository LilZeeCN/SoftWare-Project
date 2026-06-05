import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/components/dashboard/DashboardPage';
import CoursesPage from '@/components/courses/CoursesPage';
import CreateCoursePage from '@/components/courses/CreateCoursePage';
import CourseDetailLayout from '@/components/course-detail/CourseDetailLayout';
import OutlineTab from '@/components/course-detail/outline/OutlineTab';
import ReportPage from '@/components/report/ReportPage';
import CertificatesPage from '@/components/certificates/CertificatesPage';
import SettingsPage from '@/components/settings/SettingsPage';
import '@/globals.css';

function AppLayout() {
  return (
    <div className="app-layout">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<CreateCoursePage />} />
          <Route path="/courses/:courseId" element={<CourseDetailLayout />}>
            <Route index element={<Navigate to="outline" replace />} />
            <Route path="outline" element={<OutlineTab />} />
            {/* 以下 Tab 由队友 C 实现，暂时用占位 */}
            <Route path="notes" element={<TabPlaceholder title="笔记" icon="📝" />} />
            <Route path="labs" element={<TabPlaceholder title="实验" icon="🧪" />} />
            <Route path="chat" element={<TabPlaceholder title="对话" icon="💬" />} />
            <Route path="projects" element={<TabPlaceholder title="项目" icon="🔧" />} />
          </Route>
          <Route path="/report" element={<ReportPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function TabPlaceholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="course-tab-panel active" style={{ padding: '32px' }}>
      <div className="empty-state">
        <div className="empty-icon">{icon}</div>
        <div className="empty-text">{title} Tab</div>
        <div className="empty-sub">此功能由队友 C 实现</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
