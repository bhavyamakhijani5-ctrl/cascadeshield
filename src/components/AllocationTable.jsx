import React, { useState, useMemo } from 'react';
import {
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  LifeBuoy,
  Activity,
  Zap,
  HeartPulse,
  Package,
  Search,
  Filter,
} from 'lucide-react';

const RISK_WEIGHTS = {
  Critical: 4,
  High: 3,
  Moderate: 2,
  Medium: 2,
  Low: 1,
};

export default function AllocationTable({ allocations = [] }) {
  const [sortKey, setSortKey] = useState('riskLevel'); // default sort by risk
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Handle column header click for sorting
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Filter and sort the allocations
  const sortedAllocations = useMemo(() => {
    let result = [...allocations];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.zoneName.toLowerCase().includes(q) ||
          item.shortName?.toLowerCase().includes(q)
      );
    }

    // Risk level filter
    if (riskFilter !== 'ALL') {
      result = result.filter(
        (item) => item.riskLevel.toUpperCase() === riskFilter.toUpperCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'riskLevel') {
        valA = a.riskScore || RISK_WEIGHTS[a.riskLevel] || 0;
        valB = b.riskScore || RISK_WEIGHTS[b.riskLevel] || 0;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });

    return result;
  }, [allocations, sortKey, sortOrder, searchQuery, riskFilter]);

  // Compute table totals
  const totals = useMemo(() => {
    return allocations.reduce(
      (acc, item) => ({
        rescueTeams: acc.rescueTeams + (item.rescueTeams || 0),
        boats: acc.boats + (item.boats || 0),
        pumps: acc.pumps + (item.pumps || 0),
        generators: acc.generators + (item.generators || 0),
        medicalTeams: acc.medicalTeams + (item.medicalTeams || 0),
        reliefKits: acc.reliefKits + (item.reliefKits || 0),
      }),
      {
        rescueTeams: 0,
        boats: 0,
        pumps: 0,
        generators: 0,
        medicalTeams: 0,
        reliefKits: 0,
      }
    );
  }, [allocations]);

  // Export as CSV
  const handleExportCSV = () => {
    const headers = [
      'Zone ID',
      'Zone Name',
      'Overall Risk Level',
      'Risk Score',
      'Rescue Teams',
      'Boats',
      'Pumps',
      'Generators',
      'Medical Teams',
      'Relief Kits (units)',
    ];

    const rows = sortedAllocations.map((item) => [
      item.zoneId,
      `"${item.zoneName}"`,
      item.riskLevel,
      item.riskScore || 'N/A',
      item.rescueTeams || 0,
      item.boats || 0,
      item.pumps || 0,
      item.generators || 0,
      item.medicalTeams || 0,
      item.reliefKits || 0,
    ]);

    const totalRow = [
      'TOTAL',
      '"All Zones"',
      '-',
      '-',
      totals.rescueTeams,
      totals.boats,
      totals.pumps,
      totals.generators,
      totals.medicalTeams,
      totals.reliefKits,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(',')), totalRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CascadeShield_Allocation_Plan_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for sort indicators
  const renderSortIcon = (key) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-300 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-cascade-cyan ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cascade-cyan ml-1 inline" />
    );
  };

  // Badge stylings
  const getRiskBadge = (level, score) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Critical {score ? `(${score})` : ''}
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High {score ? `(${score})` : ''}
          </span>
        );
      case 'Moderate':
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Moderate {score ? `(${score})` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Low {score ? `(${score})` : ''}
          </span>
        );
    }
  };

  // Row background tint by risk
  const getRowBgClass = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-950/20 hover:bg-rose-950/35 border-b border-rose-900/30 transition-colors';
      case 'High':
        return 'bg-amber-950/15 hover:bg-amber-950/30 border-b border-amber-900/25 transition-colors';
      case 'Moderate':
      case 'Medium':
        return 'bg-yellow-950/10 hover:bg-yellow-950/20 border-b border-yellow-900/20 transition-colors';
      default:
        return 'bg-slate-900/30 hover:bg-slate-800/40 border-b border-white/5 transition-colors';
    }
  };

  return (
    <div className="glass-panel p-5 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cascade-cyan" />
            <h3 className="text-base font-display font-semibold text-white tracking-wide">
              Zone-Level Emergency Resource Allocation Matrix
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Optimal multi-objective dispatch prioritized by flood depth, population density, and infrastructure vulnerability
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900/90 border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cascade-cyan transition-colors"
            />
          </div>

          {/* Risk Filter Select */}
          <div className="flex items-center gap-1 bg-navy-900/90 border border-white/15 rounded-lg px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-navy-900 text-white">All Risks</option>
              <option value="CRITICAL" className="bg-navy-900 text-rose-400">Critical Only</option>
              <option value="HIGH" className="bg-navy-900 text-amber-400">High Only</option>
              <option value="MODERATE" className="bg-navy-900 text-yellow-400">Moderate Only</option>
              <option value="LOW" className="bg-navy-900 text-emerald-400">Low Only</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cascade-cyan/15 hover:bg-cascade-cyan/25 border border-cascade-cyan/40 text-cascade-cyan text-xs font-medium rounded-lg transition-all duration-200 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-navy-900/90 text-gray-300 font-semibold uppercase tracking-wider text-[11px] border-b border-white/10 select-none">
            <tr>
              <th
                onClick={() => handleSort('zoneName')}
                className="py-3 px-4 cursor-pointer hover:text-white group"
              >
                Zone Name {renderSortIcon('zoneName')}
              </th>
              <th
                onClick={() => handleSort('riskLevel')}
                className="py-3 px-4 cursor-pointer hover:text-white group"
              >
                Overall Risk {renderSortIcon('riskLevel')}
              </th>
              <th
                onClick={() => handleSort('rescueTeams')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-cascade-cyan" />
                  Rescue Teams {renderSortIcon('rescueTeams')}
                </span>
              </th>
              <th
                onClick={() => handleSort('boats')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <LifeBuoy className="w-3 h-3 text-blue-400" />
                  Boats {renderSortIcon('boats')}
                </span>
              </th>
              <th
                onClick={() => handleSort('pumps')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3 text-amber-400" />
                  Pumps {renderSortIcon('pumps')}
                </span>
              </th>
              <th
                onClick={() => handleSort('generators')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Generators {renderSortIcon('generators')}
                </span>
              </th>
              <th
                onClick={() => handleSort('medicalTeams')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-400" />
                  Medical {renderSortIcon('medicalTeams')}
                </span>
              </th>
              <th
                onClick={() => handleSort('reliefKits')}
                className="py-3 px-4 text-center cursor-pointer hover:text-white group"
              >
                <span className="flex items-center justify-center gap-1">
                  <Package className="w-3 h-3 text-emerald-400" />
                  Relief Kits {renderSortIcon('reliefKits')}
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {sortedAllocations.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-400">
                  No zones match the current search or risk filter criteria.
                </td>
              </tr>
            ) : (
              sortedAllocations.map((item) => (
                <tr key={item.zoneId || item.zoneName} className={getRowBgClass(item.riskLevel)}>
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-100">{item.zoneName}</span>
                      {item.population && (
                        <span className="text-[10px] text-gray-400">
                          Pop: {item.population.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getRiskBadge(item.riskLevel, item.riskScore)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-cascade-cyan text-sm">
                    {item.rescueTeams ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-blue-300 text-sm">
                    {item.boats ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-amber-300 text-sm">
                    {item.pumps ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-yellow-300 text-sm">
                    {item.generators ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-rose-300 text-sm">
                    {item.medicalTeams ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-300 text-sm">
                    {(item.reliefKits ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Table Footer Totals */}
          <tfoot className="bg-navy-950/90 border-t-2 border-white/20 font-bold text-white text-xs">
            <tr>
              <td className="py-3.5 px-4 text-white uppercase tracking-wider">
                Total Allocated ({allocations.length} Zones)
              </td>
              <td className="py-3.5 px-4">
                <span className="text-[11px] text-gray-400 font-mono">100% Coordinated</span>
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-cascade-cyan text-sm">
                {totals.rescueTeams}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-blue-300 text-sm">
                {totals.boats}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-amber-300 text-sm">
                {totals.pumps}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-yellow-300 text-sm">
                {totals.generators}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-rose-300 text-sm">
                {totals.medicalTeams}
              </td>
              <td className="py-3.5 px-4 text-center font-mono text-emerald-300 text-sm">
                {totals.reliefKits.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
