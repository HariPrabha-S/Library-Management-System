import React from 'react';
import MasterDataListPage from './components/MasterDataListPage';
export default function DepartmentPage() { return <MasterDataListPage type="departments" formRoute="/admin/subentries/department/form" title="Departments" description="Manage academic departments for the library system." addButtonLabel="Add New Department" searchPlaceholder="Search department..." emptyMessage="No departments found." itemLabel="Department Name" serialLabel="S.NO" />; }
