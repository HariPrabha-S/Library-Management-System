import React from 'react';
import SubEntryFormPage from './components/SubEntryFormPage';
import { Languages } from 'lucide-react';

export default function LanguageFormPage() {
  return (
    <SubEntryFormPage
      title="Language"
      description="Create or update a language entry for the library system."
      sectionTitle="Language Details"
      sectionIcon={Languages}
      fieldLabel="Language Name"
      fieldName="languageName"
      placeholder="Enter language name"
      initialValue=""
      listRoute="/admin/subentries/language"
      resourceType="languages"
    />
  );
}
