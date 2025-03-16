import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserProfile = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                setUsers(response.data.filter(user => user.role !== 'admin')); 
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGetHistory = (userId) => {
        setSelectedUser(users.find(user => user.id === userId));
        fetchTasks(userId);
    };

    return (
        <div>
            <h2>User Profiles</h2>
            
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    
                    {showForm && (
                        <Formik
                            initialValues={{
                                name: '',
                                email: '',
                                password: '',
                                role: 'employee',
                            }}
                            validationSchema={Yup.object({
                                name: Yup.string().min(3, 'Too short').required('Required'),
                                email: Yup.string().email('Invalid email').required('Required'),
                                password: Yup.string().min(6, 'Must be 6 characters or more').required('Required'),
                                role: Yup.string().oneOf(['employee', 'admin']).required('Required'),
                            })}
                            onSubmit={async (values, { resetForm }) => {
                                try {
                                    await axios.post('http://localhost:4000/users', values);
                                    const updatedUsers = await axios.get('http://localhost:4000/users');
                                    setUsers(updatedUsers.data.filter(user => user.role !== 'admin'));
                                    setShowForm(false);
                                    resetForm();
                                } catch (error) {
                                    console.error('Error adding user:', error);
                                }
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div>
                                        <label>Name:</label>
                                        <Field type="text" name="name" />
                                        <ErrorMessage name="name" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Email:</label>
                                        <Field type="email" name="email" />
                                        <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Password:</label>
                                        <Field type="password" name="password" />
                                        <ErrorMessage name="password" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Role:</label>
                                        <Field as="select" name="role">
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </Field>
                                        <ErrorMessage name="role" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <button type="submit" disabled={isSubmitting}>Create User</button>
                                </Form>
                            )}
                        </Formik>
                    )}
                    
                    <ul>
                        {users.map(user => (
                            <li key={user.id}>
                                <strong>Name:</strong> {user.name} <br />
                                <strong>Email:</strong> {user.email} <br />
                                <button onClick={() => handleGetHistory(user.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedUser && (
                <div>
                    <h3>Tasks Assigned to {selectedUser.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
