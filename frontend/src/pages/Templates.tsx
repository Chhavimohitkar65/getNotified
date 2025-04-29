import React from 'react';
import { useLocation } from 'react-router-dom';
import TemplateList from '../components/templates/TemplateList';
import TemplateEditor from '../components/templates/TemplateEditor';

const Templates = () => {
  const location = useLocation();
  const isCreatingTemplate = location.pathname.endsWith('/new');
  
  // In a real app, you'd fetch the template data if editing an existing one
  // and check if the path is /templates/{id} to determine if editing

  return (
    <div className="space-y-8">
      <div>
        <h1>{isCreatingTemplate ? 'Create Template' : 'Templates'}</h1>
        <p className="text-muted-foreground">
          {isCreatingTemplate 
            ? 'Create a new notification template' 
            : 'Manage your notification templates'}
        </p>
      </div>
      
      {isCreatingTemplate ? <TemplateEditor /> : <TemplateList />}
    </div>
  );
};

export default Templates;