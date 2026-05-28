import axios from 'axios'

const API = 'http://localhost:3005'

export const fetchUserActivity = async (userId) => {
    try {
        const token = localStorage.getItem('token')

        const response = await axios.get(
            `${API}/v1/activity/user/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response.data.data
    } catch (error) {
        console.error('Error fetching activities:', error)
        return []
    }
}