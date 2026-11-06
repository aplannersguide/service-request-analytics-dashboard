import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Layers, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Star, 
  Clock, 
  ArrowRight, 
  Lightbulb,
  Users,
  ShieldAlert,
  ClipboardList,
  Calendar,
  MessageSquare,
  Award,
  Zap,
  CheckSquare
} from 'lucide-react';
import citySeal from '../assets/city_of_richmond_seal.png';

export default function AnalysisGuide({ onNavigateTab }) {
  const [checkedSignals, setCheckedSignals] = useState({});
  const [activeQuestionTab, setActiveQuestionTab] = useState(1);
  const [activeMainSection, setActiveMainSection] = useState('framework'); // 'framework' | 'facilitator' | 'briefing'

  const toggleSignal = (key) => {
    setCheckedSignals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="analysis-guide-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Hero Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--bg-card-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        borderLeft: '6px solid var(--rva-navy)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={citySeal} 
            alt="City of Richmond Seal" 
            style={{ width: '74px', height: '74px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--rva-navy)', textTransform: 'uppercase' }}>
              City of Richmond • Transformation Office
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--rva-dark)', margin: '4px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
              311 Analytics Companion Guide & Performance Playbook
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, maxWidth: '750px' }}>
              A practitioner’s field guide for operational leads and supervisors to spot signals, uncover root causes, and run actionable tests ahead of their Monthly SLA Performance Meetings.
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#F0F4F8',
          border: '1px solid #CBD5E1',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          minWidth: '220px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Meeting Cadence
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--rva-dark)' }}>
            Monthly SLA Performance Meetings
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Mayor & CAO Review Rhythm
          </span>
        </div>
      </div>

      {/* Navigation Sub-Pills for the Companion Guide */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '8px'
      }}>
        {[
          { id: 'framework', label: '1. Three Performance Questions', icon: <Search size={15} /> },
          { id: 'facilitator', label: '2. Facilitator Pre-Meeting Huddle (20 Min)', icon: <Users size={15} /> },
          { id: 'briefing', label: '3. The 3-Part Briefing Standard', icon: <Award size={15} /> }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveMainSection(section.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: activeMainSection === section.id ? '1px solid var(--rva-navy)' : '1px solid #CBD5E1',
              backgroundColor: activeMainSection === section.id ? 'var(--rva-navy)' : '#ffffff',
              color: activeMainSection === section.id ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: THE THREE PERFORMANCE QUESTIONS */}
      {activeMainSection === 'framework' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Core Principle Callout */}
          <div style={{
            backgroundColor: '#F0F4F8',
            border: '1px solid #7FB1E5',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'var(--rva-navy)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--rva-navy)', margin: '0 0 4px 0' }}>
                Core Principle: Data is a Compass to Guide Us, Not a Grade to Judge Us
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.55 }}>
                <strong>The dashboard is a flashlight, not the whole picture.</strong> Numbers on a screen will never capture the complete reality of work on the street. They simply illuminate where to look next. Your goal when opening this dashboard isn’t to defend past numbers; it is to walk away with <strong>better questions</strong> for your team and <strong>focused, zero-cost actions</strong> to test.
              </p>
            </div>
          </div>

          {/* Question Tabs Container */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-card-border)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid var(--bg-card-border)',
              backgroundColor: '#FAFAFC'
            }}>
              {[
                { id: 1, num: '#1', title: 'WHAT do we see?', sub: 'Data, Metrics & 4 Basic Signals', icon: <Search size={18} /> },
                { id: 2, num: '#2', title: 'WHY is it happening?', sub: 'Drivers, 5 Whys & Resident Voice', icon: <Layers size={18} /> },
                { id: 3, num: '#3', title: 'HOW can we impact it?', sub: 'Action Within Existing Resources', icon: <Target size={18} /> },
              ].map(q => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionTab(q.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: activeQuestionTab === q.id ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderBottom: activeQuestionTab === q.id ? '3px solid var(--rva-navy)' : '3px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    color: activeQuestionTab === q.id ? 'var(--rva-navy)' : 'var(--text-muted)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: activeQuestionTab === q.id ? 'var(--rva-navy)' : '#E2E8F0',
                    color: activeQuestionTab === q.id ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {q.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: activeQuestionTab === q.id ? 'var(--rva-navy)' : 'var(--rva-dark)' }}>
                      {q.num} {q.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {q.sub}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Question 1 Body */}
            {activeQuestionTab === 1 && (
              <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--rva-dark)', margin: '0 0 6px 0' }}>
                    Question 1: What is our data telling us about service delivery?
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    Are we seeing expected day-to-day noise or a clear operational trend? Look at data bi-weekly, compare against the 80% benchmark, and isolate the 4 basic signals.
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#FAFCFF',
                  border: '1px solid #D6E4F0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      The 4 Basic Operational Signals Checklist
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Interactive: Click to check off during your huddle
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      {
                        key: 'sig1',
                        num: 'Signal 1',
                        title: 'Trend Direction',
                        desc: 'Is our overall Effective SLA rate trending up or down compared to last month/period?',
                        tab: 'pareto',
                        btnText: 'View SLA Trends'
                      },
                      {
                        key: 'sig2',
                        num: 'Signal 2',
                        title: 'City 80% Benchmark',
                        desc: 'Is our overall Effective SLA rate below 80% (counting closed requests + open overdue)?',
                        tab: 'pareto',
                        btnText: 'Check Benchmark'
                      },
                      {
                        key: 'sig3',
                        num: 'Signal 3',
                        title: 'Top Breach Drivers',
                        desc: 'Which top 3–5 service request types represent the tallest bars causing 80% of our overdue volume?',
                        tab: 'pareto',
                        btnText: 'Open Pareto Chart'
                      },
                      {
                        key: 'sig4',
                        num: 'Signal 4',
                        title: 'Target vs. Actual Gap',
                        desc: 'Where is there a wide gap between target SLA days and the actual days it takes to complete work?',
                        tab: 'backlog',
                        btnText: 'Inspect Backlog & Aging'
                      }
                    ].map(sig => (
                      <div 
                        key={sig.key}
                        onClick={() => toggleSignal(sig.key)}
                        style={{
                          backgroundColor: checkedSignals[sig.key] ? '#F0FDF4' : '#ffffff',
                          border: checkedSignals[sig.key] ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-navy)' }}>{sig.num}</span>
                            {checkedSignals[sig.key] ? (
                              <CheckCircle2 size={16} color="#15803d" />
                            ) : (
                              <div style={{ width: '14px', height: '14px', border: '1.5px solid #94A3B8', borderRadius: '3px' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--rva-dark)', marginTop: '4px' }}>
                            {sig.title}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                            {sig.desc}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateTab) onNavigateTab(sig.tab);
                          }}
                          style={{
                            alignSelf: 'flex-start',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            backgroundColor: '#F1F5F9',
                            color: 'var(--rva-navy)',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {sig.btnText} <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Question 2 Body */}
            {activeQuestionTab === 2 && (
              <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--rva-dark)', margin: '0 0 6px 0' }}>
                    Question 2: Why is it happening? (Drivers & Root Causes)
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    The dashboard shows what was logged into the system; only you and your team know why it happened in the real world.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    borderTop: '4px solid var(--rva-navy)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BarChart3 size={18} color="var(--rva-navy)" />
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--rva-dark)' }}>
                        Focus with the 80/20 Rule
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Roughly 80% of overdue volume comes from just 20% of your service request types. Don't try to fix everything at once—start with the tallest bars on the left in the Pareto chart.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    borderTop: '4px solid var(--rva-red)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Star size={18} color="var(--rva-red)" />
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--rva-dark)' }}>
                        Listen to Resident Feedback
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Filter the <strong>CSAT Deep-Dive</strong> tab by 1-star ratings and high follow-up counts. Residents will tell you directly whether tickets were closed prematurely or communication broke down.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    borderTop: '4px solid var(--rva-sky)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={18} color="var(--rva-navy)" />
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--rva-dark)' }}>
                        Go & See (Gemba Walk)
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Export 5–10 tickets from the Data Explorer. Walk the dispatch process with your supervisors and frontline crew leads to observe the real workflow constraints.
                    </p>
                  </div>

                </div>

                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Lightbulb size={18} color="var(--status-warning)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Municipal Case Study: The Premature Closure Dilemma
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Signal:</strong> Street & Sign repair has 85% on-time completion, but CSAT is 2.1 stars with repeated follow-ups.</div>
                    <div><strong>Why #1?</strong> Residents report: <em>"The ticket says completed, but the stop sign is still knocked down."</em></div>
                    <div><strong>Why #2?</strong> The inspector closed the 311 ticket immediately after conducting the site inspection.</div>
                    <div><strong>Why #3?</strong> The job required an underground utility locate, so the inspector created an internal work order and closed 311.</div>
                    <div><strong>Why #4?</strong> Closing the 311 ticket automatically sent the resident an email saying "Your request is completed!"</div>
                    <div style={{ color: 'var(--rva-red)', fontWeight: 600 }}>
                      <strong>Why #5 (Root Bottleneck):</strong> Our workflow treated "Internal Triage Finished" as "Citizen Problem Solved," leaving the resident in the dark.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Question 3 Body */}
            {activeQuestionTab === 3 && (
              <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--rva-dark)', margin: '0 0 6px 0' }}>
                    Question 3: How can we impact it? (Action Within Existing Resources)
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    In municipal government, it's easy to wait for more staff, budget, or new tech. While macro investments are pursued through budget cycles, they should never be an excuse for inaction today.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase' }}>Mindset</span>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 6px 0', color: 'var(--rva-dark)' }}>
                      Circle of Influence vs. Control
                    </h5>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      You cannot control severe weather or sudden surges, but you can influence how tickets are triaged, dispatched, and communicated. Focus where your actions directly move the needle.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-success)', textTransform: 'uppercase' }}>Action</span>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 6px 0', color: 'var(--rva-dark)' }}>
                      Action Within Existing Resources
                    </h5>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Commit to testing changes with <strong>$0, 0 new hires, and no new technology</strong>: update closure notes, set daily 20-min unassigned queue clearings, or standardize dispatch rules.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase' }}>Accountability</span>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 6px 0', color: 'var(--rva-dark)' }}>
                      Who is Doing What by When?
                    </h5>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Never conclude a performance huddle with just a data observation. Conclude with a named lead, a date, and a specific 30-day operational test.
                    </p>
                  </div>

                </div>

                <div style={{
                  backgroundColor: '#F0F4F8',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #CBD5E1'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award size={20} color="var(--rva-navy)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--rva-dark)' }}>
                      Ready to prep for leadership? View the 3-Part Briefing Standard.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveMainSection('briefing')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: 'var(--rva-navy)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    View Briefing Standard <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* SECTION 2: THE TURNKEY FACILITATOR GUIDE */}
      {activeMainSection === 'facilitator' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-card-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                The Facilitator's Turnkey Playbook
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--rva-navy)',
                backgroundColor: '#F0F4F8',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                Prep Routine: 20 Minutes Total
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--rva-dark)', margin: '4px 0 6px 0' }}>
              Facilitator Guide: Preparing for Your Monthly SLA Performance Meeting
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              A step-by-step meeting blueprint that any division head, supervisor, or manager can pick up and run with their operational leads.
            </p>
          </div>

          {/* Room & Setup Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Who Should Be in the Room
              </div>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Meeting Sponsor / Division Head:</strong> Anchors the tone (learning, not blame).</li>
                <li><strong>Frontline Supervisors & Crew Leads:</strong> The ground truth on field execution.</li>
                <li><strong>311 / Dispatch Coordinator:</strong> Manages daily intake and queue triage.</li>
                <li><strong>Dashboard Driver:</strong> One person with a laptop projecting the dashboard.</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Pre-Meeting Setup (2 Minutes)
              </div>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Open the 311 Dashboard and filter to your Department/Owner Group.</li>
                <li>Set the Date Window to 90 Days for broad context.</li>
                <li>Have a blank notepad ready for the 3-Part Briefing takeaways.</li>
              </ul>
            </div>
          </div>

          {/* Step-by-Step Agenda Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              The 20-Minute Huddle Agenda
            </div>

            {/* Phase 1 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: 'var(--rva-navy)', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                    Minutes 00 – 05
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--rva-dark)' }}>
                    Phase 1: Spot the 4 Basic Signals
                  </strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Goal: Pick 1 priority category</span>
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Screen Action:</strong> Toggle between 90 Days (trend) and 30 Days (recent momentum). Open the Pareto chart.</div>
                <div><strong>Facilitator Prompts to Read:</strong></div>
                <div style={{ paddingLeft: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  • "Is our overall Effective SLA rate trending up or down compared to last month?"<br />
                  • "Are we meeting the City's 80% benchmark?"<br />
                  • "Looking at the tallest bars on the left in the Pareto chart, which 3–5 request types drive our breaches?"<br />
                  • "Where is there a wide gap between target SLA days and actual completion days?"
                </div>
                <div style={{ marginTop: '4px', padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: '4px', color: '#991B1B', fontSize: '0.8rem' }}>
                  <strong>Guardrail:</strong> Don't audit single disputed tickets today. Keep the team focused on the tallest bars driving 80% of volume!
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: 'var(--rva-navy)', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                    Minutes 05 – 15
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--rva-dark)' }}>
                    Phase 2: Peel Back the Onion with a 5-Whys
                  </strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Goal: Find the root bottleneck</span>
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Screen Action:</strong> Click the #1 tallest Pareto bar to cross-filter. Jump to <strong>CSAT Deep-Dive</strong> and filter by 1-star ratings.</div>
                <div><strong>Facilitator Prompts to Read:</strong></div>
                <div style={{ paddingLeft: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  • "What are residents saying in their survey comments for this request type?"<br />
                  • "Are residents submitting repeat follow-up tickets? Why?"<br />
                  • "Does what is logged in the system match what physically happens in the field?"<br />
                  • "Let's run a 5-Whys on that delay: Why did this step stall? What happened before that?"
                </div>
                <div style={{ marginTop: '4px', padding: '8px 12px', backgroundColor: '#F0FDF4', borderRadius: '4px', color: '#166534', fontSize: '0.8rem' }}>
                  <strong>Output:</strong> Identify one root bottleneck (e.g., triage vs. resolution confusion, unassigned queues, or ambiguous status handoffs).
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: 'var(--rva-navy)', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                    Minutes 15 – 20
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--rva-dark)' }}>
                    Phase 3: Commit to a 30-Day Operational Test
                  </strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Goal: Who is doing what by when?</span>
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Screen Action:</strong> Check the Data Explorer to see how tickets are routed and assigned.</div>
                <div><strong>Facilitator Prompts to Read:</strong></div>
                <div style={{ paddingLeft: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  • "What is one operational adjustment we can test this month with $0, zero new hires, and no new technology?"<br />
                  • "Can we clarify closure notes? Can crew leads spend 20 minutes triaging unassigned tickets each morning?"<br />
                  • "Who owns this test, and by what date will we check the dashboard to verify results?"
                </div>
                <div style={{ marginTop: '4px', padding: '8px 12px', backgroundColor: '#EFF6FF', borderRadius: '4px', color: '#1E40AF', fontSize: '0.8rem' }}>
                  <strong>Meeting Closeout:</strong> Document the answers directly into the 3-Part Briefing format to present to Mayor Avula and CAO Donald.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 3: THE 3-PART BRIEFING STANDARD (DEDICATED SECTION) */}
      {activeMainSection === 'briefing' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-card-border)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Executive Briefing Protocol
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--rva-dark)', margin: '4px 0 6px 0' }}>
              The 3-Part Briefing Standard: Preparing for Your Monthly SLA Performance Meeting
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              How to command your operations, build executive trust, and turn performance reviews into constructive problem-solving sessions.
            </p>
          </div>

          {/* Proactivity Contrast Box */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Why Proactivity is Your Superpower
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '16px'
            }}>
              
              <div style={{
                backgroundColor: '#FFF5F5',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                borderLeft: '5px solid var(--rva-red)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <ShieldAlert size={18} color="var(--rva-red)" />
                  <strong style={{ fontSize: '0.95rem', color: '#991B1B' }}>The Defensive Posture (Passive)</strong>
                </div>
                <ul style={{ fontSize: '0.84rem', color: '#7F1D1D', margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li>Waits for leadership to point out a red metric or breach.</li>
                  <li>Scrambles with external excuses (weather, staffing shortages).</li>
                  <li>Leaves the meeting with assigned audits and micro-management.</li>
                  <li><em>Result: Lost trust and increased scrutiny.</em></li>
                </ul>
              </div>

              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-sm)',
                padding: '16px 20px',
                borderLeft: '5px solid var(--status-success)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Award size={18} color="var(--status-success)" />
                  <strong style={{ fontSize: '0.95rem', color: '#166534' }}>The Proactive Posture (Leadership)</strong>
                </div>
                <ul style={{ fontSize: '0.84rem', color: '#14532D', margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li>Points out the red number <strong>first</strong> without defensiveness.</li>
                  <li>Explains the ground-truth root cause discovered with crews.</li>
                  <li>Presents a 30-day operational test already underway.</li>
                  <li><em>Result: Executive credibility, trust, and operational autonomy.</em></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Golden Rule Callout */}
          <div style={{
            backgroundColor: '#F0F4F8',
            border: '1px solid #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 20px',
            fontStyle: 'italic',
            fontSize: '0.92rem',
            color: 'var(--rva-navy)',
            fontWeight: 600
          }}>
            "Bad news delivered proactively with a root cause and an action plan is leadership. Bad news discovered by leadership during a meeting is an audit."
          </div>

          {/* What to Bring Card */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-sm)',
            padding: '18px 20px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--rva-dark)', margin: '0 0 8px 0' }}>
              What to Bring to the Meeting
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', borderRadius: '4px', color: '#991B1B' }}>
                <strong>Do NOT Bring:</strong> A 40-page printed slide deck, defensive excuses, or a request for a dozen new hires before looking under the hood.
              </div>
              <div style={{ padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '4px', color: '#166534' }}>
                <strong>DO Bring:</strong> A single 1-page briefing sheet (or 3 clean slides) covering the three standard parts below. Keep verbal delivery to 4–5 minutes total.
              </div>
            </div>
          </div>

          {/* Detailed 3-Part Standard Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Part 1 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px 22px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase' }}>
                  Part 1: What the Flashlight Revealed (The Numbers Without Defensiveness)
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Speaking Time: 1 Minute</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                State your top-line Effective SLA rate, status against the 80% benchmark, and your top 3–5 breach categories clearly and objectively.
              </p>
              <div style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid var(--rva-navy)',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                <strong>Example Dialogue:</strong> "Over the last 90 days, our department’s Effective SLA Attainment was 68%, below the 80% benchmark. While our closed work looks steady, our open overdue backlog has grown by 14%. Looking at our Pareto drivers, 78% of our overdue volume is concentrated in just two request types: Pothole Patching and Alley Clearing."
              </div>
            </div>

            {/* Part 2 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px 22px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase' }}>
                  Part 2: What the Field Revealed (The Ground Truth Behind the Data)
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Speaking Time: 1.5 Minutes</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                Connect the screen to the street. Explain what you discovered by talking with supervisors, inspecting backlogs, and reading resident CSAT comments.
              </p>
              <div style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid var(--rva-red)',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                <strong>Example Dialogue:</strong> "When we took this signal to our crew leads and reviewed resident comments, we found that in Alley Clearing, 60% of complaints involved private brush mixed with city debris. Crews were arriving, seeing they needed a specialized boom truck, and leaving the ticket sitting in an unassigned queue without notifying the resident—leading to an average of 2.4 follow-ups per ticket."
              </div>
            </div>

            {/* Part 3 */}
            <div style={{
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '18px 22px',
              backgroundColor: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rva-navy)', textTransform: 'uppercase' }}>
                  Part 3: What We Are Testing Next (The 30-Day Operational Test)
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Speaking Time: 1.5 Minutes</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                Present a clear, zero-cost operational adjustment you are testing this month using existing people, tools, and budget.
              </p>
              <div style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid var(--status-success)',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                <strong>Example Dialogue:</strong> "While long-term equipment upgrades follow normal budget cycles, we aren't waiting. Over the next 30 days, our dispatch lead is spending 20 minutes every morning triaging aged tickets, we've updated ticket notes to explain private brush citations within 24 hours, and we are batching boom truck dispatches geographically on Tuesdays and Thursdays. We will check the dashboard weekly to see if this moves us toward 80%."
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
