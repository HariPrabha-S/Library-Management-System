import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, RotateCcw, X } from 'lucide-react';
import adminService from '../../services/adminService';

export default function SubEntryFormPage({
  title,
  description,
  sectionTitle,
  sectionIcon: SectionIcon,
  fieldLabel,
  fieldName,
  placeholder,
  initialValue,
  listRoute,
  resourceType,
  getDisplayValue = (value) => value,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.mode === 'edit';
  const editingItem = location.state?.item || null;

  const [form, setForm] = useState({ [fieldName]: initialValue || '' });
  const [errors, setErrors] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isEditing && editingItem) {
      setForm({ [fieldName]: editingItem.name || '' });
    }
  }, [editingItem, fieldName, isEditing]);

  const pageTitle = useMemo(() => (isEditing ? `Edit ${title}` : `Add New ${title}`), [isEditing, title]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSavedMessage('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form[fieldName].trim()) {
      nextErrors[fieldName] = `${fieldLabel} is required.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const value = form[fieldName].trim();
    try {
      if (isEditing) {
        await adminService.editSubEntry(resourceType, editingItem.id, { name: value });
      } else {
        await adminService.addSubEntry(resourceType, { name: value });
      }
      setSavedMessage(`${title} saved successfully: ${value}`);
      setForm({ [fieldName]: '' });
      setErrors({});
      navigate(listRoute);
    } catch (error) {
      setErrors({ [fieldName]: error.message || `Unable to save ${title.toLowerCase()}.` });
    }
  };

  const handleReset = () => {
    setForm({ [fieldName]: '' });
    setErrors({});
    setSavedMessage('');
  };

  const handleCancel = () => {
    navigate(listRoute);
  };

  return (
    <div className="animate-fade-in-down">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="admin-page-heading">{pageTitle}</h1>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            • {currentTime.toLocaleTimeString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#eef0f4] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-(--color-primary) font-bold text-sm uppercase tracking-widest">
            {SectionIcon ? <SectionIcon size={16} /> : null}
            <span>{sectionTitle}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {fieldLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name={fieldName}
              value={form[fieldName]}
              onChange={handleChange}
              placeholder={placeholder}
              className={`form-input w-full text-sm ${errors[fieldName] ? 'border-red-300' : ''}`}
            />
            {errors[fieldName] && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors[fieldName]}</p>
            )}
          </div>

          {savedMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {savedMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="btn btn-primary flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl">
              <Save size={15} /> Save
            </button>
            <button type="button" onClick={handleReset} className="btn btn-outline flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl border-gray-200">
              <RotateCcw size={15} /> Reset
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-outline flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl border-gray-200">
              <X size={15} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
