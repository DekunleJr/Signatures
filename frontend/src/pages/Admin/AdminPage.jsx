import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios } from "../../utils/customAxios";
import "./AdminPage.css";
import Loader from "../../components/Loader/Loader";

const ITEMS_PER_PAGE = 10; // Maximum of 10 users at a time
const TABS = ["users", "categories", "broadcast"];

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [categories, setCategories] = useState([]);
  const { user, toast } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab = TABS.includes(requested) ? requested : "users";
  const tabRefs = useRef({});

  const selectTab = (tab) => {
    setSearchParams(tab === "users" ? {} : { tab }, { replace: true });
  };

  // Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern)
  const handleTabKeyDown = (e) => {
    const i = TABS.indexOf(activeTab);
    let next = null;
    if (e.key === "ArrowRight") next = TABS[(i + 1) % TABS.length];
    if (e.key === "ArrowLeft") next = TABS[(i - 1 + TABS.length) % TABS.length];
    if (e.key === "Home") next = TABS[0];
    if (e.key === "End") next = TABS[TABS.length - 1];
    if (next) {
      e.preventDefault();
      selectTab(next);
      tabRefs.current[next]?.focus();
    }
  };

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

  // Categories are small: load once so the tab can show its count
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user || !user.is_admin) return;
      try {
        const { data } = await customAxios.get("/portfolio/categories");
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error(`Failed to fetch categories: ${err.message}`);
      }
    };
    fetchCategories();
  }, [user, toast]);

  // The full user list is only needed for the "selected users" picker, so load it
  // lazily: only on the Broadcast tab, and only once a "selected" option is chosen.
  const needsUserPicker =
    activeTab === "broadcast" &&
    (sendOption === "all_except_selected" || sendOption === "only_selected");
  useEffect(() => {
    if (!needsUserPicker || allUsersForSelection.length > 0) return;
    if (!user || !user.is_admin) return;
    (async () => {
      try {
        const { data } = await customAxios.get("/admin/?skip=0&limit=99999");
        setAllUsersForSelection(data.users);
      } catch (err) {
        console.error("Error fetching all users for selection:", err);
      }
    })();
  }, [needsUserPicker, allUsersForSelection.length, user]);

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

  const handleDeleteCategory = async (categoryId) => {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to delete categories.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await customAxios.delete(`/portfolio/category/${categoryId}`);
      toast.success("Category deleted successfully!");
      setCategories((prevCategories) =>
        prevCategories.filter((c) => c.id !== categoryId)
      );
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category. Please try again.");
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

  if (!user || !user.is_admin) {
    return null; // Should be redirected by useEffect
  }

  const tabLabels = {
    users: `Users${totalUsers ? ` (${totalUsers})` : ""}`,
    categories: `Categories${categories.length ? ` (${categories.length})` : ""}`,
    broadcast: "Broadcast email",
  };

  return (
    <div className='admin-page-container'>
      <h1>Admin Dashboard</h1>

      <div className='admin-tabs' role='tablist' aria-label='Admin sections' onKeyDown={handleTabKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type='button'
            role='tab'
            id={`admin-tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`admin-panel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}
            className={`admin-tab ${activeTab === tab ? "is-active" : ""}`}
            onClick={() => selectTab(tab)}
            ref={(el) => (tabRefs.current[tab] = el)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div role='tabpanel' id='admin-panel-users' aria-labelledby='admin-tab-users' className='admin-panel'>
          <h2>User Management</h2>
          {loading ? (
            <div style={{ position: "relative", minHeight: "120px" }}>
              <Loader />
            </div>
          ) : error ? (
            <p className='error-message' role='alert'>Error: {error}</p>
          ) : (
            <>
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
                          <td data-label='ID'>{u.id}</td>
                          <td data-label='First Name'>{u.first_name}</td>
                          <td data-label='Last Name'>{u.last_name}</td>
                          <td
                            data-label='Email'
                            style={{ textTransform: "lowercase" }}
                          >
                            {u.email}
                          </td>
                          <td data-label='Phone Number'>{u.phone_number || "N/A"}</td>
                          <td data-label='User Role'>
                            {u.is_admin ? "admin" : "user"}
                          </td>
                          <td data-label='Status'>{u.status}</td>
                          <td data-label='Member Since'>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td data-label='Action' className='row-actions'>
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
            </>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div role='tabpanel' id='admin-panel-categories' aria-labelledby='admin-tab-categories' className='admin-panel category-management-section'>
          <div className='admin-panel-header'>
            <h2>Category Management</h2>
            <Link to='/category' className='btn'>+ Create category</Link>
          </div>
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th className="category-action-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td data-label='ID'>{c.id}</td>
                    <td data-label='Title'>{c.title}</td>
                    <td
                      data-label='Action'
                      className='category-action-buttons'
                    >
                      <button
                        className='btn'
                        onClick={() => navigate(`/category/edit/${c.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn delete-user-btn"
                        onClick={() => handleDeleteCategory(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {activeTab === "broadcast" && (
        <div role='tabpanel' id='admin-panel-broadcast' aria-labelledby='admin-tab-broadcast' className='admin-panel'>
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
        </div>
      )}
    </div>
  );
}
