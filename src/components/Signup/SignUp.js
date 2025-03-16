import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignUp = () => {
    const history = useHistory();

    const initialValues = {
        name: '',
        email: '',
        password: ''
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    });

    const handleSignUp = async (values, { setSubmitting }) => {
        try {
            await axios.post('http://localhost:4000/users', {
                ...values,
                role: 'employee'
            });
            history.push('/login');
        } catch (error) {
            console.error('Error signing up:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSignUp}>
                {({ isSubmitting }) => (
                    <Form>
                        <label>
                            Name:
                            <Field type="text" name="name" />
                            <ErrorMessage name="name" component="div" className="error" />
                        </label>
                        <label>
                            Email:
                            <Field type="email" name="email" />
                            <ErrorMessage name="email" component="div" className="error" />
                        </label>
                        <label>
                            Password:
                            <Field type="password" name="password" />
                            <ErrorMessage name="password" component="div" className="error" />
                        </label>
                        <button type="submit" disabled={isSubmitting}>Sign Up</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SignUp;