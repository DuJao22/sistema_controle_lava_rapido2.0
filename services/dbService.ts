
import { DatabaseState, Sale, Expense, User, UserRole } from '../types';

// Extend the User interface locally for password handling in this mock
export interface UserWithPassword extends User {
  password?: string;
}

const DEFAULT_STATE: DatabaseState & { users: UserWithPassword[] } = {
  users: [
    { 
      id: 'admin-1', 
      name: 'João Layón', 
      username: 'Dujao22', 
      password: '30031936Vo.', 
      role: UserRole.ADMIN, 
      createdAt: Date.now() 
    }
  ],
  sales: [],
  expenses: [],
  version: 1,
  updatedAt: Date.now()
};

const STORAGE_KEY = 'lavarapido_db_local';
const CLOUD_STORAGE_KEY_PREFIX = 'lavarapido_cloud_';

export const dbService = {
  getLocalState(): DatabaseState & { users: UserWithPassword[] } {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATE;
  },

  saveLocalState(state: DatabaseState) {
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  async fetchCloudState(cloudKey: string): Promise<DatabaseState | null> {
    const cloudData = localStorage.getItem(`${CLOUD_STORAGE_KEY_PREFIX}${cloudKey}`);
    return cloudData ? JSON.parse(cloudData) : null;
  },

  async pushToCloud(cloudKey: string, state: DatabaseState) {
    localStorage.setItem(`${CLOUD_STORAGE_KEY_PREFIX}${cloudKey}`, JSON.stringify(state));
  },

  sync(cloudKey: string, localState: DatabaseState, cloudState: DatabaseState): DatabaseState {
    if (cloudState.updatedAt > localState.updatedAt) {
      return cloudState;
    } else if (localState.updatedAt > cloudState.updatedAt) {
      this.pushToCloud(cloudKey, localState);
      return localState;
    }
    return localState;
  },

  authenticate(username: string, password: string): User | null {
    const state = this.getLocalState();
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  addSale(sale: Sale) {
    const state = this.getLocalState();
    state.sales.push(sale);
    this.saveLocalState(state);
  },

  addExpense(expense: Expense) {
    const state = this.getLocalState();
    state.expenses.push(expense);
    this.saveLocalState(state);
  },

  addUser(user: UserWithPassword) {
    const state = this.getLocalState();
    state.users.push(user);
    this.saveLocalState(state);
  },

  deleteUser(userId: string) {
    const state = this.getLocalState();
    state.users = state.users.filter(u => u.id !== userId);
    this.saveLocalState(state);
  },

  resetUserPassword(userId: string, newPassword: string) {
    const state = this.getLocalState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      this.saveLocalState(state);
    }
  }
};
