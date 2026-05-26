import { useState } from 'react';
import { statusService } from '../services/statusService';
import './ApiTestPage.css';

const endpoints = [
  { method: 'GET', path: '/v1/status/user/{id}', desc: 'Get status for a single user', key: 'user' },
  { method: 'GET', path: '/v1/status/group/{id}', desc: 'Get aggregated status for a group', key: 'group' },
  { method: 'GET', path: '/v1/status/all', desc: 'Get classification for all users', key: 'all' },
  { method: 'POST', path: '/v1/status/classify', desc: 'Trigger classification with custom threshold', key: 'classify' },
  { method: 'PATCH', path: '/v1/status/threshold', desc: 'Update inactivity threshold config', key: 'threshold' },
];

const integrationNotes = [
  { label: 'Consumes From', value: 'Module 5 — Activity Tracking Service (activity logs)' },
  { label: 'Provides To', value: 'Module 7 — Analytics & Dashboard Service' },
  { label: 'Auth', value: 'JWT — validated via Module 1 (/auth/validate)' },
  { label: 'Rule', value: 'NO other module calculates activity independently' },
  { label: 'Time Format', value: 'UTC ISO 8601 — YYYY-MM-DDTHH:MM:SSZ' },
];

export default function ApiTestView({ users }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  async function handleTest(key) {
    setLoading(true);
    setActiveEndpoint(key);
    setResponse(null);

    try {
      let data;
      if (key === 'user') {
        const uid = users.length ? users[0].user_id : 'unknown';
        data = await statusService.fetchUserStatus(uid);
      } else if (key === 'group') {
        const gid = users.length ? users[0].group_id : 'unknown';
        data = await statusService.fetchGroupStatus(gid);
      } else if (key === 'all') {
        data = await statusService.fetchAllStatuses();
      } else if (key === 'classify') {
        data = await statusService.classifyUsers(3);
      } else if (key === 'threshold') {
        data = await statusService.updateThreshold(5, 'admin@institute.com');
      }
      setResponse({ success: true, data });
    } catch (err) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="api-test-view">
      <div className="section-header">
        <div className="section-title">Module 6 — API Endpoints</div>
        <span className="section-hint">Click an endpoint to test it</span>
      </div>

      <div className="api-panel">
        <div className="api-panel-header">Endpoints — /v1/status</div>
        <div className="api-endpoint-list">
          {endpoints.map((ep) => (
            <div
              key={ep.key}
              className={`api-endpoint ${activeEndpoint === ep.key ? 'selected' : ''}`}
              onClick={() => handleTest(ep.key)}
            >
              <span className={`method ${ep.method}`}>{ep.method}</span>
              <span className="ep-path">{ep.path}</span>
              <span className="ep-desc">{ep.desc}</span>
            </div>
          ))}
        </div>

        {/* Response box */}
        {(loading || response) && (
          <div className="response-box">
            {loading ? (
              <div className="response-loading">
                <span className="loading-spinner" /> Loading...
              </div>
            ) : response?.success ? (
              <pre className="response-json">{JSON.stringify(response.data, null, 2)}</pre>
            ) : (
              <div className="response-error">Error: {response?.error}</div>
            )}
          </div>
        )}
      </div>

      {/* Integration notes */}
      <div className="integration-panel">
        <div className="integration-header">Integration Notes</div>
        <table className="integration-table">
          <tbody>
            {integrationNotes.map((note, i) => (
              <tr key={i}>
                <td className="note-label">{note.label}</td>
                <td className="note-value">{note.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
