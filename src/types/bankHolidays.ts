export interface BankHolidayEvent {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}

export interface Division {
  division: string;
  events: BankHolidayEvent[];
}

export interface BankHolidaysResponse {
  'england-and-wales': Division;
  scotland: Division;
  'northern-ireland': Division;
} 