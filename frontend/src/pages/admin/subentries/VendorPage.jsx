import React from 'react';
import MasterDataListPage from './components/MasterDataListPage';
export default function VendorPage() { return <MasterDataListPage type="vendors" formRoute="/admin/subentries/vendors/form" title="Vendors" description="Manage publishing and supply vendors for the library." addButtonLabel="Add New Vendor" searchPlaceholder="Search vendor..." emptyMessage="No vendors found." itemLabel="Vendor Name" />; }
