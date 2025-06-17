import React, { useState } from 'react';
import MainAppLayout from '@/components/layout/MainAppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Removed TabsContent as it's not directly used here for PageHeader
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CalendarDays, Info, AlertCircle, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Data Interfaces
interface FunnelStage {
  name: string;
  count: number;
  value: number;
  avgTime: string;
  colorClass: string; // Tailwind CSS class for background color
  progress: number; // percentage for the stacked bar
  tooltipText?: string; // Optional specific tooltip for avgTime
}

const funnelStageData: Omit<FunnelStage, 'progress'>[] = [
  { name: 'Discovery', count: 200, value: 200, avgTime: '2 days', colorClass: 'bg-rose-500' },
  { name: 'Qualified', count: 100, value: 100, avgTime: '2 days', colorClass: 'bg-amber-500' },
  { name: 'In conversation', count: 50, value: 100, avgTime: '5 days*', colorClass: 'bg-indigo-500', tooltipText: 'Average time on this stage: 5 days' },
  { name: 'Negotiations', count: 20, value: 50, avgTime: '8 days', colorClass: 'bg-teal-500' },
  { name: 'Closed won', count: 20, value: 50, avgTime: '10 days', colorClass: 'bg-purple-500' },
];
const totalFunnelCount = funnelStageData.reduce((sum, stage) => sum + stage.count, 0);
const funnelDataWithProgress: FunnelStage[] = funnelStageData.map(stage => ({
  ...stage,
  progress: (stage.count / totalFunnelCount) * 100,
}));

interface SourceDataPoint {
  name: string;
  value: number;
  percentage: number;
  fill: string; // Hex color for recharts
}

const leadSourcesData: SourceDataPoint[] = [
  { name: 'Clutch', value: 3000, percentage: 50, fill: '#EF4444' }, // red-500
  { name: 'Behance', value: 1000, percentage: 25, fill: '#F59E0B' }, // amber-500
  { name: 'Instagram', value: 1000, percentage: 15, fill: '#14B8A6' }, // teal-500
  { name: 'Dribbble', value: 1000, percentage: 10, fill: '#84CC16' }, // lime-500
];

interface MonthlyLeadData {
  month: string;
  closedWon: number;
  closedLost: number;
}

const leadTrackingData: MonthlyLeadData[] = [
  { month: 'March', closedWon: 68, closedLost: 52 },
  { month: 'April', closedWon: 55, closedLost: 40 },
  { month: 'May', closedWon: 82, closedLost: 22 },
  { month: 'June', closedWon: 60, closedLost: 8 },
  { month: 'July', closedWon: 90, closedLost: 31 },
  { month: 'August', closedWon: 105, closedLost: 60 },
];

interface ReasonStat {
  percentage: number;
  description: string;
}
const reasonsLostData: ReasonStat[] = [
  { percentage: 40, description: 'The proposal is unclear' },
  { percentage: 20, description: 'Switched to competitor' },
  { percentage: 30, description: 'Budget constraints' },
  { percentage: 10, description: 'Other' },
];

interface OtherDataStat {
  value: string;
  label: string;
  icon?: React.ElementType; 
  iconTooltip?: string;
}
const otherStatsData: OtherDataStat[] = [
  { value: '900', label: 'total leads count' },
  { value: '12', label: 'days in average to convert lead' },
  { value: '30', label: 'inactive leads', icon: Info, iconTooltip: "Leads not contacted in 14 days" },
];

const timeRangeOptions = [
  { value: 'last6months', label: 'Last 6 months' },
  { value: 'last3months', label: 'Last 3 months' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'last7days', label: 'Last 7 days' },
] as const;

// Sub-components
const PageHeaderComponent: React.FC<{
  currentTimeRange: typeof timeRangeOptions[number]['value'];
  onTimeRangeChange: (value: typeof timeRangeOptions[number]['value']) => void;
}> = ({ currentTimeRange, onTimeRangeChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <Tabs defaultValue="leads" className="w-full sm:w-auto">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="w-full sm:w-auto">
        <Select value={currentTimeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const FunnelSummaryCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel count</CardTitle>
        <CardDescription className="text-3xl font-bold text-foreground pt-1">
          {totalFunnelCount} active leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-6 flex rounded-md overflow-hidden mb-6">
          {funnelDataWithProgress.map((stage) => (
            <TooltipProvider key={stage.name} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn('h-full transition-all duration-300 hover:opacity-80', stage.colorClass)}
                    style={{ width: `${stage.progress}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{stage.name}: {stage.count} ({stage.progress.toFixed(1)}%)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <ul className="space-y-3">
          {funnelDataWithProgress.map((stage) => (
            <li key={stage.name} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-3 text-sm">
              <div className={cn("w-3 h-3 rounded-sm", stage.colorClass)} />
              <span className="text-foreground font-medium">{stage.name}</span>
              <span className="text-right text-muted-foreground">{stage.count}</span>
              <span className="text-right text-muted-foreground">${stage.value.toLocaleString()}</span>
              <span className="text-right text-muted-foreground">
                {stage.tooltipText ? (
                   <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dashed decoration-muted-foreground/50">{stage.avgTime}</span>
                      </TooltipTrigger>
                      <TooltipContent><p>{stage.tooltipText}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : stage.avgTime }
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const SourcePieChartCard: React.FC<{
  activeTab: string;
  onTabChange: (value: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const currentData = leadSourcesData; // Data could change based on activeTab

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-52"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={50}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {currentData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number, name: string, props: { payload: SourceDataPoint }) => [`$${value.toLocaleString()} (${props.payload.percentage}%)`, props.payload.name]}
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {currentData.map((source) => (
            <li key={source.name} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-sm mr-2" style={{ backgroundColor: source.fill }} />
                <span className="text-muted-foreground">{source.name}</span>
              </div>
              <div className="text-foreground font-medium">
                ${source.value.toLocaleString()}
                <span className="ml-2 text-xs text-muted-foreground">({source.percentage}%)</span>
              </div>
            </li>
          ))}
        </ul>
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="link" size="sm" className="text-muted-foreground p-0 h-auto mt-3 text-xs hover:text-primary">
                        from leads total <Info className="w-3 h-3 ml-1"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Percentages based on total leads from these sources.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="leadsCame" className="text-xs px-2">Leads came</TabsTrigger>
            <TabsTrigger value="leadsConverted" className="text-xs px-2">Leads Converted</TabsTrigger>
            <TabsTrigger value="totalDealsSize" className="text-xs px-2">Total deals size</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StatsCardGridComponent: React.FC<{
  activeLeadSourceTab: string;
  onLeadSourceTabChange: (value: string) => void;
}> = ({ activeLeadSourceTab, onLeadSourceTabChange }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <FunnelSummaryCard />
      </div>
      <div>
        <SourcePieChartCard activeTab={activeLeadSourceTab} onTabChange={onLeadSourceTabChange} />
      </div>
    </div>
  );
};

const LeadTrackingGraphComponent: React.FC<{ currentTimeRange: typeof timeRangeOptions[number]['value'] }> = ({ currentTimeRange }) => {
  const data = leadTrackingData; // This data should be filtered/fetched based on currentTimeRange in a real app
  const currentTotalClosed = data.reduce((sum, item) => sum + item.closedWon, 0);
  const currentTotalLost = data.reduce((sum, item) => sum + item.closedLost, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Leads tracking</CardTitle>
                <CardDescription className="pt-1">
                    <span className="text-green-600 font-semibold">{currentTotalClosed} total closed</span> vs <span className="text-red-600 font-semibold">{currentTotalLost} total lost</span>
                </CardDescription>
            </div>
            <Select defaultValue={currentTimeRange}> 
              <SelectTrigger className="w-full sm:w-[180px]">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="h-80 w-full p-0 pr-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClosedWon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClosedLost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} width={30}/>
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '500' }}
                itemStyle={{ paddingTop: '0.25rem', paddingBottom: '0.25rem'}}
              />
              <RechartsLegend
                verticalAlign="top"
                align="right"
                iconSize={10}
                wrapperStyle={{ fontSize: '0.8rem', paddingBottom: '1rem'}}
                formatter={(value, entry) => {
                  return <span className="text-muted-foreground ml-1">{value}</span>;
                }}
              />
              <Area type="monotone" dataKey="closedWon" name="Closed won" strokeWidth={2} stroke="#10B981" fillOpacity={1} fill="url(#colorClosedWon)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#10B981' }} />
              <Area type="monotone" dataKey="closedLost" name="Closed lost" strokeWidth={2} stroke="#EF4444" fillOpacity={1} fill="url(#colorClosedLost)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#EF4444' }} />
            </AreaChart>
          </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const ReasonsStatsCardComponent: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <h3 className="text-base font-semibold mb-4 text-card-foreground">Reasons of leads lost</h3>
          <div className="space-y-5">
            {reasonsLostData.map((reason, index) => (
              <div key={index}>
                <p className="text-2xl font-bold text-foreground">{reason.percentage}%</p>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4 text-card-foreground">Other data</h3>
          <div className="space-y-5">
            {otherStatsData.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  {stat.label}
                  {stat.icon && stat.iconTooltip && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <stat.icon className="w-3.5 h-3.5 ml-1.5 text-muted-foreground/80 hover:text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>{stat.iconTooltip}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main page component
const DashboardOverviewPage: React.FC = () => {
  const [activeLeadSourceTab, setActiveLeadSourceTab] = useState('leadsCame');
  const [timeRange, setTimeRange] = useState<typeof timeRangeOptions[number]['value']>('last6months');

  return (
    <MainAppLayout pageTitle="Dashboard" activePath="/">
      <div className="flex flex-col space-y-6">
        <PageHeaderComponent currentTimeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <StatsCardGridComponent activeLeadSourceTab={activeLeadSourceTab} onLeadSourceTabChange={setActiveLeadSourceTab} />
        <LeadTrackingGraphComponent currentTimeRange={timeRange} />
        <ReasonsStatsCardComponent />
      </div>
    </MainAppLayout>
  );
};

export default DashboardOverviewPage;
