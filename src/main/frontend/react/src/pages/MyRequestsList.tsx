import {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import {useAuth} from "../components/AuthContext";
// import { RequestDTO } from '../../types/dto'; // Тип для данных заявки


const StudentRequestList = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {user} = useAuth();

    interface Request {
        id: number;
        status: string;
        createTime: string;
        requestText: string | null;
        courseName: string;
        studyDirection: string;
    }

    useEffect(() => {
        const fetchRequests = async () => {

            try {
                const response = await fetch('http://localhost:8080/api/requests/my', {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки заявок');
                }

                const data = await response.json();
                setRequests(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user?.token]);

    if (loading) return <CircularProgress/>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Курс</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Комментарий</TableCell>
                        <TableCell>Дата подачи</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>{request.courseName}</TableCell>
                            <TableCell>{request.status}</TableCell>
                            <TableCell>{request.requestText}</TableCell>
                            <TableCell>{new Date(request.createTime).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StudentRequestList;