import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../app/providers/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router';

const loginSchema = z.object({
    email: z.string().email('Correo invalido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });


    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await authService.login(data);
            login(response.user);
            navigate(response.user.role === 'creator' ? '/creator-dashboard' : '/student-dashboard');
        } catch {
            setError('email', { type: 'manual', message: 'Credenciales inválidas' });
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Correo</Label>
                                <Input id="email" type="email" placeholder="usuario@email.com" {...register('email')} />
                                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                            </div>
                            {errors.root && <p className="text-destructive text-sm text-center">{errors.root.message}</p>}
                            <Button type="submit" className="w-full hover:cursor-pointer" disabled={isSubmitting}>
                                {isSubmitting ? 'Cargando...' : 'Entrar'}
                            </Button>
                        </form>
                        <p className="text-center text-sm mt-4 text-muted-foreground">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default LoginPage;