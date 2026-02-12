import React, { useEffect, useState } from 'react';
import { Users, Eye, FileText, RefreshCw, AlertCircle, Clock, PieChart, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = '/api/analytics';

function App() {
    const [pages, setPages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('views-desc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/pages?t=${Date.now()}`);
            const resData = await response.json();

            if (resData.success) {
                setPages(resData.data);
                setLastUpdated(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            } else {
                setError(resData.message || 'Error al obtener datos');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor backend.');
        } finally {
            // Small delay for better visual perception of refresh
            setTimeout(() => setLoading(false), 600);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalViews = pages.reduce((sum, p) => sum + p.screenPageViews, 0);
    const totalUsers = pages.reduce((sum, p) => sum + p.activeUsers, 0);
    const avgEngagement = totalUsers > 0 ? (totalViews / totalUsers).toFixed(2) : 0;

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const date = now.toLocaleDateString('es-ES');
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            // Header
            doc.setFontSize(20);
            doc.setTextColor(230, 81, 58); // Brand Red
            doc.text('REPORTE DE MÉTRICAS IAB', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Fecha de generación: ${date} a las ${time} hs`, 14, 30);
            doc.text('Rango: Últimos 30 días', 14, 35);

            // Resumen
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Resumen Ejecutivo', 14, 50);

            const summaryData = [
                ['Total de Lecturas', totalViews.toLocaleString()],
                ['Lectores Únicos', totalUsers.toLocaleString()],
                ['Fidelidad (Notas/Lector)', avgEngagement]
            ];

            autoTable(doc, {
                startY: 55,
                head: [['Métrica', 'Valor']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [230, 81, 58] }
            });

            // Tabla de Detalle
            doc.text('Detalle por Noticia', 14, doc.lastAutoTable.finalY + 15);

            const tableData = pages.map(p => [
                p.pagePath,
                p.screenPageViews.toLocaleString(),
                p.activeUsers.toLocaleString(),
                `${p.avgDuration}s`
            ]);

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Noticia', 'Lecturas', 'Lectores', 'Duración Prom.']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [30, 30, 30] }
            });

            doc.save(`reporte-iab-${date.replace(/\//g, '-')}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('Error al generar el PDF. Revisa la consola para más detalles.');
        }
    };

    if (loading && pages.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Sincronizando métricas de Google Analytics...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header>
                <div>
                    <h1>MÉTRICAS NOTICIAS - IAB ARGENTINA</h1>
                    <div className="status-indicator">
                        <div className="dot" style={{ backgroundColor: '#22c55e' }}></div>
                        Panel Histórico (30 días) {lastUpdated && <span style={{ marginLeft: '10px', opacity: 0.6 }}>— Actualizado: {lastUpdated}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={downloadPDF} className="card" style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                        <Download size={16} />
                        Exportar PDF
                    </button>
                    <button onClick={fetchData} className="card" style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: '#fff' }}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        Refrescar Datos
                    </button>
                </div>
            </header>

            {error && (
                <div className="card" style={{ border: '1px solid #ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#fef2f2' }}>
                    <AlertCircle color="#ef4444" />
                    <p style={{ color: '#b91c1c' }}>{error}</p>
                </div>
            )}

            <div style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.3s ease', pointerEvents: loading ? 'none' : 'auto' }}>
                <div className="metrics-grid">
                    <div className="card">
                        <div className="card-title">
                            <Eye size={18} color="#38bdf8" />
                            TOTAL DE LECTURAS
                        </div>
                        <div className="card-value">{totalViews.toLocaleString()}</div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            Cantidad total de veces que se abrieron tus noticias en los últimos 30 días.
                        </p>
                    </div>
                    <div className="card">
                        <div className="card-title">
                            <Users size={18} color="#8b5cf6" />
                            LECTORES ÚNICOS
                        </div>
                        <div className="card-value">{totalUsers.toLocaleString()}</div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            Personas reales que visitaron el sitio (no duplica si entran varias veces).
                        </p>
                    </div>
                    <div className="card">
                        <div className="card-title">
                            <PieChart size={18} color="var(--primary)" />
                            FIDELIDAD (NOTICIAS POR LECTOR)
                        </div>
                        <div className="card-value" style={{ color: 'var(--primary)' }}>{avgEngagement}</div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            El promedio de artículos que lee cada persona antes de irse del sitio.
                        </p>
                    </div>
                </div>

                <div className="filters-row" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: 1, minWidth: '280px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Search size={20} style={{ opacity: 0.4 }} />
                        <input
                            type="text"
                            placeholder="Buscar noticia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.95rem',
                                background: 'transparent',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div className="card" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ordenar:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                width: '100%'
                            }}
                        >
                            <option value="views-desc">Más Vistas</option>
                            <option value="views-asc">Menos Vistas</option>
                            <option value="latest">Últimas Publicadas</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="news-table">
                        <thead>
                            <tr>
                                <th>NOTICIA</th>
                                <th>VISTAS (30D)</th>
                                <th>USUARIOS (30D)</th>
                                <th>LECTURA PROMEDIO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages
                                .filter(p =>
                                    p.pagePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (p.pageTitle && p.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()))
                                )
                                .sort((a, b) => {
                                    if (sortBy === 'views-desc') return b.screenPageViews - a.screenPageViews;
                                    if (sortBy === 'views-asc') return a.screenPageViews - b.screenPageViews;
                                    if (sortBy === 'latest') {
                                        const idA = parseInt(a.pagePath.match(/\d+/)?.[0] || 0);
                                        const idB = parseInt(b.pagePath.match(/\d+/)?.[0] || 0);
                                        return idB - idA;
                                    }
                                    return 0;
                                })
                                .map((p, index) => (
                                    <tr key={p.pagePath}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <FileText size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <a
                                                        href={`https://www.iabargentina.com.ar${p.pagePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="note-link"
                                                        style={{ fontWeight: index === 0 ? '700' : '500', fontSize: '1rem' }}
                                                        title={p.pageTitle}
                                                    >
                                                        {p.pageTitle
                                                            ? (p.pageTitle.split('|')[0].trim().length > 35
                                                                ? p.pageTitle.split('|')[0].trim().substring(0, 35) + '...'
                                                                : p.pageTitle.split('|')[0].trim())
                                                            : p.pagePath}
                                                    </a>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.5, fontFamily: 'monospace' }}>
                                                        {p.pagePath}
                                                    </span>
                                                </div>
                                                {index === 0 && <span className="badge">Noticia Top</span>}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{p.screenPageViews.toLocaleString()}</td>
                                        <td>{p.activeUsers.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} style={{ opacity: 0.5 }} />
                                                {p.avgDuration} seg
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default App;
