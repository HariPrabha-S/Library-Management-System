import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, RotateCcw, X, CalendarDays } from 'lucide-react';
import adminService from '../services/adminService';

const initialForm = {
  holidayName: '',
  holidayDate: '',
};

function formatDateForDisplay(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function HolidayFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.mode === 'edit';
  const editingHoliday = location.state?.item || null;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isEditing && editingHoliday) {
      setForm({
        holidayName: editingHoliday.name || '',
        holidayDate: editingHoliday.date || '',
      });
    }
  }, [editingHoliday, isEditing]);

  const pageTitle = useMemo(() => (isEditing ? 'Edit Holiday' : 'Add New Holiday'), [isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSavedMessage('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.holidayName.trim()) {
      nextErrors.holidayName = 'Holiday Name is required.';
    }

    if (!form.holidayDate) {
      nextErrors.holidayDate = 'Holiday Date is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const holidayName = form.holidayName.trim();
    const holidayDate = form.holidayDate;
    try {
      if (isEditing && editingHoliday) {
        await adminService.editSubEntry('holidays', editingHoliday.id, { name: holidayName, date: holidayDate });
      } else {
        await adminService.addSubEntry('holidays', { name: holidayName, date: holidayDate });
      }
      setSavedMessage(`Holiday saved successfully: ${holidayName}`);
      setForm(initialForm);
      setErrors({});
      navigate('/admin/subentries/holiday');
    } catch (error) {
      setErrors({ holidayName: error.message || 'Unable to save holiday.' });
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSavedMessage('');
  };

  const handleCancel = () => {
    navigate('/admin/subentries/holiday');
  };

  return (
    <div className="animate-fade-in-down">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="admin-page-heading">{pageTitle}</h1>
          <p className="text-xs text-gray-500 mt-1">Create or update a holiday entry for the library calendar.</p>
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
            <CalendarDays size={16} />
            <span>Holiday Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="holidayName"
              value={form.holidayName}
              onChange={handleChange}
              placeholder="Enter holiday name"
              className={`form-input w-full text-sm ${errors.holidayName ? 'border-red-300' : ''}`}
            />
            {errors.holidayName && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.holidayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Holiday Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="holidayDate"
              value={form.holidayDate}
              onChange={handleChange}
              className={`form-input w-full text-sm ${errors.holidayDate ? 'border-red-300' : ''}`}
            />
            {errors.holidayDate && (
              <p className="mt-2 text-xs font-semibold text-red-600">{errors.holidayDate}</p>
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
