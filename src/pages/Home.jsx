import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Briefcase, Medal, Newspaper, ArrowRight, Users, Calendar, 
    Trophy, Ticket, Shield, Zap, Globe, CheckCircle, Moon, Sun 
} from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.3)', borderRadius: '50%', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* THEME TOGGLE BUTTON - Fixed Position */}
            <button
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    top: '12px',
                    right: '1.5rem',
                    zIndex: 9999,
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    minHeight: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    margin: '0',
                    lineHeight: '0',
                    transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? 
                    <Sun size={24} strokeWidth={1.5} style={{ color: 'var(--text-primary)' }} /> : 
                    <Moon size={24} strokeWidth={1.5} style={{ color: 'var(--text-primary)' }} />
                }
            </button>

            {/* HERO SECTION */}
            <div style={{ 
                background: 'var(--bg-secondary)',
                padding: '4rem 2rem',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container-lg">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        {/* LEFT COLUMN - Content */}
                        <div>
                            <h1 style={{ 
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                                fontWeight: '700',
                                marginBottom: '1.5rem',
                                color: 'var(--text-primary)',
                                lineHeight: '1.1'
                            }}>
                                The Unified Sports Ecosystem
                            </h1>
                            <p style={{ 
                                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
                                color: 'var(--text-secondary)',
                                marginBottom: '3rem',
                                lineHeight: '1.6'
                            }}>
                                Connect, Compete, and Cover. The ultimate platform for creating and experiencing sports events.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => navigate('/signup')} 
                                    className="btn btn-primary" 
                                    style={{ fontSize: '1.1rem', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Get Started <ArrowRight size={20} />
                                </button>
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="btn btn-outline" 
                                    style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
                                >
                                    Log In
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Image */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                        }}>
                            <img 
                                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=800&fit=crop" 
                                alt="Sports event with athletes competing"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    height: 'auto',
                                    borderRadius: 'var(--radius-xl)',
                                    boxShadow: 'var(--elevation-3)',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
                <div className="container-lg">
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                        textAlign: 'center', 
                        marginBottom: '3rem',
                        fontWeight: '600'
                    }}>
                        Everything You Need
                    </h2>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '2rem' 
                    }}>
                        <FeatureCard 
                            icon={Calendar}
                            title="Event Management"
                            description="Create and manage sports events with ease. Set dates, locations, and participant limits."
                        />
                        <FeatureCard 
                            icon={Ticket}
                            title="Ticketing System"
                            description="Sell tickets, manage payments, and validate entries with QR codes."
                        />
                        <FeatureCard 
                            icon={Users}
                            title="Community"
                            description="Connect with athletes, organizers, and reporters in one unified platform."
                        />
                        <FeatureCard 
                            icon={Newspaper}
                            title="News & Reports"
                            description="Share event coverage, match reports, and sports news with the community."
                        />
                        <FeatureCard 
                            icon={Shield}
                            title="Secure Payments"
                            description="Multiple payment methods with manual verification for safety."
                        />
                        <FeatureCard 
                            icon={Zap}
                            title="Real-time Updates"
                            description="Stay updated with live event information and instant notifications."
                        />
                    </div>
                </div>
            </div>

            {/* ROLES SECTION */}
            <div style={{ padding: '5rem 2rem' }}>
                <div className="container-lg">
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                        textAlign: 'center', 
                        marginBottom: '1rem',
                        fontWeight: '600'
                    }}>
                        Choose Your Role
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '3rem',
                        fontSize: '1.1rem'
                    }}>
                        Join as an organizer, athlete, reporter, or viewer
                    </p>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '2rem' 
                    }}>
                        <RoleCard 
                            icon={Briefcase}
                            title="Organizer"
                            description="Create and manage sports events, sell tickets, and grow your community."
                            color="#3b82f6"
                        />
                        <RoleCard 
                            icon={Medal}
                            title="Athlete"
                            description="Discover events, purchase tickets, and showcase your athletic journey."
                            color="#10b981"
                        />
                        <RoleCard 
                            icon={Newspaper}
                            title="Reporter"
                            description="Cover events, write reports, and share sports news with the world."
                            color="#f59e0b"
                        />
                        <RoleCard 
                            icon={Globe}
                            title="Viewer"
                            description="Browse events, read reports, and stay connected with local sports."
                            color="#8b5cf6"
                        />
                    </div>
                </div>
            </div>

            {/* STATS SECTION */}
            <div style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
                <div className="container-lg">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '3rem',
                        textAlign: 'center'
                    }}>
                        <StatCard number="100%" title="Free to Use" />
                        <StatCard number="24/7" title="Always Available" />
                        <StatCard number="Secure" title="Safe Payments" />
                        <StatCard number="Cloud" title="Never Lose Data" />
                    </div>
                </div>
            </div>

            {/* CTA SECTION */}
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <div className="container-lg">
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                        marginBottom: '1rem',
                        fontWeight: '600'
                    }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        marginBottom: '2rem',
                        fontSize: '1.1rem'
                    }}>
                        Join the sports ecosystem today and experience the future of event management
                    </p>
                    <button 
                        onClick={() => navigate('/signup')} 
                        className="btn btn-primary" 
                        style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
                    >
                        Create Free Account
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <footer style={{ 
                background: 'var(--bg-tertiary)', 
                padding: '3rem 2rem 2rem',
                borderTop: '1px solid var(--glass-border)'
            }}>
                <div className="container-lg">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '3rem',
                        marginBottom: '3rem'
                    }}>
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '600' }}>
                                Pak Sports Hub
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                The ultimate platform for creating, managing, and experiencing sports events.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Platform</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Support</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Help Center</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</a></li>
                                <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ 
                        paddingTop: '2rem', 
                        borderTop: '1px solid var(--glass-border)',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                    }}>
                        <p>© 2026 Pak Sports Hub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
            display: 'inline-flex',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            marginBottom: '1rem'
        }}>
            <Icon size={32} style={{ color: 'var(--primary)' }} />
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: '600' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </div>
);

// Role Card Component
const RoleCard = ({ icon: Icon, title, description, color }) => (
    <div className="card glass-panel" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
    }}>
        <div style={{ 
            display: 'inline-flex',
            padding: '1.2rem',
            background: `${color}15`,
            borderRadius: '50%',
            marginBottom: '1rem'
        }}>
            <Icon size={36} style={{ color }} />
        </div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', fontWeight: '600' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </div>
);

// Stat Card Component
const StatCard = ({ number, title }) => (
    <div>
        <div style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '700',
            color: 'var(--primary)',
            marginBottom: '0.5rem'
        }}>
            {number}
        </div>
        <div style={{ 
            fontSize: '1.1rem',
            color: 'var(--text-secondary)'
        }}>
            {title}
        </div>
    </div>
);
