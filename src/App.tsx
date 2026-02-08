import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegistrationStatus from "./pages/RegistrationStatus";
import Hub from "./pages/Hub";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/hr/Employees";
import Organization from "./pages/hr/Organization";
import OrgTree from "./pages/hr/OrgTree";
import Shifts from "./pages/hr/Shifts";
import Leave from "./pages/hr/Leave";
import Attendance from "./pages/hr/Attendance";
import Expenses from "./pages/hr/Expenses";
import EmployeeOnboarding from "./pages/hr/EmployeeOnboarding";
import EmployeeProfile from "./pages/hr/EmployeeProfile";
import NewBooking from "./pages/seva/NewBooking";
import TodaysBookings from "./pages/seva/TodaysBookings";
import BookingHistory from "./pages/seva/BookingHistory";
import CounterSummary from "./pages/seva/CounterSummary";
import TempleStructure from "./pages/structure/TempleStructure";
import Temples from "./pages/structure/Temples";
import ChildTemples from "./pages/structure/ChildTemples";
import ChildTempleDetail from "./pages/structure/ChildTempleDetail";
import Sacred from "./pages/structure/Sacred";
import SacredDetail from "./pages/structure/SacredDetail";
import Zones from "./pages/structure/Zones";
import ZoneDetail from "./pages/structure/ZoneDetail";
import HallsRooms from "./pages/structure/HallsRooms";
import HallRoomDetail from "./pages/structure/HallRoomDetail";
import Counters from "./pages/structure/Counters";
import CounterDetail from "./pages/structure/CounterDetail";
import StructureHierarchy from "./pages/structure/StructureHierarchy";
import Rituals from "./pages/rituals/Rituals";
import Offerings from "./pages/rituals/Offerings";
import OfferingDetail from "./pages/rituals/OfferingDetail";
import DailySchedule from "./pages/rituals/DailySchedule";
import Festivals from "./pages/rituals/Festivals";
import FestivalDetail from "./pages/rituals/FestivalDetail";
import PriestAssignments from "./pages/rituals/PriestAssignments";
import PriestAssignmentDetail from "./pages/rituals/PriestAssignmentDetail";
import Items from "./pages/inventory/Items";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import Godowns from "./pages/inventory/Godowns";
import StockTransactions from "./pages/inventory/StockTransactions";
import PurchaseManagement from "./pages/inventory/PurchaseManagement";
import MaterialDonations from "./pages/inventory/MaterialDonations";
import StockAudits from "./pages/inventory/StockAudits";
import InventoryReports from "./pages/inventory/InventoryReports";
import Recipes from "./pages/kitchen/Recipes";
import ProductionPlanning from "./pages/kitchen/ProductionPlanning";
import ProductionExecution from "./pages/kitchen/ProductionExecution";
import KitchenStores from "./pages/kitchen/KitchenStores";
import PrasadMaster from "./pages/prasad/PrasadMaster";
import PrasadInventory from "./pages/prasad/PrasadInventory";
import PrasadDistribution from "./pages/prasad/PrasadDistribution";
import RegistrationApprovals from "./pages/admin/RegistrationApprovals";
import PlatformDashboard from "./pages/platform/Dashboard";
import InformationManagement from "./pages/platform/InformationManagement";
import TempleOnboarding from "./pages/platform/TempleOnboarding";
import ApplicationConfig from "./pages/platform/ApplicationConfig";
import Applications from "./pages/platform/Applications";
import Subscriptions from "./pages/platform/Subscriptions";
import Settings from "./pages/platform/Settings";
import Analytics from "./pages/platform/Analytics";
import AssetDashboard from "./pages/assets/AssetDashboard";
import AssetMaster from "./pages/assets/AssetMaster";
import AssetMasterForm from "./pages/assets/AssetMasterForm";
import AssetMovement from "./pages/assets/AssetMovement";
import Maintenance from "./pages/assets/Maintenance";
import AssetAudit from "./pages/assets/AssetAudit";
import AssetDisposal from "./pages/assets/AssetDisposal";
import AssetReports from "./pages/assets/AssetReports";
import ProjectsOverview from "./pages/projects/ProjectsOverview";
import ProjectRegistry from "./pages/projects/ProjectRegistry";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectEditor from "./pages/projects/ProjectEditor";
import MyActivities from "./pages/projects/MyActivities";
import ProjectReports from "./pages/projects/ProjectReports";
import PRDashboard from "./pages/pr/PRDashboard";
import Announcements from "./pages/pr/Announcements";
import CommunicationCenter from "./pages/pr/communication/CommunicationCenter";
import SocialDigital from "./pages/pr/SocialDigital";
import LiveStreaming from "./pages/pr/LiveStreaming";
import LiveDarshan from "./pages/pr/LiveDarshan";
import CommunityFeed from "./pages/pr/devotee-experience/CommunityFeed";
import SupportTickets from "./pages/pr/devotee-experience/SupportTickets";
// Legacy imports (keeping for backward compatibility)
import Events from "./pages/pr/Events";
import EventEditor from "./pages/pr/EventEditor";
import Notifications from "./pages/pr/Notifications";
import BroadcastCenter from "./pages/pr/BroadcastCenter";
import BroadcastCampaignBuilder from "./pages/pr/BroadcastCampaignBuilder";
import Feedback from "./pages/pr/Feedback";
import KnowledgeDashboard from "./pages/knowledge/KnowledgeDashboard";
import CategoriesManagement from "./pages/knowledge/CategoriesManagement";
import KnowledgeDocuments from "./pages/knowledge/KnowledgeDocuments";
import UploadDocument from "./pages/knowledge/UploadDocument";
import ApprovalManagement from "./pages/knowledge/ApprovalManagement";
import BetaConversationTesting from "./pages/knowledge/BetaConversationTesting";
import DevoteeChat from "./pages/knowledge/DevoteeChat";
import NotFound from "./pages/NotFound";
import TaskDashboard from "./pages/tasks/TaskDashboard";
import Tasks from "./pages/tasks/Tasks";
import BranchDirectory from "./pages/branch/BranchDirectory";
import BranchHierarchy from "./pages/branch/BranchHierarchy";
import BranchUsers from "./pages/branch/BranchUsers";
import BranchAccess from "./pages/branch/BranchAccess";
import BranchOverview from "./pages/branch/BranchOverview";
import { PlatformConfigProvider } from "./contexts/PlatformConfigContext";

const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registration-status/:id" element={<RegistrationStatus />} />

      {/* Hub - Post Login Module Selection */}
      <Route path="/hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />

      {/* Dashboard within modules */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* HR Module */}
      <Route path="/hr" element={<ProtectedRoute><Navigate to="/hr/employees" replace /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      <Route path="/hr/employees/:id" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
      <Route path="/hr/employees/new" element={<ProtectedRoute><EmployeeOnboarding /></ProtectedRoute>} />
      <Route path="/hr/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
      <Route path="/hr/org-tree" element={<ProtectedRoute><OrgTree /></ProtectedRoute>} />
      <Route path="/hr/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
      <Route path="/hr/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/hr/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/hr/payroll" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Seva Module */}
      <Route path="/seva" element={<ProtectedRoute><Navigate to="/seva/bookings/new" replace /></ProtectedRoute>} />
      <Route path="/seva/bookings" element={<ProtectedRoute><Navigate to="/seva/bookings/new" replace /></ProtectedRoute>} />
      <Route path="/seva/bookings/new" element={<ProtectedRoute><NewBooking /></ProtectedRoute>} />
      <Route path="/seva/bookings/today" element={<ProtectedRoute><TodaysBookings /></ProtectedRoute>} />
      <Route path="/seva/bookings/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
      <Route path="/seva/bookings/summary" element={<ProtectedRoute><CounterSummary /></ProtectedRoute>} />

      {/* Structure Module */}
      <Route path="/structure" element={<ProtectedRoute><TempleStructure /></ProtectedRoute>} />
      <Route path="/structure/temples" element={<ProtectedRoute><Temples /></ProtectedRoute>} />
      <Route path="/structure/child-temples" element={<ProtectedRoute><ChildTemples /></ProtectedRoute>} />
      <Route path="/structure/child-temples/:id" element={<ProtectedRoute><ChildTempleDetail /></ProtectedRoute>} />
      <Route path="/structure/sacred" element={<ProtectedRoute><Sacred /></ProtectedRoute>} />
      <Route path="/structure/sacred/:id" element={<ProtectedRoute><SacredDetail /></ProtectedRoute>} />
      <Route path="/structure/zones" element={<ProtectedRoute><Zones /></ProtectedRoute>} />
      <Route path="/structure/zones/:id" element={<ProtectedRoute><ZoneDetail /></ProtectedRoute>} />
      <Route path="/structure/halls-rooms" element={<ProtectedRoute><HallsRooms /></ProtectedRoute>} />
      <Route path="/structure/halls-rooms/:id" element={<ProtectedRoute><HallRoomDetail /></ProtectedRoute>} />
      <Route path="/structure/counters" element={<ProtectedRoute><Counters /></ProtectedRoute>} />
      <Route path="/structure/counters/:id" element={<ProtectedRoute><CounterDetail /></ProtectedRoute>} />
      <Route path="/structure/hierarchy" element={<ProtectedRoute><StructureHierarchy /></ProtectedRoute>} />

      {/* Rituals & Darshan Module */}
      <Route path="/rituals" element={<ProtectedRoute><Rituals /></ProtectedRoute>} />
      <Route path="/rituals/offerings" element={<ProtectedRoute><Offerings /></ProtectedRoute>} />
      <Route path="/rituals/offerings/:id" element={<ProtectedRoute><OfferingDetail /></ProtectedRoute>} />
      <Route path="/rituals/schedule" element={<ProtectedRoute><DailySchedule /></ProtectedRoute>} />
      <Route path="/rituals/festivals" element={<ProtectedRoute><Festivals /></ProtectedRoute>} />
      <Route path="/rituals/festivals/:id" element={<ProtectedRoute><FestivalDetail /></ProtectedRoute>} />
      <Route path="/rituals/priests" element={<ProtectedRoute><PriestAssignments /></ProtectedRoute>} />
      <Route path="/rituals/priests/:id" element={<ProtectedRoute><PriestAssignmentDetail /></ProtectedRoute>} />

      {/* Inventory Module */}
      <Route path="/inventory" element={<ProtectedRoute><Navigate to="/inventory/dashboard" replace /></ProtectedRoute>} />
      <Route path="/inventory/dashboard" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/inventory/godowns" element={<ProtectedRoute><Godowns /></ProtectedRoute>} />
      <Route path="/inventory/transactions" element={<ProtectedRoute><StockTransactions /></ProtectedRoute>} />
      <Route path="/inventory/purchases" element={<ProtectedRoute><PurchaseManagement /></ProtectedRoute>} />
      <Route path="/inventory/donations" element={<ProtectedRoute><MaterialDonations /></ProtectedRoute>} />
      <Route path="/inventory/audits" element={<ProtectedRoute><StockAudits /></ProtectedRoute>} />
      <Route path="/inventory/reports" element={<ProtectedRoute><InventoryReports /></ProtectedRoute>} />

      {/* Kitchen Module */}
      <Route path="/kitchen" element={<ProtectedRoute><Navigate to="/kitchen/recipes" replace /></ProtectedRoute>} />
      <Route path="/kitchen/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
      <Route path="/kitchen/production-planning" element={<ProtectedRoute><ProductionPlanning /></ProtectedRoute>} />
      <Route path="/kitchen/production-execution" element={<ProtectedRoute><ProductionExecution /></ProtectedRoute>} />
      <Route path="/kitchen/stores" element={<ProtectedRoute><KitchenStores /></ProtectedRoute>} />

      {/* Prasad Module */}
      <Route path="/prasad" element={<ProtectedRoute><Navigate to="/prasad/master" replace /></ProtectedRoute>} />
      <Route path="/prasad/master" element={<ProtectedRoute><PrasadMaster /></ProtectedRoute>} />
      <Route path="/prasad/inventory" element={<ProtectedRoute><PrasadInventory /></ProtectedRoute>} />
      <Route path="/prasad/distribution" element={<ProtectedRoute><PrasadDistribution /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/registrations" element={<ProtectedRoute><RegistrationApprovals /></ProtectedRoute>} />

      {/* Platform Routes */}
      <Route path="/platform" element={<ProtectedRoute><PlatformDashboard /></ProtectedRoute>} />
      <Route path="/platform/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/platform/onboarding" element={<ProtectedRoute><TempleOnboarding /></ProtectedRoute>} />
      <Route path="/platform/information" element={<ProtectedRoute><InformationManagement /></ProtectedRoute>} />
      <Route path="/platform/config/:appId" element={<ProtectedRoute><ApplicationConfig /></ProtectedRoute>} />
      <Route path="/platform/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
      <Route path="/platform/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/platform/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Asset Management Routes */}
      <Route path="/assets" element={<ProtectedRoute><Navigate to="/assets/dashboard" replace /></ProtectedRoute>} />
      <Route path="/assets/dashboard" element={<ProtectedRoute><AssetDashboard /></ProtectedRoute>} />
      <Route path="/assets/master" element={<ProtectedRoute><AssetMaster /></ProtectedRoute>} />
      <Route path="/assets/master/new" element={<ProtectedRoute><AssetMasterForm /></ProtectedRoute>} />
      <Route path="/assets/master/:id/edit" element={<ProtectedRoute><AssetMasterForm /></ProtectedRoute>} />
      <Route path="/assets/movement" element={<ProtectedRoute><AssetMovement /></ProtectedRoute>} />
      <Route path="/assets/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/assets/audit" element={<ProtectedRoute><AssetAudit /></ProtectedRoute>} />
      <Route path="/assets/disposal" element={<ProtectedRoute><AssetDisposal /></ProtectedRoute>} />
      <Route path="/assets/reports" element={<ProtectedRoute><AssetReports /></ProtectedRoute>} />
      
      {/* Projects routes */}
      <Route path="/projects" element={<ProtectedRoute><Navigate to="/projects/overview" replace /></ProtectedRoute>} />
      <Route path="/projects/overview" element={<ProtectedRoute><ProjectsOverview /></ProtectedRoute>} />
      <Route path="/projects/registry" element={<ProtectedRoute><ProjectRegistry /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      <Route path="/projects/:id/edit" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
      <Route path="/projects/my-activities" element={<ProtectedRoute><MyActivities /></ProtectedRoute>} />
      <Route path="/projects/reports" element={<ProtectedRoute><ProjectReports /></ProtectedRoute>} />
      
      {/* PR & Communication routes */}
      <Route path="/pr" element={<ProtectedRoute><Navigate to="/pr/dashboard" replace /></ProtectedRoute>} />
      <Route path="/pr/dashboard" element={<ProtectedRoute><PRDashboard /></ProtectedRoute>} />
      <Route path="/pr/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/pr/communication" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/communication/manual" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/communication/bulk" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/communication/scheduled" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/communication/templates" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/communication/reports" element={<ProtectedRoute><CommunicationCenter /></ProtectedRoute>} />
      <Route path="/pr/social" element={<ProtectedRoute><SocialDigital /></ProtectedRoute>} />
      <Route path="/pr/live-streaming" element={<ProtectedRoute><LiveStreaming /></ProtectedRoute>} />
      <Route path="/pr/live-darshan" element={<ProtectedRoute><LiveDarshan /></ProtectedRoute>} />
      <Route path="/pr/devotee-experience" element={<ProtectedRoute><Navigate to="/pr/devotee-experience/feed" replace /></ProtectedRoute>} />
      <Route path="/pr/devotee-experience/feed" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
      <Route path="/pr/devotee-experience/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
      {/* Legacy PR routes for backward compatibility */}
      <Route path="/pr/calendar" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/pr/calendar/new" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />
      <Route path="/pr/calendar/:id" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />
      <Route path="/pr/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/pr/broadcast" element={<ProtectedRoute><BroadcastCenter /></ProtectedRoute>} />
      <Route path="/pr/broadcast/new" element={<ProtectedRoute><BroadcastCampaignBuilder /></ProtectedRoute>} />
      <Route path="/pr/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      <Route path="/pr/digital" element={<ProtectedRoute><SocialDigital /></ProtectedRoute>} />
      <Route path="/crm/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Task Management routes */}
      <Route path="/tasks" element={<ProtectedRoute><Navigate to="/tasks/dashboard" replace /></ProtectedRoute>} />
      <Route path="/tasks/dashboard" element={<ProtectedRoute><TaskDashboard /></ProtectedRoute>} />
      <Route path="/tasks/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      
      <Route path="/crowd/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/devotee/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/freelancer/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/vip/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/events/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* Branch Management Module */}
      <Route path="/branch" element={<ProtectedRoute><Navigate to="/branch/overview" replace /></ProtectedRoute>} />
      <Route path="/branch/directory" element={<ProtectedRoute><BranchDirectory /></ProtectedRoute>} />
      <Route path="/branch/hierarchy" element={<ProtectedRoute><BranchHierarchy /></ProtectedRoute>} />
      <Route path="/branch/users" element={<ProtectedRoute><BranchUsers /></ProtectedRoute>} />
      <Route path="/branch/access" element={<ProtectedRoute><BranchAccess /></ProtectedRoute>} />
      <Route path="/branch/overview" element={<ProtectedRoute><BranchOverview /></ProtectedRoute>} />
      <Route path="/institution/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* Knowledge routes */}
      <Route path="/knowledge" element={<ProtectedRoute><Navigate to="/knowledge/dashboard" replace /></ProtectedRoute>} />
      <Route path="/knowledge/dashboard" element={<ProtectedRoute><KnowledgeDashboard /></ProtectedRoute>} />
      <Route path="/knowledge/categories" element={<ProtectedRoute><CategoriesManagement /></ProtectedRoute>} />
      <Route path="/knowledge/documents" element={<ProtectedRoute><KnowledgeDocuments /></ProtectedRoute>} />
      <Route path="/knowledge/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
      <Route path="/knowledge/approvals" element={<ProtectedRoute><ApprovalManagement /></ProtectedRoute>} />
      <Route path="/knowledge/beta-testing" element={<ProtectedRoute><BetaConversationTesting /></ProtectedRoute>} />
      <Route path="/knowledge/chat" element={<ProtectedRoute><DevoteeChat /></ProtectedRoute>} />
      <Route path="/knowledge/*" element={<ProtectedRoute><Navigate to="/knowledge/dashboard" replace /></ProtectedRoute>} />
      <Route path="/settings/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <PlatformConfigProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </PlatformConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
