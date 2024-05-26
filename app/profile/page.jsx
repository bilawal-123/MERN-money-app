"use client";
import { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { updateProfile } from "firebase/auth";

export default function ProfileUpdate() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(true);
  const [showViewForm, setShowViewForm] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setDisplayName(currentUser.displayName || "");
    setEmail(currentUser.email || "");
    setAuthUser(currentUser);
  }, []);

  const handleViewProfile = () => {
    setShowEditForm(true);
    setShowViewForm(false);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      console.log("Profile updated successfully!");
      setShowEditForm(false);
      setShowViewForm(true);
      setAuthUser({ ...authUser, displayName: displayName });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <div className="page-header-group">
        <h1 className="heading1">
          {showViewForm && "Profile View"}
          {showEditForm && "Update Profile"}
        </h1>
        <div className="flex gap-3">
          {showViewForm && (
            <div>
              <button
                onClick={handleViewProfile} // Added parentheses to call the function
                className="button-style"
              >
                Edit Profile
              </button>
            </div>
          )}
          {showEditForm && (
            <button onClick={handleUpdateProfile} className="button-style">
              Update Profile
            </button>
          )}
        </div>
      </div>

      {showEditForm && (
        <>
          <div className="box-style">
            <h2 className="heading2">User Detail</h2>
            <div className="personal-detail-box">
              <div>
                <label className="label-style">
                  Set Role: <span className="asterisk">*</span>
                </label>
                <select
                  value={displayName}
                  className="input-style"
                  onChange={(e) => setDisplayName(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="label-style"> Email:</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="input-style !bg-gray-100"
                />
              </div>
            </div>
          </div>
        </>
      )}
      {showViewForm && (
        <div className="box-style">
          <h2 className="heading2">User Detail</h2>
          <div className="personal-detail-box">
            <div>
              <span className="label-style">Role:</span>{" "}
              <p>{authUser?.displayName}</p>
            </div>
            <div>
              <span className="label-style">Email:</span>{" "}
              <p>{authUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
