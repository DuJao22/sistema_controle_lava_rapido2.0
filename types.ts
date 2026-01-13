
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export enum VehicleSize {
  P = 'Pequeno',
  M = 'Médio',
  G = 'Grande'
}

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'Dinheiro',
  CARD = 'Cartão'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: number;
}

export interface Sale {
  id: string;
  type: string;
  vehicleSize: VehicleSize;
  paymentMethod: PaymentMethod;
  value: number;
  date: number;
  userId: string;
  userName: string;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  date: number;
  userId: string;
}

export interface SyncState {
  lastSync: number;
  status: 'online' | 'syncing' | 'offline';
  cloudKey: string;
}

export interface DatabaseState {
  users: User[];
  sales: Sale[];
  expenses: Expense[];
  version: number;
  updatedAt: number;
}
