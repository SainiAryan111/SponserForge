import React, { useState } from 'react';
import { createCampaign } from '../services/api';

export default function CreateCampaignModal({ isOpen, onClose, onCampaignCreated }) {
  const [startMode, setStartMode] = useState('instant'); // 'instant' | 'scheduled'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 500,
    target_platform: 'youtube',
    target_niche: 'tech',
    min_subscribers_required: 1000,
    creators_needed: 1,
    start_datetime: '',
    duration_hours: 24,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const extractErrorMessage = (err) => {
    if (!err.response) return err.message || 'Network error.';
    const data = err.response.data;
    if (!data) return 'Failed to create campaign.';
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (typeof data === 'object') {
      const messages = Object.entries(data).map(([field, errs]) => {
        const msgStr = Array.isArray(errs) ? errs.join(', ') : String(errs);
        return `${field}: ${msgStr}`;
      });
      return messages.join(' | ');
    }
    return 'Failed to create campaign.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let isoStartDt = null;
    if (startMode === 'scheduled' && formData.start_datetime) {
      const parsedDt = new Date(formData.start_datetime);
      if (!isNaN(parsedDt.getTime())) {
        isoStartDt = parsedDt.toISOString();
      }
    }

    try {
      const response = await createCampaign({
        ...formData,
        start_instantly: startMode === 'instant',
        start_datetime: isoStartDt,
        duration_hours: parseInt(formData.duration_hours || 24, 10),
      });
      onCampaignCreated(response.data);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
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