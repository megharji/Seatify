import apiClient from './client';

export const getWalletSummaryRequest = () => apiClient.get('/wallet');
export const addMoneyRequest = (payload, config = {}) => apiClient.post('/wallet/add-money', payload, config);
