import axiosInstance from './axiosInstance.js';

/**
 * axiosInstance's response interceptor already returns the response body
 * (`{ success, data, message }`), so every helper unwraps `.data` once.
 */
const unwrap = (response) => response?.data;

export const getTodoSummary = async () => unwrap(await axiosInstance.get('/v1/todos/summary'));

export const getTodoLists = async () => unwrap(await axiosInstance.get('/v1/todos/lists'));

export const createTodoList = async (payload) => unwrap(await axiosInstance.post('/v1/todos/lists', payload));

export const getTodoList = async (id) => unwrap(await axiosInstance.get(`/v1/todos/lists/${id}`));

export const updateTodoList = async (id, payload) => unwrap(await axiosInstance.patch(`/v1/todos/lists/${id}`, payload));

export const deleteTodoList = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/lists/${id}`));

export const shareTodoList = async (id, { user_ids, permission }) =>
  unwrap(await axiosInstance.post(`/v1/todos/lists/${id}/share`, { user_ids, permission }));

export const removeTodoListMember = async (listId, userId) =>
  unwrap(await axiosInstance.delete(`/v1/todos/lists/${listId}/members/${userId}`));

export const getTodoItems = async (listId, params = {}) =>
  unwrap(await axiosInstance.get(`/v1/todos/lists/${listId}/items`, { params }));

export const createTodoItem = async (listId, payload) => unwrap(await axiosInstance.post(`/v1/todos/lists/${listId}/items`, payload));

export const updateTodoItem = async (id, payload) => unwrap(await axiosInstance.patch(`/v1/todos/items/${id}`, payload));

export const deleteTodoItem = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/items/${id}`));

export const createTodoSubtask = async (itemId, payload) =>
  unwrap(await axiosInstance.post(`/v1/todos/items/${itemId}/subtasks`, payload));

export const updateTodoSubtask = async (id, payload) => unwrap(await axiosInstance.patch(`/v1/todos/subtasks/${id}`, payload));

export const deleteTodoSubtask = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/subtasks/${id}`));

export const getTodoComments = async (itemId) => unwrap(await axiosInstance.get(`/v1/todos/items/${itemId}/comments`));

export const createTodoComment = async (itemId, payload) =>
  unwrap(await axiosInstance.post(`/v1/todos/items/${itemId}/comments`, payload));

export const deleteTodoComment = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/comments/${id}`));

export const createTodoAttachment = async (itemId, payload) =>
  unwrap(await axiosInstance.post(`/v1/todos/items/${itemId}/attachments`, payload));

export const deleteTodoAttachment = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/attachments/${id}`));

export const getTodoReminders = async (itemId) => unwrap(await axiosInstance.get(`/v1/todos/items/${itemId}/reminders`));

export const createTodoReminder = async (itemId, payload) =>
  unwrap(await axiosInstance.post(`/v1/todos/items/${itemId}/reminders`, payload));

export const deleteTodoReminder = async (id) => unwrap(await axiosInstance.delete(`/v1/todos/reminders/${id}`));

/**
 * Real, active people for the assignee / share pickers. There is no public
 * user directory for every role, so try the curated assignable-users endpoint
 * first and fall back to the admin user list. If both are unavailable the UI
 * hides the pickers rather than showing invented names.
 */
export const getAssignablePeople = async () => {
  const endpoints = ['/v1/projects/assignable-users', '/v1/users?limit=200&is_active=true'];
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = unwrap(await axiosInstance.get(url));
      if (Array.isArray(response)) return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No assignable users endpoint is available.');
};

export const todoApi = {
  getSummary: getTodoSummary,
  getLists: getTodoLists,
  createList: createTodoList,
  getList: getTodoList,
  updateList: updateTodoList,
  deleteList: deleteTodoList,
  shareList: shareTodoList,
  removeMember: removeTodoListMember,
  getItems: getTodoItems,
  createItem: createTodoItem,
  updateItem: updateTodoItem,
  deleteItem: deleteTodoItem,
  createSubtask: createTodoSubtask,
  updateSubtask: updateTodoSubtask,
  deleteSubtask: deleteTodoSubtask,
  getComments: getTodoComments,
  createComment: createTodoComment,
  deleteComment: deleteTodoComment,
  createAttachment: createTodoAttachment,
  deleteAttachment: deleteTodoAttachment,
  getReminders: getTodoReminders,
  createReminder: createTodoReminder,
  deleteReminder: deleteTodoReminder,
  getAssignablePeople,
};

export default todoApi;
