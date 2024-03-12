import { makeObservable, observable, action } from 'mobx';

class AppState {
    name: string = '';
    departure: string[] = [];
    destination: string[] = [];
    date: string = '';
    returnDate: string = '';
    flights: any[] = [];
    hotels: any[] = [];
    activities: any = {};
    meals: any = {};
    city: string = '';
    country: string = '';
    days: number = 0;
    value: number = 0;
    hasFlight: boolean | null = null;

    constructor() {
    makeObservable(this, {
        name: observable,
        departure: observable,
        destination: observable,
        date: observable,
        returnDate: observable,
        flights: observable,
        hotels: observable,
        activities: observable,
        city: observable,
        country: observable,
        days: observable,
        value: observable,
        hasFlight: observable,
        meals: observable,
        setDeparture: action,
        setDestination: action,
        filterDeparture: action,
        setDate: action,
        setReturnDate: action,
        setName: action,
        setCity: action,
        setDays: action,
        setValue: action,
        setActivities: action,
        setFlights: action,
        setHasFlight: action,
        setCountry: action,
        setMeals: action
    });
    }

    setDeparture(departure: string[]) {
    this.departure = departure;
    }

    setDestination(destination: string[]) {
    this.destination = destination;
    }

    filterDeparture(departure: string) {
    this.departure = this.departure.filter((d) => d !== departure);
    }

    setDate(date: string) {
        this.date = date;
    }

    setReturnDate(date: string) {
        this.returnDate = date;
    }

    setName(name: string) {
        this.name = name;
    }

    setCity(city: string) {
        this.city = city;
    }

    setDays(days: number) {
        this.days = days;
    }

    setValue(value: number) {
        this.value = value;
    }

    setActivities(activities: any[]) {
        this.activities = activities;
    }

    setFlights(flights: any[]) {
        this.flights = flights;
    }

    setHasFlight(hasFlight: boolean) {
        this.hasFlight = hasFlight;
    }

    setCountry(country: string) {
        this.country = country;
    }

    setMeals(meals: any) {
        this.meals = meals;
    }

}

export default new AppState();