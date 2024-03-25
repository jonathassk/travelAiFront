import { makeObservable, observable, action } from 'mobx';

class AppState {
    name: string = '';
    departure: string[] = [];
    destination: string[] = [];
    date: string = '';
    returnDate: string = '';
    flights: any[] = [];
    hasFlight: boolean = false;
    hotels: any[] = [];
    activities: any = {};
    meals: any = {};
    cityOrigin: string = '';
    cityDestination: string = '';
    country: string = '';
    days: number = 0;
    value: number = 0;
    currency: string = '';
    airport_departure: string = '';
    airport_destination: string = '';
    messages: string[] = [];
    constructor() {
    makeObservable(this, {
        name: observable,
        departure: observable,
        destination: observable,
        hasFlight: observable,
        date: observable,
        returnDate: observable,
        flights: observable,
        hotels: observable,
        activities: observable,
        cityOrigin: observable,
        cityDestination: observable,
        country: observable,
        days: observable,
        value: observable,
        currency: observable,
        meals: observable,
        messages: observable,
        airport_departure: observable,
        airport_destination: observable,
        setDeparture: action,
        setDestination: action,
        filterDeparture: action,
        setDate: action,
        setReturnDate: action,
        setName: action,
        setCityOrigin: action,
        setCityDestination: action,
        setDays: action,
        setValue: action,
        setCurrency: action,
        setActivities: action,
        setHasFlight: action,
        setFlights: action,
        setCountry: action,
        setMeals: action,
        addMessage: action,
        setAirportDeparture: action,
        setAirportDestination: action,
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

    setCityOrigin(cityOrigin: string) {
        this.cityOrigin = cityOrigin;
    }
    
    setCityDestination(cityDestination: string) {
        this.cityDestination = cityDestination;
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

    addMessage(message: string) {
        this.messages[this.messages.length] = message;
    }

    setCurrency(currency: string) {
        this.currency = currency;
    }

    setAirportDeparture(airport: string) {
        this.airport_departure = airport;
    }

    setAirportDestination(airport: string) {
        this.airport_destination = airport;
    }
}

export default new AppState();