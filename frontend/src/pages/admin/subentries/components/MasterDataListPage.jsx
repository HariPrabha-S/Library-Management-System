import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import SubEntryListPage from './SubEntryListPage';

export default function MasterDataListPage({ type, formRoute, title, description, addButtonLabel, searchPlaceholder, emptyMessage, itemLabel, serialLabel = 'S.No', columns }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const loadItems = useCallback(async () => {
    try {
      const response = await adminService.getSubEntries(type);
      setItems(response.data || []);
    } catch (error) {
      alert(error.message || `Unable to load ${title.toLowerCase()}.`);
    }
  }, [title, type]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleEdit = (item) => navigate(formRoute, { state: { mode: 'edit', item } });
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${itemLabel.toLowerCase()}?`)) return;
    try {
      await adminService.deleteSubEntry(type, item.id);
      await loadItems();
    } catch (error) {
      alert(error.message || 'Unable to delete the entry.');
    }
  };

  return <SubEntryListPage title={title} description={description} addButtonLabel={addButtonLabel} addRoute={formRoute}
    searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage} itemLabel={itemLabel} items={items}
    onEdit={handleEdit} onDelete={handleDelete} getItemDisplayValue={(item) => item.name}
    getItemKey={(item) => item.id} serialLabel={serialLabel} columns={columns} />;
}
