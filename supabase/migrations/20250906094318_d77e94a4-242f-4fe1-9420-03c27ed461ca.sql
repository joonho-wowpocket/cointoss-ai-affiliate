-- Create AI Tasks and Pipelines tables for My AI-Assistants functionality

-- AI Agent enum type
CREATE TYPE ai_agent AS ENUM ('CREA', 'DANNY', 'RAY', 'LEO', 'ALPHA', 'GUARDIAN');

-- AI Task Status enum type  
CREATE TYPE ai_task_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- AI Pipeline Status enum type
CREATE TYPE ai_pipeline_status AS ENUM ('PENDING', 'RUNNING', 'PARTIAL', 'SUCCEEDED', 'FAILED');

-- AI Tasks table
CREATE TABLE public.ai_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent ai_agent NOT NULL,
  name TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NULL,
  status ai_task_status NOT NULL DEFAULT 'QUEUED',
  error_code TEXT NULL,
  error_message TEXT NULL,
  started_at TIMESTAMP WITH TIME ZONE NULL,
  finished_at TIMESTAMP WITH TIME ZONE NULL,
  correlation_id TEXT NULL,
  pipeline_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Pipelines table
CREATE TABLE public.ai_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status ai_pipeline_status NOT NULL DEFAULT 'PENDING',
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Webhooks table
CREATE TABLE public.ai_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key relationships
ALTER TABLE public.ai_tasks 
ADD CONSTRAINT ai_tasks_pipeline_id_fkey 
FOREIGN KEY (pipeline_id) REFERENCES public.ai_pipelines(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_pipelines ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.ai_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_tasks
CREATE POLICY "Users can view their own AI tasks" 
ON public.ai_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI tasks"
ON public.ai_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI tasks"
ON public.ai_tasks FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_pipelines
CREATE POLICY "Users can view their own AI pipelines"
ON public.ai_pipelines FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI pipelines"
ON public.ai_pipelines FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI pipelines"
ON public.ai_pipelines FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_webhooks
CREATE POLICY "Users can view their own AI webhooks"
ON public.ai_webhooks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI webhooks"
ON public.ai_webhooks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI webhooks"
ON public.ai_webhooks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI webhooks"
ON public.ai_webhooks FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ai_tasks_user_agent_status ON public.ai_tasks(user_id, agent, status);
CREATE INDEX idx_ai_tasks_pipeline_id ON public.ai_tasks(pipeline_id);
CREATE INDEX idx_ai_tasks_correlation_id ON public.ai_tasks(correlation_id);
CREATE INDEX idx_ai_pipelines_user_status ON public.ai_pipelines(user_id, status);
CREATE INDEX idx_ai_webhooks_user_event_active ON public.ai_webhooks(user_id, event, is_active);

-- Add updated_at trigger for ai_tasks
CREATE TRIGGER update_ai_tasks_updated_at
BEFORE UPDATE ON public.ai_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for ai_pipelines  
CREATE TRIGGER update_ai_pipelines_updated_at
BEFORE UPDATE ON public.ai_pipelines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();