import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, UserPlus, Calendar, Flag } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Member form state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        assignedTo: taskAssignedTo || null,
        projectId: id
      });
      setShowTaskModal(false);
      // Reset
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('Medium'); setTaskAssignedTo(''); setTaskDueDate('');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (taskId) => {
    if(window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!project) return <div>Loading project...</div>;

  const isAdmin = project.admin._id === user._id;

  const renderTask = (task) => {
    const isAssignedToMe = task.assignedTo && task.assignedTo._id === user._id;
    const canEdit = isAdmin || isAssignedToMe;

    return (
      <div className="glass-card task-card" key={task._id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
          <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
          {isAdmin && (
             <button onClick={() => deleteTask(task._id)} style={{background:'rgba(239, 68, 68, 0.1)', border:'1px solid rgba(239, 68, 68, 0.2)', color:'var(--danger)', cursor:'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'}} title="Delete Task">
               &times;
             </button>
          )}
        </div>
        <h4 style={{ marginBottom: '0.5rem' }}>{task.title}</h4>
        {task.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.assignedTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserPlus size={14} /> {task.assignedTo.name}
            </div>
          )}
        </div>

        {canEdit ? (
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Update Status</label>
            <select 
              value={task.status} 
              onChange={(e) => updateTaskStatus(task._id, e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        ) : (
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔒 Status can only be updated by assignee or admin.</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2>{project.name}</h2>
            {isAdmin ? (
              <span className="badge role-badge-admin">Admin</span>
            ) : (
              <span className="badge role-badge-member">Member</span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <>
              <button className="btn" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }} onClick={() => setShowMemberModal(true)}>
                <UserPlus size={20} style={{ marginRight: '8px' }} />
                Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={20} style={{ marginRight: '8px' }} />
                New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Team Members</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {project.members.map(m => (
            <div key={m._id} className="glass-card" style={{ padding: '0.75rem 1.25rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: project.admin._id === m._id ? 'var(--secondary)' : 'var(--text-muted)', boxShadow: project.admin._id === m._id ? '0 0 10px var(--secondary)' : 'none' }}></div>
              <span style={{ fontWeight: 500 }}>{m.name}</span>
              {project.admin._id === m._id && <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>(Admin)</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="task-board">
        <div className="task-column">
          <div className="column-header">
            To Do
            <span className="badge badge-todo">{tasks.filter(t => t.status === 'To Do').length}</span>
          </div>
          {tasks.filter(t => t.status === 'To Do').map(renderTask)}
        </div>
        <div className="task-column">
          <div className="column-header">
            In Progress
            <span className="badge badge-progress">{tasks.filter(t => t.status === 'In Progress').length}</span>
          </div>
          {tasks.filter(t => t.status === 'In Progress').map(renderTask)}
        </div>
        <div className="task-column">
          <div className="column-header">
            Done
            <span className="badge badge-done">{tasks.filter(t => t.status === 'Done').length}</span>
          </div>
          {tasks.filter(t => t.status === 'Done').map(renderTask)}
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" className="form-control" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows="3"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Team Member</h3>
              <button className="close-btn" onClick={() => setShowMemberModal(false)}>&times;</button>
            </div>
            {memberError && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{memberError}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User Email</label>
                <input type="email" className="form-control" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required placeholder="user@example.com" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetail;
