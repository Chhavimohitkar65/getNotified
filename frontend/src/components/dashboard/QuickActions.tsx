import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bell, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const actions = [
  {
    title: 'Create Template',
    description: 'Design a new notification template',
    icon: FileText,
    href: '/templates/new',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'View Logs',
    description: 'Check the status of sent notifications',
    icon: Bell,
    href: '/logs',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Configure Channels',
    description: 'Set up or modify notification channels',
    icon: Settings,
    href: '/settings',
    color: 'bg-emerald-100 text-emerald-700',
  },
];

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you might want to perform</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action, i) => (
          <Link 
            key={i}
            to={action.href}
            className="flex items-center p-3 space-x-4 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className={`${action.color} p-2 rounded-full`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium">{action.title}</h4>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              Go →
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
