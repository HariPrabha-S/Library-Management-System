import React, { useState, useEffect } from 'react';
import { User, Mail, BookOpen, GraduationCap, BadgeCheck, Phone, CalendarDays } from 'lucide-react';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    name: '', studentId: '', department: '', email: '',
    phone: '', semester: '', role: 'Student', enrollmentYear: '', profileImage: null,
  });

  const [loading, setLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.studentId || loggedInUser.studentId || '';

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`/api/profile/${studentId}`)
      .then(r => r.json())
      .then(d => {
        const data = {
          name: d.name || '',
          studentId: d.studentId || studentId,
          department: d.department || '',
          email: d.email || '',
          phone: d.phone || '',
          semester: d.semester || '',
          role: d.role || 'Student',
          enrollmentYear: d.enrollmentYear || '',
          profileImage: d.profileImage || null,
        };
        setProfileData(data);
        setLoading(false);
      })
      .catch(err => { console.error('Profile fetch error:', err); setLoading(false); });
  }, [studentId]);



  const initials = (profileData.name || 'ST').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const currentPhoto = profileData.profileImage;

  const fields = [
    { label: 'Full Name', key: 'name', icon: User },
    { label: 'Student ID', key: 'studentId', icon: BadgeCheck },
    { label: 'Department', key: 'department', icon: GraduationCap },
    { label: 'Email Address', key: 'email', icon: Mail },
    { label: 'Phone Number', key: 'phone', icon: Phone },
    { label: 'Semester', key: 'semester', icon: BookOpen },
    { label: 'Year of Study', key: 'enrollmentYear', icon: CalendarDays },
    { label: 'Role', key: 'role', icon: User },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>



      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      ) : (
        <>
          {/* Profile Hero Card */}
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
                  {profileData.studentId} &bull; {profileData.department}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <span className="badge badge-primary"><BookOpen size={11} /> {profileData.semester}</span>
                  <span className="badge badge-secondary"><BadgeCheck size={11} /> {profileData.role}</span>
                  <span className="badge badge-neutral"><CalendarDays size={11} /> Since {profileData.enrollmentYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">Personal Information</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>

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
                      <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', paddingLeft: 2 }}>
                        {profileData[field.key] || 'Not Provided'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </>
      )}
    </div>
  );
};

export default Profile;