export interface Transaction {
    action_type: string;
    amount: string;
    description: string;
    transaction_date: string;
    counterparty?: string;
}
