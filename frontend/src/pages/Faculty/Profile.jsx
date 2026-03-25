import React, { useState, useEffect } from 'react';
import { User, Mail, BookOpen, GraduationCap, BadgeCheck, Pencil, Phone, CalendarDays, Save, X, Camera } from 'lucide-react';

const Profile = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Dr. Alan Turing',
    facultyId: user?.facultyId || user?.id || 'FAC9876',
    department: user?.dept || user?.department || 'Computer Science',
    email: user?.email || 'alan.turing@university.edu',
    phone: user?.phone || '+91 91234 56789',
    semester: user?.semester || 'Associate Professor',
    role: user?.role || 'Faculty',
    enrollmentYear: user?.enrollmentYear || '2015',
    profileImage: user?.profileImage || null,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || 'Dr. Alan Turing',
        facultyId: user.facultyId || user.id || 'FAC9876',
        department: user.dept || user.department || 'Computer Science',
        email: user.email || 'alan.turing@university.edu',
        phone: user.phone || '+91 91234 56789',
        semester: user.semester || 'Associate Professor',
        role: user.role || 'Faculty',
        enrollmentYear: user.enrollmentYear || '2015',
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [editForm, setEditForm] = useState({ ...profileData });

  const initials = (profileData.name || 'Faculty').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = async () => {
    setLoading(true);
    // try {
    //   const response = await fetch('http://localhost:5001/api/profile/update', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       facultyId: profileData.facultyId,
    //       ...editForm
    //     })
    //   });
    //   
    //   const data = await response.json();
    //   if (response.ok) {
    //     setProfileData({ ...editForm });
    //     setEditing(false);
    //     setSaved(true);
    //     if (onUpdate) onUpdate(data.user);
    //     setTimeout(() => setSaved(false), 3000);
    //   } else {
    //     alert(data.message || 'Update failed');
    //   }
    // } catch (err) {
    //   console.error(err);
    //   alert('Error updating profile');
    // } finally {
    //   setLoading(false);
    // }

    setTimeout(() => {
      setProfileData({ ...editForm });
      setEditing(false);
      setSaved(true);
      if (onUpdate) onUpdate({ ...user, ...editForm });
      setTimeout(() => setSaved(false), 3000);
      setLoading(false);
    }, 600);
  };

  const fields = [
    { label: 'Full Name', key: 'name', icon: User, editable: true },
    { label: 'Faculty ID', key: 'facultyId', icon: BadgeCheck, editable: false },
    { label: 'Department', key: 'department', icon: GraduationCap, editable: true },
    { label: 'Email Address', key: 'email', icon: Mail, editable: true },
    { label: 'Phone Number', key: 'phone', icon: Phone, editable: true },
    { label: 'Designation', key: 'semester', icon: BookOpen, editable: true },
    { label: 'Joining Year', key: 'enrollmentYear', icon: CalendarDays, editable: false },
    { label: 'Role', key: 'role', icon: User, editable: false },
  ];

  const [stats, setStats] = useState(null);

  useEffect(() => {
    // if (!user?.facultyId) return;
    // fetch(`http://localhost:5001/api/dashboard/${user.facultyId}`)
    //   .then(r => r.json())
    //   .then(d => setStats(d))
    //   .catch(err => console.error('Profile stats fetch error:', err));

    // Dummy stats for frontend
    setStats({
      totalIssued: 4,
      dueSoon: 0,
      totalFine: 0,
      pendingReqs: 1
    });
  }, [user?.facultyId]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>

      {saved && (
        <div style={{ padding: '12px 20px', background: 'var(--success-light)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontWeight: 500, fontSize: '0.9rem' }}>
          <Save size={16} /> Profile updated successfully!
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="panel" style={{ marginBottom: 24, overflow: 'hidden' }}>
        {/* Header Banner */}
        <div style={{ height: 100, background: 'linear-gradient(135deg, var(--primary-color), #a01010)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: 32,
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #790c0c, #a01010)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'white',
              border: '4px solid white',
              boxShadow: '0 4px 16px rgba(121,12,12,0.3)',
              overflow: 'hidden',
              cursor: editing ? 'pointer' : 'default'
            }}
            onClick={() => editing && document.getElementById('profile-upload').click()}
          >
            {(editing ? editForm.profileImage : profileData.profileImage) ? (
              <img
                src={editing ? editForm.profileImage : profileData.profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : initials}

            {editing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={24} color="white" />
              </div>
            )}
            <input
              type="file"
              id="profile-upload"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div style={{ padding: '52px 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
              {profileData.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              {profileData.facultyId} &bull; {profileData.department}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-primary"><BookOpen size={11} /> {profileData.semester || 'N/A'}</span>
              <span className="badge badge-secondary"><BadgeCheck size={11} /> {profileData.role}</span>
              <span className="badge badge-neutral"><CalendarDays size={11} /> Since {profileData.enrollmentYear}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditForm({ ...profileData }); }} id="cancel-edit-btn">
                  <X size={15} /> Cancel
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleSave} id="save-profile-btn">
                  <Save size={15} /> Save Changes
                </button>
              </>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Personal Information</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {editing ? 'Editing mode active' : 'Click "Edit Profile" to make changes'}
          </span>
        </div>

        <div style={{ padding: '8px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} style={{ padding: '18px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <Icon size={14} color="var(--text-muted)" />
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {field.label}
                    </label>
                  </div>
                  {editing && field.editable ? (
                    <input
                      type="text"
                      id={`profile-field-${field.key}`}
                      className="form-input"
                      value={editForm[field.key]}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', paddingLeft: 2 }}>
                      {profileData[field.key]}
                      {!field.editable && <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>(read-only)</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Library Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}>
        {[
          { label: 'Books Issued', value: stats?.totalIssued || '0', color: 'var(--secondary-color)', bg: 'rgba(1,137,141,0.08)' },
          { label: 'Due Soon', value: stats?.dueSoon || '0', color: 'var(--primary-color)', bg: 'rgba(121,12,12,0.06)' },
          { label: 'Total Fine', value: `₹${stats?.totalFine || '0'}`, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending Req.', value: stats?.pendingReqs || '0', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, fontFamily: "'Inter',sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
