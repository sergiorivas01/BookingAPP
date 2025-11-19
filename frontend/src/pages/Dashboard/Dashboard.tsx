import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="subtitle">Welcome to BookingAPP - Reservation Manager</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Clients</h2>
          <p>Manage your clients and their information</p>
        </div>
        <div className="dashboard-card">
          <h2>Reservations</h2>
          <p>Create and manage reservations</p>
        </div>
        <div className="dashboard-card">
          <h2>Properties</h2>
          <p>View and manage available properties</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
