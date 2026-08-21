import React from 'react';
import MasterDataListPage from './components/MasterDataListPage';
export default function PublisherPage() { return <MasterDataListPage type="publishers" formRoute="/admin/subentries/publisher/form" title="Publishers" description="Manage publisher entries for the library system." addButtonLabel="Add New Publisher" searchPlaceholder="Search publisher..." emptyMessage="No publishers found." itemLabel="Publisher Name" />; }
