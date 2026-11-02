import { ArrowUpRight, Clock3, Film, Layers3, Network } from 'lucide-react';
import { duration } from '@/lib/planner.mjs';

type Topic = { id: string; label: string; total: number; watched: number; planned: number; omitted: number };
type Scenario = { hours: number; minutes: number; films: number; topics: number; gaps: number };

export function DashboardMetrics({ films, minutes, remaining, topics, fits, shortfall }: {
  films: number; minutes: number; remaining: number; topics: number; fits: boolean; shortfall: number;
}) {
  return <section className="metric-grid" aria-label="Current plan metrics">
    <article className="metric-card"><span><Film size={16}/> FILMS IN YOUR PLAN</span><strong>{films}<small> films</small></strong><p>Unwatched titles, in release order</p></article>
    <article className="metric-card"><span><Clock3 size={16}/> PLANNED WATCH TIME</span><strong>{duration(minutes)}</strong><p>Already-watched films excluded</p></article>
    <article className={'metric-card '+(!fits?'metric-alert':'')}><span><Layers3 size={16}/>{fits?'TIME LEFT IN BUDGET':'MORE TIME NEEDED'}</span><strong>{duration(fits?remaining:shortfall)}</strong><p>{fits?'Available after your selected route':'To fit the shortest unwatched film'}</p></article>
    <article className="metric-card"><span><Network size={16}/> STORY TOPICS REPRESENTED</span><strong>{topics}<small> / 6 topics</small></strong><p>In your plan or watched history</p></article>
  </section>;
}

export function DashboardAnalysis({ topics, scenarios, hours, focus, onFocus, onBudget, ready }: {
  topics: Topic[]; scenarios: Scenario[]; hours: number; focus: string|null;
  onFocus: (id: string|null)=>void; onBudget: (hours: number)=>void; ready: boolean;
}) {
  return <section className="analysis-grid" id="analysis" aria-label="Plan analysis">
    <div className="analysis-card"><div className="analysis-heading"><div><span className="section-label">COVERAGE BREAKDOWN</span><h2>Where your story connects</h2></div><span className="small-badge">6 TOPICS</span></div>
      <p className="analysis-description">Select a topic to highlight its films on the map.</p>
      <div className="topic-chart">{topics.map(topic=><button key={topic.id} className={'topic-row '+(focus===topic.id?'active':'')} aria-pressed={focus===topic.id} onClick={()=>onFocus(focus===topic.id?null:topic.id)} aria-label={`${topic.label}: ${topic.watched} watched, ${topic.planned} planned, ${topic.omitted} not selected. Highlight on map`}>
        <span className="topic-name">{topic.label}</span><span className="topic-track" aria-hidden="true"><i className="topic-seen" style={{width:`${topic.watched/topic.total*100}%`}}/><i className="topic-planned" style={{width:`${topic.planned/topic.total*100}%`}}/></span><span className="topic-value">{topic.watched+topic.planned}<small> / {topic.total}</small></span>
      </button>)}</div><div className="chart-key"><span><i className="topic-seen"/> Watched</span><span><i className="topic-planned"/> In plan</span><span><i/> Not selected</span></div><p className="chart-note">Counts are films per topic. A film can appear in several rows. These editorial categories are not a readiness score.</p>
    </div>
    <div className="analysis-card"><div className="analysis-heading"><div><span className="section-label">WHAT-IF COMPARISON</span><h2>What could more time unlock?</h2></div><Clock3 size={18}/></div>
      <p className="analysis-description">Compare weekly viewing time before your chosen deadline.</p>
      <div className="scenario-table-wrap"><table className="scenario-table"><caption className="sr-only">Watch plans at 1, 2, and 4 hours per week</caption><thead><tr><th>Per week</th><th>Films</th><th>Topics</th><th>Watch time</th><th><span className="sr-only">Apply budget</span></th></tr></thead><tbody>{scenarios.map(s=><tr key={s.hours} className={hours===s.hours?'current-scenario':''}><th scope="row">{s.hours}h/wk{hours===s.hours&&<span className="scenario-current">CURRENT</span>}</th><td>{s.films}</td><td>{s.topics}/6</td><td>{duration(s.minutes)}</td><td><button disabled={!ready||hours===s.hours} aria-label={`Use ${s.hours} hours per week`} onClick={()=>onBudget(s.hours)}><ArrowUpRight size={17}/></button></td></tr>)}</tbody></table></div>
      <div className="analysis-callout"><span className="section-label">FROM INSIGHT TO ACTION</span><p>Try a weekly pace, explore the connections, then ask AI to explain a film’s editorial value.</p><small>Plans and metrics are calculated by code. AI runs only when you request an explanation.</small></div>
    </div>
  </section>;
}
