import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helpers
export const auth = {
  signUp: async (email, password) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email, password) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    if (!supabase) return { error: null };
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    if (!supabase) return { data: { user: null }, error: null };
    return await supabase.auth.getUser();
  }
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  create: async (project) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, user_id: user.id }])
      .select()
      .single();
    return { data, error };
  },
  
  update: async (id, updates) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Soil Analysis API
export const soilAnalysisAPI = {
  create: async (projectId, analysis) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase
      .from('soil_analyses')
      .insert([{ project_id: projectId, ...analysis }])
      .select()
      .single();
    return { data, error };
  },
  
  getByProject: async (projectId) => {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('soil_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

// NDVI Readings API
export const ndviAPI = {
  create: async (projectId, value) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase
      .from('ndvi_readings')
      .insert([{ project_id: projectId, value }])
      .select()
      .single();
    return { data, error };
  },
  
  getByProject: async (projectId) => {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from('ndvi_readings')
      .select('*')
      .eq('project_id', projectId)
      .order('recorded_at', { ascending: true });
    return { data, error };
  }
};

// Image upload helper
export const uploadSoilImage = async (file) => {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('soil-images')
    .upload(filePath, file);

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('soil-images')
    .getPublicUrl(filePath);

  return { data: publicUrl, error: null };
};