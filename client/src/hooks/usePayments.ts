/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { createPaymentOrder, getPayments, getPaymentDetail, approvePayment as approvePaymentApi, rejectPayment as rejectPaymentApi } from '../lib/api';
import type { Payment, PaymentCreateData } from '../types';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        count: number;
        next: string | null;
        previous: string | null;
    }>({ count: 0, next: null, previous: null });

    const fetchPayments = useCallback(async (params?: Record<string, any>, pageUrl?: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPayments(params, pageUrl);
            const data = response.data as any;
            
            // Handle both paginated and non-paginated responses
            if (data.results && Array.isArray(data.results)) {
                setPayments(data.results);
                setPagination({
                    count: data.count,
                    next: data.next,
                    previous: data.previous
                });
            } else if (data.data && Array.isArray(data.data)) {
                setPayments(data.data);
                // If backend doesn't provide pagination info in this specific format yet
                setPagination({
                    count: data.data.length,
                    next: null,
                    previous: null
                });
            }
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
                toast.success('Payment details submitted successfully');
                return response.data.data;
            }
            throw new Error('Failed to submit payment details');
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

    const approvePayment = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await approvePaymentApi(id);
            if (response.data.success) {
                toast.success('Payment approved and student enrolled');
                return response.data.data;
            }
            throw new Error('Failed to approve payment');
        } catch (err: unknown) {
            let message = 'Failed to approve payment';
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

    const rejectPayment = async (id: string, feedback?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rejectPaymentApi(id, feedback);
            if (response.data.success) {
                toast.success('Payment rejected');
                return response.data.data;
            }
            throw new Error('Failed to reject payment');
        } catch (err: unknown) {
            let message = 'Failed to reject payment';
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
        pagination,
        fetchPayments,
        initiatePayment,
        fetchPaymentDetail,
        approvePayment,
        rejectPayment,
    };
}
