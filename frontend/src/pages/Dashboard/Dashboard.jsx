import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios } from "../../utils/customAxios";
import "./Dashboard.css";
import Loader from "../../components/Loader/Loader";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await customAxios.get("/dashboard");
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <p style={{ margin: " auto 0" }}>
        <Loader />
      </p>
    );
  }

  if (!dashboardData) {
    return <p>No data available.</p>;
  }

  return (
    <div className='dashboard'>
      <aside className='user-details'>
        <h2>My Details</h2>
        <p>
          <strong>First Name:</strong> {dashboardData.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {dashboardData.last_name}
        </p>
        <p>
          <strong>Email:</strong> {dashboardData.email}
        </p>
        <p>
          <strong>Phone Number:</strong> {dashboardData.phone_number}
        </p>
        <p>
          <strong>Role:</strong> {dashboardData.is_admin ? "Admin" : "User"}
        </p>
        <p>
          <strong>Member Since:</strong>{" "}
          {new Date(dashboardData.created_at).toLocaleDateString()}
        </p>
        <Link to='/edit-profile'>
          <button className='btn edit-profile-btn'>Edit Profile</button>
        </Link>
      </aside>
      <main className='liked-works'>
        <h2>Designs Liked</h2>
        <div className='liked-works-grid'>
          {dashboardData.liked_works.length > 0 ? (
            dashboardData.liked_works.map((work) => (
              <div
                key={work.id}
                className='liked-works-item'
                style={{ backgroundImage: `url(${work.img_url})` }}
              >
                <div className='liked-works-info'>
                  <h3>{work.title}</h3>
                  <p>{work.description}</p>
                  <Link to={`/portfolio/${work.id}`}>
                    <button className='btn view-details-btn'>
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>You haven't liked any works yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
