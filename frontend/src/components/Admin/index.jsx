import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { notify } from "../../reducers/notificationReducer";
import services from "../../services";

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      dispatch(notify({ type: "danger", message: "Enter admin password" }));
      return;
    }

    setVerifying(true);
    try {
      await services.verifyAdminPassword(password);
      setAuthenticated(true);
      setPassword("");
      dispatch(notify({ type: "success", message: "Admin access granted" }));
      fetchUsers();
    } catch {
      dispatch(notify({ type: "danger", message: "Invalid admin password" }));
      setPassword("");
    } finally {
      setVerifying(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await services.getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      dispatch(notify({ type: "danger", message: "Failed to load users" }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) {
      return;
    }

    try {
      await services.deleteUserAdmin(userId);
      setUsers(users.filter((u) => u.id !== userId));
      dispatch(
        notify({ type: "success", message: `User "${username}" deleted` })
      );
    } catch (err) {
      console.error(err);
      dispatch(notify({ type: "danger", message: "Failed to delete user" }));
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUsers([]);
    setPassword("");
    navigate("/");
  };

  if (!authenticated) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm p-4">
              <h3 className="mb-4">Admin Access</h3>
              <div className="mb-3">
                <label className="form-label">Admin Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleVerifyPassword()
                  }
                  placeholder="Enter admin password"
                />
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={handleVerifyPassword}
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Access"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Admin Panel</h3>
        <button className="btn btn-sm btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="mb-0">Users Management</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-muted">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-3 text-muted">No users found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Courses</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge bg-info">
                          {user.courseCount}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDeleteUser(user.id, user.username)
                          }
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
      </div>
    </div>
  );
};

export default Admin;
