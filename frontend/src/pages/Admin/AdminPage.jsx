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

  // State for broadcast email form
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendOption, setSendOption] = useState("all_except_admin"); // Default option
  const [selectedEmails, setSelectedEmails] = useState([]); // For 'all_except_selected' and 'only_selected'
  const [allUsersForSelection, setAllUsersForSelection] = useState([]); // All users for dropdown
  const [emailLoading, setEmailLoading] = useState(false); // Loading state for email broadcast

  // Fetch paginated users for the table
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

  // Fetch all users for the email broadcast dropdown
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!user || !user.is_admin) return;
      try {
        // Fetch all users without pagination
        const { data } = await customAxios.get("/admin/?skip=0&limit=99999"); // A large limit to get all users
        setAllUsersForSelection(data.users);
      } catch (err) {
        console.error("Error fetching all users for selection:", err);
      }
    };
    fetchAllUsers();
  }, [user]);

  const handleBlockUser = async (userId, currentStatus) => {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to block/unblock users.");
      return;
    }

    const action = currentStatus === "active" ? "block" : "unblock";
    const isConfirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!isConfirmed) {
      return;
    }

    try {
      const { data } = await customAxios.put(`/admin/block-unblock/${userId}`);
      toast.success(`User ${action}ed successfully!`);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? data : u))
      );
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      toast.error(`Failed to ${action} user. Please try again.`);
    }
  };

  const handleSelectedEmailsChange = (e) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedEmails(value);
  };

  const handleBroadcastEmail = async (e) => {
    e.preventDefault();
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to broadcast emails.");
      return;
    }

    setEmailLoading(true); // Set loading to true immediately

    try {
      const requestBody = {
        subject: emailSubject,
        message: emailMessage,
        send_option: sendOption,
        selected_emails: (sendOption === "all_except_selected" || sendOption === "only_selected")
          ? selectedEmails
          : undefined,
      };

      const { data } = await customAxios.post("/admin/broadcast-email", requestBody);
      toast.success(data.message);
      setEmailSubject("");
      setEmailMessage("");
      setSendOption("all_except_admin");
      setSelectedEmails([]);
    } catch (err) {
      console.error("Error broadcasting email:", err);
      toast.error(`Failed to send email: ${err.response?.data?.detail || err.message}`);
    } finally {
      setEmailLoading(false);
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

      <div className="broadcast-email-section">
        <h2>Broadcast Email to Users</h2>
        <form onSubmit={handleBroadcastEmail}>
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="sendOption">Send To:</label>
            <select
              id="sendOption"
              value={sendOption}
              onChange={(e) => setSendOption(e.target.value)}
            >
              <option value="all_except_admin">All users (except admin)</option>
              <option value="all_except_selected">All users (except selected)</option>
              <option value="only_selected">Only selected users</option>
            </select>
          </div>
          {(sendOption === "all_except_selected" || sendOption === "only_selected") && (
            <div className="form-group">
              <label htmlFor="selectedEmails">Select Users:</label>
              <select
                id="selectedEmails"
                multiple
                value={selectedEmails}
                onChange={handleSelectedEmailsChange}
              >
                {allUsersForSelection.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.first_name} {u.last_name} ({u.email})
                  </option>
                ))}
              </select>
              <p className="hint">Hold Ctrl/Cmd to select multiple users.</p>
            </div>
          )}
          <button type="submit" className="btn send-email-btn" disabled={emailLoading}>
            {emailLoading ? "Sending..." : "Send Email"}
          </button>
        </form>
        {emailLoading && (
          <div style={{ position: "relative", margin: "20px auto", width: "50px", height: "50px" }}>
            <Loader />
          </div>
        )}
      </div>

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
                <th>Status</th>
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
                  <td>{u.status}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className='btn'
                      onClick={() => navigate(`/admin/edit-user/${u.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn ${
                        u.status === "active"
                          ? "delete-user-btn"
                          : "unblock-user-btn"
                      }`}
                      onClick={() => handleBlockUser(u.id, u.status)}
                    >
                      {u.status === "active" ? "Block" : "Unblock"}
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
