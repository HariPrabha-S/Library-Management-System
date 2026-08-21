import React from 'react';
import SubEntryFormPage from './components/SubEntryFormPage';
import { BookOpenCheck } from 'lucide-react';

export default function PublisherFormPage() {
  return (
    <SubEntryFormPage
      title="Publisher"
      description="Create or update a publisher entry for the library system."
      sectionTitle="Publisher Details"
      sectionIcon={BookOpenCheck}
      fieldLabel="Publisher Name"
      fieldName="publisherName"
      placeholder="Enter publisher name"
      initialValue=""
      listRoute="/admin/subentries/publisher"
      resourceType="publishers"
    />
  );
}
