// interfaces/user.interface.ts
export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  accountCount: number;
  transactionCount: number;
  totalBalance: number;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
}

export interface BankAccount {
  id: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  currentBalance: number;
  lastSync: string;
  rib: string | null;
  role: string;
  swiftCode: string | null;
}

export interface Transaction {
  id: number;
  transactionRef: string;
  type: string;
  amount: number;
  finalAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  status: string;
  createdAt: string;
  completedAt: string;
  isReconciled: boolean;
}
