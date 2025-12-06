import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { register: registerUser, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser(data.name, data.email, data.password, data.photoURL);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            console.error('Google registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-3xl font-bold text-center justify-center mb-6">
                        Join <span className="text-primary">ClubSphere</span>
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                                {...register('name', {
                                    required: 'Name is required'
                                })}
                            />
                            {errors.name && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.name.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Email */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {errors.email && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.email.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Photo URL */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Photo URL (optional)</span>
                            </label>
                            <input
                                type="url"
                                placeholder="Enter photo URL"
                                className={`input input-bordered ${errors.photoURL ? 'input-error' : ''}`}
                                {...register('photoURL', {
                                    pattern: {
                                        value: /^https?:\/\/.+/i,
                                        message: 'Invalid URL'
                                    }
                                })}
                            />
                            {errors.photoURL && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.photoURL.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Password */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
                                        message: 'Password must contain at least one uppercase and one lowercase letter'
                                    }
                                })}
                            />
                            {errors.password && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.password.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner"></span> : 'Register'}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="divider">OR</div>

                    {/* Google Register */}
                    <button
                        onClick={handleGoogleRegister}
                        className="btn btn-outline gap-2"
                        disabled={loading}
                    >
                        <FaGoogle className="text-xl" />
                        Continue with Google
                    </button>

                    {/* Login Link */}
                    <p className="text-center mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
