import api from './api';

export const JobService = {
    getAllJobs: async () => {
        const response = await api.get('/jobs');
        return response.data;
    },

    getJobsByLocation: async () => {
        const response = await api.get('/jobs/location');
        return response.data;
    },

    getJobsBySkills: async () => {
        const response = await api.get('/jobs/skills');
        return response.data;
    },

    getAppliedJobs: async () => {
        const response = await api.get('/jobs/applied');
        return response.data;
    },

    calculateATSScore: async (jobId) => {
        const response = await api.get(`/jobs/${jobId}/ats-score`);
        return response.data;
    },

    applyForJob: async (jobId) => {
        const response = await api.post(`/jobs/${jobId}/apply`);
        return response.data;
    },

    // Recruiter endpoints
    postJob: async (jobData) => {
        const response = await api.post('/jobs', jobData);
        return response.data;
    },

    getAppliedCandidates: async (jobId) => {
        const response = await api.get(`/jobs/${jobId}/candidates`);
        return response.data;
    }
};
