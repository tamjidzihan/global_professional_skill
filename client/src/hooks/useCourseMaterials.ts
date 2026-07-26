import { useState, useCallback } from 'react';
import { getCourseMaterials, uploadCourseMaterial, deleteCourseMaterial, deleteCourseMaterialsBulk } from '../lib/api';
import type { CourseMaterial } from '../types';
import { extractErrorMessage } from '../lib/errorUtils';
import toast from 'react-hot-toast';

export function useCourseMaterials() {
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMaterials = useCallback(async (courseId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCourseMaterials(courseId);
            if (response.data?.success) {
                setMaterials(response.data.data);
            }
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadMaterial = async (
        courseId: string,
        formData: FormData,
        onUploadProgress?: (progressEvent: any) => void
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await uploadCourseMaterial(courseId, formData, onUploadProgress);
            if (response.data?.success) {
                setMaterials(prev => [response.data.data, ...prev]);
                return response.data.data;
            }
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMaterial = async (courseId: string, materialId: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteCourseMaterial(courseId, materialId);
            setMaterials(prev => prev.filter(m => m.id !== materialId));
            toast.success("Material deleted successfully.");
            return true;
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteMaterialsBulk = async (courseId: string, materialIds: string[]) => {
        setLoading(true);
        setError(null);
        try {
            await deleteCourseMaterialsBulk(courseId, materialIds);
            setMaterials(prev => prev.filter(m => !materialIds.includes(m.id)));
            toast.success(`Successfully deleted ${materialIds.length} materials.`);
            return true;
        } catch (err: any) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        materials,
        loading,
        error,
        fetchMaterials,
        uploadMaterial,
        deleteMaterial,
        deleteMaterialsBulk,
    };
}
