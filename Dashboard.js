
import { useEffect, useState } from "react";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    course: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  const getStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load students");
      }

      setStudents(Array.isArray(data) ? data : data.students || data.data || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setStudents((prev) =>
        prev.filter((student) => student._id !== id)
      );

      setMessage("Student deleted successfully");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEdit = (student) => {
    setEditingStudent(student._id);

    setEditForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      gender: student.gender || "",
      course: student.course || "",
      address: student.address || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const updateStudent = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${editingStudent}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setEditingStudent(null);
      setMessage("Student updated successfully");
      getStudents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(value) ||
      student.email?.toLowerCase().includes(value) ||
      student.course?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">ADMIN PANEL</p>
          <h1>Student Dashboard</h1>
          <p>Manage registered student records.</p>
        </div>

        <div className="total-card">
          <span>Total Students</span>
          <h2>{students.length}</h2>
        </div>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name, email or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {editingStudent && (
        <div className="edit-panel">
          <h2>Edit Student</h2>

          <form onSubmit={updateStudent}>
            <div className="form-grid">
              {Object.entries(editForm).map(([key, value]) => (
                <div
                  className={`form-group ${
                    key === "address" ? "full-width" : ""
                  }`}
                  key={key}
                >
                  <label>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>

                  {key === "address" ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleEditChange}
                      rows="3"
                    />
                  ) : key === "gender" ? (
                    <select
                      name={key}
                      value={value}
                      onChange={handleEditChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      name={key}
                      type={key === "age" ? "number" : "text"}
                      value={value}
                      onChange={handleEditChange}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="edit-actions">
              <button type="submit" className="primary-btn">
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditingStudent(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-panel">
        <h2>Registered Students</h2>

        {filteredStudents.length === 0 ? (
          <p className="empty-message">
            No students found.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.age}</td>
                    <td>{student.gender}</td>
                    <td>{student.course}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(student)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteStudent(student._id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

