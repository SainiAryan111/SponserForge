import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-Refresh Expired Access Tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest); // Retry original failed request
        } catch (refreshErr) {
          // Refresh token expired or invalid -> logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);


// ==========================================
// AUTH & PROFILE
// ==========================================
export const signup = (data) => API.post('auth/signup/', data);
export const login = (data) => API.post('auth/login/', data);
export const getUserProfile = () => API.get('auth/profile/');
export const updateUserProfile = (data) => API.put('auth/profile/', data);

// ==========================================
// CAMPAIGNS (ViewSet: GET, POST, PUT, DELETE)
// ==========================================
export const getCampaigns = () => API.get('campaigns/');
export const getCampaignDetail = (id) => API.get(`campaigns/${id}/`);
export const createCampaign = (data) => API.post('campaigns/', data);
export const updateCampaign = (id, data) => API.put(`campaigns/${id}/`, data);
export const deleteCampaign = (id) => API.delete(`campaigns/${id}/`);
export const startCampaignInstantly = (id) => API.post(`campaigns/${id}/start-instantly/`);
export const endCampaignInstantly = (id) => API.post(`campaigns/${id}/end-instantly/`);

// ==========================================
// AI VECTOR MATCHING
// ==========================================
export const searchCreators = (filterParams) => API.post('match-creators/', filterParams);
export const getCreatorsForCampaign = (campaignId) => API.get(`campaigns/${campaignId}/match/`);
export const getCampaignsForCreator = (creatorId) => API.get(`creator/match-campaigns/${creatorId}/`);

export const searchUsers = (params) => API.get('users/search/', { params });
export const offerCampaign = (campaignId, creatorId, offerData = {}) => 
  API.post('applications/offer-campaign/', { campaign_id: campaignId, creator_id: creatorId, ...offerData });

export const acceptOffer = (applicationId) => 
  API.post(`applications/${applicationId}/accept-offer/`);

export const rejectApplication = (applicationId) => 
  API.post(`applications/${applicationId}/reject/`);

// ==========================================
// CAMPAIGN APPLICATIONS & PAYOUT LIFECYCLE
// ==========================================
export const getApplications = () => API.get('applications/');
export const applyToCampaign = (campaignId, pitch) => 
  API.post('applications/', { campaign: campaignId, pitch });

export const acceptApplication = (applicationId, acceptData = {}) => 
  API.post(`applications/${applicationId}/accept/`, acceptData);

export const submitWork = (applicationId, submissionLink) => 
  API.post(`applications/${applicationId}/submit-work/`, { submission_link: submissionLink });

export const completeAndPay = (applicationId, payData = {}) => 
  API.post(`applications/${applicationId}/complete-and-pay/`, payData);

export default API;