import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../services/authService'
import { useNavigate, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'creator']),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof schema>

function RegisterPage() {
    const navigate = useNavigate()

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, setError } = useForm<RegisterForm>({
        resolver: zodResolver(schema),
        defaultValues: { role: 'student' }
    })

    const onSubmit = async (data: RegisterForm) => {
        try {
            await authService.register({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
            })
            navigate('/login')
        } catch (error: any) {
            setError('root', { message: error.response?.data?.message || 'Error al registrarse' })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-fondo">
            <Card className="w-full max-w-md shadow-lg bg-fondo-claro">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-primario">Crear cuenta</CardTitle>
                    <CardDescription className="text-secundario">Completa el formulario para registrarte</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-3">
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input id="firstName" placeholder="Juan" {...register('firstName')} />
                                {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input id="lastName" placeholder="García" {...register('lastName')} />
                                {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
                            </div>
                        </div>
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
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                            {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Rol</Label>
                            <Select defaultValue="student" onValueChange={val => setValue('role', val as 'student' | 'creator')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Estudiante</SelectItem>
                                    <SelectItem value="creator">Creador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.root && <p className="text-destructive text-sm text-center">{errors.root.message}</p>}
                        <Button type="submit" className="w-full hover:cursor-pointer" disabled={isSubmitting}>
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </form>
                    <p className="text-center text-sm mt-4 text-secundario">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-primario hover:underline">Inicia sesión</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default RegisterPage