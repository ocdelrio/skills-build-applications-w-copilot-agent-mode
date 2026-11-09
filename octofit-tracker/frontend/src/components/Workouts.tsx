import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch(() => setError('Unable to load workout suggestions.'))
      .finally(() => setLoading(false));
  }, []);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p>
    {loading && <p role="status">Loading workout suggestions...</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && suggestions.length === 0 && <p>No workout suggestions yet.</p>}
    {!loading && !error && suggestions.length > 0 && <ul>{suggestions.map((workout) => <li key={workout.title}><strong>{workout.title}</strong>{workout.reason ? `: ${workout.reason}` : ''}</li>)}</ul>}
  </div></section>;
}
