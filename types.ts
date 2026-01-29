
export interface ImageState {
  data: string | null; // Base64 string including metadata
  mimeType: string;
}

export interface GenerationResult {
  image: ImageState | null;
  text: string | null;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type WidgetType = 
  | 'NONE'
  | 'TIMER' 
  | 'YOUTUBE' 
  | 'SLIDES' 
  | 'PDF'
  | 'WEBSITE' 
  | 'WHEEL'
  | 'MAGIC_ART'
  | 'NOTEPAD'
  | 'ALARM'
  | 'CALENDAR'
  | 'SOUNDBOARD'
  | 'DRAW';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}