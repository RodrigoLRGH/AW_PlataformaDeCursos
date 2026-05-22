import { useCertificates } from '../hooks/useCertificates.hooks';
import { certificateService } from '../services/certificateService';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../app/providers/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

function CertificatePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { certificates, loading } = useCertificates();
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (certId: string, courseTitle: string) => {
        setDownloading(certId);
        try {
            const pdfData = await certificateService.download(certId);
            const url = window.URL.createObjectURL(pdfData);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${courseTitle}-certificate.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error al descargar certificado');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">

                    <Button size="sm" onClick={() => navigate('/student-dashboard')} className="hover:cursor-pointer">
                        ← Volver al dashboard
                    </Button><h1 className="text-xl font-bold text-primary">Mis Certificados</h1>
                    <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                        Cerrar sesión
                    </Button>
                </nav>
                <div className="max-w-4xl mx-auto px-8 py-10">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Mis Certificados</h2>
                        <p className="text-muted-foreground">Aquí puedes ver y descargar tus certificados de los cursos que has completado.</p>
                    </div>
                    {loading ? (
                        <p className="text-center py-12 text-muted-foreground">Cargando certificados...</p>
                    ) : certificates.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-center py-12 text-muted-foreground">No has generado ningún certificado aún.</p>
                                <Button onClick={() => navigate('/catalog')} className="hover:cursor-pointer">
                                    Explorar cursos
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map((cert) => (
                                <Card key={cert.id}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{cert.course.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Expedido el {new Date(cert.issuedAt).toLocaleDateString()}
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {cert.certificateCode}
                                                </Badge>
                                            </p>
                                        </div>
                                        <Button onClick={() => handleDownload(cert.id, cert.course.title)}
                                            disabled={downloading === cert.id}
                                            className="hover:cursor-pointer">
                                            {downloading === cert.id ? 'Descargando...' : 'Descargar Certificado en PDF'}
                                        </Button>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CertificatePage;