import React from 'react';
import SubEntryFormPage from './components/SubEntryFormPage';
import { Store } from 'lucide-react';

export default function VendorFormPage() {
  return (
    <SubEntryFormPage
      title="Vendor"
      description="Create or update a vendor entry for the library system."
      sectionTitle="Vendor Details"
      sectionIcon={Store}
      fieldLabel="Vendor Name"
      fieldName="vendorName"
      placeholder="Enter vendor name"
      initialValue=""
      listRoute="/admin/subentries/vendors"
      resourceType="vendors"
    />
  );
}
