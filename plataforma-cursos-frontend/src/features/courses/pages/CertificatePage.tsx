import { useCertificates } from '../hooks/useCertificates.hooks';
import { certificateService } from '../services/certificateService';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../app/providers/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

function CertificatePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { certificates, loading } = useCertificates();
    const [downloading, setDownloading] = useState<string | null>(null);
    const { isDark, toggleTheme } = useTheme()

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
            <div className="min-h-screen bg-fondo">
                <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-between items-center">
                    <div className="flex flex-1">
                        <Button size="sm" onClick={() => navigate('/student-dashboard')}>
                            <ArrowLeft size={16} /> Volver al dashboard
                        </Button>
                    </div>

                    <h1 className="text-xl font-bold text-primario">Plataforma de cursos</h1>

                    <div className="flex flex-1 justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                </nav>
                <div className="max-w-4xl mx-auto px-8 py-10">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-primario">Mis Certificados</h2>
                        <p className="text-secundario">Certificados de los cursos que has completado.</p>
                    </div>
                    {loading ? (
                        <p className="text-center py-12 text-secundario">Cargando certificados...</p>
                    ) : certificates.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-center py-12 text-secundario">No has generado ningun certificado.</p>
                                <Button onClick={() => navigate('/catalog')}>
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
                                            <p className="text-sm text-secundario">
                                                Expedido el {new Date(cert.issuedAt).toLocaleDateString()}
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {cert.certificateCode}
                                                </Badge>
                                            </p>
                                        </div>
                                        <Button onClick={() => handleDownload(cert.id, cert.course.title)}
                                            disabled={downloading === cert.id}>
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