import React from 'react';
import { BookOpen } from 'lucide-react';
import SubEntryFormPage from './components/SubEntryFormPage';

export default function SubjectFormPage() {
  return <SubEntryFormPage title="Subject" description="Create or update a subject entry for the library system."
    sectionTitle="Subject Details" sectionIcon={BookOpen} fieldLabel="Subject Name" fieldName="subjectName"
    placeholder="Enter subject name" initialValue="" listRoute="/admin/subentries/subject" resourceType="subjects" />;
}
