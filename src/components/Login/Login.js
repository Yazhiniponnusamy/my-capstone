import React, { useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
    const history = useHistory();
    const { login } = useContext(UserContext);

    const initialValues = {
        email: '',
        password: ''
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required')
    });

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const response = await axios.get(`http://localhost:4000/users?email=${values.email}&password=${values.password}`);
            if (response.data.length > 0) {
                const user = response.data[0];
                login(user);
                history.push(user.role === 'admin' ? '/' : '/profiles');
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleLogin}>
                {({ isSubmitting }) => (
                    <Form>
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
                        <button type="submit" disabled={isSubmitting}>Login</button>
                    </Form>
                )}
            </Formik>
            <button onClick={() => history.push('/signup')}>Sign Up</button>
        </div>
    );
};

export default Login;
