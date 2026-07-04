/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#F04B23', '#4AA8D8', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

interface AnalyticsChartsProps {
  registrations: any[];
  payments: any[];
  events: any[];
}

export default function AnalyticsCharts({ registrations, payments, events }: AnalyticsChartsProps) {
  // 1. Process registrations by date
  const regByDateMap: Record<string, number> = {};
  registrations.forEach((r) => {
    if (!r.registration_date) return;
    const dateStr = new Date(r.registration_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    regByDateMap[dateStr] = (regByDateMap[dateStr] || 0) + 1;
  });

  const dailyRegData = Object.keys(regByDateMap).map((date) => ({
    name: date,
    registrations: regByDateMap[date],
  })).slice(-7);

  // 2. Process revenue by event
  const revenueMap: Record<string, number> = {};
  payments.forEach((p) => {
    if (p.status !== 'success') return;
    // Find event via registration
    const reg = registrations.find((r) => r.id === p.registration_id);
    if (!reg) return;
    const evt = events.find((e) => e.id === reg.event_id);
    const eventName = evt ? evt.title.substring(0, 15) + '...' : 'Unknown';
    revenueMap[eventName] = (revenueMap[eventName] || 0) + Number(p.amount);
  });

  const revenueData = Object.keys(revenueMap).map((name) => ({
    name,
    revenue: revenueMap[name],
  }));

  // 3. Gender split ratio
  const genderMap: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
  registrations.forEach((r) => {
    const gender = r.fields?.gender || 'Other';
    genderMap[gender] = (genderMap[gender] || 0) + 1;
  });

  const genderData = Object.keys(genderMap)
    .map((name) => ({
      name,
      value: genderMap[name],
    }))
    .filter((g) => g.value > 0);

  // 4. Ticket Category Popularity
  const categoryMap: Record<string, number> = {};
  events.forEach((e) => {
    categoryMap[e.category] = 0;
  });
  registrations.forEach((r) => {
    const evt = events.find((e) => e.id === r.event_id);
    if (evt) {
      categoryMap[evt.category] = (categoryMap[evt.category] || 0) + 1;
    }
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat.toUpperCase(),
    count: categoryMap[cat],
  }));

  // Custom tooltips with Brutalist styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F10] border-2 border-white p-3 font-mono-custom text-xs text-white rounded-none">
          <p className="font-bold uppercase tracking-wider">{label}</p>
          <p className="text-[#F04B23] mt-1 font-black">
            {payload[0].name.toUpperCase()}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Chart 1: Daily Registration Activity */}
      <div className="bg-[#1A1A1A] border-4 border-[#0F0F10] p-6 relative">
        <div className="absolute top-0 right-0 bg-[#F04B23] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 border-b-2 border-l-2 border-black">
          Trend Activity
        </div>
        <h4 className="font-sans uppercase font-black text-xl text-white mb-6 tracking-tight">
          Daily Registrations
        </h4>
        <div className="h-[250px] w-full">
          {dailyRegData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 font-mono-custom text-xs uppercase">
              No recent registration logs found
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRegData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#FFF" fontSize={11} tickLine={false} />
                <YAxis stroke="#FFF" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#F04B23"
                  strokeWidth={4}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Revenue Distribution per Event */}
      <div className="bg-[#1A1A1A] border-4 border-[#0F0F10] p-6 relative">
        <div className="absolute top-0 right-0 bg-[#4AA8D8] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 border-b-2 border-l-2 border-black">
          Financials
        </div>
        <h4 className="font-sans uppercase font-black text-xl text-white mb-6 tracking-tight">
          Revenue Generator ($)
        </h4>
        <div className="h-[250px] w-full">
          {revenueData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 font-mono-custom text-xs uppercase">
              No sales revenue accumulated yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#FFF" fontSize={10} tickLine={false} />
                <YAxis stroke="#FFF" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#4AA8D8" stroke="#000" strokeWidth={2}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Category Popularity */}
      <div className="bg-[#1A1A1A] border-4 border-[#0F0F10] p-6 relative">
        <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 border-b-2 border-l-2 border-black">
          Event Distribution
        </div>
        <h4 className="font-sans uppercase font-black text-xl text-white mb-6 tracking-tight">
          Interests by Category
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#FFF" fontSize={11} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#FFF" fontSize={9} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#F59E0B" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Gender Demographics */}
      <div className="bg-[#1A1A1A] border-4 border-[#0F0F10] p-6 relative">
        <div className="absolute top-0 right-0 bg-[#F59E0B] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 border-b-2 border-l-2 border-black">
          Attendee Profile
        </div>
        <h4 className="font-sans uppercase font-black text-xl text-white mb-6 tracking-tight">
          Gender Ratio
        </h4>
        <div className="h-[250px] w-full flex items-center justify-center">
          {genderData.length === 0 ? (
            <div className="text-gray-500 font-mono-custom text-xs uppercase">
              No registration gender data
            </div>
          ) : (
            <div className="w-full h-full flex flex-col md:flex-row items-center justify-around">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 font-mono-custom text-xs text-white">
                {genderData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3.5 h-3.5 border border-black"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="uppercase">{entry.name}:</span>
                    <span className="font-black">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
