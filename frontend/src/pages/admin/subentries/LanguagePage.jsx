import React from 'react';
import MasterDataListPage from './components/MasterDataListPage';
export default function LanguagePage() { return <MasterDataListPage type="languages" formRoute="/admin/subentries/language/form" title="Languages" description="Manage languages available in the library system." addButtonLabel="Add New Language" searchPlaceholder="Search language..." emptyMessage="No languages found." itemLabel="Language Name" />; }
