import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios } from "../../utils/customAxios";
import "./AdminPage.css";
import Loader from "../../components/Loader/Loader";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, toast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.is_admin) {
        toast.error("You are not authorized to view this page.");
        navigate("/");
        return;
      }
      setLoading(true);
      try {
        const { data } = await customAxios.get("/admin/");
        // Sort users by ID from small to big
        const sortedUsers = data.sort((a, b) => a.id - b.id);
        setUsers(sortedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
        toast.error(`Failed to fetch users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate, toast]);

  const handleDeleteUser = async (userId) => {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to delete users.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await customAxios.delete(`/admin/${userId}`);
      toast.success("User deleted successfully!");
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ position: "relative", margin: "auto 0" }}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='admin-page-container error-message'>Error: {error}</div>
    );
  }

  if (!user || !user.is_admin) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className='admin-page-container'>
      <h1>Admin Dashboard - User Management</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className='table-responsive'>
          <table className='users-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>User Role</th>
                <th>Member Since</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ textTransform: "capitalize" }}>
                  <td>{u.id}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td style={{ textTransform: "lowercase" }}>{u.email}</td>
                  <td>{u.phone_number || "N/A"}</td>
                  <td>{u.is_admin ? "admin" : "user"}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className='btn'
                      onClick={() => navigate(`/admin/edit-user/${u.id}`)}
                    >
                      {/*  &#9998;  */}Edit
                    </button>
                    <button
                      className='btn delete-user-btn'
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      {/* &#128465; */} Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
