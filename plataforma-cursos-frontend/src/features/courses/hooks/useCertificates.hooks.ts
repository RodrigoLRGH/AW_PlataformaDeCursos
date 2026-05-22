import { useEffect, useState } from 'react';
import { certificateService, type Certificate } from '../services/certificateService';

export function useCertificates() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        certificateService.getMyCertificates()
            .then(setCertificates)
            .finally(() => setLoading(false));
    }, []);

    return { certificates, setCertificates, loading };
}