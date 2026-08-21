import React from 'react';
import MasterDataListPage from './components/MasterDataListPage';
export default function SubjectPage() { return <MasterDataListPage type="subjects" formRoute="/admin/subentries/subject/form" title="Subjects" description="Manage academic subjects for the library catalog." addButtonLabel="Add New Subject" searchPlaceholder="Search subject..." emptyMessage="No subjects found." itemLabel="Subject Name" />; }
