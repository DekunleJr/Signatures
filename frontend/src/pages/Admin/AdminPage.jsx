import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios } from "../../utils/customAxios";
import "./AdminPage.css";
import Loader from "../../components/Loader/Loader";

const ITEMS_PER_PAGE = 10; // Maximum of 10 users at a time

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
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
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        const { data } = await customAxios.get(`/admin/?skip=${skip}&limit=${limit}`);
        setUsers(data.users);
        setTotalUsers(data.total_users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
        toast.error(`Failed to fetch users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate, toast, currentPage]);

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
      // Re-fetch users to update pagination if a user is deleted from the current page
      // This might be optimized later to just adjust totalUsers and current page if needed
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const limit = ITEMS_PER_PAGE;
      const { data } = await customAxios.get(`/admin/?skip=${skip}&limit=${limit}`);
      setUsers(data.users);
      setTotalUsers(data.total_users);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
      {users.length === 0 && totalUsers === 0 ? (
        <p>No users found.</p>
      ) : users.length === 0 ? (
        <p>No users found on this page.</p>
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

      {totalPages > 1 && (
        <div className='pagination-controls'>
          <button
            className='btn'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className='btn'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
