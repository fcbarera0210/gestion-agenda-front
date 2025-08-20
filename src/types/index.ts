export interface BreakPeriod {
  start: string;
  end: string;
}

export interface DaySchedule {
  isActive: boolean;
  workHours: {
    start: string;
    end: string;
  };
  breaks?: BreakPeriod[];
}

export interface Professional {
  id?: string;
  displayName: string;
  email: string;
  title?: string;
  photoURL?: string;
  workSchedule?: Record<string, DaySchedule>;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface ProfessionalData {
  professional: Professional | null;
  services: Service[];
}
