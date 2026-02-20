import { useState, useCallback } from 'react';
import { createPaymentOrder, getPayments, getPaymentDetail } from '../lib/api';
import type { Payment, PaymentCreateData } from '../types';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async (params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPayments(params);
            setPayments(response.data.data);
        } catch (err: unknown) {
            let message = 'Failed to fetch payments';
            if (isAxiosError(err)) {
                message = err.response?.data?.error?.message || message;
            }
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const initiatePayment = async (data: PaymentCreateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createPaymentOrder(data);
            if (response.data.success) {
                toast.success('Payment order created successfully');
                return response.data.data;
            }
            throw new Error('Failed to create payment order');
        } catch (err: unknown) {
            let message = 'Failed to initiate payment';
            if (isAxiosError(err)) {
                message = err.response?.data?.error?.message || message;
            }
            setError(message);
            toast.error(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentDetail = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPaymentDetail(id);
            return response.data.data;
        } catch (err: unknown) {
            let message = 'Failed to fetch payment details';
            if (isAxiosError(err)) {
                message = err.response?.data?.error?.message || message;
            }
            setError(message);
            toast.error(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        payments,
        loading,
        error,
        fetchPayments,
        initiatePayment,
        fetchPaymentDetail,
    };
}
