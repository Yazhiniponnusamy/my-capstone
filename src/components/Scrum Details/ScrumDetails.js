import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ScrumDetails = ({ scrum }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const history = useHistory();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            history.push('/login');
        }
    }, [history]);

    useEffect(() => {
        const fetchScrumData = async () => {
            try {
                const [tasksResponse, usersResponse] = await Promise.all([
                    axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`),
                    axios.get('http://localhost:4000/users'),
                ]);

                setTasks(tasksResponse.data);

                const scrumUsers = usersResponse.data.filter(user =>
                    tasksResponse.data.some(task => task.assignedTo === user.id)
                );
                setUsers(scrumUsers);
            } catch (error) {
                console.error('Error fetching scrum data:', error);
            }
        };

        fetchScrumData();
    }, [scrum.id]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            if (!taskToUpdate) return;

            const updatedTask = {
                ...taskToUpdate,
                status: newStatus,
                history: [
                    ...taskToUpdate.history,
                    { status: newStatus, date: new Date().toISOString().split('T')[0] },
                ],
            };

            await axios.patch(`http://localhost:4000/tasks/${taskId}`, updatedTask);

            setTasks(prevTasks =>
                prevTasks.map(task => (task.id === taskId ? updatedTask : task))
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    return (
        <div>
            <h3>Scrum Details for {scrum.name}</h3>
            <h4>Tasks</h4>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <strong>{task.title}:</strong> {task.description} - <em>{task.status}</em>
                        {user?.role === 'admin' && (
                            <Formik
                                initialValues={{ status: task.status }}
                                validationSchema={Yup.object({
                                    status: Yup.string().required('Status is required'),
                                })}
                                onSubmit={(values, { setSubmitting }) => {
                                    handleStatusChange(task.id, values.status);
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <Field as="select" name="status">
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </Field>
                                        <ErrorMessage name="status" component="div" style={{ color: 'red' }} />
                                        <button type="submit" disabled={isSubmitting}>Update</button>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </li>
                ))}
            </ul>
            <h4>Users</h4>
            <ul>
                {users.map(u => (
                    <li key={u.id}>
                        {u.name} ({u.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScrumDetails;
