import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, BookOpen, GraduationCap, BadgeCheck, Pencil, Phone, CalendarDays, Save, X, Camera, Upload } from 'lucide-react';

const Profile = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', facultyId: '', department: '', email: '',
    phone: '', semester: '', role: 'Faculty', enrollmentYear: '', profileImage: null,
  });
  const [editForm, setEditForm] = useState({});

  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const facultyId = user?.facultyId || loggedInUser.facultyId || '';

  useEffect(() => {
    if (!facultyId) return;
    setLoading(true);
    fetch(`/api/profile/${facultyId}`)
      .then(r => r.json())
      .then(d => {
        const data = {
          name: d.name || '',
          facultyId: d.studentId || facultyId,
          department: d.department || '',
          email: d.email || '',
          phone: d.phone || '',
          semester: d.semester || '',
          role: d.role || 'Faculty',
          enrollmentYear: d.enrollmentYear || '',
          profileImage: d.profileImage || null,
        };
        setProfileData(data);
        setEditForm(data);
        setLoading(false);
      })
      .catch(err => { console.error('Profile fetch error:', err); setLoading(false); });
  }, [facultyId]);



  const initials = (profileData.name || 'FC').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadingPhoto(true);

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('identifier', facultyId);

    try {
      const res = await fetch('/api/profile/upload-photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const newImg = data.photoUrl;
        setEditForm(prev => ({ ...prev, profileImage: newImg }));
        setProfileData(prev => ({ ...prev, profileImage: newImg }));
        const updated = { ...loggedInUser, profileImage: newImg };
        localStorage.setItem('user', JSON.stringify(updated));
        if (onUpdate) onUpdate(updated);
        setPreviewUrl(null);
      } else {
        alert(data.message || 'Photo upload failed');
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('Error uploading photo');
      setPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: facultyId, ...editForm })
      });
      const data = await response.json();
      if (response.ok) {
        setProfileData({ ...editForm });
        setEditing(false);
        setSaved(true);
        const updated = { ...loggedInUser, name: editForm.name, email: editForm.email, phone: editForm.phone };
        localStorage.setItem('user', JSON.stringify(updated));
        if (onUpdate) onUpdate(updated);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = previewUrl || editForm.profileImage || profileData.profileImage;

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

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>

      {saved && (
        <div style={{ padding: '12px 20px', background: 'var(--success-light)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontWeight: 500, fontSize: '0.9rem' }}>
          <Save size={16} /> Profile updated successfully!
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: 110, background: 'linear-gradient(135deg, var(--primary-color), #a01010)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute', bottom: -44, left: 32,
              width: 88, height: 88, borderRadius: 22,
              background: 'linear-gradient(135deg, #790c0c, #a01010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.9rem', fontWeight: 700, color: 'white',
              border: '4px solid white', boxShadow: '0 4px 20px rgba(121,12,12,0.35)',
              overflow: 'hidden',
            }}
          >
            {currentPhoto ? (
              <img src={currentPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
        </div>

        <div style={{ padding: '56px 32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
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


        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Personal Information</h3>
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
                      value={editForm[field.key] || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', paddingLeft: 2 }}>
                      {profileData[field.key] || '—'}
                      {!field.editable && <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>(read-only)</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Profile;
