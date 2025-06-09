import { BankHolidaysResponse, BankHolidayEvent } from '../types/bankHolidays';

const API_URL = 'https://www.gov.uk/bank-holidays.json';

export class BankHolidaysService {
  private static instance: BankHolidaysService;
  private cache: BankHolidaysResponse | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private constructor() {}

  public static getInstance(): BankHolidaysService {
    if (!BankHolidaysService.instance) {
      BankHolidaysService.instance = new BankHolidaysService();
    }
    return BankHolidaysService.instance;
  }

  public async getBankHolidays(): Promise<BankHolidaysResponse> {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (this.cache && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Update cache
      this.cache = data;
      this.lastFetchTime = now;
      
      return data;
    } catch (error) {
      console.error('Error fetching bank holidays:', error);
      throw error;
    }
  }

  public async getBankHolidaysForDivision(division: keyof BankHolidaysResponse): Promise<BankHolidayEvent[]> {
    const data = await this.getBankHolidays();
    return data[division].events;
  }

  public async getUpcomingBankHolidays(division: keyof BankHolidaysResponse, limit: number = 5): Promise<BankHolidayEvent[]> {
    const events = await this.getBankHolidaysForDivision(division);
    const now = new Date();
    
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
} 