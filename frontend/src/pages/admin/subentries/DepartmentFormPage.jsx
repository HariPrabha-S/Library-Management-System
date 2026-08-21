import React from 'react';
import SubEntryFormPage from './components/SubEntryFormPage';
import { CalendarDays } from 'lucide-react';

export default function DepartmentFormPage() {
  return (
    <SubEntryFormPage
      title="Department"
      description="Create or update a department entry for the library system."
      sectionTitle="Department Details"
      sectionIcon={CalendarDays}
      fieldLabel="Department Name"
      fieldName="departmentName"
      placeholder="Enter department name"
      initialValue=""
      listRoute="/admin/subentries/department"
      resourceType="departments"
    />
  );
}
