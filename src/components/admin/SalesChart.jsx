import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { date: new Date().toISOString().split('T')[0], total_amount: 0 }
  ];

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-sm"
          />
          <YAxis className="text-sm" />
          <Tooltip 
            formatter={(value) => [`${value} HTG`, 'Chiffre d\'affaires']}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
          />
          <Line 
            type="monotone" 
            dataKey="total_amount" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#0284c7' }}
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          Aucune donnée de vente disponible
        </div>
      )}
    </div>
  );
};

export default SalesChart;
