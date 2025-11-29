export const API_BASE = import.meta.env.VITE_API_BASE || "";

export const endpoints = {

  // --- AUTH ---
  register: `${API_BASE}/register`,
  login: `${API_BASE}/login`,
  forgotPassword: `${API_BASE}/forgot-password`,
  resetPassword: `${API_BASE}/reset-password`,

  // --- UPLOAD & SEARCH ---
  upload: `${API_BASE}/upload`,
  search: `${API_BASE}/search`,
  saveSearch: `${API_BASE}/api/save_search`,

  // --- SELECTED ENTRIES (old single-row system) ---
  saveSelected: `${API_BASE}/api/save_selected`,
  selectedRows: `${API_BASE}/api/selected_rows`,
  removeSelected: `${API_BASE}/api/remove_selected`,
  removeSelectedGroup: `${API_BASE}/api/remove_selected_group`,
  // --- NEW GROUPED SYSTEM ---
  getSelectedGroups: `${API_BASE}/api/selected_groups`,                   // list groups
  selectedRowsByGroup: (tableName) => `${API_BASE}/api/selected_group/${tableName}`, // rows of 1 group
  deleteGroup: (tableName) => `${API_BASE}/api/selected_group/${tableName}`,         // delete group
  deleteSelectedEntry: (selId) => `${API_BASE}/api/selected_entry/${selId}`,         // delete single selected row

  // --- EXPORTING ---
  exportExcel: `${API_BASE}/export/selected/excel`,
  exportWord: `${API_BASE}/export/selected/word`,
  emailSelected: `${API_BASE}/email/selected`,

  // --- HISTORY ---
  history: `${API_BASE}/api/history`,

  // --- DOCUMENT DELETE ---
  deleteDoc: (id) => `${API_BASE}/delete/${id}`,

  // --- PROFILE ---
  profile: `${API_BASE}/profile`,
  updateProfile: `${API_BASE}/profile/update`,

  // --- ADMIN ---
  adminDashboard: `${API_BASE}/admin/dashboard`,
  adminUsers: `${API_BASE}/admin/users`,
  adminCreateUser: `${API_BASE}/admin/create_user`,
  adminSetStatus: `${API_BASE}/admin/set_status`,
  adminSetExpiry: `${API_BASE}/admin/set_expiry`,
  adminUpdateUser: `${API_BASE}/admin/update_user`,
  adminDeleteUser: `${API_BASE}/admin/delete_user`,
  
  // --- TABLES LIST ---
  tables: `${API_BASE}/tables`,
};
