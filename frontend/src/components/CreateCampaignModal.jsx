import React, { useState } from 'react';
import { createCampaign } from '../services/api';

export default function CreateCampaignModal({ isOpen, onClose, onCampaignCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 500,
    target_platform: 'youtube',
    target_niche: 'tech',
    min_subscribers_required: 1000,
    creators_needed: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createCampaign(formData);
      onCampaignCreated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Create New Campaign</h2>
        {error && <p className="error-badge">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Campaign Title</label>
            <input 
              type="text" 
              placeholder="e.g. Next-Gen Wireless Gaming Headset Review" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>
          <div className="form-row">
            <label>Description & Deliverables</label>
            <textarea 
              placeholder="Provide a detailed description of the campaign deliverables..." 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              required 
            />
          </div>
          <div className="form-row">
            <label>Points Reward</label>
            <input 
              type="number" 
              value={formData.points_reward} 
              onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value) || 0})} 
            />
          </div>
          <div className="form-row">
            <label>Platform</label>
            <select 
              value={formData.target_platform} 
              onChange={(e) => setFormData({...formData, target_platform: e.target.value})}
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitch">Twitch</option>
            </select>
          </div>
          <div className="form-row">
            <label>Min Subscribers Required</label>
            <input 
              type="number" 
              value={formData.min_subscribers_required} 
              onChange={(e) => setFormData({...formData, min_subscribers_required: parseInt(e.target.value) || 0})} 
            />
          </div>
          <div className="form-row">
            <label>Creators Needed</label>
            <input 
              type="number" 
              min="1"
              value={formData.creators_needed} 
              onChange={(e) => setFormData({...formData, creators_needed: parseInt(e.target.value) || 1})} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Generating Embedding...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}