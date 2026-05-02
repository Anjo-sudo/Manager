import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault(); // Prevent the Link from navigating
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All tasks inside will also be deleted.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="header-flex">
        <h2>Projects</h2>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          New Project
        </button>
      </div>

      <div className="grid-cards">
        {projects.map((project) => (
          <Link to={`/projects/${project._id}`} key={project._id} className="glass-card card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Folder size={22} color="var(--primary)" />
              {project.name}
            </h3>
            <p className="card-desc">{project.description || 'No description provided.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)'}}></div>
                {project.members.length} member(s)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {project.admin._id === user._id ? (
                  <span className="badge role-badge-admin">Admin</span>
                ) : (
                  <span className="badge role-badge-member">Member</span>
                )}
                {project.admin._id === user._id && (
                  <button
                    onClick={(e) => handleDeleteProject(e, project._id)}
                    title="Delete Project"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No projects found. Create one to get started!
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
