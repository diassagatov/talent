import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Main from "./components/Main";
import CreateJob from "./components/company/CreateJob";
import SearchJob from "./components/candidate/SearchJob";
import Applicants from "./components/company/Applicants";
import Profile from "./components/candidate/Profile";
import Settings from "./components/candidate/Settings";
import MyJobs from "./components/company/MyJobs";
import MyApplications from "./components/candidate/MyApplications";
import Apply from "./components/candidate/Apply";
import Kanban from "./components/candidate/Kanban";
import AddUsers from "./components/super/AddUsers";
import AddCompany from "./components/super/AddCompany";
import InterviewCreator from "./components/company/InterviewCreator";
// import InterviewSee from "./components/company/InterviewSee";
import TakeInterview from "./components/company/TakeInterview";
import ObserveInterview from "./components/company/ObserveInterview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/in" element={<Layout />}>
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/search" element={<SearchJob />} />
          <Route path="jobs/mine" element={<MyJobs />} />
          <Route path="jobs/apply/:vacancyId/:title" element={<Apply />} />
          <Route path="jobs/kanban/:id" element={<Kanban />} />

          <Route
            path="interview/create/:vacancyId"
            element={<InterviewCreator />}
          />
          <Route path="interview/see/:appId" element={<ObserveInterview />} />
          <Route
            path="interview/fill/:intId/:appId"
            element={<TakeInterview />}
          />

          <Route path="applicants" element={<Applicants />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="me/applications" element={<MyApplications />} />

          <Route path="admin/users" element={<AddUsers />} />
          <Route path="admin/orgs" element={<AddCompany />} />
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
